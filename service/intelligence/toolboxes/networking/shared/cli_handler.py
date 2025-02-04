from aiwraps.models import FuncTool, ToolBox


from netmiko import ConnectHandler, BaseConnection


import logging
import time
from threading import Event, Thread
from dataclasses import dataclass, field
from typing import Callable, Optional, Dict

@dataclass
class ManagedDevice:
    """A managed connection to a network device."""
    connection: BaseConnection
    last_used: float  # In seconds since epoch
    # For recording command output across sessions
    output_history: Dict[str, str] = field(default_factory=dict)
    # For storing arbitrary data across sessions
    annotations: Dict[str, str] = field(default_factory=dict)


class DeviceConnectionToolBoxHandler(ToolBox):
    """
    Maintains persistent connections to network devices across multiple
    function calls. This permits the assistant to open connections to
    more than one host at a time and avoid the overhead of repeatedly
    opening and closing connections to the same host. Connections are
    monitored for inactivity and are automatically closed. To the
    assistant the establishing and closing of connections is transparent.

    A consistent username, password, and device type must be provided
    for each context the toolbox is used in.
    """

    def __init__(self, name: str, description: str):
        super().__init__(name, description)
        self.devices: dict[str, ManagedDevice] = {}
        self.username: Optional[str] = None
        self.password: Optional[str] = None
        self.device_type: str = "autodetect"
        self.timeout: int = 300
        self.exit_event = Event()
        self.monitor_thread = Thread(target=self.monitor_connections)


    def monitor_connections(self):
        while True:
            if self.exit_event.is_set():
                break
            for host, connection in self.devices.items():
                if time.time() - connection.last_used > self.timeout:
                    logging.info(
                        f"Closing connection to {host} due to inactivity.")
                    connection.connection.disconnect()
            time.sleep(10)

    def get_device(self, host: str) -> ManagedDevice:
        if host not in self.devices:
            connection = ConnectHandler(
                host=host,
                username=self.username,
                password=self.password,
                device_type=self.device_type,
                secret=self.password
            )
            self.devices[host] = ManagedDevice(
                connection=connection,
                last_used=time.time()
            )
        if not self.devices[host].connection.is_alive():
            self.devices[host].connection.establish_connection()
        self.devices[host].last_used = time.time()
        return self.devices[host]

    def host_register(self, args: list[FuncTool.Arg] | None = None):
        """
        Register a function that takes a ManagedDevice as its first argument, but
        needs to proxy the host argument to get_device.
        """
        def decorator(func: Callable[..., str | None]) -> Callable[..., str | None]:
            @self.register(args=args)
            def wrapper(host: str, *args, **kwargs) -> str | None:
                device = self.get_device(host)
                return func(device, *args, **kwargs)
            return wrapper
        return decorator