# Automation Workflow Examples

This document provides real-world automation workflow examples using the 47 available browser actions.

## Table of Contents

1. [E-Commerce Workflows](#e-commerce-workflows)
2. [Form Submission Workflows](#form-submission-workflows)
3. [Data Scraping Workflows](#data-scraping-workflows)
4. [Social Media Workflows](#social-media-workflows)
5. [Testing Workflows](#testing-workflows)
6. [File Management Workflows](#file-management-workflows)
7. [Multi-Tab Workflows](#multi-tab-workflows)
8. [Cookie & Session Workflows](#cookie--session-workflows)

---

## E-Commerce Workflows

### Workflow 1: Product Search and Add to Cart

**Scenario:** Search for a product, filter results, and add to cart.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://example-store.com",
    "reasoning": "Go to e-commerce site"
  },
  {
    "action": "wait_for_element",
    "selector": "input#search",
    "value": "",
    "reasoning": "Wait for search box to load"
  },
  {
    "action": "type",
    "selector": "input#search",
    "value": "wireless headphones",
    "reasoning": "Enter product search term"
  },
  {
    "action": "press_key",
    "selector": "",
    "value": "Enter",
    "reasoning": "Submit search"
  },
  {
    "action": "wait_for_navigation",
    "selector": "",
    "value": "",
    "reasoning": "Wait for search results page"
  },
  {
    "action": "check_checkbox",
    "selector": "input[value='free-shipping']",
    "value": "",
    "reasoning": "Filter for free shipping items"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "2000",
    "reasoning": "Wait for filtered results"
  },
  {
    "action": "get_element_count",
    "selector": ".product-card",
    "value": "",
    "reasoning": "Count available products"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture search results"
  },
  {
    "action": "click",
    "selector": ".product-card:first-child .view-details",
    "value": "",
    "reasoning": "View first product details"
  },
  {
    "action": "wait_for_element",
    "selector": ".product-details",
    "value": "",
    "reasoning": "Wait for product page to load"
  },
  {
    "action": "extract_text",
    "selector": "h1.product-title",
    "value": "",
    "reasoning": "Get product name"
  },
  {
    "action": "extract_text",
    "selector": ".price",
    "value": "",
    "reasoning": "Get product price"
  },
  {
    "action": "select_dropdown",
    "selector": "select#color",
    "value": "Black",
    "reasoning": "Select color option"
  },
  {
    "action": "click",
    "selector": "button.add-to-cart",
    "value": "",
    "reasoning": "Add product to cart"
  },
  {
    "action": "wait_for_element",
    "selector": ".cart-confirmation",
    "value": "",
    "reasoning": "Wait for cart confirmation"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture cart confirmation"
  }
]
```

### Workflow 2: Complete Checkout Process

**Scenario:** Navigate cart, fill shipping info, and complete purchase.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://example-store.com/cart",
    "reasoning": "Go to shopping cart"
  },
  {
    "action": "get_element_count",
    "selector": ".cart-item",
    "value": "",
    "reasoning": "Count items in cart"
  },
  {
    "action": "element_exists",
    "selector": ".promo-code",
    "value": "",
    "reasoning": "Check if promo code field exists"
  },
  {
    "action": "click",
    "selector": "button.checkout",
    "value": "",
    "reasoning": "Proceed to checkout"
  },
  {
    "action": "wait_for_url",
    "selector": "",
    "value": "https://example-store.com/checkout",
    "reasoning": "Wait for checkout page"
  },
  {
    "action": "type",
    "selector": "input#email",
    "value": "customer@example.com",
    "reasoning": "Enter email"
  },
  {
    "action": "type",
    "selector": "input#firstName",
    "value": "John",
    "reasoning": "Enter first name"
  },
  {
    "action": "type",
    "selector": "input#lastName",
    "value": "Doe",
    "reasoning": "Enter last name"
  },
  {
    "action": "type",
    "selector": "input#address",
    "value": "123 Main St",
    "reasoning": "Enter address"
  },
  {
    "action": "type",
    "selector": "input#city",
    "value": "New York",
    "reasoning": "Enter city"
  },
  {
    "action": "select_dropdown",
    "selector": "select#state",
    "value": "NY",
    "reasoning": "Select state"
  },
  {
    "action": "type",
    "selector": "input#zip",
    "value": "10001",
    "reasoning": "Enter ZIP code"
  },
  {
    "action": "check_checkbox",
    "selector": "input#sameAsBilling",
    "value": "",
    "reasoning": "Use same address for billing"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture filled form"
  },
  {
    "action": "scroll_to_bottom",
    "selector": "",
    "value": "",
    "reasoning": "Scroll to payment section"
  },
  {
    "action": "extract_text",
    "selector": ".order-total",
    "value": "",
    "reasoning": "Get final order total"
  }
]
```

---

## Form Submission Workflows

### Workflow 3: Job Application Form

**Scenario:** Complete a multi-step job application with file upload.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://careers.example.com/apply",
    "reasoning": "Go to application page"
  },
  {
    "action": "get_title",
    "selector": "",
    "value": "",
    "reasoning": "Verify we're on correct page"
  },
  {
    "action": "clear_input",
    "selector": "input#fullName",
    "value": "",
    "reasoning": "Clear any pre-filled name"
  },
  {
    "action": "type",
    "selector": "input#fullName",
    "value": "Jane Smith",
    "reasoning": "Enter full name"
  },
  {
    "action": "type",
    "selector": "input#email",
    "value": "jane.smith@email.com",
    "reasoning": "Enter email"
  },
  {
    "action": "type",
    "selector": "input#phone",
    "value": "(555) 123-4567",
    "reasoning": "Enter phone number"
  },
  {
    "action": "select_dropdown",
    "selector": "select#yearsExperience",
    "value": "5-10",
    "reasoning": "Select years of experience"
  },
  {
    "action": "select_dropdown",
    "selector": "select#position",
    "value": "Senior Developer",
    "reasoning": "Select desired position"
  },
  {
    "action": "focus",
    "selector": "textarea#coverLetter",
    "value": "",
    "reasoning": "Focus on cover letter field"
  },
  {
    "action": "type_text",
    "selector": "",
    "value": "I am excited to apply for this position...",
    "reasoning": "Type cover letter content"
  },
  {
    "action": "scroll_to",
    "selector": "#fileUploadSection",
    "value": "",
    "reasoning": "Scroll to file upload section"
  },
  {
    "action": "upload_file",
    "selector": "input[name='resume']",
    "value": "/home/user/documents/resume.pdf",
    "reasoning": "Upload resume PDF"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "1000",
    "reasoning": "Wait for file upload to process"
  },
  {
    "action": "upload_file",
    "selector": "input[name='portfolio']",
    "value": "/home/user/documents/portfolio.pdf",
    "reasoning": "Upload portfolio"
  },
  {
    "action": "check_checkbox",
    "selector": "input#termsAccepted",
    "value": "",
    "reasoning": "Accept terms and conditions"
  },
  {
    "action": "check_checkbox",
    "selector": "input#privacyPolicy",
    "value": "",
    "reasoning": "Accept privacy policy"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture completed form"
  },
  {
    "action": "click",
    "selector": "button[type='submit']",
    "value": "",
    "reasoning": "Submit application"
  },
  {
    "action": "wait_for_element",
    "selector": ".success-message",
    "value": "",
    "reasoning": "Wait for success confirmation"
  },
  {
    "action": "extract_text",
    "selector": ".application-number",
    "value": "",
    "reasoning": "Get application reference number"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture confirmation page"
  }
]
```

### Workflow 4: Newsletter Signup with Validation

**Scenario:** Sign up for newsletter and handle validation.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://blog.example.com",
    "reasoning": "Go to blog homepage"
  },
  {
    "action": "scroll_to_bottom",
    "selector": "",
    "value": "",
    "reasoning": "Scroll to newsletter signup"
  },
  {
    "action": "is_visible",
    "selector": "#newsletter-form",
    "value": "",
    "reasoning": "Check if newsletter form is visible"
  },
  {
    "action": "type",
    "selector": "input#newsletter-email",
    "value": "invalid-email",
    "reasoning": "Enter invalid email to test validation"
  },
  {
    "action": "click",
    "selector": "button.subscribe",
    "value": "",
    "reasoning": "Try to submit"
  },
  {
    "action": "element_exists",
    "selector": ".error-message",
    "value": "",
    "reasoning": "Check if error message appears"
  },
  {
    "action": "screenshot_element",
    "selector": "#newsletter-form",
    "value": "",
    "reasoning": "Capture validation error"
  },
  {
    "action": "clear_input",
    "selector": "input#newsletter-email",
    "value": "",
    "reasoning": "Clear invalid email"
  },
  {
    "action": "type",
    "selector": "input#newsletter-email",
    "value": "valid.email@example.com",
    "reasoning": "Enter valid email"
  },
  {
    "action": "check_checkbox",
    "selector": "input#acceptTerms",
    "value": "",
    "reasoning": "Accept terms"
  },
  {
    "action": "click",
    "selector": "button.subscribe",
    "value": "",
    "reasoning": "Submit subscription"
  },
  {
    "action": "wait_for_element",
    "selector": ".success-message",
    "value": "",
    "reasoning": "Wait for success message"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture success confirmation"
  }
]
```

---

## Data Scraping Workflows

### Workflow 5: Product Price Comparison

**Scenario:** Scrape product details from multiple pages.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://electronics-store.com/laptops",
    "reasoning": "Go to laptop category"
  },
  {
    "action": "get_url",
    "selector": "",
    "value": "",
    "reasoning": "Record current URL"
  },
  {
    "action": "get_title",
    "selector": "",
    "value": "",
    "reasoning": "Get page title"
  },
  {
    "action": "wait_for_element",
    "selector": ".product-grid",
    "value": "",
    "reasoning": "Wait for products to load"
  },
  {
    "action": "get_element_count",
    "selector": ".product-card",
    "value": "",
    "reasoning": "Count total products"
  },
  {
    "action": "scroll_to_bottom",
    "selector": "",
    "value": "",
    "reasoning": "Trigger lazy loading"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "2000",
    "reasoning": "Wait for more products to load"
  },
  {
    "action": "extract_text",
    "selector": ".product-card:nth-child(1) .product-name",
    "value": "",
    "reasoning": "Get first product name"
  },
  {
    "action": "extract_text",
    "selector": ".product-card:nth-child(1) .price",
    "value": "",
    "reasoning": "Get first product price"
  },
  {
    "action": "get_attribute",
    "selector": ".product-card:nth-child(1) a",
    "value": "href",
    "reasoning": "Get product link"
  },
  {
    "action": "get_attribute",
    "selector": ".product-card:nth-child(1) img",
    "value": "src",
    "reasoning": "Get product image URL"
  },
  {
    "action": "screenshot_element",
    "selector": ".product-card:nth-child(1)",
    "value": "",
    "reasoning": "Capture product card"
  },
  {
    "action": "click",
    "selector": ".product-card:nth-child(1) a",
    "value": "",
    "reasoning": "Go to product details"
  },
  {
    "action": "wait_for_navigation",
    "selector": "",
    "value": "",
    "reasoning": "Wait for product page"
  },
  {
    "action": "extract_text",
    "selector": ".full-description",
    "value": "",
    "reasoning": "Get detailed description"
  },
  {
    "action": "extract_text",
    "selector": ".rating",
    "value": "",
    "reasoning": "Get product rating"
  },
  {
    "action": "get_element_count",
    "selector": ".review",
    "value": "",
    "reasoning": "Count reviews"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture full product page"
  },
  {
    "action": "go_back",
    "selector": "",
    "value": "",
    "reasoning": "Return to listing page"
  }
]
```

### Workflow 6: Real Estate Listing Scraper

**Scenario:** Scrape property listings with filtering.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://realestate.example.com",
    "reasoning": "Go to real estate site"
  },
  {
    "action": "select_dropdown",
    "selector": "select#propertyType",
    "value": "House",
    "reasoning": "Filter for houses"
  },
  {
    "action": "select_dropdown",
    "selector": "select#bedrooms",
    "value": "3+",
    "reasoning": "Filter for 3+ bedrooms"
  },
  {
    "action": "type",
    "selector": "input#maxPrice",
    "value": "500000",
    "reasoning": "Set maximum price"
  },
  {
    "action": "click",
    "selector": "button#applyFilters",
    "value": "",
    "reasoning": "Apply filters"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "3000",
    "reasoning": "Wait for filtered results"
  },
  {
    "action": "get_element_count",
    "selector": ".listing-card",
    "value": "",
    "reasoning": "Count matching properties"
  },
  {
    "action": "scroll_by",
    "selector": "",
    "value": "500",
    "reasoning": "Scroll to see more listings"
  },
  {
    "action": "extract_text",
    "selector": ".listing-card:first-child .address",
    "value": "",
    "reasoning": "Get property address"
  },
  {
    "action": "extract_text",
    "selector": ".listing-card:first-child .price",
    "value": "",
    "reasoning": "Get property price"
  },
  {
    "action": "extract_text",
    "selector": ".listing-card:first-child .bedrooms",
    "value": "",
    "reasoning": "Get bedroom count"
  },
  {
    "action": "screenshot_element",
    "selector": ".listing-card:first-child",
    "value": "",
    "reasoning": "Capture listing card"
  },
  {
    "action": "get_attribute",
    "selector": ".listing-card:first-child a",
    "value": "href",
    "reasoning": "Get listing detail URL"
  }
]
```

---

## Social Media Workflows

### Workflow 7: LinkedIn Profile Update

**Scenario:** Update LinkedIn profile information.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://linkedin.com/in/username/edit",
    "reasoning": "Go to profile edit page"
  },
  {
    "action": "wait_for_element",
    "selector": "textarea#headline",
    "value": "",
    "reasoning": "Wait for edit form"
  },
  {
    "action": "clear_input",
    "selector": "textarea#headline",
    "value": "",
    "reasoning": "Clear current headline"
  },
  {
    "action": "type",
    "selector": "textarea#headline",
    "value": "Senior Software Engineer | Full-Stack Developer",
    "reasoning": "Update headline"
  },
  {
    "action": "scroll_to",
    "selector": "#aboutSection",
    "value": "",
    "reasoning": "Scroll to about section"
  },
  {
    "action": "click",
    "selector": "#aboutSection .edit-button",
    "value": "",
    "reasoning": "Click edit about"
  },
  {
    "action": "wait_for_element",
    "selector": "textarea#about",
    "value": "",
    "reasoning": "Wait for about textarea"
  },
  {
    "action": "focus",
    "selector": "textarea#about",
    "value": "",
    "reasoning": "Focus on about section"
  },
  {
    "action": "press_key",
    "selector": "",
    "value": "Control+A",
    "reasoning": "Select all text"
  },
  {
    "action": "type_text",
    "selector": "",
    "value": "Passionate about building scalable web applications...",
    "reasoning": "Type new about section"
  },
  {
    "action": "screenshot_element",
    "selector": "#aboutSection",
    "value": "",
    "reasoning": "Capture updated about section"
  },
  {
    "action": "click",
    "selector": "button.save-changes",
    "value": "",
    "reasoning": "Save changes"
  },
  {
    "action": "wait_for_element",
    "selector": ".success-notification",
    "value": "",
    "reasoning": "Wait for save confirmation"
  }
]
```

---

## Testing Workflows

### Workflow 8: Login Flow Testing

**Scenario:** Test login functionality with various scenarios.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://app.example.com/login",
    "reasoning": "Navigate to login page"
  },
  {
    "action": "get_title",
    "selector": "",
    "value": "",
    "reasoning": "Verify page title"
  },
  {
    "action": "element_exists",
    "selector": "form#loginForm",
    "value": "",
    "reasoning": "Verify login form exists"
  },
  {
    "action": "is_visible",
    "selector": "input#username",
    "value": "",
    "reasoning": "Check username field visibility"
  },
  {
    "action": "is_visible",
    "selector": "input#password",
    "value": "",
    "reasoning": "Check password field visibility"
  },
  {
    "action": "click",
    "selector": "button[type='submit']",
    "value": "",
    "reasoning": "Try submit with empty fields"
  },
  {
    "action": "element_exists",
    "selector": ".validation-error",
    "value": "",
    "reasoning": "Check for validation errors"
  },
  {
    "action": "screenshot_element",
    "selector": "form#loginForm",
    "value": "",
    "reasoning": "Capture validation state"
  },
  {
    "action": "type",
    "selector": "input#username",
    "value": "wronguser@example.com",
    "reasoning": "Enter wrong username"
  },
  {
    "action": "type",
    "selector": "input#password",
    "value": "wrongpassword",
    "reasoning": "Enter wrong password"
  },
  {
    "action": "click",
    "selector": "button[type='submit']",
    "value": "",
    "reasoning": "Submit with wrong credentials"
  },
  {
    "action": "wait_for_element",
    "selector": ".error-message",
    "value": "",
    "reasoning": "Wait for error message"
  },
  {
    "action": "extract_text",
    "selector": ".error-message",
    "value": "",
    "reasoning": "Get error message text"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture error state"
  },
  {
    "action": "clear_input",
    "selector": "input#username",
    "value": "",
    "reasoning": "Clear username"
  },
  {
    "action": "clear_input",
    "selector": "input#password",
    "value": "",
    "reasoning": "Clear password"
  },
  {
    "action": "type",
    "selector": "input#username",
    "value": "validuser@example.com",
    "reasoning": "Enter correct username"
  },
  {
    "action": "type",
    "selector": "input#password",
    "value": "correctpassword",
    "reasoning": "Enter correct password"
  },
  {
    "action": "click",
    "selector": "button[type='submit']",
    "value": "",
    "reasoning": "Submit with valid credentials"
  },
  {
    "action": "wait_for_navigation",
    "selector": "",
    "value": "",
    "reasoning": "Wait for redirect"
  },
  {
    "action": "get_url",
    "selector": "",
    "value": "",
    "reasoning": "Verify redirected to dashboard"
  },
  {
    "action": "element_exists",
    "selector": ".welcome-message",
    "value": "",
    "reasoning": "Check for welcome message"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture logged-in state"
  }
]
```

