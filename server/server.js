const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// Configuration from environment variables
const config = {
  port: process.env.PORT || 3001,
  apiKey: process.env.API_KEY,
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  ollamaUrl: process.env.OLLAMA_URL || 'http://localhost:11434',
  ollamaModel: process.env.OLLAMA_MODEL || 'llama3.2-vision',
  ollamaTimeout: parseInt(process.env.OLLAMA_TIMEOUT) || 60000,
  browserHeadless: process.env.BROWSER_HEADLESS === 'true',
  browserViewportWidth: parseInt(process.env.BROWSER_VIEWPORT_WIDTH) || 1920,
  browserViewportHeight: parseInt(process.env.BROWSER_VIEWPORT_HEIGHT) || 1080,
  uploadDir: process.env.UPLOAD_DIR || './uploads'
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, config.uploadDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);

    if (config.allowedOrigins.indexOf(origin) !== -1 || config.allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// API Key Authentication Middleware
function authenticateApiKey(req, res, next) {
  // Skip authentication if no API_KEY is set (development mode)
  if (!config.apiKey) {
    console.warn('⚠️  WARNING: API_KEY not set. Authentication is disabled!');
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key is required. Please provide X-API-Key header.'
    });
  }

  if (apiKey !== config.apiKey) {
    return res.status(403).json({
      success: false,
      error: 'Invalid API key.'
    });
  }

  next();
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

let browser;

async function initBrowser() {
  // Modern Chrome user agent
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  browser = await chromium.launch({
    headless: config.browserHeadless,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      `--window-size=${config.browserViewportWidth},${config.browserViewportHeight}`
    ]
  });
}

async function createContext() {
  return await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: config.browserViewportWidth, height: config.browserViewportHeight },
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    locale: 'en-US',
    timezoneId: 'America/New_York',
    geolocation: { longitude: -73.935242, latitude: 40.730610 }, // New York coordinates
    permissions: ['geolocation'],
    // Add human-like characteristics
    httpCredentials: undefined,
    offline: false,
    colorScheme: 'light',
    reducedMotion: 'no-preference',
    forcedColors: 'none',
    acceptDownloads: true,
    defaultBrowserType: 'chromium',
    bypassCSP: false,
    javaScriptEnabled: true,
    // Enable video recording
    recordVideo: {
      dir: uploadsDir,
      size: { width: config.browserViewportWidth, height: config.browserViewportHeight }
    },
    // Add additional headers to appear more human-like
    extraHTTPHeaders: {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1'
    }
  });
}

initBrowser();

