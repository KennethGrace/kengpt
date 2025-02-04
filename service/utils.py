"""
A collection of utility functions and decorators used throughout the
application.

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
import os

import time
import logging

from yaml import safe_load, FullLoader
from model.system import Configuration, ServiceType

logger = logging.getLogger("uvicorn")


def display_time(func: callable) -> callable:
    def wrapper(*args, **kwargs):
        logger.debug(f"Running {func.__name__}...")
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        elapsed_str = (
            f"{elapsed:.2f} seconds"
            if elapsed < 60 else f"{elapsed / 60:.2f} minutes"
        )
        logger.info(f"Time taken to run {func.__name__}: {elapsed_str}")
        return result

    return wrapper

_configuration: Configuration | None = None

def get_configuration() -> Configuration:
    """
    Assemble a `Configuration` object from Docker secrets and environment
    variables. Prefer Docker secrets over environment variables. Provide
    default values for missing configuration. Cache the configuration in
    a global variable to avoid re-reading the secrets and environment
    variables.
    ENVIRONMENT VARIABLES:
    `{category}_{type}_FILE`: The file path to the secret for the given
    category and type.
    `{category}_{type}`: The secret value for the given category and
    type.
    """
    global _configuration
    if _configuration:
        return _configuration
    # TODO: Implement external secret management
    def check_for_value(t: ServiceType) -> str:
        # Check for the environment variables pointing to the secrets
        value = os.getenv(f"{t.value}_FILE".upper())
        if value:
            with open(value, "r") as f:
                return f.read()
        # Check for the environment variables containing the secrets
        value = os.getenv(f"{t.value}".upper())
        if value:
            return value
        return value
    _configuration = Configuration({t.value:check_for_value(t)
                                    for t in ServiceType})
    return _configuration
