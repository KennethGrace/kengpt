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

from fastapi import APIRouter, Request
from fastapi.responses import StreamingResponse
from google.cloud import texttospeech
import io

logger = logging.getLogger("uvicorn")

SpeakRouter = APIRouter(prefix="/speak")

def speak_text(text: str) -> bytes:
    """Speak the provided text and return MP3 binary data."""
    client = texttospeech.TextToSpeechClient()
    synthesis_input = texttospeech.SynthesisInput(text=text)
    voice = texttospeech.VoiceSelectionParams(
        language_code="en-US",
        ssml_gender=texttospeech.SsmlVoiceGender.FEMALE,
        name="en-US-Journey-O"
    )
    audio_config = texttospeech.AudioConfig(
        audio_encoding=texttospeech.AudioEncoding.MP3,
    )
    response = client.synthesize_speech(
        input=synthesis_input, voice=voice, audio_config=audio_config
    )
    return response.audio_content

@SpeakRouter.post("")
async def serve_speech(request: Request):
    """Serve the synthesized speech as an MP3 file."""
    data = await request.json()
    text = data.get("text", "")
    if not text:
        return {"error": "Text is required"}
    
    mp3_data = speak_text(text)
    return StreamingResponse(
        io.BytesIO(mp3_data),
        media_type="audio/mpeg",
        headers={"Content-Disposition": "inline; filename=speech.mp3"}
    )