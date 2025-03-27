#!/bin/bash

# Get the absolute path of the project directory
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Define color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

show_menu() {
    clear
    echo -e "${BLUE}===============================${NC}"
    echo -e "${GREEN}      2ML CRM Manager      ${NC}"
    echo -e "${BLUE}===============================${NC}"
    echo ""
    echo "1) Start CRM"
    echo "2) Stop CRM"
    echo "3) View logs"
    echo "4) Setup production environment"
    echo "5) Generate notification icons"
    echo "6) Open CRM in browser"
    echo "0) Exit"
    echo ""
    echo -e "Current status: $(get_status)"
    echo ""
}

get_status() {
    if launchctl list | grep -q com.2ml-crm; then
        echo -e "${GREEN}RUNNING${NC}"
    else
        echo -e "${RED}STOPPED${NC}"
    fi
}

start_crm() {
    echo "Starting 2ML CRM..."
    launchctl start com.2ml-crm
    sleep 2
    echo "Done. CRM should be available at http://localhost:3000"
}

stop_crm() {
    echo "Stopping 2ML CRM..."
    launchctl stop com.2ml-crm
    sleep 2
    echo "Done."
}

view_logs() {
    echo "Select log to view:"
    echo "1) Output log"
    echo "2) Error log"
    echo "0) Back to main menu"
    
    read -p "Enter choice: " log_choice
    
    case $log_choice in
        1)
            echo "Press Ctrl+C to stop viewing the log"
            sleep 2
            tail -f "$PROJECT_DIR/logs/output.log"
            ;;
        2)
            echo "Press Ctrl+C to stop viewing the log"
            sleep 2
            tail -f "$PROJECT_DIR/logs/error.log"
            ;;
        0)
            return
            ;;
        *)
            echo "Invalid choice"
            sleep 2
            ;;
    esac
}

setup_production() {
    echo "Setting up production environment..."
    bash "$PROJECT_DIR/scripts/setup-production.sh"
    read -p "Press Enter to continue..."
}

generate_icons() {
    echo "Generating notification icons..."
    bash "$PROJECT_DIR/scripts/generate-icons.sh"
    read -p "Press Enter to continue..."
}

open_browser() {
    echo "Opening CRM in browser..."
    open http://localhost:3000
}

# Main loop
while true; do
    show_menu
    read -p "Enter choice: " choice
    
    case $choice in
        1)
            start_crm
            ;;
        2)
            stop_crm
            ;;
        3)
            view_logs
            ;;
        4)
            setup_production
            ;;
        5)
            generate_icons
            ;;
        6)
            open_browser
            ;;
        0)
            echo "Exiting..."
            exit 0
            ;;
        *)
            echo "Invalid choice"
            sleep 2
            ;;
    esac
done 