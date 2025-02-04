
import os
import io
import json
import logging
import uuid
import time

from ollama import chat, Client
from ollama import Message

from model import ToolBox, FuncTool
from model.message import ChatContent, ChatRequest, ChatResponse, Role, Status

import re

ollama_client = Client(
    host=os.getenv("OLLAMA_API_URL", "http://localhost:11434"),
)

def separate_thought_from_content(text: str) -> tuple[str, str | None]:
    """
    This is a utility function that separates any thought from the content of a
    response message. Thought is expected to be enclosed in angle bracket tags
    "<think>" and "</think>". If no thought is found, the second element of the
    returned tuple will be None.
    """
    # re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
    thought = re.search(r"<think>(.*?)</think>", text, flags=re.DOTALL)
    if thought:
        content = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
        return content, thought.group(1)
    return text, None

class LlamaCore:

    def __init__(self,
                 system_prompt: str,
                 model: str = "deepseek-r1:7b",
                 toolboxes: list[ToolBox] | None = None):
        self.model = model
        self.system_prompt = system_prompt
        self._toolboxes: dict[str, ToolBox] = {
            tbx.name: tbx for tbx in toolboxes} if toolboxes else {}

    def get_response(self, request: ChatRequest) -> ChatResponse:
        """Get a response from the Assistant."""
        system_message = Message(
            content=request.profile.instruction,
            role="system"
        )
        request_model = request.profile.model or self.model
        request_role = "user" if request.role == "user" else "assistant"
        chat_history = [system_message] + [
            Message(content=msg.render_text(),
                    role="user" if msg.role == "user" else "assistant")
            for msg in request.history
        ]
        chat_history.append(
            Message(content=request.render_text(), role=request_role))
        response = ollama_client.chat(model=request_model, messages=chat_history)
        response_content, response_thought = separate_thought_from_content(
            response.message.content or "I'm sorry. Something went wrong."
        )
        return ChatResponse(
            timestamp=int(time.time() * 1000),
            status=Status.Running,
            role=Role.Assistant,
            contents=[
                ChatContent(
                    format="text",
                    content=response_content,
                )
            ],
            thoughts=[response_thought] if response_thought else None,
            model_signature=request_model,
            session_id=request.session_id or uuid.uuid4()
        )
    
    def get_models(self) -> list[str]:
        """Get a list of available models from the Assistant."""
        response = ollama_client.list()
        all_models = [model.model for model in response.models if model.model]
        # Filter any models that have prefixes (ie. "prefix/model:size")
        return [model for model in all_models if "/" not in model]


    # def add_toolbox(self, toolbox: ToolBox):
    #     """Add a toolbox to the Assistant."""
    #     self._toolboxes.update({toolbox.name: toolbox})

    # def find_tool(self, tool_name: str) -> Optional[FuncTool]:
    #     """Find a tool by name from within any of the registered toolboxes."""
    #     return next((tool for toolbox in self._toolboxes.values() for tool in toolbox if tool.name == tool_name), None)

    # def list_chat_completion_tools(self) -> list[ChatCompletionToolParam]:
    #     """List all the chat completion tools from all the registered toolboxes."""
    #     return [ChatCompletionToolParam(**tool_param) for toolbox in self._toolboxes.values() for tool_param in toolbox.openapi]
