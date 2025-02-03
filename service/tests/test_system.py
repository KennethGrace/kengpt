import time
from server.model.chat import ChatRequest
from system import System


def test_process():
    """Test the process function of the system."""
    system = System.get_instance()
    request = ChatRequest(
        **{
            "role": "user",
            "content": "Hello, world!",
            "timestamp": int(time.time() * 1000),
            "settings": {
                "username": "Test User",
                "botname": "Test Bot",
                "instruction": "",
                "acknowledge": "Understood.",
            },
            "memory": [],
            "fileContent": "",
        }
    )
    response = system.process(request)
    print(response)
    assert response["role"] == "assistant"
