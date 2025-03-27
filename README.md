# 2ML CRM

A modern CRM application for managing connections and relationships.
![2ML CRM Dashboard](/public/images/screenshot_home.png)
![2ML CRM Contact Details](/public/images/Details.png)
![2ML CRM Send Message](/public/images/SendMessage.png)

## Features

- Connection management with status tracking
- Tagging system for organizing contacts
- Task reminders for follow-ups
- Message history and templates
- Activity timeline for each connection
- Filtering by status and tags

## Importing LinkedIn Connections

You can populate this CRM with your LinkedIn connections by following these steps:

### 1. Request Your LinkedIn Data Export

1. Log in to your LinkedIn account
2. Click on your profile picture in the top right corner
3. Select **Settings & Privacy**
4. Navigate to the **Data Privacy** section
5. Click on **Get a copy of your data**
6. Select **Connections** (or you can request the full archive)
7. Submit your request

LinkedIn will prepare your data and send you an email when it's ready for download. This process usually takes 24 hours or less.

### 2. Download and Prepare Your Connections CSV

1. Once you receive the email from LinkedIn, download your data archive
2. Extract the ZIP file
3. Locate the `Connections.csv` file in the extracted folder

### 3. Import Connections to 2ML CRM

1. Copy the `Connections.csv` file to the `/Data` folder in your 2ML CRM project directory
2. Ensure the file is named exactly `Connections.csv` (case-sensitive)
3. Restart the application with `npm run dev`
4. The application will automatically import your connections on startup

### Data Format

The LinkedIn `Connections.csv` file contains columns that will be mapped to your CRM:

- **First Name**: Contact's first name
- **Last Name**: Contact's last name
- **Email Address**: Contact's email
- **Company**: Company name
- **Position**: Job title
- **Connected On**: Date when you connected

The application automatically processes this file and:

1. Creates unique IDs for each connection
2. Assigns a default "new" status to all imported connections
3. Merges duplicate contacts (same first and last name)
4. Preserves historical position data when merging duplicates
5. Imports all data into the local SQLite database

**Note**: The import process only runs if no connections are found in the database. If you already have connections and want to re-import, you'll need to reset the database.

### Resetting the Database

If you want to start fresh or re-import your LinkedIn connections:

1. Stop the application if it's running
2. The database file is stored at `data/crm.db`. The application will create this lowercase `data` folder automatically if it doesn't exist. Delete this file to reset the database.
3. Ensure your `Connections.csv` file is in the `/Data` folder (note the uppercase D)
4. Start the application with `npm run dev`

The application will detect that the database is missing, create a new one, and import your connections from the CSV file.

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React

## Running the Application

```bash
# Install dependencies
npm install

# Run the application
npm run dev
```

Once you've run these commands, the application will be available at [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: This application is designed to run locally on your machine. The `npm run dev` command is not just for development - it's how you actually use the application.

## Running in Production Mode

While developing, you can use `npm run dev`. For daily usage, you can run the CRM as a background service with full production optimizations and browser notifications.

### Using the Management Tool

The easiest way to manage your CRM is using the included management tool:

```bash
npm run manage
```

This opens an interactive menu with options to:
- Start/stop the CRM
- View logs
- Set up the production environment
- Generate notification icons
- Open the CRM in your browser

### One-Time Setup

1. Run the setup script to configure the CRM as a background service:

```bash
npm run setup-production
```

2. Generate notification icons (requires ImageMagick):

```bash
# Install ImageMagick if needed
brew install imagemagick

# Generate icons
npm run manage
# Then select option 5
```

3. The setup will:
   - Configure the CRM to start automatically when you log in
   - Set up logging to files in the `logs` directory
   - Enable browser notifications for reminders

### Manual Control

You can manually control the service with these commands:

```bash
# Start the CRM
launchctl start com.2ml-crm

# Stop the CRM
launchctl stop com.2ml-crm

# Remove from auto-start
launchctl unload ~/Library/LaunchAgents/com.2ml-crm.plist

# Add back to auto-start
launchctl load ~/Library/LaunchAgents/com.2ml-crm.plist

# View logs
tail -f ./logs/output.log
tail -f ./logs/error.log
```

### Browser Notifications

The production mode enables browser notifications for reminders:
- Notifications will appear even when the browser is closed
- Clicking a notification takes you to the relevant connection
- Reminders are checked automatically in the background

**Note:** You must grant notification permissions when prompted.