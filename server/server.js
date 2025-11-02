const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

// Import logger, metrics, and database
const logger = require('./logger');
const metrics = require('./metrics');

// Use file-based database for testing (fallback when Prisma is unavailable)
const db = require('./services/file-database.service');

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

// HTTP Request Logging Middleware
app.use(morgan('combined', { stream: logger.stream }));

// Metrics Tracking Middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.logRequest(req);

  // Intercept response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    metrics.recordRequest(res.statusCode, duration);
    logger.logResponse(req, res, duration);
  });

  next();
});

// API Key Authentication Middleware
function authenticateApiKey(req, res, next) {
  const clientIp = req.ip || req.connection.remoteAddress;

  // Skip authentication if no API_KEY is set (development mode)
  if (!config.apiKey) {
    logger.warn('API_KEY not set. Authentication is disabled!');
    return next();
  }

  const apiKey = req.headers['x-api-key'];

  if (!apiKey) {
    logger.logAuth(false, clientIp, { reason: 'missing_key' });
    metrics.recordAuthAttempt(false);
    return res.status(401).json({
      success: false,
      error: 'API key is required. Please provide X-API-Key header.'
    });
  }

  if (apiKey !== config.apiKey) {
    logger.logAuth(false, clientIp, { reason: 'invalid_key' });
    metrics.recordAuthAttempt(false);
    return res.status(403).json({
      success: false,
      error: 'Invalid API key.'
    });
  }

  logger.logAuth(true, clientIp);
  metrics.recordAuthAttempt(true);
  next();
}

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

let browser;

async function initBrowser() {
  if (browser) return browser;

  try {
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
    logger.info('Browser initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize browser', { error: error.message });
    logger.warn('Server will run without browser automation capabilities');
    logger.warn('To enable browser automation, run: npx playwright install chromium');
  }

  return browser;
}

