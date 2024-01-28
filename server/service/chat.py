from __future__ import annotations

from typing import Callable, Dict

from plugins.chatgpt import run_chatgpt
from model.chat import ChatRequest, ChatResponse
from model.system import ServiceType
from utils import get_configuration

_available_services: Dict[str, Callable[[ChatRequest], ChatResponse]] = {
    "chatgpt": run_chatgpt,
}


class ChatService:
    instance = None

    @staticmethod
    def get_instance():
        if ChatService.instance is None:
            ChatService.instance = ChatService()
        return ChatService.instance

    def __init__(self):
        if ChatService.instance is not None:
            raise Exception(
                "ChatService is a singleton class! Use ChatService.get_instance()"
            )

    def process(self, request: ChatRequest) -> ChatResponse:
        service_name = get_configuration().services[ServiceType.Chat].name
        return _available_services[service_name](request)
