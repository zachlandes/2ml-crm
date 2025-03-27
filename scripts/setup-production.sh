#!/bin/bash

# Get the absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Create logs directory
mkdir -p "$PROJECT_DIR/logs"

# Replace placeholder paths in the plist file
sed "s|ABSOLUTE_PATH_TO_BE_REPLACED|$PROJECT_DIR|g" "$PROJECT_DIR/scripts/com.2ml-crm.plist" > "$PROJECT_DIR/scripts/com.2ml-crm.configured.plist"

# Copy the launch agent to the user's LaunchAgents directory
mkdir -p ~/Library/LaunchAgents
cp "$PROJECT_DIR/scripts/com.2ml-crm.configured.plist" ~/Library/LaunchAgents/com.2ml-crm.plist

# Load the launch agent
launchctl unload ~/Library/LaunchAgents/com.2ml-crm.plist 2>/dev/null || true
launchctl load ~/Library/LaunchAgents/com.2ml-crm.plist

echo "Setup complete! The 2ML CRM will now start automatically when you log in."
echo "To start it now, run: launchctl start com.2ml-crm"
echo "To stop it, run: launchctl stop com.2ml-crm"
echo "To view logs:"
echo "  - Output log: tail -f $PROJECT_DIR/logs/output.log"
echo "  - Error log: tail -f $PROJECT_DIR/logs/error.log" 