async function queryOllama(prompt) {
  try {
    // Check for Google search first
    if (prompt.toLowerCase().includes('google')) {
      console.log('Detected Google search, using optimized steps');
      const searchTerm = prompt.toLowerCase().includes('find') ? 
        prompt.split('find')[1].trim() : 
        prompt.split('google')[1].trim();
        
      return [
        {
          action: 'navigate',
          selector: '',
          value: 'https://www.google.com',
          reasoning: 'Navigate to Google homepage'
        },
        {
          action: 'type',
          selector: 'textarea[name="q"]',
          value: searchTerm,
          reasoning: 'Enter search query'
        },
        {
          action: 'type',
          selector: 'textarea[name="q"]',
          value: '\n',
          reasoning: 'Submit search by pressing Enter'
        },
        {
          action: 'wait_for_element',
          selector: '#search',
          value: '',
          reasoning: 'Wait for search results to load'
        },
        {
          action: 'screenshot',
          selector: '',
          value: '',
          reasoning: 'Capture final state'
        }
      ];
    }

    // Check for YouTube actions
    if (prompt.toLowerCase().includes('youtube')) {
      console.log('Detected YouTube action, using optimized steps');
      const searchTerm = prompt.toLowerCase().includes('find') ? 
        prompt.split('find')[1].trim() : 
        prompt.split('youtube')[1].trim();
        
      return [
        {
          action: 'navigate',
          selector: '',
          value: 'https://www.youtube.com',
          reasoning: 'Navigate to YouTube homepage'
        },
        {
          action: 'wait_for_element',
          selector: 'input[name="search_query"]',
          value: '',
          reasoning: 'Wait for search box to be available'
        },
        {
          action: 'type',
          selector: 'input[name="search_query"]',
          value: searchTerm,
          reasoning: 'Enter search query'
        },
        {
          action: 'click',
          selector: 'button[aria-label="Search"]',
          value: '',
          reasoning: 'Click search button'
        },
        {
          action: 'wait_for_element',
          selector: 'ytd-video-renderer',
          value: '',
          reasoning: 'Wait for search results to load'
        },
        {
          action: 'screenshot',
          selector: '',
          value: '',
          reasoning: 'Capture final state'
        }
      ];
    }

    console.log('Sending prompt to Ollama:', prompt);
    const response = await axios.post(`${config.ollamaUrl}/api/chat`, {
      model: config.ollamaModel,
      messages: [{
        role: 'system',
        content: `You are an advanced AI web interaction agent with the following core capabilities:

Task Understanding:
    Carefully analyze the user's request
    Break down complex tasks into executable browser actions
    Plan actions systematically and logically

Browser Action Guidelines:
    Use precise, minimal selector paths
    Always verify page context before actions
    Handle potential errors gracefully
    Prioritize reliability over speed

Action Types Available:
    navigate: Go to specific URLs
    click: Interact with page elements
    type: Input text into fields
    extract_text: Retrieve page content
    wait_for_element: Ensure page readiness
    screenshot: Capture page state
    execute_javascript: Run custom scripts
    select_dropdown: Choose dropdown options
    scroll_to: Navigate page sections
    hover: Interact with elements

Action Execution Rules:
    Confirm each action's feasibility
    Provide rationale for action sequence
    Report detailed outcomes
    Adjust strategy if initial approach fails

Privacy and Ethics:
    Respect website terms of service
    Avoid destructive or unauthorized actions
    Do not bypass authentication without permission
    Protect user and site data

Output Format:
{
"action": "specific_action_type",
"selector": "precise_element_path",
"value": "optional_input_value",
"reasoning": "explanation_of_action"
}`
      }, {
        role: 'user',
        content: `Convert this request into browser automation steps: "${prompt}"`
      }],
      stream: false,
      format: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['navigate', 'click', 'type', 'extract_text', 'wait_for_element', 'screenshot', 'execute_javascript', 'select_dropdown', 'scroll_to', 'hover']
            },
            selector: { type: 'string' },
            value: { type: 'string' },
            reasoning: { type: 'string' }
          },
          required: ['action', 'reasoning']
        }
      },
      options: {
        temperature: 0
      }
    }, {
      timeout: config.ollamaTimeout
    });

    console.log('Raw Ollama response:', response.data);
    
    // Extract the response text and parse it
    const responseText = response.data.message.content;
    console.log('Response text:', responseText);

    try {
      // Try to parse the response as JSON
      const steps = JSON.parse(responseText);
      
      // Validate the steps have the correct structure
      if (Array.isArray(steps) && steps.length > 0) {
        // Add a screenshot step at the end if not present
        if (steps[steps.length - 1].action !== 'screenshot') {
          steps.push({ 
            action: 'screenshot',
            selector: '',
            value: '',
            reasoning: 'Capture final state'
          });
        }
        return steps;
      }
    } catch (parseError) {
      console.log('Failed to parse response:', parseError);
    }
    
    // Default fallback
    console.log('Using default fallback steps');
    return [{
      action: 'navigate',
      selector: '',
      value: 'https://www.google.com',
      reasoning: 'Navigate to Google homepage as fallback'
    },
    {
      action: 'screenshot',
      selector: '',
      value: '',
      reasoning: 'Capture final state'
    }];
  } catch (error) {
    console.error('Error querying Ollama:', error);
    return [{
      action: 'navigate',
      selector: '',
      value: 'https://www.google.com',
      reasoning: 'Navigate to Google homepage as error fallback'
    },
    {
      action: 'screenshot',
      selector: '',
      value: '',
      reasoning: 'Capture final state'
    }];
  }
}

