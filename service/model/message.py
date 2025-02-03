"""
The chat model is responsible for providing the API compatible models for
use in client to server communication. Internally, these models are used to
enforce type safety between the server's internal components.
"""

from __future__ import annotations

from enum import Enum
from typing import Any, List, Literal
import uuid

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



class ChatContent(BaseModel):
    format: Literal["text", "table", "image", "audio", "video", "file"]  # The format of the content
    content: Any  # The content data
    description: str | None = None  # The description of the content (optional)


class ChatMessage(BaseModel):
    role: Role  # Role of the message sender
    contents: list[ChatContent]  # The message contents
    thoughts: list[str] | None = None  # The thoughts of the message (default is None)
    timestamp: int  # UTC Unix timestamp in milliseconds

    def render_text(self) -> str:
        thought_str = "<think>" + " ".join(self.thoughts) + "</think>" if self.thoughts else ""
        content_str = " ".join([content.content for content in self.contents])
        return f"{thought_str}\n{content_str}"


class ChatResponse(ChatMessage):
    session_id: uuid.UUID  # The session ID of the chat
    status: Status  # The status of the chat system
    model_signature: str | None = None  # The model signature of the message (default is Unknown)


class ChatRequest(ChatMessage):
    """
    A Message from the user to the chat system identifying the user and the
    chat session ID. Carries the user's message content.
    """
    profile: ChatProfile
    history: list[ChatMessage]  # The chat history
    session_id: uuid.UUID | None = None  # The session ID of the chat



class ChatProfile(BaseModel):
    botname: str
    instruction: str
    username: str = "You"
    model: str | None = None
