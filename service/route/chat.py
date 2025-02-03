"""
---

This file is part of The KenGPT Project. The KenGPT Project is free software:
you can redistribute it and/or modify it under the terms of the GNU General
Public License as published by the Free Software Foundation, either version 3
of the License, or (at your option) any later version.
The KenGPT Project is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
details.
You should have received a copy of the GNU General Public License along with
The KenGPT Project. If not, see <https://www.gnu.org/licenses/>.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from model.message import ChatMessage, ChatRequest, ChatResponse
from core.llama_core import LlamaCore

logger = logging.getLogger("uvicorn")

ChatRouter = APIRouter(prefix="/chat")

ChatCore = LlamaCore(
    system_prompt="Hello! How can I help you today?",
    model="deepseek-r1:7b",
)


@ChatRouter.post("", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse | HTTPException:
    """
    Process a `ChatRequest` sent by a user into a `ChatResponse` from the
    AI service.
    """
    logger.debug(f"Request: {request}")
    logger.debug(f"{request.profile.username} -> {request.contents[-1].content}")
    try:
        response = ChatCore.get_response(request)
        return response
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail="Internal server error")

@ChatRouter.get("/models", response_model=list[str])
async def models() -> list[str]:
    """
    Get a list of available models.
    """
    return ChatCore.get_models()

