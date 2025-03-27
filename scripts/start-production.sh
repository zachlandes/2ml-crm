#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")/.."

# Build the production version
npm run build

# Start the production server
npm run start 