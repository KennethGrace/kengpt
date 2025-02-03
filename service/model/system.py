from __future__ import annotations
from random import randint, random

from typing import Dict
from enum import Enum
from abc import ABC, abstractmethod
import uuid
from pydantic import BaseModel


class ServiceType(str, Enum):
    Chat = "chat"


class Configuration(BaseModel):
    services: Dict[ServiceType, Provider]

class Provider(BaseModel, ABC):
    id: uuid.UUID
    name: str = "provider"

    def __init__(self):
        self.id = uuid.uuid4()

    @abstractmethod
    def __enter__(self) -> ProviderContext:
        pass

    @abstractmethod
    def __exit__(self, exc_type, exc_value, traceback) -> None:
        pass

class ProviderContext(BaseModel, ABC):
    provider: Provider