---

## File Management Workflows

### Workflow 9: Bulk File Download

**Scenario:** Download multiple files from a file manager.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://filemanager.example.com/documents",
    "reasoning": "Go to file manager"
  },
  {
    "action": "wait_for_element",
    "selector": ".file-list",
    "value": "",
    "reasoning": "Wait for file list to load"
  },
  {
    "action": "get_element_count",
    "selector": ".file-item",
    "value": "",
    "reasoning": "Count total files"
  },
  {
    "action": "check_checkbox",
    "selector": "input[data-file='report-q1.pdf']",
    "value": "",
    "reasoning": "Select Q1 report"
  },
  {
    "action": "check_checkbox",
    "selector": "input[data-file='report-q2.pdf']",
    "value": "",
    "reasoning": "Select Q2 report"
  },
  {
    "action": "check_checkbox",
    "selector": "input[data-file='report-q3.pdf']",
    "value": "",
    "reasoning": "Select Q3 report"
  },
  {
    "action": "screenshot_element",
    "selector": ".file-list",
    "value": "",
    "reasoning": "Capture selected files"
  },
  {
    "action": "download_file",
    "selector": "button.download-selected",
    "value": "",
    "reasoning": "Download selected files"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "5000",
    "reasoning": "Wait for download to start"
  }
]
```

---

## Multi-Tab Workflows

### Workflow 10: Compare Products Across Tabs

**Scenario:** Open multiple products in tabs and compare.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://tech-store.com/smartphones",
    "reasoning": "Go to smartphones page"
  },
  {
    "action": "switch_to_new_tab",
    "selector": ".product-card:nth-child(1) a[target='_blank']",
    "value": "",
    "reasoning": "Open first product in new tab"
  },
  {
    "action": "wait_for_navigation",
    "selector": "",
    "value": "",
    "reasoning": "Wait for product page to load"
  },
  {
    "action": "extract_text",
    "selector": "h1.product-name",
    "value": "",
    "reasoning": "Get product 1 name"
  },
  {
    "action": "extract_text",
    "selector": ".price",
    "value": "",
    "reasoning": "Get product 1 price"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture product 1 page"
  },
  {
    "action": "go_back",
    "selector": "",
    "value": "",
    "reasoning": "Return to listing"
  },
  {
    "action": "switch_to_new_tab",
    "selector": ".product-card:nth-child(2) a[target='_blank']",
    "value": "",
    "reasoning": "Open second product in new tab"
  },
  {
    "action": "wait_for_navigation",
    "selector": "",
    "value": "",
    "reasoning": "Wait for product page to load"
  },
  {
    "action": "extract_text",
    "selector": "h1.product-name",
    "value": "",
    "reasoning": "Get product 2 name"
  },
  {
    "action": "extract_text",
    "selector": ".price",
    "value": "",
    "reasoning": "Get product 2 price"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture product 2 page"
  }
]
```