async function createContext() {
  if (!browser) {
    await initBrowser();
  }

  if (!browser) {
    throw new Error('Browser not available. Please install Playwright browsers: npx playwright install chromium');
  }

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

// Initialize browser on first request instead of startup
// initBrowser();

async function queryOllama(prompt) {
  const startTime = Date.now();

  try {
    // Check for Google search first
    if (prompt.toLowerCase().includes('google')) {
      logger.info('Detected Google search, using optimized steps');
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
      logger.info('Detected YouTube action, using optimized steps');
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

    logger.logOllamaRequest(prompt);
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

Action Types Available (50+ actions):

BASIC INTERACTIONS:
    navigate: Go to specific URLs
    click: Click on page elements
    double_click: Double-click on elements
    right_click: Right-click for context menu
    hover: Hover over elements
    drag_and_drop: Drag element to another element (selector=source, value=target)

INPUT & FORMS:
    type: Input text into fields
    type_text: Type at current focus position
    clear_input: Clear input field content
    focus: Focus on an element
    press_key: Press keyboard key (Enter, Escape, ArrowDown, etc.)
    check_checkbox: Check a checkbox
    uncheck_checkbox: Uncheck a checkbox
    select_dropdown: Choose dropdown option
    select_text: Select text in element

FILE OPERATIONS:
    upload_file: Upload file (selector=input, value=file path)
    download_file: Download file by clicking element

NAVIGATION:
    go_back: Navigate back in history
    go_forward: Navigate forward in history
    reload: Reload current page
    close_tab: Close current tab

FRAME & WINDOW:
    switch_to_iframe: Switch to iframe (selector=iframe)
    switch_to_main_frame: Switch back to main frame
    switch_to_new_tab: Click element and switch to new tab

DATA EXTRACTION:
    extract_text: Get text content from element
    get_attribute: Get element attribute (selector=element, value=attribute name)
    get_title: Get page title
    get_url: Get current URL
    element_exists: Check if element exists
    is_visible: Check if element is visible
    get_element_count: Count matching elements
    get_cookies: Get all cookies
    get_alert_text: Get alert dialog text

WAITING:
    wait_for_element: Wait for element to appear
    wait_for_navigation: Wait for page navigation
    wait_for_timeout: Wait for specified milliseconds
    wait_for_url: Wait for specific URL

SCROLLING:
    scroll_to: Scroll to specific element
    scroll_to_top: Scroll to page top
    scroll_to_bottom: Scroll to page bottom
    scroll_by: Scroll by pixels (value=pixels, positive=down)

SCREENSHOTS:
    screenshot: Capture full page screenshot
    screenshot_element: Capture specific element screenshot

COOKIES & STORAGE:
    set_cookie: Set cookie (value=JSON cookie object)
    get_cookies: Get all cookies
    clear_cookies: Clear all cookies

ALERTS & DIALOGS:
    accept_alert: Accept alert/confirm dialog
    dismiss_alert: Dismiss alert/confirm dialog
    get_alert_text: Get alert message text

ADVANCED:
    execute_javascript: Run custom JavaScript code

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
              enum: [
                'navigate', 'click', 'double_click', 'right_click', 'hover', 'drag_and_drop',
                'type', 'type_text', 'clear_input', 'focus', 'press_key', 'check_checkbox', 'uncheck_checkbox', 'select_dropdown', 'select_text',
                'upload_file', 'download_file',
                'go_back', 'go_forward', 'reload', 'close_tab',
                'switch_to_iframe', 'switch_to_main_frame', 'switch_to_new_tab',
                'extract_text', 'get_attribute', 'get_title', 'get_url', 'element_exists', 'is_visible', 'get_element_count', 'get_cookies', 'get_alert_text',
                'wait_for_element', 'wait_for_navigation', 'wait_for_timeout', 'wait_for_url',
                'scroll_to', 'scroll_to_top', 'scroll_to_bottom', 'scroll_by',
                'screenshot', 'screenshot_element',
                'set_cookie', 'clear_cookies',
                'accept_alert', 'dismiss_alert',
                'execute_javascript'
              ]
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

    logger.debug('Raw Ollama response received', {
      model: config.ollamaModel,
      hasContent: !!response.data.message?.content
    });

    // Extract the response text and parse it
    const responseText = response.data.message.content;
    logger.debug('Response text extracted', {
      length: responseText?.length
    });

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

        const responseTime = Date.now() - startTime;
        logger.logOllamaResponse(true, steps, { responseTime });
        metrics.recordOllamaRequest(true, responseTime);

        return steps;
      }
    } catch (parseError) {
      logger.warn('Failed to parse Ollama response', {
        error: parseError.message,
        responsePreview: responseText?.substring(0, 200)
      });
    }

    // Default fallback
    logger.info('Using default fallback steps');
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
    const responseTime = Date.now() - startTime;
    logger.logError(error, {
      context: 'queryOllama',
      promptLength: prompt.length,
      ollamaUrl: config.ollamaUrl
    });
    metrics.recordOllamaRequest(false, responseTime);
    metrics.recordError('ollama_query');

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
      logger.info('Executing browser step', {
        action: step.action,
        reasoning: step.reasoning,
        selector: step.selector
      });
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

        // Advanced Interaction Actions
        case 'double_click':
          await page.waitForSelector(step.selector);
          await page.hover(step.selector);
          await addRandomDelay();
          await page.dblclick(step.selector);
          await page.waitForLoadState('networkidle');
          await takeScreenshot();
          break;

        case 'right_click':
          await page.waitForSelector(step.selector);
          await page.click(step.selector, { button: 'right' });
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'drag_and_drop':
          // step.selector = source, step.value = target selector
          await page.waitForSelector(step.selector);
          await page.waitForSelector(step.value);
          await page.dragAndDrop(step.selector, step.value);
          await addRandomDelay();
          await takeScreenshot();
          break;

        // File Operations
        case 'upload_file':
          // step.selector = file input, step.value = file path
          await page.waitForSelector(step.selector);
          await page.setInputFiles(step.selector, step.value);
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'download_file':
          // Click download button and wait for download
          const [download] = await Promise.all([
            page.waitForEvent('download'),
            page.click(step.selector)
          ]);
          const downloadPath = path.join(uploadsDir, download.suggestedFilename());
          await download.saveAs(downloadPath);
          results.push({
            type: 'download',
            data: downloadPath,
            filename: download.suggestedFilename(),
            timestamp: new Date().toISOString()
          });
          break;

        // Navigation Actions
        case 'go_back':
          await page.goBack({ waitUntil: 'networkidle' });
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'go_forward':
          await page.goForward({ waitUntil: 'networkidle' });
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'reload':
          await page.reload({ waitUntil: 'networkidle' });
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'close_tab':
          await page.close();
          break;

        // Frame/Window Switching
        case 'switch_to_iframe':
          // step.selector = iframe selector
          await page.waitForSelector(step.selector);
          const frameElement = await page.$(step.selector);
          const frame = await frameElement.contentFrame();
          // Store frame reference for subsequent actions
          page._currentFrame = frame;
          break;

        case 'switch_to_main_frame':
          page._currentFrame = null;
          break;

        case 'switch_to_new_tab':
          // Wait for new tab to open and switch to it
          const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            page.click(step.selector)
          ]);
          await newPage.waitForLoadState('networkidle');
          // Replace page reference
          page = newPage;
          await takeScreenshot();
          break;

        // Data Extraction Actions
        case 'get_attribute':
          // step.selector = element, step.value = attribute name
          await page.waitForSelector(step.selector);
          const attrValue = await page.$eval(step.selector, (el, attr) => el.getAttribute(attr), step.value);
          results.push({
            type: 'attribute',
            data: attrValue,
            attribute: step.value,
            timestamp: new Date().toISOString()
          });
          break;

        case 'get_title':
          const title = await page.title();
          results.push({
            type: 'title',
            data: title,
            timestamp: new Date().toISOString()
          });
          break;

        case 'get_url':
          const url = page.url();
          results.push({
            type: 'url',
            data: url,
            timestamp: new Date().toISOString()
          });
          break;

        case 'element_exists':
          const exists = await page.$(step.selector) !== null;
          results.push({
            type: 'exists',
            data: exists,
            selector: step.selector,
            timestamp: new Date().toISOString()
          });
          break;

        case 'is_visible':
          await page.waitForSelector(step.selector);
          const visible = await page.isVisible(step.selector);
          results.push({
            type: 'visibility',
            data: visible,
            selector: step.selector,
            timestamp: new Date().toISOString()
          });
          break;

        case 'get_element_count':
          const elements = await page.$$(step.selector);
          results.push({
            type: 'count',
            data: elements.length,
            selector: step.selector,
            timestamp: new Date().toISOString()
          });
          break;

        // Keyboard and Input Actions
        case 'press_key':
          // step.value = key name (e.g., 'Enter', 'Escape', 'ArrowDown')
          await page.keyboard.press(step.value);
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'type_text':
          // Type without selector (types at current focus)
          await page.keyboard.type(step.value, { delay: Math.random() * 100 + 50 });
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'clear_input':
          await page.waitForSelector(step.selector);
          await page.click(step.selector, { clickCount: 3 }); // Select all
          await page.keyboard.press('Backspace');
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'focus':
          await page.waitForSelector(step.selector);
          await page.focus(step.selector);
          await addRandomDelay();
          break;

        // Cookie Management
        case 'set_cookie':
          // step.value should be JSON string with cookie object
          const cookieData = JSON.parse(step.value);
          await context.addCookies([cookieData]);
          break;

        case 'get_cookies':
          const cookies = await context.cookies();
          results.push({
            type: 'cookies',
            data: cookies,
            timestamp: new Date().toISOString()
          });
          break;

        case 'clear_cookies':
          await context.clearCookies();
          break;

        // Advanced Waiting
        case 'wait_for_navigation':
          await page.waitForNavigation({ waitUntil: 'networkidle' });
          await takeScreenshot();
          break;

        case 'wait_for_timeout':
          // step.value = milliseconds
          await page.waitForTimeout(parseInt(step.value));
          break;

        case 'wait_for_url':
          // step.value = URL or regex pattern
          await page.waitForURL(step.value);
          await takeScreenshot();
          break;

        // Screenshot Actions
        case 'screenshot_element':
          await page.waitForSelector(step.selector);
          const element = await page.$(step.selector);
          const elementScreenshot = await element.screenshot();
          const screenshotName = `element-${Date.now()}.png`;
          const elementScreenshotPath = path.join(uploadsDir, screenshotName);
          fs.writeFileSync(elementScreenshotPath, elementScreenshot);
          results.push({
            type: 'screenshot',
            data: `data:image/png;base64,${elementScreenshot.toString('base64')}`,
            path: `/uploads/${screenshotName}`,
            timestamp: new Date().toISOString()
          });
          break;

        // Selection Actions
        case 'select_text':
          await page.waitForSelector(step.selector);
          await page.click(step.selector, { clickCount: 3 }); // Triple-click to select all text
          await addRandomDelay();
          break;

        case 'check_checkbox':
          await page.waitForSelector(step.selector);
          await page.check(step.selector);
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'uncheck_checkbox':
          await page.waitForSelector(step.selector);
          await page.uncheck(step.selector);
          await addRandomDelay();
          await takeScreenshot();
          break;

        // Scroll Actions
        case 'scroll_to_top':
          await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'scroll_to_bottom':
          await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
          await addRandomDelay();
          await takeScreenshot();
          break;

        case 'scroll_by':
          // step.value = pixels (positive = down, negative = up)
          await page.evaluate((pixels) => window.scrollBy({ top: parseInt(pixels), behavior: 'smooth' }), step.value);
          await addRandomDelay();
          await takeScreenshot();
          break;

        // Alert Handling
        case 'accept_alert':
          page.once('dialog', dialog => dialog.accept());
          break;

        case 'dismiss_alert':
          page.once('dialog', dialog => dialog.dismiss());
          break;

        case 'get_alert_text':
          page.once('dialog', dialog => {
            results.push({
              type: 'alert_text',
              data: dialog.message(),
              timestamp: new Date().toISOString()
            });
            dialog.dismiss();
          });
          break;

        default:
          logger.warn('Unknown action type', { action: step.action });
      }
      
      results.push({
        type: 'action',
        action: step.action,
        reasoning: step.reasoning,
        success: true,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      logger.logError(error, {
        context: 'executeStep',
        action: step.action,
        selector: step.selector
      });
      logger.logBrowserAction(step.action, false, {
        error: error.message
      });
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
        logger.error('Failed to take error screenshot', {
          error: screenshotError.message
        });
      }
    }
  }
  
  return results;
}

