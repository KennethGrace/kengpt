#!/bin/bash

# Find what command to use to run python
if command -v python3 &> /dev/null; then
  python=python3
elif command -v python &> /dev/null; then
  python=python
elif command -v py &> /dev/null; then
  python=py
else
  echo "Python not found"
  exit 1
fi

# Install the dependencies
# ${python} -m pip install -r requirements.txt

# Run the server with debug mode
${python} -m uvicorn app:application --host 0.0.0.0 --port 5001 \
  --reload --log-level debug
