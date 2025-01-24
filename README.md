# Browser Automation Project
![cover](https://github.com/user-attachments/assets/05365779-ccee-46fc-bfec-0c503784e90e)

This project provides automated browser interaction capabilities using Playwright and React. It consists of a React frontend and an Express.js backend server that controls browser automation tasks.

## Project Overview

Key features:
- Browser automation using Playwright
- React-based frontend interface
- Express.js backend server
- Headless Chrome browser control
- File upload handling
- Cross-origin resource sharing (CORS) support

## Prerequisites

- Node.js and npm installed
- A modern web browser (Chrome recommended)
- Playwright browser dependencies

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/browser-automation.git
cd browser-automation
```

2. Install dependencies:
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
```

## Available Scripts

### Frontend

#### `npm start`

Runs the React app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Backend

#### `node server.js` (from server directory)

Starts the Express.js server on port 3001.\
The server handles browser automation tasks and provides API endpoints for the frontend.

### Production

#### `npm run build`

Builds the React app for production to the `build` folder.

## Usage

1. Start the backend server:
```bash
cd server
node server.js
```

2. In a separate terminal, start the frontend:
```bash
npm start
```

3. The application will open in your default browser at [http://localhost:3000](http://localhost:3000)

## Architecture

- Frontend: React application (port 3000)
- Backend: Express.js server (port 3001)
- Browser Automation: Playwright with Chrome

## Learn More

- [React documentation](https://reactjs.org/)
- [Playwright documentation](https://playwright.dev/)
- [Express.js documentation](https://expressjs.com/)