app.post('/execute-prompt', authenticateApiKey, async (req, res) => {
  const executionStartTime = Date.now();
  let execution = null;

  try {
    const { prompt, workflowId } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      logger.warn('Invalid prompt received', { prompt });
      metrics.recordError('invalid_prompt');
      return res.status(400).json({
        success: false,
        error: 'Invalid prompt. Please provide a non-empty string.'
      });
    }

    if (prompt.length > 5000) {
      logger.warn('Prompt too long', { length: prompt.length });
      metrics.recordError('prompt_too_long');
      return res.status(400).json({
        success: false,
        error: 'Prompt too long. Maximum length is 5000 characters.'
      });
    }

    logger.info('Automation execution started', {
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 100)
    });

    // Create execution record in database
    try {
      execution = await db.createExecution({
        prompt,
        workflowId: workflowId || null,
        userId: 'anonymous', // Will be replaced with real user authentication later
        status: 'running',
        steps: [],
        triggeredBy: 'manual'
      });
      logger.info('Execution record created', { executionId: execution.id });
    } catch (dbError) {
      logger.warn('Failed to create execution record, continuing without persistence', {
        error: dbError.message
      });
    }

    // Get steps from Ollama
    const steps = await queryOllama(prompt);
    logger.info('Executing automation steps', {
      stepsCount: steps.length,
      actions: steps.map(s => s.action)
    });

    // Update execution with steps
    if (execution) {
      try {
        await db.updateExecution(execution.id, { steps });
      } catch (dbError) {
        logger.warn('Failed to update execution steps', { error: dbError.message });
      }
    }

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

    const executionTime = Date.now() - executionStartTime;
    logger.info('Automation execution completed successfully', {
      executionId: execution?.id,
      executionTime,
      stepsExecuted: steps.length,
      resultsCount: results.length
    });
    metrics.recordAutomationExecution(true, steps);

    // Update execution record as successful
    if (execution) {
      try {
        await db.updateExecution(execution.id, {
          status: 'success',
          endTime: new Date(),
          results,
          screenshot: screenshotUrl,
          videoUrl
        });
      } catch (dbError) {
        logger.warn('Failed to update execution as successful', { error: dbError.message });
      }
    }

    res.json({
      success: true,
      message: 'Actions executed successfully',
      executionId: execution?.id,
      steps: steps,
      results,
      finalScreenshot: screenshotUrl,
      videoUrl: videoUrl
    });
  } catch (error) {
    const executionTime = Date.now() - executionStartTime;
    logger.logError(error, {
      context: 'execute-prompt',
      executionId: execution?.id,
      executionTime
    });
    metrics.recordAutomationExecution(false, []);
    metrics.recordError('execution_failed');

    // Update execution record as failed
    if (execution) {
      try {
        await db.updateExecution(execution.id, {
          status: 'failed',
          endTime: new Date(),
          errorLog: error.message
        });
      } catch (dbError) {
        logger.warn('Failed to update execution as failed', { error: dbError.message });
      }
    }

    res.status(500).json({
      success: false,
      error: error.message,
      executionId: execution?.id
    });
  }
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  const health = metrics.getHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  res.status(statusCode).json(health);
});

