#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")/.."

# Default port (can be overridden by environment variable)
export PORT=${PORT:-4500}

# Find npm path
NPM_PATH=$(which npm)
if [ -z "$NPM_PATH" ]; then
  # Try common locations
  for path in "/usr/local/bin/npm" "/opt/homebrew/bin/npm" "$HOME/.nvm/versions/node/*/bin/npm"; do
    if [ -x "$path" ]; then
      NPM_PATH="$path"
      break
    fi
  done
fi

if [ -z "$NPM_PATH" ]; then
  echo "ERROR: Could not find npm command. Please ensure npm is installed and in your PATH."
  exit 1
fi

echo "Using npm at: $NPM_PATH"

# Build the production version
"$NPM_PATH" run build

# Start the production server
"$NPM_PATH" run start 