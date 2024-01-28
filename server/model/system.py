from __future__ import annotations

from typing import Dict
from enum import Enum
from pydantic import BaseModel


class ServiceType(str, Enum):
    Chat = "chat"


class Service(BaseModel):
    name: str


class Configuration(BaseModel):
    services: Dict[ServiceType, Service]