---

## Cookie & Session Workflows

### Workflow 11: Cookie Banner Handling

**Scenario:** Accept/reject cookie banners and manage cookies.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://website-with-cookies.com",
    "reasoning": "Go to site with cookie banner"
  },
  {
    "action": "wait_for_element",
    "selector": ".cookie-banner",
    "value": "",
    "reasoning": "Wait for cookie banner"
  },
  {
    "action": "is_visible",
    "selector": ".cookie-banner",
    "value": "",
    "reasoning": "Verify cookie banner is visible"
  },
  {
    "action": "screenshot_element",
    "selector": ".cookie-banner",
    "value": "",
    "reasoning": "Capture cookie banner"
  },
  {
    "action": "click",
    "selector": "button.accept-all-cookies",
    "value": "",
    "reasoning": "Accept all cookies"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "1000",
    "reasoning": "Wait for banner to close"
  },
  {
    "action": "get_cookies",
    "selector": "",
    "value": "",
    "reasoning": "Get all cookies after acceptance"
  },
  {
    "action": "set_cookie",
    "selector": "",
    "value": "{\"name\":\"user_preference\",\"value\":\"dark_mode\",\"domain\":\".example.com\"}",
    "reasoning": "Set custom preference cookie"
  },
  {
    "action": "reload",
    "selector": "",
    "value": "",
    "reasoning": "Reload to apply cookies"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture page with preferences"
  }
]
```

---

## Advanced Workflows

### Workflow 12: Interactive Dashboard Testing

**Scenario:** Test interactive charts and filters on a dashboard.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://analytics.example.com/dashboard",
    "reasoning": "Go to analytics dashboard"
  },
  {
    "action": "wait_for_element",
    "selector": ".chart-container",
    "value": "",
    "reasoning": "Wait for charts to load"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture initial state"
  },
  {
    "action": "select_dropdown",
    "selector": "select#timeRange",
    "value": "Last 7 Days",
    "reasoning": "Change time range"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "2000",
    "reasoning": "Wait for chart update"
  },
  {
    "action": "hover",
    "selector": ".chart-bar:nth-child(3)",
    "value": "",
    "reasoning": "Hover over chart bar"
  },
  {
    "action": "wait_for_element",
    "selector": ".tooltip",
    "value": "",
    "reasoning": "Wait for tooltip"
  },
  {
    "action": "extract_text",
    "selector": ".tooltip .value",
    "value": "",
    "reasoning": "Get tooltip value"
  },
  {
    "action": "screenshot_element",
    "selector": ".chart-container",
    "value": "",
    "reasoning": "Capture chart with tooltip"
  },
  {
    "action": "scroll_to",
    "selector": "#dataTable",
    "value": "",
    "reasoning": "Scroll to data table"
  },
  {
    "action": "click",
    "selector": "th.sortable[data-column='revenue']",
    "value": "",
    "reasoning": "Sort by revenue"
  },
  {
    "action": "wait_for_timeout",
    "selector": "",
    "value": "1000",
    "reasoning": "Wait for sort animation"
  },
  {
    "action": "get_element_count",
    "selector": "tbody tr",
    "value": "",
    "reasoning": "Count table rows"
  },
  {
    "action": "screenshot_element",
    "selector": "#dataTable",
    "value": "",
    "reasoning": "Capture sorted table"
  }
]
```

