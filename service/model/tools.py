"""
# AIWraps Tools Model Module

This module provides for the data models used by "Tools" and "ToolBoxes"
in AIWraps. Tools provide a standardized way to define functions that can
ne used by the Assistant.
"""

from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Literal, Iterable, Generator


class ToolBox:
    """A collection of functions that can be used as tools for the Assistant."""
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.functions: dict[str, FuncTool] = {}

    def register(self, args: list[FuncTool.Arg] | None = None):
        """Register a function as a tool for the Assistant."""
        def decorator(func: Callable[..., str | None]) -> Callable[..., str | None]:
            tool = FuncTool(
                name=func.__name__,
                description=func.__doc__,
                arguments=args if args is not None else [],
                callable=func
            )
            self.functions[func.__name__] = tool
            return func
        return decorator

    @property
    def openapi(self) -> list[dict]:
        """Return this tool box as a list of dicts for use as an OpenAPI."""
        return [func.openapi for func in self.functions.values()]

    def __getitem__(self, key: str) -> FuncTool:
        """Return the function tool with the given name."""
        return self.functions[key]

    def __contains__(self, key: str) -> bool:
        """Return whether the function tool with the given name exists."""
        return key in self.functions

    def __iter__(self):
        """Return an iterator of the function tool names."""
        return iter(self.functions.values())

    def __len__(self) -> int:
        """Return the number of function tools."""
        return len(self.functions)

    def __call__(self, name: str, **kwargs) -> str | None:
        """Call the function with the given name and return the result."""
        return self.functions[name](**kwargs)

FuncToolArgType = Literal["string", "number", "boolean", "object", "array"]

@dataclass
class FuncTool:
    """The data necessary to register a function tool for the Assistant."""
    name: str
    arguments: list[Arg]
    callable: Callable[..., str | None]
    description: str | None = None
    cache_file: Path | None = None

    @dataclass
    class Arg:
        """The data necessary to register an argument for a function tool."""
        name: str
        type: FuncToolArgType
        description: str | None = None
        required: bool = False
        enum: list[str] | None = None
        items: FuncTool.Arg | None = None
        args: list[FuncTool.Arg] | None = None

        @property
        def openapi(self) -> dict:
            """Return this argument as a dict for use as an OpenAPI."""
            data: dict = {"type": self.type}
            if self.description is not None:
                data["description"] = self.description
            if self.enum is not None:
                data["enum"] = self.enum
            if self.items is not None:
                data["items"] = self.items.openapi
            if self.args is not None:
                data["properties"] = {arg.name: arg.openapi for arg in self.args}
                data["required"] = [arg.name for arg in self.args if arg.required]
            return data

    @property
    def openapi(self) -> dict:
        """Return this function tool as a dict for use as an OpenAPI."""
        properties = {arg.name: arg.openapi for arg in self.arguments}
        required = [arg.name for arg in self.arguments if arg.required]
        payload = {
            "type": "function",
            "function": {
                "name": self.name,
                "description": self.description
            }
        }
        if len(properties) > 0:
            payload["function"]["parameters"] = {
                "type": "object",
                "properties": properties,
                "required": required
            }
        return payload

    def __call__(self, **kwargs) -> str | None:
        """Call the function and return the result."""
        return self.callable(**kwargs)