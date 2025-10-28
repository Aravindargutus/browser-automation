# Browser Actions Reference

This document provides a comprehensive reference for all 47 browser actions available in the automation system.

## Table of Contents

- [Basic Interactions](#basic-interactions)
- [Input & Forms](#input--forms)
- [File Operations](#file-operations)
- [Navigation](#navigation)
- [Frame & Window Management](#frame--window-management)
- [Data Extraction](#data-extraction)
- [Waiting Actions](#waiting-actions)
- [Scrolling](#scrolling)
- [Screenshots](#screenshots)
- [Cookie Management](#cookie-management)
- [Alert & Dialog Handling](#alert--dialog-handling)
- [Advanced Actions](#advanced-actions)

---

## Basic Interactions

### navigate
Navigate to a specific URL.

**Parameters:**
- `selector`: (empty)
- `value`: URL to navigate to

**Example:**
```json
{
  "action": "navigate",
  "selector": "",
  "value": "https://www.example.com",
  "reasoning": "Navigate to example website"
}
```

---

### click
Click on a page element.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "click",
  "selector": "button#submit",
  "value": "",
  "reasoning": "Click the submit button"
}
```

---

### double_click
Double-click on an element.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "double_click",
  "selector": ".file-item",
  "value": "",
  "reasoning": "Open file by double-clicking"
}
```

---

### right_click
Right-click on an element to open context menu.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "right_click",
  "selector": "img.photo",
  "value": "",
  "reasoning": "Open context menu for image"
}
```

---

### hover
Hover mouse over an element.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "hover",
  "selector": ".dropdown-trigger",
  "value": "",
  "reasoning": "Hover to reveal dropdown menu"
}
```

---

### drag_and_drop
Drag one element and drop it onto another.

**Parameters:**
- `selector`: CSS selector of source element
- `value`: CSS selector of target element

**Example:**
```json
{
  "action": "drag_and_drop",
  "selector": "#item1",
  "value": "#dropzone",
  "reasoning": "Drag item to drop zone"
}
```

---

## Input & Forms

### type
Type text into an input field.

**Parameters:**
- `selector`: CSS selector of input field
- `value`: Text to type

**Example:**
```json
{
  "action": "type",
  "selector": "input[name='username']",
  "value": "john.doe",
  "reasoning": "Enter username"
}
```

**Special:** Use `"\n"` as value to press Enter key.

---

### type_text
Type text at the current focus position (no selector needed).

**Parameters:**
- `selector`: (empty)
- `value`: Text to type

**Example:**
```json
{
  "action": "type_text",
  "selector": "",
  "value": "Hello World",
  "reasoning": "Type text at cursor position"
}
```

---

### clear_input
Clear the content of an input field.

**Parameters:**
- `selector`: CSS selector of input field
- `value`: (empty)

**Example:**
```json
{
  "action": "clear_input",
  "selector": "input#search",
  "value": "",
  "reasoning": "Clear search field"
}
```

---

### focus
Set focus on an element.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "focus",
  "selector": "input#email",
  "value": "",
  "reasoning": "Focus on email input"
}
```

---

### press_key
Press a keyboard key.

**Parameters:**
- `selector`: (empty)
- `value`: Key name (e.g., Enter, Escape, Tab, ArrowDown, F1)

**Example:**
```json
{
  "action": "press_key",
  "selector": "",
  "value": "Enter",
  "reasoning": "Submit form by pressing Enter"
}
```

**Common Keys:** Enter, Escape, Tab, Backspace, Delete, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, End, PageUp, PageDown, F1-F12

---

### check_checkbox
Check a checkbox.

**Parameters:**
- `selector`: CSS selector of checkbox
- `value`: (empty)

**Example:**
```json
{
  "action": "check_checkbox",
  "selector": "input[name='terms']",
  "value": "",
  "reasoning": "Accept terms and conditions"
}
```

---

### uncheck_checkbox
Uncheck a checkbox.

**Parameters:**
- `selector`: CSS selector of checkbox
- `value`: (empty)

**Example:**
```json
{
  "action": "uncheck_checkbox",
  "selector": "input[name='newsletter']",
  "value": "",
  "reasoning": "Unsubscribe from newsletter"
}
```

---

### select_dropdown
Select an option from a dropdown.

**Parameters:**
- `selector`: CSS selector of select element
- `value`: Value or text of the option to select

**Example:**
```json
{
  "action": "select_dropdown",
  "selector": "select#country",
  "value": "USA",
  "reasoning": "Select country"
}
```

---

### select_text
Select all text in an element (triple-click).

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "select_text",
  "selector": "div.content",
  "value": "",
  "reasoning": "Select all text for copying"
}
```

---

## File Operations

### upload_file
Upload a file to a file input.

**Parameters:**
- `selector`: CSS selector of file input element
- `value`: Absolute path to the file

**Example:**
```json
{
  "action": "upload_file",
  "selector": "input[type='file']",
  "value": "/home/user/document.pdf",
  "reasoning": "Upload document"
}
```

---

### download_file
Click an element to trigger file download.

**Parameters:**
- `selector`: CSS selector of download button/link
- `value`: (empty)

**Example:**
```json
{
  "action": "download_file",
  "selector": "a.download-link",
  "value": "",
  "reasoning": "Download file"
}
```

**Note:** Downloaded file will be saved to the uploads directory.

---

## Navigation

### go_back
Navigate back in browser history.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "go_back",
  "selector": "",
  "value": "",
  "reasoning": "Go to previous page"
}
```

---

### go_forward
Navigate forward in browser history.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "go_forward",
  "selector": "",
  "value": "",
  "reasoning": "Go to next page"
}
```

---

### reload
Reload the current page.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "reload",
  "selector": "",
  "value": "",
  "reasoning": "Refresh the page"
}
```

---

### close_tab
Close the current tab.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "close_tab",
  "selector": "",
  "value": "",
  "reasoning": "Close current tab"
}
```

---

## Frame & Window Management

### switch_to_iframe
Switch context to an iframe.

**Parameters:**
- `selector`: CSS selector of the iframe
- `value`: (empty)

**Example:**
```json
{
  "action": "switch_to_iframe",
  "selector": "iframe#content-frame",
  "value": "",
  "reasoning": "Switch to iframe for embedded content"
}
```

---

### switch_to_main_frame
Switch back to the main page context from iframe.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "switch_to_main_frame",
  "selector": "",
  "value": "",
  "reasoning": "Return to main page"
}
```

---

### switch_to_new_tab
Click an element that opens a new tab and switch to it.

**Parameters:**
- `selector`: CSS selector of element that opens new tab
- `value`: (empty)

**Example:**
```json
{
  "action": "switch_to_new_tab",
  "selector": "a[target='_blank']",
  "value": "",
  "reasoning": "Open and switch to new tab"
}
```

---

## Data Extraction

### extract_text
Extract text content from an element.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "extract_text",
  "selector": "h1.title",
  "value": "",
  "reasoning": "Get page title text"
}
```

**Returns:** Text content in results array.

---

### get_attribute
Get an attribute value from an element.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: Attribute name

**Example:**
```json
{
  "action": "get_attribute",
  "selector": "a.link",
  "value": "href",
  "reasoning": "Get link URL"
}
```

**Returns:** Attribute value in results array.

---

### get_title
Get the page title.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "get_title",
  "selector": "",
  "value": "",
  "reasoning": "Get current page title"
}
```

**Returns:** Page title in results array.

---

### get_url
Get the current page URL.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "get_url",
  "selector": "",
  "value": "",
  "reasoning": "Get current URL"
}
```

**Returns:** Current URL in results array.

---

### element_exists
Check if an element exists on the page.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "element_exists",
  "selector": ".error-message",
  "value": "",
  "reasoning": "Check if error is displayed"
}
```

**Returns:** Boolean (true/false) in results array.

---

### is_visible
Check if an element is visible.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "is_visible",
  "selector": "#modal",
  "value": "",
  "reasoning": "Check if modal is visible"
}
```

**Returns:** Boolean (true/false) in results array.

---

### get_element_count
Count the number of elements matching a selector.

**Parameters:**
- `selector`: CSS selector
- `value`: (empty)

**Example:**
```json
{
  "action": "get_element_count",
  "selector": "li.item",
  "value": "",
  "reasoning": "Count number of list items"
}
```

**Returns:** Count number in results array.

---

### get_cookies
Get all cookies for the current page.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "get_cookies",
  "selector": "",
  "value": "",
  "reasoning": "Retrieve all cookies"
}
```

**Returns:** Array of cookie objects in results.

---

### get_alert_text
Get the text from an alert dialog.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "get_alert_text",
  "selector": "",
  "value": "",
  "reasoning": "Get alert message"
}
```

**Returns:** Alert text in results array. Automatically dismisses the alert.

---

## Waiting Actions

### wait_for_element
Wait for an element to appear on the page.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Timeout:** 30 seconds

**Example:**
```json
{
  "action": "wait_for_element",
  "selector": ".loading-complete",
  "value": "",
  "reasoning": "Wait for page to finish loading"
}
```

---

### wait_for_navigation
Wait for page navigation to complete.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "wait_for_navigation",
  "selector": "",
  "value": "",
  "reasoning": "Wait for navigation after form submit"
}
```

---

### wait_for_timeout
Wait for a specific duration.

**Parameters:**
- `selector`: (empty)
- `value`: Milliseconds to wait

**Example:**
```json
{
  "action": "wait_for_timeout",
  "selector": "",
  "value": "3000",
  "reasoning": "Wait 3 seconds for animation"
}
```

---

### wait_for_url
Wait until the URL matches a pattern.

**Parameters:**
- `selector`: (empty)
- `value`: URL pattern or regex

**Example:**
```json
{
  "action": "wait_for_url",
  "selector": "",
  "value": "https://example.com/success",
  "reasoning": "Wait for redirect to success page"
}
```

---

## Scrolling

### scroll_to
Scroll to bring an element into view.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "scroll_to",
  "selector": "#footer",
  "value": "",
  "reasoning": "Scroll to footer"
}
```

---

### scroll_to_top
Scroll to the top of the page.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "scroll_to_top",
  "selector": "",
  "value": "",
  "reasoning": "Scroll to page top"
}
```

---

### scroll_to_bottom
Scroll to the bottom of the page.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "scroll_to_bottom",
  "selector": "",
  "value": "",
  "reasoning": "Scroll to page bottom"
}
```

---

### scroll_by
Scroll by a specific number of pixels.

**Parameters:**
- `selector`: (empty)
- `value`: Pixels to scroll (positive = down, negative = up)

**Example:**
```json
{
  "action": "scroll_by",
  "selector": "",
  "value": "500",
  "reasoning": "Scroll down 500 pixels"
}
```

---

## Screenshots

### screenshot
Capture a full-page screenshot.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "screenshot",
  "selector": "",
  "value": "",
  "reasoning": "Capture current state"
}
```

**Returns:** Base64 encoded image in results array.

---

### screenshot_element
Capture a screenshot of a specific element.

**Parameters:**
- `selector`: CSS selector of the element
- `value`: (empty)

**Example:**
```json
{
  "action": "screenshot_element",
  "selector": "#chart",
  "value": "",
  "reasoning": "Capture chart image"
}
```

**Returns:** Base64 encoded image and file path in results array.

---

## Cookie Management

### set_cookie
Set a cookie for the current domain.

**Parameters:**
- `selector`: (empty)
- `value`: JSON string with cookie object

**Example:**
```json
{
  "action": "set_cookie",
  "selector": "",
  "value": "{\"name\":\"session\",\"value\":\"abc123\",\"domain\":\".example.com\"}",
  "reasoning": "Set session cookie"
}
```

**Cookie Object Fields:**
- `name` (required): Cookie name
- `value` (required): Cookie value
- `domain` (optional): Cookie domain
- `path` (optional): Cookie path
- `expires` (optional): Expiration timestamp
- `httpOnly` (optional): HTTP only flag
- `secure` (optional): Secure flag
- `sameSite` (optional): SameSite policy

---

### clear_cookies
Clear all cookies for the current context.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "clear_cookies",
  "selector": "",
  "value": "",
  "reasoning": "Clear all cookies"
}
```