### Workflow 13: iFrame Interaction

**Scenario:** Work with content inside an iframe.

```json
[
  {
    "action": "navigate",
    "selector": "",
    "value": "https://example.com/embedded-content",
    "reasoning": "Go to page with iframe"
  },
  {
    "action": "wait_for_element",
    "selector": "iframe#contentFrame",
    "value": "",
    "reasoning": "Wait for iframe to load"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture page with iframe"
  },
  {
    "action": "switch_to_iframe",
    "selector": "iframe#contentFrame",
    "value": "",
    "reasoning": "Switch context to iframe"
  },
  {
    "action": "wait_for_element",
    "selector": "button.action-button",
    "value": "",
    "reasoning": "Wait for button inside iframe"
  },
  {
    "action": "extract_text",
    "selector": "h2.title",
    "value": "",
    "reasoning": "Get title from iframe content"
  },
  {
    "action": "click",
    "selector": "button.action-button",
    "value": "",
    "reasoning": "Click button inside iframe"
  },
  {
    "action": "wait_for_element",
    "selector": ".result",
    "value": "",
    "reasoning": "Wait for result in iframe"
  },
  {
    "action": "extract_text",
    "selector": ".result",
    "value": "",
    "reasoning": "Get result text from iframe"
  },
  {
    "action": "switch_to_main_frame",
    "selector": "",
    "value": "",
    "reasoning": "Return to main page context"
  },
  {
    "action": "screenshot",
    "selector": "",
    "value": "",
    "reasoning": "Capture final state"
  }
]
```

