from __future__ import annotations

from enum import Enum

from pydantic import BaseModel


class Role(str, Enum):
    User = "user"
    Assistant = "assistant"


class Status(str, Enum):
    Running = "running"  # The chat system is busy
    Loading = "loading"  # The chat system is loading
    Standby = "standby"  # The chat system is accepting messages
    Offline = "offline"  # The chat system is offline
    Error = "error"  # The chat system has encountered an error


class ChatMessage(BaseModel):
    role: Role  # Role of the message sender
    content: str  # Message content
    timestamp: int  # Unix timestamp in milliseconds (UTC)
    thread_id: str | None = None  # The thread ID of the response


class ChatSettings(BaseModel):
    username: str  # Name of the user
    botname: str  # Name of the AI
    instruction: str = ""  # Instruction to the AI
    acknowledge: str = "Understood."  # Acknowledgement to the user


class ChatSystem(BaseModel):
    status: Status  # The status of the chat system
    model: str  # The name of the active model


class ChatResponse(ChatMessage):
    thread_id: str  # The thread ID of the response
    runtime: int | None = None  # The generation time in milliseconds
    source: str | None = None  # The backend source of the response


class ChatRequest(ChatMessage):
    settings: ChatSettings  # The state of the chat system
    memory: list[ChatMessage]  # A list of messages
    fileContent: str = ""  # The content of the uploaded file
