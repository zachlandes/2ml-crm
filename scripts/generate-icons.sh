#!/bin/bash

# Check if convert (ImageMagick) is installed
if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it with:"
    echo "  brew install imagemagick"
    exit 1
fi

# Get the absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Create public directory if it doesn't exist
mkdir -p "$PROJECT_DIR/public"

# Generate notification icon
convert -size 192x192 xc:transparent \
    -fill "#0072F5" -draw "circle 96,96 96,160" \
    -fill white -pointsize 120 -font Arial -gravity center -annotate 0 "2" \
    "$PROJECT_DIR/public/notification-icon.png"

# Generate notification badge
convert -size 64x64 xc:transparent \
    -fill "#0072F5" -draw "circle 32,32 32,56" \
    "$PROJECT_DIR/public/notification-badge.png"

echo "Notification icons generated in public/ directory" 