async function executeSteps(page, steps) {
  const results = [];
  
  // Function to add random delay between actions
  const addRandomDelay = async () => {
    const delay = Math.floor(Math.random() * (2000 - 500) + 500); // Random delay between 500ms and 2000ms
    await new Promise(resolve => setTimeout(resolve, delay));
  };

  // Function to simulate human-like typing
  const humanType = async (selector, text) => {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    await element.focus();
    
    for (const char of text) {
      await page.type(selector, char, {
        delay: Math.floor(Math.random() * (200 - 50) + 50) // Random delay between 50ms and 200ms per character
      });
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100)); // Small random pause between characters
    }
  };

  // Function to take a screenshot with proper encoding
  const takeScreenshot = async () => {
    await page.waitForLoadState('networkidle');
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: true,
      encoding: 'base64'
    });
    results.push({
      type: 'screenshot',
      data: screenshot,
      timestamp: new Date().toISOString()
    });
  };
  
  for (const step of steps) {
    try {
      console.log(`Executing step: ${step.action} - ${step.reasoning}`);
      await addRandomDelay(); // Add random delay before each action
      
      switch (step.action) {
        case 'navigate':
          await page.goto(step.value);
          await page.waitForLoadState('networkidle');
          // Random scroll after page load to simulate reading
          if (Math.random() > 0.5) {
            await page.evaluate(() => {
              window.scrollTo({
                top: Math.random() * 100,
                behavior: 'smooth'
              });
            });
            await addRandomDelay();
          }
          await takeScreenshot();
          break;
          
        case 'click':
          await page.waitForSelector(step.selector);
          // Move mouse to element with human-like gesture
          await page.hover(step.selector);
          await addRandomDelay();
          await page.click(step.selector);
          await page.waitForLoadState('networkidle');
          await takeScreenshot();
          break;
          
        case 'type':
          if (step.value === '\n') {
            await addRandomDelay();
            // Press Enter and wait for navigation
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle' }),
              page.keyboard.press('Enter')
            ]);
            await addRandomDelay(); // Add extra delay after form submission
          } else {
            await humanType(step.selector, step.value);
          }
          await takeScreenshot();
          break;

        case 'extract_text':
          await page.waitForSelector(step.selector);
          const text = await page.$eval(step.selector, el => el.textContent);
          results.push({
            type: 'text',
            data: text,
            timestamp: new Date().toISOString()
          });
          break;

        case 'wait_for_element':
          await page.waitForSelector(step.selector, { timeout: 30000 });
          break;

        case 'execute_javascript':
          await page.evaluate(step.value);
          await page.waitForLoadState('networkidle');
          await takeScreenshot();
          break;

        case 'select_dropdown':
          await page.waitForSelector(step.selector);
          await page.selectOption(step.selector, step.value);
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'scroll_to':
          await page.waitForSelector(step.selector);
          await page.$eval(step.selector, el => el.scrollIntoView({ behavior: 'smooth' }));
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'hover':
          await page.waitForSelector(step.selector);
          await page.hover(step.selector);
          await addRandomDelay();
          await takeScreenshot();
          break;
          
        case 'screenshot':
          await takeScreenshot();
          break;
          
        default:
          console.warn(`Unknown action: ${step.action}`);
      }
      
      results.push({
        type: 'action',
        action: step.action,
        reasoning: step.reasoning,
        success: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error(`Error executing step ${step.action}:`, error);
      results.push({
        type: 'action',
        action: step.action,
        reasoning: step.reasoning,
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      // Take a screenshot even if the step fails
      try {
        await takeScreenshot();
      } catch (screenshotError) {
        console.error('Failed to take error screenshot:', screenshotError);
      }
    }
  }
  
  return results;
}

app.post('/execute-prompt', authenticateApiKey, async (req, res) => {
  try {
    const { prompt } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt. Please provide a non-empty string.'
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt too long. Maximum length is 5000 characters.'
      });
    }
    
    // Get steps from Ollama
    const steps = await queryOllama(prompt);
    console.log('Executing steps:', JSON.stringify(steps, null, 2));
    
    // Create a new context with human-like settings
    const context = await createContext();
    const page = await context.newPage();
    
    // Add random delays between actions to simulate human behavior
    page.setDefaultTimeout(30000); // 30 second timeout
    page.setDefaultNavigationTimeout(30000);
    
    // Execute the steps
    const results = await executeSteps(page, steps);
    
    // Wait for 5 seconds after the last command
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Take and save final screenshot
    const screenshotPath = path.join(uploadsDir, `screenshot-${Date.now()}.png`);
    await page.screenshot({ 
      path: screenshotPath,
      type: 'png',
      fullPage: true
    });
    const screenshotUrl = `/uploads/${path.basename(screenshotPath)}`;
    
    // Get the video path
    const videoPath = await page.video().path();
    const videoUrl = `/uploads/${path.basename(videoPath)}`;
    
    // Clean up
    await context.close();
    
    res.json({
      success: true,
      message: 'Actions executed successfully',
      steps: steps,
      results,
      finalScreenshot: screenshotUrl,
      videoUrl: videoUrl
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!config.apiKey) {
    console.warn('⚠️  WARNING: API_KEY not set. API authentication is DISABLED!');
    console.warn('   Please set API_KEY in your .env file for security.');
  } else {
    console.log('✓ API authentication enabled');
  }
  console.log(`Ollama URL: ${config.ollamaUrl}`);
  console.log(`Ollama Model: ${config.ollamaModel}`);
}); 