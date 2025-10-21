# Browser Automation Project

![cover](https://github.com/user-attachments/assets/7ebc3b41-2db4-45c8-b790-a39da8d86ed9)

This project provides automated browser interaction capabilities using Playwright and React. It consists of a React frontend and an Express.js backend server that controls browser automation tasks.

## Project Overview

Key features:
- Browser automation using Playwright
- React-based frontend interface
- Express.js backend server
- Headless Chrome browser control
- File upload handling
- Cross-origin resource sharing (CORS) support
- Uses llama3.2-vision with ollama

## Prerequisites

- Node.js and npm installed
- A modern web browser (Chrome recommended)
- Playwright browser dependencies
- Ollama with llama3.2-vision 

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/browser-automation.git
cd browser-automation
```

2. Install dependencies:
```bash
# Install all dependencies (frontend + backend)
npm install
```

3. Configure environment variables:
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and configure your settings (see Configuration section below)
```

4. Generate a secure API key (optional, for production):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the generated key and add it to your `.env` file as `API_KEY` and `REACT_APP_API_KEY`.

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

## Configuration

### Environment Variables

The application uses environment variables for configuration. Copy `.env.example` to `.env` and customize as needed:

#### Backend Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3001` | Backend server port |
| `NODE_ENV` | `development` | Environment mode (development/production) |
| `API_KEY` | (none) | API key for authentication. Leave blank to disable auth in development |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated list of allowed CORS origins |
| `OLLAMA_URL` | `http://localhost:11434` | Ollama API endpoint |
| `OLLAMA_MODEL` | `llama3.2-vision` | Ollama model to use |
| `OLLAMA_TIMEOUT` | `60000` | Request timeout in milliseconds |
| `BROWSER_HEADLESS` | `false` | Run browser in headless mode (true/false) |
| `BROWSER_VIEWPORT_WIDTH` | `1920` | Browser viewport width |
| `BROWSER_VIEWPORT_HEIGHT` | `1080` | Browser viewport height |
| `UPLOAD_DIR` | `./uploads` | Directory for screenshots and videos |

#### Frontend Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:3001` | Backend API URL |
| `REACT_APP_API_KEY` | (none) | API key (must match backend `API_KEY`) |

**Important:** Frontend environment variables must start with `REACT_APP_` and require a dev server restart to take effect.

### API Authentication

The API supports API key authentication for securing your automation endpoints.

#### Authentication Methods

**1. API Key Authentication (Recommended for Production)**

To enable API key authentication:

1. Generate a secure API key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

2. Add to `.env`:
   ```env
   API_KEY=your-generated-key-here
   REACT_APP_API_KEY=your-generated-key-here
   ```

3. Restart both frontend and backend servers

The frontend will automatically include the API key in the `X-API-Key` header.

**2. No Authentication (Development Only)**

For local development, you can disable authentication by leaving `API_KEY` blank in `.env`:

```env
API_KEY=
```

⚠️ **WARNING:** This disables all API security. Only use in development!

#### Manual API Requests

When making manual API requests with authentication enabled:

```bash
curl -X POST http://localhost:3001/execute-prompt \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key-here" \
  -d '{"prompt": "Go to Google and search for cats"}'
```

#### Authentication Responses

- **401 Unauthorized**: Missing API key
  ```json
  {"success": false, "error": "API key is required. Please provide X-API-Key header."}
  ```

- **403 Forbidden**: Invalid API key
  ```json
  {"success": false, "error": "Invalid API key."}
  ```

### CORS Configuration

Configure allowed origins in `.env`:

```env
# Allow specific origins (recommended)
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# Allow all origins (development only - NOT secure)
ALLOWED_ORIGINS=*
```

## Usage

### Prerequisites

Before starting the application, ensure Ollama is running with the llama3.2-vision model:

```bash
# Start Ollama service (if not already running)
ollama serve

# In another terminal, pull the model if you haven't already
ollama pull llama3.2-vision
```

### Starting the Application

1. Start the backend server:
```bash
node server/server.js
```

You should see:
```
Server running on port 3001
Environment: development
✓ API authentication enabled
Ollama URL: http://localhost:11434
Ollama Model: llama3.2-vision
```

2. In a separate terminal, start the frontend:
```bash
npm start
```

3. The application will open in your default browser at [http://localhost:3000](http://localhost:3000)

### Example Prompts

Try these example prompts in the application:

- "Go to Google and search for browser automation"
- "Navigate to YouTube and search for cats"
- "Go to Wikipedia and take a screenshot"
- "Visit GitHub and scroll down"

## Architecture

- Frontend: React application (port 3000)
- Backend: Express.js server (port 3001)
- Browser Automation: Playwright with Chrome

## Security Best Practices

1. **Never commit `.env` files**: The `.env` file is in `.gitignore` for a reason
2. **Use strong API keys**: Generate keys with at least 32 bytes of randomness
3. **Enable authentication in production**: Always set `API_KEY` for production deployments
4. **Restrict CORS origins**: Never use `ALLOWED_ORIGINS=*` in production
5. **Use HTTPS**: Always use HTTPS in production to protect API keys in transit
6. **Rotate API keys**: Periodically regenerate and rotate your API keys
7. **Monitor usage**: Log and monitor API usage to detect unauthorized access

## Troubleshooting

### Server won't start
- **Error: "Ollama connection failed"**
  - Ensure Ollama is running: `ollama serve`
  - Check the Ollama URL in your `.env` file

### Authentication errors
- **Error: "API key is required"**
  - Add `API_KEY` to your `.env` file or leave it blank for development
  - Ensure `REACT_APP_API_KEY` matches `API_KEY`
  - Restart both frontend and backend after changing `.env`

### CORS errors
- Check that `ALLOWED_ORIGINS` includes your frontend URL
- Ensure both servers are running on the correct ports

## Learn More

- [React documentation](https://reactjs.org/)
- [Playwright documentation](https://playwright.dev/)
- [Express.js documentation](https://expressjs.com/)
- [Ollama documentation](https://ollama.ai/)
