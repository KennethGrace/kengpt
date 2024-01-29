#!/bin/sh

# Check secret sources for runtime variable sourcing.
# TODO: Add secret sources.

# Start the server in the container.
uvicorn app:application --host 0.0.0.0 --port 8080