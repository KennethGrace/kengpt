from __future__ import annotations

import time
import logging

from fastapi import APIRouter, HTTPException

from model.chat import ChatRequest, ChatResponse
from service.chat import ChatService

logger = logging.getLogger("uvicorn")

ChatRouter = APIRouter(prefix="/chat")


@ChatRouter.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse | HTTPException:
    """Send a message to the AI and get a response."""
    Chat = ChatService.get_instance()
    logger.debug(f"Received chat request: {request}")
    logger.debug(f"Chat request: {request.settings.username} -> {request.content}")
    try:
        response = Chat.process(request)
        logger.debug(f"Chat response: {response.role} -> {response.content}")
        return response
    except Exception as e:
        logger.error(e)
        raise HTTPException(status_code=500, detail="Internal server error")
