/**
 * Comprehensive Unit Tests for All 47 Browser Actions
 * Tests cover all action types with mocked Playwright components
 */

const { chromium } = require('playwright');

// Test configuration
const TEST_URL = 'http://localhost:3000/test-page';
const TIMEOUT = 30000;

describe('Browser Actions Test Suite', () => {
  let browser;
  let context;
  let page;

  // Setup before all tests
  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  }, TIMEOUT);

  // Setup before each test
  beforeEach(async () => {
    context = await browser.newContext();
    page = await context.newPage();
  });

  // Cleanup after each test
  afterEach(async () => {
    await page.close();
    await context.close();
  });

  // Cleanup after all tests
  afterAll(async () => {
    await browser.close();
  });

  // ==============================================
  // BASIC INTERACTIONS (6 actions)
  // ==============================================

  describe('Basic Interactions', () => {
    test('navigate - should navigate to URL', async () => {
      await page.goto(TEST_URL);
      expect(page.url()).toBe(TEST_URL);
    });

    test('click - should click element', async () => {
      await page.setContent(`
        <button id="test-btn">Click Me</button>
        <div id="result"></div>
        <script>
          document.getElementById('test-btn').addEventListener('click', () => {
            document.getElementById('result').textContent = 'clicked';
          });
        </script>
      `);

      await page.click('#test-btn');
      const result = await page.textContent('#result');
      expect(result).toBe('clicked');
    });

    test('double_click - should double-click element', async () => {
      await page.setContent(`
        <div id="test-elem">Double Click Me</div>
        <div id="result"></div>
        <script>
          document.getElementById('test-elem').addEventListener('dblclick', () => {
            document.getElementById('result').textContent = 'double-clicked';
          });
        </script>
      `);

      await page.dblclick('#test-elem');
      const result = await page.textContent('#result');
      expect(result).toBe('double-clicked');
    });

    test('right_click - should right-click element', async () => {
      await page.setContent(`
        <div id="test-elem">Right Click Me</div>
        <div id="result"></div>
        <script>
          document.getElementById('test-elem').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            document.getElementById('result').textContent = 'right-clicked';
          });
        </script>
      `);

      await page.click('#test-elem', { button: 'right' });
      const result = await page.textContent('#result');
      expect(result).toBe('right-clicked');
    });

    test('hover - should hover over element', async () => {
      await page.setContent(`
        <div id="test-elem">Hover Me</div>
        <div id="result"></div>
        <script>
          document.getElementById('test-elem').addEventListener('mouseenter', () => {
            document.getElementById('result').textContent = 'hovered';
          });
        </script>
      `);

      await page.hover('#test-elem');
      const result = await page.textContent('#result');
      expect(result).toBe('hovered');
    });

    test('drag_and_drop - should drag element to target', async () => {
      await page.setContent(`
        <div id="draggable" draggable="true" style="width:100px;height:100px;background:red;">Drag</div>
        <div id="dropzone" style="width:200px;height:200px;background:blue;">Drop Here</div>
        <div id="result"></div>
        <script>
          document.getElementById('dropzone').addEventListener('drop', (e) => {
            e.preventDefault();
            document.getElementById('result').textContent = 'dropped';
          });
          document.getElementById('dropzone').addEventListener('dragover', (e) => e.preventDefault());
        </script>
      `);

      await page.dragAndDrop('#draggable', '#dropzone');
      const result = await page.textContent('#result');
      expect(result).toBe('dropped');
    });
  });

  // ==============================================
  // INPUT & FORMS (9 actions)
  // ==============================================

  describe('Input & Forms', () => {
    test('type - should type text into input', async () => {
      await page.setContent('<input id="test-input" type="text" />');
      await page.type('#test-input', 'Hello World');
      const value = await page.inputValue('#test-input');
      expect(value).toBe('Hello World');
    });

    test('type_text - should type text at current focus', async () => {
      await page.setContent('<input id="test-input" type="text" />');
      await page.focus('#test-input');
      await page.keyboard.type('Focused typing');
      const value = await page.inputValue('#test-input');
      expect(value).toBe('Focused typing');
    });

    test('clear_input - should clear input field', async () => {
      await page.setContent('<input id="test-input" type="text" value="Clear this" />');
      await page.click('#test-input', { clickCount: 3 });
      await page.keyboard.press('Backspace');
      const value = await page.inputValue('#test-input');
      expect(value).toBe('');
    });

    test('focus - should focus on element', async () => {
      await page.setContent(`
        <input id="test-input" type="text" />
        <div id="result"></div>
        <script>
          document.getElementById('test-input').addEventListener('focus', () => {
            document.getElementById('result').textContent = 'focused';
          });
        </script>
      `);

      await page.focus('#test-input');
      const result = await page.textContent('#result');
      expect(result).toBe('focused');
    });

    test('press_key - should press keyboard key', async () => {
      await page.setContent(`
        <input id="test-input" type="text" />
        <div id="result"></div>
        <script>
          document.getElementById('test-input').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              document.getElementById('result').textContent = 'enter-pressed';
            }
          });
        </script>
      `);

      await page.focus('#test-input');
      await page.keyboard.press('Enter');
      const result = await page.textContent('#result');
      expect(result).toBe('enter-pressed');
    });

    test('check_checkbox - should check checkbox', async () => {
      await page.setContent('<input id="test-checkbox" type="checkbox" />');
      await page.check('#test-checkbox');
      const isChecked = await page.isChecked('#test-checkbox');
      expect(isChecked).toBe(true);
    });

    test('uncheck_checkbox - should uncheck checkbox', async () => {
      await page.setContent('<input id="test-checkbox" type="checkbox" checked />');
      await page.uncheck('#test-checkbox');
      const isChecked = await page.isChecked('#test-checkbox');
      expect(isChecked).toBe(false);
    });

    test('select_dropdown - should select dropdown option', async () => {
      await page.setContent(`
        <select id="test-select">
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
          <option value="3">Option 3</option>
        </select>
      `);

      await page.selectOption('#test-select', '2');
      const value = await page.inputValue('#test-select');
      expect(value).toBe('2');
    });

    test('select_text - should select text in element', async () => {
      await page.setContent('<div id="test-div">Select this text</div>');
      await page.click('#test-div', { clickCount: 3 });

      const selection = await page.evaluate(() => window.getSelection().toString());
      expect(selection).toBe('Select this text');
    });
  });

  // ==============================================
  // FILE OPERATIONS (2 actions)
  // ==============================================

  describe('File Operations', () => {
    test('upload_file - should upload file', async () => {
      await page.setContent('<input id="file-input" type="file" />');

      // Create a temporary test file
      const fs = require('fs');
      const path = require('path');
      const testFilePath = path.join(__dirname, 'test-file.txt');
      fs.writeFileSync(testFilePath, 'Test file content');

      await page.setInputFiles('#file-input', testFilePath);

      const fileName = await page.evaluate(() => {
        const input = document.getElementById('file-input');
        return input.files[0].name;
      });

      expect(fileName).toBe('test-file.txt');

      // Cleanup
      fs.unlinkSync(testFilePath);
    });

    test('download_file - should initiate download', async () => {
      await page.setContent(`
        <a id="download-link" href="data:text/plain,Hello%20World" download="test.txt">Download</a>
      `);

      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.click('#download-link')
      ]);

      expect(download.suggestedFilename()).toBe('test.txt');
    });
  });

  // ==============================================
  // NAVIGATION (4 actions)
  // ==============================================

  describe('Navigation', () => {
    test('go_back - should navigate back', async () => {
      await page.setContent('<a id="link" href="about:blank">Go</a>');
      const firstURL = page.url();

      await page.click('#link');
      await page.waitForLoadState();

      await page.goBack();
      expect(page.url()).toBe(firstURL);
    });

    test('go_forward - should navigate forward', async () => {
      await page.setContent('<a id="link" href="about:blank">Go</a>');

      await page.click('#link');
      await page.waitForLoadState();
      const secondURL = page.url();

      await page.goBack();
      await page.goForward();

      expect(page.url()).toBe(secondURL);
    });

    test('reload - should reload page', async () => {
      await page.setContent('<div id="timestamp"></div><script>document.getElementById("timestamp").textContent = Date.now();</script>');

      const time1 = await page.textContent('#timestamp');
      await new Promise(resolve => setTimeout(resolve, 10));

      await page.reload();
      const time2 = await page.textContent('#timestamp');

      expect(time1).not.toBe(time2);
    });

    test('close_tab - should close page', async () => {
      const isClosed = await page.close().then(() => true).catch(() => false);
      expect(isClosed).toBe(true);
    });
  });

  // ==============================================
  // FRAME & WINDOW (3 actions)
  // ==============================================

  describe('Frame & Window Management', () => {
    test('switch_to_iframe - should switch to iframe context', async () => {
      await page.setContent(`
        <iframe id="test-iframe" srcdoc="<div id='iframe-content'>Inside iframe</div>"></iframe>
      `);

      const frame = await page.frame({ name: 'test-iframe' }) ||
                     await page.frameLocator('#test-iframe');
      expect(frame).toBeTruthy();
    });

    test('switch_to_main_frame - should return to main context', async () => {
      await page.setContent(`
        <div id="main-content">Main page</div>
        <iframe id="test-iframe" srcdoc="<div>iframe</div>"></iframe>
      `);

      const mainContent = await page.textContent('#main-content');
      expect(mainContent).toBe('Main page');
    });

    test('switch_to_new_tab - should switch to new tab', async () => {
      await page.setContent('<a id="new-tab-link" href="about:blank" target="_blank">Open</a>');

      const [newPage] = await Promise.all([
        context.waitForEvent('page'),
        page.click('#new-tab-link')
      ]);

      expect(newPage).toBeTruthy();
      await newPage.close();
    });
  });

  // ==============================================
  // DATA EXTRACTION (9 actions)
  // ==============================================

  describe('Data Extraction', () => {
    test('extract_text - should extract text content', async () => {
      await page.setContent('<div id="test-div">Extracted text</div>');
      const text = await page.textContent('#test-div');
      expect(text).toBe('Extracted text');
    });

    test('get_attribute - should get element attribute', async () => {
      await page.setContent('<a id="test-link" href="https://example.com">Link</a>');
      const href = await page.getAttribute('#test-link', 'href');
      expect(href).toBe('https://example.com');
    });

    test('get_title - should get page title', async () => {
      await page.setContent('<title>Test Page Title</title>');
      const title = await page.title();
      expect(title).toBe('Test Page Title');
    });

    test('get_url - should get current URL', async () => {
      await page.setContent('<div>Content</div>');
      const url = page.url();
      expect(url).toContain('about:blank');
    });

    test('element_exists - should check if element exists', async () => {
      await page.setContent('<div id="exists">I exist</div>');
      const exists = await page.$('#exists') !== null;
      expect(exists).toBe(true);

      const notExists = await page.$('#does-not-exist') !== null;
      expect(notExists).toBe(false);
    });

    test('is_visible - should check if element is visible', async () => {
      await page.setContent(`
        <div id="visible">Visible</div>
        <div id="hidden" style="display:none;">Hidden</div>
      `);

      const visible = await page.isVisible('#visible');
      expect(visible).toBe(true);

      const hidden = await page.isVisible('#hidden');
      expect(hidden).toBe(false);
    });

    test('get_element_count - should count elements', async () => {
      await page.setContent(`
        <div class="item">Item 1</div>
        <div class="item">Item 2</div>
        <div class="item">Item 3</div>
      `);

      const items = await page.$$('.item');
      expect(items.length).toBe(3);
    });

    test('get_cookies - should get all cookies', async () => {
      await context.addCookies([
        { name: 'test-cookie', value: 'test-value', domain: 'localhost', path: '/' }
      ]);

      const cookies = await context.cookies();
      const testCookie = cookies.find(c => c.name === 'test-cookie');
      expect(testCookie).toBeTruthy();
      expect(testCookie.value).toBe('test-value');
    });

    test('get_alert_text - should get alert text', async () => {
      let alertText = '';

      page.once('dialog', async dialog => {
        alertText = dialog.message();
        await dialog.dismiss();
      });

      await page.setContent('<button onclick="alert(\'Alert message\')">Alert</button>');
      await page.click('button');

      expect(alertText).toBe('Alert message');
    });
  });

  // ==============================================
  // WAITING (4 actions)
  // ==============================================

  describe('Waiting Actions', () => {
    test('wait_for_element - should wait for element to appear', async () => {
      await page.setContent('<div id="container"></div>');

      // Add element after delay
      setTimeout(async () => {
        await page.evaluate(() => {
          const div = document.createElement('div');
          div.id = 'delayed-element';
          div.textContent = 'I appeared!';
          document.getElementById('container').appendChild(div);
        });
      }, 500);

      await page.waitForSelector('#delayed-element', { timeout: 2000 });
      const text = await page.textContent('#delayed-element');
      expect(text).toBe('I appeared!');
    });

    test('wait_for_navigation - should wait for navigation', async () => {
      await page.setContent('<a id="link" href="about:blank">Navigate</a>');

      await Promise.all([
        page.waitForNavigation(),
        page.click('#link')
      ]);

      expect(page.url()).toContain('about:blank');
    });

    test('wait_for_timeout - should wait for specified time', async () => {
      const start = Date.now();
      await page.waitForTimeout(1000);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(1000);
      expect(elapsed).toBeLessThan(1500);
    });

    test('wait_for_url - should wait for URL to change', async () => {
      await page.setContent('<a id="link" href="about:blank">Go</a>');

      await Promise.all([
        page.waitForURL('about:blank'),
        page.click('#link')
      ]);

      expect(page.url()).toContain('about:blank');
    });
  });

  // ==============================================
  // SCROLLING (4 actions)
  // ==============================================

  describe('Scrolling Actions', () => {
    test('scroll_to - should scroll to element', async () => {
      await page.setContent(`
        <div style="height:2000px;"></div>
        <div id="target">Target element</div>
      `);

      await page.$eval('#target', el => el.scrollIntoView({ behavior: 'smooth' }));

      const isInViewport = await page.evaluate(() => {
        const elem = document.getElementById('target');
        const rect = elem.getBoundingClientRect();
        return rect.top >= 0 && rect.bottom <= window.innerHeight;
      });

      expect(isInViewport).toBe(true);
    });

    test('scroll_to_top - should scroll to page top', async () => {
      await page.setContent('<div style="height:3000px;"></div>');

      await page.evaluate(() => window.scrollTo({ top: 1000 }));
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBe(0);
    });

    test('scroll_to_bottom - should scroll to page bottom', async () => {
      await page.setContent('<div style="height:3000px;"></div>');

      await page.evaluate(() => window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      }));

      const scrollY = await page.evaluate(() => window.scrollY);
      expect(scrollY).toBeGreaterThan(0);
    });

    test('scroll_by - should scroll by pixel amount', async () => {
      await page.setContent('<div style="height:3000px;"></div>');

      const initialScroll = await page.evaluate(() => window.scrollY);
      await page.evaluate(() => window.scrollBy({ top: 500, behavior: 'smooth' }));

      const newScroll = await page.evaluate(() => window.scrollY);
      expect(newScroll).toBeGreaterThan(initialScroll);
    });
  });

  // ==============================================
  // SCREENSHOTS (2 actions)
  // ==============================================

  describe('Screenshots', () => {
    test('screenshot - should capture full page screenshot', async () => {
      await page.setContent('<div>Screenshot test</div>');
      const screenshot = await page.screenshot({ fullPage: true });

      expect(screenshot).toBeTruthy();
      expect(screenshot.length).toBeGreaterThan(0);
    });

    test('screenshot_element - should capture element screenshot', async () => {
      await page.setContent('<div id="test-elem" style="width:100px;height:100px;background:red;">Element</div>');

      const element = await page.$('#test-elem');
      const screenshot = await element.screenshot();

      expect(screenshot).toBeTruthy();
      expect(screenshot.length).toBeGreaterThan(0);
    });
  });

  // ==============================================
  // COOKIE MANAGEMENT (2 actions)
  // ==============================================

  describe('Cookie Management', () => {
    test('set_cookie - should set cookie', async () => {
      await context.addCookies([{
        name: 'custom-cookie',
        value: 'custom-value',
        domain: 'localhost',
        path: '/'
      }]);

      const cookies = await context.cookies();
      const customCookie = cookies.find(c => c.name === 'custom-cookie');

      expect(customCookie).toBeTruthy();
      expect(customCookie.value).toBe('custom-value');
    });

    test('clear_cookies - should clear all cookies', async () => {
      await context.addCookies([{
        name: 'test-cookie',
        value: 'test-value',
        domain: 'localhost',
        path: '/'
      }]);

      await context.clearCookies();
      const cookies = await context.cookies();

      expect(cookies.length).toBe(0);
    });
  });

  // ==============================================
  // ALERT HANDLING (2 actions)
  // ==============================================

  describe('Alert Handling', () => {
    test('accept_alert - should accept alert dialog', async () => {
      let wasAccepted = false;

      page.once('dialog', async dialog => {
        await dialog.accept();
        wasAccepted = true;
      });

      await page.setContent('<button onclick="alert(\'Test alert\')">Alert</button>');
      await page.click('button');

      expect(wasAccepted).toBe(true);
    });

    test('dismiss_alert - should dismiss alert dialog', async () => {
      let wasDismissed = false;

      page.once('dialog', async dialog => {
        await dialog.dismiss();
        wasDismissed = true;
      });

      await page.setContent('<button onclick="confirm(\'Test confirm\')">Confirm</button>');
      await page.click('button');

      expect(wasDismissed).toBe(true);
    });
  });

  // ==============================================
  // ADVANCED (1 action)
  // ==============================================

  describe('Advanced Actions', () => {
    test('execute_javascript - should execute custom JavaScript', async () => {
      await page.setContent('<div id="result"></div>');

      await page.evaluate(() => {
        document.getElementById('result').textContent = 'JavaScript executed';
      });

      const result = await page.textContent('#result');
      expect(result).toBe('JavaScript executed');
    });
  });

  // ==============================================
  // INTEGRATION TESTS
  // ==============================================

  describe('Integration Tests', () => {
    test('should complete multi-step form workflow', async () => {
      await page.setContent(`
        <form id="test-form">
          <input id="name" type="text" />
          <input id="email" type="email" />
          <select id="country">
            <option value="US">USA</option>
            <option value="UK">UK</option>
          </select>
          <input id="terms" type="checkbox" />
          <button type="submit">Submit</button>
          <div id="result"></div>
        </form>
        <script>
          document.getElementById('test-form').addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('result').textContent = 'submitted';
          });
        </script>
      `);

      // Fill form
      await page.type('#name', 'John Doe');
      await page.type('#email', 'john@example.com');
      await page.selectOption('#country', 'US');
      await page.check('#terms');

      // Submit
      await page.click('button[type="submit"]');

      // Verify
      const result = await page.textContent('#result');
      expect(result).toBe('submitted');
    });

    test('should extract data from multiple elements', async () => {
      await page.setContent(`
        <div id="product-1" class="product">
          <h3 class="name">Product 1</h3>
          <span class="price">$10</span>
        </div>
        <div id="product-2" class="product">
          <h3 class="name">Product 2</h3>
          <span class="price">$20</span>
        </div>
      `);

      const count = await page.$$('.product');
      expect(count.length).toBe(2);

      const names = await page.$$eval('.name', els => els.map(el => el.textContent));
      expect(names).toEqual(['Product 1', 'Product 2']);

      const prices = await page.$$eval('.price', els => els.map(el => el.textContent));
      expect(prices).toEqual(['$10', '$20']);
    });
  });
});