---

## Alert & Dialog Handling

### accept_alert
Accept an alert, confirm, or prompt dialog.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "accept_alert",
  "selector": "",
  "value": "",
  "reasoning": "Accept confirmation dialog"
}
```

**Note:** Set this action BEFORE the action that triggers the alert.

---

### dismiss_alert
Dismiss an alert, confirm, or prompt dialog.

**Parameters:**
- `selector`: (empty)
- `value`: (empty)

**Example:**
```json
{
  "action": "dismiss_alert",
  "selector": "",
  "value": "",
  "reasoning": "Dismiss alert dialog"
}
```

**Note:** Set this action BEFORE the action that triggers the alert.

---

## Advanced Actions

### execute_javascript
Execute custom JavaScript code in the page context.

**Parameters:**
- `selector`: (empty)
- `value`: JavaScript code to execute

**Example:**
```json
{
  "action": "execute_javascript",
  "selector": "",
  "value": "document.querySelector('.button').style.display = 'block';",
  "reasoning": "Show hidden button using JavaScript"
}
```

**Security Note:** Use with caution. Can execute any JavaScript in the page context.

---

## Summary

**Total Actions:** 47

**Categories:**
- Basic Interactions: 6 actions
- Input & Forms: 9 actions
- File Operations: 2 actions
- Navigation: 4 actions
- Frame & Window: 3 actions
- Data Extraction: 9 actions
- Waiting: 4 actions
- Scrolling: 4 actions
- Screenshots: 2 actions
- Cookie Management: 2 actions (+ get_cookies in extraction)
- Alert Handling: 2 actions (+ get_alert_text in extraction)
- Advanced: 1 action

---

## Best Practices

1. **Always wait for elements** before interacting with them
2. **Use appropriate selectors** - prefer IDs, then data attributes, then classes
3. **Add reasoning** to every action for better debugging
4. **Handle errors gracefully** - use element_exists or is_visible before actions
5. **Take screenshots** at key points for verification
6. **Use human-like delays** - the system adds random delays automatically
7. **Extract data** when needed for validation or further processing
8. **Clean up** - close tabs, clear cookies when appropriate

---

## Common Patterns

### Form Submission
```json
[
  {"action": "type", "selector": "#email", "value": "user@example.com", "reasoning": "Enter email"},
  {"action": "type", "selector": "#password", "value": "password123", "reasoning": "Enter password"},
  {"action": "click", "selector": "button[type='submit']", "value": "", "reasoning": "Submit form"}
]
```

### Data Scraping
```json
[
  {"action": "navigate", "selector": "", "value": "https://example.com", "reasoning": "Go to page"},
  {"action": "wait_for_element", "selector": ".content", "value": "", "reasoning": "Wait for content"},
  {"action": "extract_text", "selector": "h1", "value": "", "reasoning": "Get title"},
  {"action": "get_element_count", "selector": ".item", "value": "", "reasoning": "Count items"}
]
```

### Multi-Page Navigation
```json
[
  {"action": "navigate", "selector": "", "value": "https://example.com", "reasoning": "Go to home"},
  {"action": "click", "selector": "a.next-page", "value": "", "reasoning": "Go to next page"},
  {"action": "wait_for_navigation", "selector": "", "value": "", "reasoning": "Wait for page load"},
  {"action": "screenshot", "selector": "", "value": "", "reasoning": "Capture new page"}
]
```

---

**Last Updated:** January 2025
**Version:** 2.0
