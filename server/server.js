const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const app = express();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

let browser;

async function initBrowser() {
  // Modern Chrome user agent
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
  
  browser = await chromium.launch({ 
    headless: false,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1920,1080'
    ]
  });
}

async function createContext() {
  return await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
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
      dir: 'uploads',
      size: { width: 1920, height: 1080 }
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
    console.log('Sending prompt to Ollama:', prompt);
    const response = await axios.post('http://localhost:11434/api/chat', {
      model: 'llama3.2-vision',
      messages: [{
        role: 'system',
        content: `You are a browser automation expert. Convert user requests into a series of browser automation steps.
Common selectors and patterns:
- Google search box: textarea[name="q"]
- YouTube search box: input#search
- Wikipedia search: input#searchInput
- Common form inputs: input[name="email"], input[name="password"]
- Links: a[href*="keyword"]`
      }, {
        role: 'user',
        content: `Convert this request into browser automation steps: "${prompt}". 
Here are example patterns:

1. Google Search (use Enter key, no click needed):
[
  {"action": "goto", "params": {"url": "https://www.google.com"}},
  {"action": "type", "params": {"selector": "textarea[name='q']", "text": "search term"}},
  {"action": "type", "params": {"selector": "textarea[name='q']", "text": "\\n"}}
]

2. YouTube Search (requires click on search button):
[
  {"action": "goto", "params": {"url": "https://www.youtube.com"}},
  {"action": "type", "params": {"selector": "input#search", "text": "video search"}},
  {"action": "click", "params": {"selector": "button#search-icon-legacy"}}
]

3. Login Flow (requires click on submit):
[
  {"action": "goto", "params": {"url": "https://example.com/login"}},
  {"action": "type", "params": {"selector": "input[name='email']", "text": "user@example.com"}},
  {"action": "type", "params": {"selector": "input[name='password']", "text": "password123"}},
  {"action": "click", "params": {"selector": "button[type='submit']"}}
]

Return ONLY the JSON array matching this format. For Google searches, always use Enter key (\\n) to submit, never use click.`
      }],
      stream: false,
      format: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            action: {
              type: 'string',
              enum: ['goto', 'type', 'click', 'screenshot']
            },
            params: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                selector: { type: 'string' },
                text: { type: 'string' }
              }
            }
          },
          required: ['action', 'params']
        }
      },
      options: {
        temperature: 0
      }
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
          steps.push({ action: 'screenshot', params: {} });
        }
        return steps;
      }
      
      // If steps don't match expected format, create default steps for Google
      if (prompt.toLowerCase().includes('google')) {
        console.log('Creating default Google search steps');
        let searchTerm = '';
        if (prompt.toLowerCase().includes('search for')) {
          searchTerm = prompt.toLowerCase().split('search for')[1].trim();
        } else if (prompt.toLowerCase().includes('type in')) {
          searchTerm = prompt.toLowerCase().split('type in')[1].trim();
        } else {
          searchTerm = prompt.toLowerCase().split('google')[1].trim();
        }
        
        searchTerm = searchTerm.replace(/\s+in\s+.*$/, '').trim();
        console.log('Extracted search term:', searchTerm);
        
        // Return steps with Enter key press, no click action
        return [
          {
            action: 'goto',
            params: {
              url: 'https://www.google.com'
            }
          },
          {
            action: 'type',
            params: {
              selector: 'textarea[name="q"]',
              text: searchTerm
            }
          },
          {
            action: 'type',
            params: {
              selector: 'textarea[name="q"]',
              text: '\n'
            }
          },
          {
            action: 'screenshot',
            params: {}
          }
        ];
      }
    } catch (parseError) {
      console.log('Failed to parse response:', parseError);
    }
    
    // Default fallback
    console.log('Using default fallback steps');
    return [{
      action: 'goto',
      params: {
        url: 'https://www.google.com'
      }
    },
    {
      action: 'screenshot',
      params: {}
    }];
  } catch (error) {
    console.error('Error querying Ollama:', error);
    return [{
      action: 'goto',
      params: {
        url: 'https://www.google.com'
      }
    },
    {
      action: 'screenshot',
      params: {}
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
      await addRandomDelay(); // Add random delay before each action
      
      switch (step.action) {
        case 'goto':
          await page.goto(step.params.url);
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
          await page.waitForSelector(step.params.selector);
          // Move mouse to element with human-like gesture
          await page.hover(step.params.selector);
          await addRandomDelay();
          await page.click(step.params.selector);
          await page.waitForLoadState('networkidle');
          await takeScreenshot();
          break;
          
        case 'type':
          if (step.params.text === '\n') {
            await addRandomDelay();
            // Press Enter and wait for navigation
            await Promise.all([
              page.waitForNavigation({ waitUntil: 'networkidle' }),
              page.keyboard.press('Enter')
            ]);
            await addRandomDelay(); // Add extra delay after form submission
          } else {
            await humanType(step.params.selector, step.params.text);
          }
          await takeScreenshot();
          break;
          
        case 'screenshot':
          await takeScreenshot();
          break;
          
        default:
          console.warn(`Unknown action: ${step.action}`);
      }
      
    } catch (error) {
      console.error(`Error executing step ${step.action}:`, error);
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

app.post('/execute-prompt', async (req, res) => {
  try {
    const { prompt } = req.body;
    
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 