"""
# AIWraps Networking Cisco IOS Toolbox Module

This toolbox provides a collection of network administration commands using Netmiko
for Cisco IOS devices.
"""

from __future__ import annotations

from aiwraps.models import FuncTool

from contextlib import contextmanager

from aiwraps.toolboxes.networking.shared.cli_handler import DeviceConnectionToolBoxHandler, ManagedDevice


CiscoIOSToolBox = DeviceConnectionToolBoxHandler(
    "cisco_ios",
    "A collection of network administration commands using Netmiko for Cisco IOS devices."
)


@CiscoIOSToolBox.host_register(args=[FuncTool.Arg("host", "string"), FuncTool.Arg("command", "string")])
def send_command(device: ManagedDevice, command: str) -> str:
    """
    Send a command and return the output.
    """
    if not command.startswith("show"):
        return "Only 'show' commands are allowed."
    try:
        output = device.connection.send_command(command)
    except Exception as e:
        output = f"An error occurred: {e}"
    device.output_history[command] = str(output)
    return str(output)

@CiscoIOSToolBox.host_register(args=[FuncTool.Arg("host", "string", required=True)])


@CiscoIOSToolBox.host_register(args=[FuncTool.Arg("host", "string"), FuncTool.Arg("command", "string")])
def command_help(device: ManagedDevice, command: str) -> str:
    """
    Get help for a command prefix (ie. "{command} ?")
    """
    try:
        output = device.connection.send_command(f"{command} ?")
    except Exception as e:
        output = f"An error occurred: {e}"
    return str(output)


@contextmanager
def use_cisco_ios_toolbox(username: str, password: str, timeout: int = 300):
    """
    A context manager for using the netmiko toolbox.
    """
    CiscoIOSToolBox.username = username
    CiscoIOSToolBox.password = password
    CiscoIOSToolBox.device_type = "cisco_ios"
    CiscoIOSToolBox.timeout = timeout
    CiscoIOSToolBox.exit_event.clear()
    CiscoIOSToolBox.monitor_thread.start()
    yield CiscoIOSToolBox
    CiscoIOSToolBox.exit_event.set()
    for host in CiscoIOSToolBox.devices:
        CiscoIOSToolBox.devices[host].connection.disconnect()
    CiscoIOSToolBox.monitor_thread.join()