---

## Workflow Summary

| Workflow | Actions Used | Complexity | Use Case |
|----------|--------------|------------|----------|
| Product Search & Cart | 16 | Medium | E-commerce automation |
| Complete Checkout | 18 | High | Purchase flow testing |
| Job Application | 21 | High | Form submission with files |
| Newsletter Signup | 14 | Low | Validation testing |
| Price Comparison | 18 | Medium | Data scraping |
| Real Estate Scraper | 13 | Medium | Property data extraction |
| LinkedIn Update | 13 | Medium | Profile management |
| Login Testing | 23 | High | Authentication testing |
| Bulk Download | 9 | Low | File management |
| Multi-Tab Compare | 12 | Medium | Product comparison |
| Cookie Management | 10 | Low | Privacy compliance |
| Dashboard Testing | 14 | High | Interactive UI testing |
| iFrame Interaction | 11 | Medium | Embedded content |

---

## Tips for Creating Workflows

1. **Start Simple**: Begin with basic navigation and verification
2. **Add Waiting**: Use `wait_for_element` and `wait_for_navigation` liberally
3. **Verify State**: Use `element_exists` and `is_visible` before interactions
4. **Extract Data**: Use extraction actions to get information for validation
5. **Take Screenshots**: Capture key states for debugging and verification
6. **Handle Errors**: Plan for validation errors and alerts
7. **Clean Up**: Close tabs and clear cookies when appropriate
8. **Test Incrementally**: Build workflows step-by-step

---

**Version:** 1.0
**Last Updated:** January 2025