// Metrics Endpoint
app.get('/metrics', (req, res) => {
  res.json(metrics.getMetrics());
});

// Summary Endpoint (simpler view)
app.get('/metrics/summary', (req, res) => {
  res.json(metrics.getSummary());
});

// Reset Metrics (useful for testing)
app.post('/metrics/reset', authenticateApiKey, (req, res) => {
  metrics.reset();
  logger.info('Metrics reset by user');
  res.json({ success: true, message: 'Metrics reset successfully' });
});

// ==================== WORKFLOW ENDPOINTS ====================

// Get all workflows
app.get('/workflows', authenticateApiKey, async (req, res) => {
  try {
    const { isTemplate, isActive, tags, search } = req.query;
    const workflows = await db.getWorkflows({
      userId: 'anonymous', // Will be replaced with real user authentication later
      isTemplate: isTemplate === 'true' ? true : isTemplate === 'false' ? false : undefined,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      tags: tags ? tags.split(',') : undefined,
      search
    });
    res.json({ success: true, data: workflows });
  } catch (error) {
    logger.error('Failed to get workflows', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get workflow by ID
app.get('/workflows/:id', authenticateApiKey, async (req, res) => {
  try {
    const workflow = await db.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }
    res.json({ success: true, data: workflow });
  } catch (error) {
    logger.error('Failed to get workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new workflow
app.post('/workflows', authenticateApiKey, async (req, res) => {
  try {
    const { name, description, steps, tags, isTemplate } = req.body;

    // Validation
    if (!name || !steps) {
      return res.status(400).json({
        success: false,
        error: 'Name and steps are required'
      });
    }

    const workflow = await db.createWorkflow({
      name,
      description: description || null,
      steps,
      tags: tags || [],
      isTemplate: isTemplate || false,
      userId: 'anonymous' // Will be replaced with real user authentication later
    });

    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    logger.error('Failed to create workflow', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update workflow
app.put('/workflows/:id', authenticateApiKey, async (req, res) => {
  try {
    const { name, description, steps, tags, isTemplate, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (steps !== undefined) updateData.steps = steps;
    if (tags !== undefined) updateData.tags = tags;
    if (isTemplate !== undefined) updateData.isTemplate = isTemplate;
    if (isActive !== undefined) updateData.isActive = isActive;

    const workflow = await db.updateWorkflow(req.params.id, updateData);
    res.json({ success: true, data: workflow });
  } catch (error) {
    logger.error('Failed to update workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Delete workflow
app.delete('/workflows/:id', authenticateApiKey, async (req, res) => {
  try {
    await db.deleteWorkflow(req.params.id);
    res.json({ success: true, message: 'Workflow deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==================== EXECUTION ENDPOINTS ====================

// Get all executions
app.get('/executions', authenticateApiKey, async (req, res) => {
  try {
    const { workflowId, status, limit, offset } = req.query;
    const executions = await db.getExecutions({
      userId: 'anonymous', // Will be replaced with real user authentication later
      workflowId,
      status,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0
    });
    res.json({ success: true, data: executions });
  } catch (error) {
    logger.error('Failed to get executions', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get execution by ID
app.get('/executions/:id', authenticateApiKey, async (req, res) => {
  try {
    const execution = await db.getExecutionById(req.params.id);
    if (!execution) {
      return res.status(404).json({ success: false, error: 'Execution not found' });
    }
    res.json({ success: true, data: execution });
  } catch (error) {
    logger.error('Failed to get execution', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get execution statistics
app.get('/executions/stats/summary', authenticateApiKey, async (req, res) => {
  try {
    const stats = await db.getExecutionStats('anonymous'); // Will be replaced with real user authentication later
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Failed to get execution stats', { error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

// Execute a saved workflow
app.post('/workflows/:id/execute', authenticateApiKey, async (req, res) => {
  try {
    const workflow = await db.getWorkflowById(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, error: 'Workflow not found' });
    }

    // Trigger execution by redirecting to execute-prompt with workflow steps
    req.body.workflowId = workflow.id;
    req.body.prompt = workflow.description || `Executing workflow: ${workflow.name}`;

    // Forward to execute-prompt endpoint
    const executionStartTime = Date.now();
    let execution = null;

    try {
      execution = await db.createExecution({
        prompt: req.body.prompt,
        workflowId: workflow.id,
        userId: 'anonymous',
        status: 'running',
        steps: workflow.steps,
        triggeredBy: 'workflow'
      });

      const context = await createContext();
      const page = await context.newPage();
      page.setDefaultTimeout(30000);
      page.setDefaultNavigationTimeout(30000);

      const results = await executeSteps(page, workflow.steps);
      await new Promise(resolve => setTimeout(resolve, 5000));

      const screenshotPath = path.join(uploadsDir, `screenshot-${Date.now()}.png`);
      await page.screenshot({ path: screenshotPath, type: 'png', fullPage: true });
      const screenshotUrl = `/uploads/${path.basename(screenshotPath)}`;

      const videoPath = await page.video().path();
      const videoUrl = `/uploads/${path.basename(videoPath)}`;

      await context.close();

      await db.updateExecution(execution.id, {
        status: 'success',
        endTime: new Date(),
        results,
        screenshot: screenshotUrl,
        videoUrl
      });

      res.json({
        success: true,
        message: 'Workflow executed successfully',
        executionId: execution.id,
        steps: workflow.steps,
        results,
        finalScreenshot: screenshotUrl,
        videoUrl
      });
    } catch (error) {
      if (execution) {
        await db.updateExecution(execution.id, {
          status: 'failed',
          endTime: new Date(),
          errorLog: error.message
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error('Failed to execute workflow', { id: req.params.id, error: error.message });
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(config.port, () => {
  logger.info('Server started', {
    port: config.port,
    environment: process.env.NODE_ENV || 'development',
    authEnabled: !!config.apiKey,
    ollamaUrl: config.ollamaUrl,
    ollamaModel: config.ollamaModel
  });

  console.log(`\n🚀 Server running on port ${config.port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);

  if (!config.apiKey) {
    console.warn('⚠️  WARNING: API_KEY not set. API authentication is DISABLED!');
    console.warn('   Please set API_KEY in your .env file for security.');
  } else {
    console.log('✅ API authentication enabled');
  }

  console.log(`🤖 Ollama URL: ${config.ollamaUrl}`);
  console.log(`🧠 Ollama Model: ${config.ollamaModel}`);
  console.log(`\n📍 Endpoints:`);
  console.log(`   POST /execute-prompt - Execute automation`);
  console.log(`   GET  /health - Health check`);
  console.log(`   GET  /metrics - Detailed metrics`);
  console.log(`   GET  /metrics/summary - Metrics summary`);
  console.log('');
}); 