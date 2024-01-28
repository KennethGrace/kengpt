"""
The KenGPT Service serves natural language processing.

This file is part of The KenGPT Project. The KenGPT Project is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3
of the License, or (at your option) any later version.
The KenGPT Project is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more
details.
You should have received a copy of the GNU General Public License along with The KenGPT Project.
If not, see <https://www.gnu.org/licenses/>.
"""

import logging
import sys

import fastapi
from fastapi.middleware.cors import CORSMiddleware

from route.chat import ChatRouter

logging.basicConfig(level=logging.DEBUG, stream=sys.stdout)

application = fastapi.FastAPI(
    title="KenGPT Service",
    description="The KenGPT Service serves natural language processing.",
    version="0.1.0",
)

application.include_router(ChatRouter, prefix="/api")

application.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
