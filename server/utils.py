from __future__ import annotations

import time
import logging

from yaml import safe_load, FullLoader
from model.system import Configuration

logger = logging.getLogger("uvicorn")


def display_time(func: callable) -> callable:
    def wrapper(*args, **kwargs):
        logger.debug(f"Running {func.__name__}...")
        start = time.time()
        result = func(*args, **kwargs)
        elapsed = time.time() - start
        elapsed_str = (
            f"{elapsed:.2f} seconds" if elapsed < 60 else f"{elapsed / 60:.2f} minutes"
        )
        logger.info(f"Time taken to run {func.__name__}: {elapsed_str}")
        return result

    return wrapper


_config: Configuration = None


def get_configuration() -> Configuration:
    """Load the configuration from the config.yml file and cache it for all requests."""
    try:
        global _config
        if _config is None:
            with open("config.yml", "r") as f:
                _config = Configuration(**safe_load(f))
        return _config
    except FileNotFoundError:
        logger.fatal("config.yml not found!")
        raise
    except Exception as e:
        logger.fatal("Error loading config.yml!")
        logger.debug(e)
        raise
