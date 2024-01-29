from __future__ import annotations

import os
from time import sleep, time
from typing import Any, Dict, List
import logging

import openai

from model.chat import ChatRequest, ChatResponse, Role


logger = logging.getLogger("uvicorn")


class ChatGPT:
    """ChatGPT is a plugin that uses the OpenAI Assistant API to generate responses."""

    def __init__(self):
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        if openai.api_key is None:
            logger.warning("OPENAI_API_KEY not set")
        self.assistant_id = os.environ.get("OPENAI_ASSISTANT_ID")
        if self.assistant_id is None:
            logger.warning("OPENAI_ASSISTANT_ID not set")
        self.assistant = openai.beta.assistants.retrieve(self.assistant_id)

    def __call__(self, request: ChatRequest) -> ChatResponse:
        """Send a message to the OpenAI API and get a response."""
        start_time = time()
        if request.thread_id is not None:
            thread = openai.beta.threads.retrieve(thread_id=request.thread_id)
        else:
            thread = openai.beta.threads.create()
        message = openai.beta.threads.messages.create(
            thread_id=thread.id, content=request.content, role="user"
        )
        runner = openai.beta.threads.runs.create(
            thread_id=thread.id,
            assistant_id=self.assistant.id,
            instructions=request.settings.instruction or None,
            tools=[],
        )
        i = 0
        while runner.status not in ["completed", "failed", "expired", "cancelled"]:
            if i > 600:
                raise Exception("Timeout")
            sleep(0.1)
            runner = openai.beta.threads.runs.retrieve(
                run_id=runner.id, thread_id=thread.id
            )
            i += 1
        if runner.status in ["failed", "expired", "cancelled"]:
            raise Exception(runner.status)
        messages = openai.beta.threads.messages.list(
            thread_id=thread.id, order="asc"
        ).data
        if len(messages) == 0:
            raise Exception("No messages")
        new_strings = [
            entry.text.value
            for m in messages
            if m.created_at > message.created_at
            for entry in m.content
        ]
        return ChatResponse(
            content="\n".join(new_strings),
            role=Role.Assistant,
            timestamp=messages[-1].created_at,
            runtime=int((time() - start_time) * 1000),
            thread_id=thread.id,
        )
