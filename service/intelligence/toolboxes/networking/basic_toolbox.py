"""
# AIWraps Networking Basics Toolbox Module

These functions are implemented using Netmiko, a multi-vendor library for
managing network devices via SSH or Telnet.
"""

from __future__ import annotations
import time
import logging

import dns.resolver
import dns.reversename

from aiwraps.models import ToolBox, FuncTool
from aiwraps.constants.oui import OUI_DATABASE


NetworkBasicsToolBox = ToolBox(
    name="Network Basics",
    description="A collection of functions for basic networking tasks."
)

@NetworkBasicsToolBox.register(args=[FuncTool.Arg("mac_addresses", "array", items=FuncTool.Arg("mac_address", "string"))])
def lookup_oui(mac_addresses: list[str]) -> str:
    """
    Look up the OUI (Organizationally Unique Identifier) for a list of MAC addresses.
    """
    output = ""
    for mac in mac_addresses:
        mac = mac.replace(":", "").replace("-", "").lower()
        oui = mac[:6]
        vendor = OUI_DATABASE.get(oui, "Unknown")
        output += f"{mac} - {vendor}\n"
    return output


@NetworkBasicsToolBox.register(args=[FuncTool.Arg("ip_addresses", "array", items=FuncTool.Arg("ip_address", "string"))])
def dns_lookup(ip_addresses: list[str]) -> str:
    """
    Perform a DNS lookup on a list of IP addresses.
    """
    output = ""
    for ip in ip_addresses:
        try:
            resolved_name = dns.resolver.resolve(ip, "PTR")[0]
            output += f"{ip} - {resolved_name}\n"
        except Exception as e:
            output += f"{ip} - {e}\n"
    return output
