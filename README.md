# Delivery Management System

A delivery and logistics management web application built with **Vue 3**. It covers orders, drivers, customers, invoicing, delivery routes, pricing, work scheduling, and interactive map visualization.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Getting Started](#getting-started)
3. [Project Structure](#project-structure)
4. [Common Module Pattern](#common-module-pattern)
5. [Modules](#modules)
   - [User Management](#user-management)
   - [Driver Management](#driver-management)
   - [Company Management](#company-management)
   - [Customer Management](#customer-management)
   - [Orders](#orders)
   - [Statistics](#statistics)
   - [Work Plans](#work-plans)
   - [Collections & Payments](#collections--payments)
   - [Invoices](#invoices)
   - [Driver Lines](#driver-lines)
   - [Line Work](#line-work)
   - [Lines](#lines)
   - [Line Pricing](#line-pricing)
   - [Company Pricing](#company-pricing)
   - [Discounts](#discounts)
   - [Branches](#branches)
   - [Regions](#regions)
   - [Currency](#currency)
   - [Map](#map)
   - [Permissions](#permissions)
   - [Profile](#profile)
6. [Entity Relationships](#entity-relationships)
7. [Shared Components Reference](#shared-components-reference)
8. [Routing & Access Control](#routing--access-control)
9. [State Management](#state-management)
10. [API Layer](#api-layer)
11. [Internationalization](#internationalization)
12. [Composables & Utilities](#composables--utilities)
13. [Testing, Building & Deployment](#testing-building--deployment)

---

## Tech Stack

| Category       | Technology                   |
| -------------- | ---------------------------- |
| Framework      | Vue 3 (Composition API)      |
| Build Tool     | Vite                         |
| CSS            | Bootstrap 5                  |
| State          | Pinia                        |
| Routing        | Vue Router 4                 |
| HTTP           | Axios                        |
| i18n           | vue-i18n (English + Arabic)  |
| Maps           | OpenLayers / vue3-openlayers |
| Calendar       | FullCalendar 6               |
| PDF            | html2pdf.js                  |
| Testing        | Vitest + Vue Test Utils      |

---

## Getting Started

**Prerequisites:** Node.js `^20.19.0` or `>=22.12.0`

```bash
git clone <repository-url>
cd front-end
npm install
npm run dev
```

**Environment:** Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://your-api-server/api
```

---

## Project Structure

```
src/
├── App.vue                       # Root component
├── main.js                       # Entry point
├── assets/                       # Images, stylesheets
├── components/
│   ├── layout/                   # AppLayout, Navbar, Sidebar
│   ├── shared/                   # Reusable components (tables, modals, buttons)
│   └── filters/                  # Search, group, and time-period filters
├── composables/                  # Shared reactive logic
├── i18n/                         # en.js and ar.js translation files
├── modules/                      # Feature modules (one folder per feature)
├── router/                       # Routes and navigation guards
├── services/                     # Axios setup and API service helpers
├── stores/                       # Global Pinia stores
└── utils/                        # Helper functions
```

Every feature module follows the same layout:

```
modules/<name>/
├── view/<Name>.vue               # Main page
├── components/                   # Module-specific components
├── store/                        # Pinia store
└── constants/                    # Validation limits, etc.
```

---
### Login

### Login

**Route:** `/login` | **Access:** Guest users only

Handles user authentication with support for both username and email login.

#### Main View (`login.vue`)

**Layout Structure:**
- **Split Design:** Form section (left 50%) + Animated carousel (right 50%)
- **Language Switcher:** Top-right corner with persistent preference storage
- **Responsive:** Carousel hidden on screens < 992px (mobile)

**Visual Design:**
- **Color Scheme:**
  - Primary Color: CSS variable `--primary-color`
  - Background: White for form section, gradient overlay on carousel
  - Error States: Red (#dc3545) with inline validation messages
  - Success States: Green accents (#28a745)
- **Typography:** System font stack with fallbacks, responsive sizing
- **Spacing:** Bootstrap 5 utilities (mb-3, mt-4, etc.)

**Form Schema:**
- **Login Field:** Username or email (required, trimmed, single input)
- **Password Field:** Minimum 6 characters (required, with visibility toggle)

**Key Features:**
- Dual login system accepting username OR email
- Real-time client-side validation with immediate feedback
- Server-side validation with field-specific error display
- Auto-redirect to user's default page after successful login
- Language synchronization with user's database preference
- Session persistence via localStorage (token, user, device)
- Browser language auto-detection on first visit

**Components Used:**
- `FormLabel` — Field labels with required indicators
- `TextField` — Text/password inputs with show/hide toggle
- `PrimaryButton` — Submit button with loading state
- `BaseDropdown` — Language selector (English/Arabic)

**Carousel System:**
- Custom implementation (no external library)
- 4 slides with images, titles, and descriptions
- Auto-advance every 5 seconds with auto-play timer
- Manual controls: previous/next arrows + dot indicators
- Smooth transitions with fade and horizontal slide effects
- Gradient overlay for text readability
- Pause on hover functionality

**Styling Framework:**
- **Bootstrap 5** for grid, spacing, and form controls
- **Custom CSS Variables** for theming (primary color, text colors, borders)
- **Scoped Styles** for component-specific design
- **Animations:** CSS transitions for hover, focus, and slide changes

#### Component Functions

**Lifecycle Hooks:**
- `onMounted()` — Initializes browser language detection, starts carousel auto-play timer
- `onUnmounted()` — Cleans up carousel interval to prevent memory leaks

**Form Handling:**
- `handleSubmit()` — Main form submission handler
  - Validates form inputs (login and password)
  - Calls auth store login action
  - Handles success: extracts redirect path from query params or uses default_page
  - Handles errors: maps API errors to user-friendly messages
  - Updates UI state (loading, errors)

**Validation Functions:**
- `validateForm()` — Client-side validation before submission
  - Checks login field is not empty
  - Validates password length (minimum 6 characters)
  - Returns boolean validation result
- `clearErrors()` — Resets all error messages
  - Called on input change for real-time error clearing

**Carousel Functions:**
- `nextSlide()` — Advances to next slide (wraps to first after last)
- `prevSlide()` — Goes to previous slide (wraps to last from first)
- `goToSlide(index)` — Jumps to specific slide by index (dot navigation)
- `startAutoPlay()` — Initializes 5-second interval for automatic slide advancement
- `stopAutoPlay()` — Pauses carousel (called on user interaction)
- `resetAutoPlay()` — Restarts auto-play timer after manual navigation

**Language Functions:**
- `detectBrowserLanguage()` — Auto-detects browser language on first visit
  - Checks localStorage for saved preference
  - Falls back to browser language (navigator.language)
  - Sets 'ar' if browser language starts with 'ar', else 'en'
- `changeLanguage(lang, closeDropdown)` — Handles language switching
  - Updates current language reactive state
  - Calls i18n setLocale() to change UI language
  - Persists choice to localStorage
  - Closes language dropdown menu
  - Triggers reactive UI update

**Error Handling Functions:**
- `handleLoginError(error)` — Processes API error responses
  - Maps 401 to "Invalid credentials"
  - Maps 422 to field-specific validation errors
  - Handles network errors
  - Sets generic fallback message for unknown errors

**Utility Functions:**
- `extractRedirectPath()` — Determines post-login navigation target
  - Priority: query param `redirect` > user.default_page > user.landing_page > '/user'
- `isValidEmail(email)` — Email format validation using regex
- `trimFormData()` — Removes whitespace from login field before submission

#### Validation Rules

**Client-side Validation:**
- Login field: Required, non-empty after trim
- Password field: Required, minimum 6 characters
- Real-time error display below each field

**Server-side Error Mapping:**
- **401** → Invalid credentials message
- **422** → Validation errors mapped to specific fields
- **Network Error** → Connection failure message
- **Generic** → Fallback error message

#### Store Integration (`stores/auth.js`)

**State Management:**
- User object with profile data (name, email, company, currency, role)
- JWT authentication token
- Device identifier (web/mobile)
- Loading and error states
- User switching flag (SuperAdmin feature)

**Computed Getters:**
- `isAuthenticated` — Boolean authentication status
- `userRole` — Current user role (handles array or string format)
- `userName` — Display name
- `userCompanyId` / `userCompanyName` — Company information
- `userCurrencyId` / `userCurrencyName` — Currency preferences

**Key Actions:**
- `login(credentials)` — Authenticates user, processes response, updates state, persists to localStorage
  - Validates input credentials
  - Makes POST request to /login endpoint
  - Processes user data (converts image path to full URL)
  - Restores default_page from localStorage if exists
  - Updates reactive state (user, token, device)
  - Persists to localStorage (auth_token, auth_user, auth_device)
  - Syncs language preference (arabic → 'ar', english → 'en')
- `updateUserLanguage(language)` — Syncs UI language with backend preference
  - Sends PATCH request to update user language
  - Updates user object in state
- `logout()` — Clears authentication state and redirects to login
- `checkAuth()` — Validates existing token on app initialization

**State Persistence:**
- Stores token, user object, and device in localStorage
- Restores default_page preference from previous session
- Syncs language setting (arabic → 'ar', english → 'en')

#### API Integration

**Endpoint:** `POST /login`

**Request Body:**
```
{
  login: string,     // Username or email
  password: string
}
```

**Success Response (200):**
Returns user object with: id, name, username, email, phone, role, language, image, company (id, name), currency (id, name, symbol), default_page, landing_page, plus authentication token and device identifier.

**Error Responses:**
- **401 Unauthorized:** Invalid credentials
- **422 Validation Error:** Field-specific validation failures

#### Language System

**Features:**
- Auto-detection from browser language on first visit
- Persistent storage in localStorage (`lang` key)
- Sync with user's database language preference after login
- Reactive UI updates without page reload
- RTL support for Arabic

**Language Flow:**
1. Check localStorage for saved preference
2. If none, detect browser language (Arabic if starts with 'ar', else English)
3. After login, sync with user.language from database
4. User can manually switch languages via dropdown

#### Navigation Guards

**Route Protection:**
- Authenticated users on `/login` redirect to their default_page
- Unauthenticated users redirect to `/login` with return URL preserved
- Post-login redirect respects query parameter or defaults to user's landing page

**Guard Implementation:**
- `beforeEach()` guard in router checks authentication state
- Validates token presence and expiration
- Preserves intended destination in query params
- Handles session timeout gracefully

#### Security Features

- Password masking with optional visibility toggle
- CSRF token handling via Axios interceptors
- Automatic token attachment to authenticated requests
- Session timeout handling (401 → clear state → redirect to login)
- Secure localStorage for sensitive data
- Input sanitization (trim whitespace, prevent XSS)
- Rate limiting on login attempts (backend enforced)
- HTTPS recommended for production

#### Technical Stack

**Core Dependencies:**
- Vue 3 (Composition API)
- Vue Router 4 (navigation and guards)
- Pinia (state management)
- vue-i18n (internationalization)
- Axios (HTTP client)
- Bootstrap 5 (CSS framework)

**Asset Management:**
- Carousel images: `/src/assets/images/login/`
- Brand logo: `/src/assets/icons/`
- Component-scoped styles

**Browser Support:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- RTL layout support for Arabic
- Responsive breakpoints: Mobile (< 768px), Tablet (768-992px), Desktop (> 992px)

**Performance Considerations:**
- Lazy-loaded carousel images
- Debounced input validation
- Optimized re-renders with Vue reactivity
- Minimal bundle size with tree-shaking

---

### Forgot Password

**Route:** `/forgot-password` | **Access:** Guest users only

Password recovery flow allowing users to request a password reset link via email.

**Main View (`forgetPassword.vue`):**
- Centered card layout with branding icon and clear instructions
- Language switcher in top-right corner
- Single-field form focused on email submission
- Success message displayed inline after successful submission
- "Back to Login" link for easy navigation

**Form Fields:**
- **Email** (required, validated) — Email address associated with the user account

**Features:**
- Client-side email format validation (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)
- Real-time error clearing as user types
- Server-side validation with detailed error messages
- Success state with animated checkmark and confirmation message
- Auto-storage of email and token in localStorage for reset flow
- Error display directly under email input (not in alert box)

**Components Used:**
- `FormLabel` — Email field label with required indicator
- `TextField` — Email input with placeholder
- `PrimaryButton` — Submit button with loading state ("Sending...")
- `BaseDropdown` — Language selector

**Workflow:**
1. User enters their email address
2. Client validates email format
3. API request sent to backend
4. On success:
   - Token saved to localStorage (`reset_token`)
   - Email saved to localStorage (`reset_email`)
   - Success message displayed with green alert box
   - User can manually navigate to reset password or wait for email
5. On error:
   - Error message displayed under email input field
   - 404 → "Email address not found"
   - 422 → Validation error message from server
   - 500 → "Server error. Please try again later."

**API Endpoints:**
- `POST /forgot_password` — Request reset token with `{email}`
- Returns: `{success: true, message: string, token: string}`

**Error Handling:**
- 404 Not Found → `forgotPassword.errors.emailNotFound`
- 422 Validation Error → Display first validation message from `errors.email` array
- 500 Server Error → `forgotPassword.errors.serverError`
- Network Error → Generic error message
- All errors shown inline under email field with warning icon (⚠)

**Validation Rules:**
- Email required
- Valid email format
- Errors cleared on input change

**Storage:**
- `reset_email` → Stored for use in reset password page
- `reset_token` → Token received from server for verification

**Navigation:**
- "Back to Login" link → `/login`
- No auto-redirect; user controls next step

---

### Reset Password

**Route:** `/reset-password` | **Access:** Guest users only (with valid token)

Secure password reset interface with token validation and confirmation.

**Main View (`resetPassword.vue`):**
- Split layout: reset form (left, 50%) and informational panel (right, 50%, hidden on mobile)
- Three states: Loading (validating token), Invalid Token (error state), Valid Token (form state)
- Token validation runs immediately on page load
- Auto-redirect to `/forgot-password` after 5 seconds if token is invalid

**Token Validation:**
- Token and email extracted from URL query parameters (`?token=...&email=...`) or localStorage fallback
- Validation API call: `GET /password/reset/validate?token=...&email=...`
- If validation fails, displays error message and auto-redirects
- If successful, displays password reset form

**Form Fields (Valid Token State):**
- **New Password** (required, min 6 characters) — Password input with visibility toggle
- **Confirm Password** (required, must match) — Confirmation password input with visibility toggle

**Features:**
- Real-time password match validation
- Client-side validation before submission
- Server-side error handling with field-specific messages
- Success state with animated alert and auto-redirect to login
- Loading spinner during token validation
- Invalid token state with red alert and "Request New Link" button

**Components Used:**
- `FormLabel` — Field labels with required indicators
- `TextField` — Password inputs with show/hide toggle
- `PrimaryButton` — Submit and action buttons with loading states

**Workflow:**
1. **Token Validation Phase:**
   - Loading spinner displayed
   - Token validated via API
   - If invalid: error state with redirect countdown
   - If valid: form displayed

2. **Password Reset Phase:**
   - User enters new password (min 6 chars)
   - User confirms password (must match)
   - Form submitted to API
   - On success: green alert + redirect to `/login` after 3 seconds
   - On error: error alert displayed

**API Endpoints:**
- `GET /password/reset/validate` — Validate token before showing form
  - Params: `{token, email}`
  - Returns: `{success: boolean, message: string}`
- `POST /reset_password` — Reset password
  - Body: `{token, email, password, password_confirmation}`
  - Returns: `{success: boolean, message: string}`

**Error Handling:**
- **Token Validation Errors:**
  - 400/404 → `resetPassword.errors.expiredLink`
  - Generic → `resetPassword.errors.invalidLink`
  - Missing token/email → `resetPassword.errors.missingToken`

- **Password Reset Errors:**
  - 400 → "Invalid or expired reset link"
  - 422 Validation → Field-specific errors (`errors.password`, `errors.password_confirmation`)
  - 500 → "Server error. Please try again later."

**Validation Rules:**
- Password: required, minimum 6 characters
- Confirm Password: required, must match password field
- Form disabled until both fields pass validation

**Storage Management:**
- Reads `reset_token` and `reset_email` from localStorage
- Clears both values on successful password reset
- Fallback to URL query parameters if localStorage is empty

**Navigation:**
- "Back to Login" link → `/login`
- "Request New Link" button (invalid token state) → `/forgot-password`
- Auto-redirect on success → `/login` (3 seconds)
- Auto-redirect on invalid token → `/forgot-password` (5 seconds)

**Security Features:**
- Token-based authentication
- Single-use tokens (cleared after successful reset)
- Server-side validation
- Password visibility toggle
- Minimum password length enforcement
- HTTPS recommended for production

---
## Modules Overview

---

### User Management

> **Route:** `/user` | **Roles:** SuperAdmin, Admin

#### What it does

Manages system user accounts. Users are the people who log in and operate the system — admins, employees, supervisors. This module handles creating accounts, assigning roles, managing profile images, and soft-deleting users.

#### What it connects to

- **Companies** — Every user belongs to a company. The company field appears as a select dropdown for SuperAdmin or is auto-assigned for Admin.
- **Permissions** — User IDs are used in the Permissions module to build the permission matrix.
- **Profile** — The logged-in user's data from this module is displayed on the Profile page.

#### How it works

**Table Columns:** Index, Full Name, Username, Email, Phone Number, User Role, Company

**Search & Filters:** Text search by name/username/email. Group filter by role (Admin, Employee, Supervisor, etc.).

**Form Fields:**

| Field    | Type        | Validation                 |
| -------- | ----------- | -------------------------- |
| Name     | text        | Required, max 255          |
| Username | text        | Required, max 255          |
| Email    | text        | Required, max 255          |
| Phone    | text        | Max 20 characters          |
| Password | password    | Required on create, min 6  |
| Role     | select      | Admin, Employee, Supervisor, etc. |
| Company  | select      | SuperAdmin only            |
| Image    | file upload | Max 200 KB, with preview   |

**Special behavior:**
- SuperAdmin users and the currently logged-in user are automatically hidden from the list
- Roles are shown as colored `StatusBadge` components in the table

**Soft-delete:** Yes — Active / Trashed tabs with bulk delete and restore.

**Store Endpoints:**

| Method | Endpoint               | Purpose          |
| ------ | ---------------------- | ---------------- |
| GET    | `/users`               | List (paginated) |
| GET    | `/users/trashed`       | List deleted     |
| POST   | `/users`               | Create           |
| PATCH  | `/users/{id}`          | Update           |
| DELETE | `/users/{id}`          | Soft-delete      |
| POST   | `/users/{id}/restore`  | Restore          |
| DELETE | `/users/bulk`          | Bulk delete      |
| POST   | `/users/bulk/restore`  | Bulk restore     |

---

### Driver Management

> **Route:** `/driver` | **Roles:** All

#### What it does

Manages delivery drivers — the people who physically transport goods. Each driver has a status (available, busy, in_holiday, offline), a vehicle, and belongs to a branch. The system tracks driver availability for assignment to delivery orders and work plans.

#### What it connects to

- **Branches** — Every driver belongs to a branch (physical location).
- **Companies** — Every driver belongs to a company.
- **Work Plans** — Drivers are assigned to work plans for scheduling. When deleting a driver, the system checks for active work plans and offers reassignment.
- **Driver Lines** — Drivers are mapped to delivery lines through the Driver Lines module.
- **Orders** — Drivers are assigned to orders during the order creation wizard.
- **Collections** — Payments track which driver received/paid.

#### How it works

**Table Columns:** Index, Name, Username, Status, Type, Branch Name, Vehicle Number, Phone

**Search & Filters:** Text search by name/username. Group filter by status.

**Form Fields:**

| Field          | Type     | Validation                      |
| -------------- | -------- | ------------------------------- |
| Name           | text     | Required                        |
| Username       | text     | Required                        |
| Email          | text     | Optional                        |
| Password       | password | Required on create              |
| Phone          | text     | Optional                        |
| Type           | select   | Custom driver / Delivery driver |
| Vehicle Number | text     | Optional                        |
| Branch         | select   | Required                        |
| Company        | select   | SuperAdmin only                 |
| Status         | select   | available / busy / in_holiday / offline |

**Status Colors:** green = available, yellow = busy, grey = offline, blue = in_holiday

**Unique component — `DriverReassignModal`:** When deleting a driver who has active work plans, this modal appears instead of a simple confirmation. It shows the affected work plans and offers two choices:
1. Delete the work plans along with the driver
2. Reassign the work plans to a different driver (selected from a dropdown)

**Soft-delete:** Yes — with bulk operations.

**Store Endpoints:**

| Method | Endpoint                      | Purpose                        |
| ------ | ----------------------------- | ------------------------------ |
| GET    | `/drivers`                    | List (paginated)               |
| GET    | `/drivers/trashed`            | List deleted                   |
| POST   | `/drivers`                    | Create                         |
| PATCH  | `/drivers/{id}`               | Update                         |
| DELETE | `/drivers/{id}`               | Soft-delete (optional force)   |
| POST   | `/drivers/{id}/restore`       | Restore                        |
| DELETE | `/drivers/bulk`               | Bulk delete                    |
| POST   | `/drivers/bulk/restore`       | Bulk restore                   |
| GET    | `/drivers/{id}/workplans`     | Check work plans before delete |
| POST   | `/drivers/reassign-workplans` | Move plans to another driver   |

**Store Getters:** `activeDrivers`, `busyDrivers`, `offlineDrivers` — filter the driver list by status.

---

### Company Management

> **Route:** `/company` | **Roles:** SuperAdmin only

#### What it does

Manages the companies that participate in the delivery platform. Companies can be of three types: delivery company, admin company, or customer company. Each company can have multiple branches (physical locations) and can enable or disable line sharing.

#### What it connects to

- **Branches** — Companies contain branches. When creating a company, you add branch rows directly in the form.
- **Lines** — Lines belong to companies.
- **Users** — Users belong to companies.
- **Drivers** — Drivers belong to companies.
- **Customers** — Customers belong to companies.
- **All pricing modules** — Line Pricing, Company Pricing, and Discounts are scoped to companies.

#### How it works

**Table Columns:** Index, Name, Type, Shared Line (inline toggle)

**Search & Filters:** Group filter by company type (delivery / admin / customer).

**Form Fields:**

| Field    | Type                | Validation                                               |
| -------- | ------------------- | -------------------------------------------------------- |
| Name     | text                | Required, max 255                                        |
| Type     | select              | delivery / admin / customer company                      |
| Branches | dynamic row builder | Each row has: branch name + latitude + longitude + map picker. Add/remove rows dynamically. |

**Unique components:**

- **`SharedLineToggle`** — Rendered directly inside the table's "Shared Line" column as an inline on/off switch. When toggled, it immediately calls the API. Only SuperAdmin can toggle it. If the API call fails, the checkbox reverts automatically.
- **`FormModal` with branch rows** — The form includes a dynamic section where you add/remove branch entries. Each branch row has a name field and an embedded map location picker for choosing latitude/longitude visually.
- **`DetailsModal`** — Enhanced to display company info plus branches as cards and associated lines as cards below.

**Soft-delete:** Yes — with bulk operations.

**Store Endpoints:**

| Method | Endpoint                  | Purpose           |
| ------ | ------------------------- | ----------------- |
| GET    | `/companies`              | List              |
| GET    | `/companies/trashed`      | List deleted      |
| POST   | `/companies`              | Create            |
| PATCH  | `/companies/{id}`         | Update            |
| DELETE | `/companies/{id}`         | Soft / force delete |
| POST   | `/companies/{id}/restore` | Restore           |
| DELETE | `/companies/bulk`         | Bulk delete       |
| POST   | `/companies/bulk/restore` | Bulk restore      |

---

### Customer Management

> **Route:** `/customer` | **Roles:** All

#### What it does

Manages the customers who place delivery orders. Each customer has a name, phone number, belongs to a company, and optionally has geographic coordinates. The coordinates allow the Map module to display customer locations and help with route planning.

#### What it connects to

- **Companies** — Every customer belongs to a company. SuperAdmin can filter by company; Admin sees only their own company's customers.
- **Orders** — Customers are selected during order creation in the Order Wizard.
- **Discounts** — Discounts of type "Customer" target specific customers.
- **Map** — Customer locations are displayed on the interactive map.
- **Statistics** — Customer counts and top-customer data appear on the Statistics dashboard.

#### How it works

**Table Columns:** Vary by role.
- Admin sees: Index, Name, Phone
- SuperAdmin sees: Index, Name, Phone, Company

**Search & Filters:** Text search by name/phone. Company filter (SuperAdmin only).

**Form Fields:**

| Field     | Type       | Validation                            |
| --------- | ---------- | ------------------------------------- |
| Name      | text       | Required, min 3, max 255              |
| Phone     | text       | Required, max 20                      |
| Company   | select     | Required. Locked/hidden for Admin.    |
| Latitude  | number     | Optional, -90 to 90                   |
| Longitude | number     | Optional, -180 to 180                 |
| Location  | map picker | Visual coordinate selector on an embedded map |

**Soft-delete:** Yes — with bulk operations.

**Store Endpoints:**

| Method | Endpoint                   | Purpose      |
| ------ | -------------------------- | ------------ |
| GET    | `/customers`               | List         |
| GET    | `/customers/trashed`       | List deleted |
| POST   | `/customers`               | Create       |
| PATCH  | `/customers/{id}`          | Update       |
| DELETE | `/customers/{id}`          | Soft-delete  |
| POST   | `/customers/{id}/restore`  | Restore      |
| DELETE | `/customers/bulk`          | Bulk delete  |
| POST   | `/customers/bulk/restore`  | Bulk restore |

---

### Orders

> **Route:** `/orders` | **Roles:** All

#### What it does

The core module of the application. Manages delivery orders through their full lifecycle: creation, status tracking, driver assignment, and completion. Supports three order types — delivery, return, and exchange — each created through a multi-step wizard. Parent orders can have child orders (e.g. an exchange creates a return child + a delivery child).

#### What it connects to

- **Customers** — Each order is placed by a customer (selected in wizard step 2).
- **Lines** — Each order is assigned to a delivery line (wizard step 4).
- **Drivers** — Each order is assigned to a driver (wizard step 5).
- **Line Pricing** — The order's price comes from the line price configuration.
- **Discounts** — Discounts can reduce the order price.
- **Companies** — Orders belong to a company.
- **Currencies** — Order prices are displayed in the associated currency.
- **Work Plans** — Orders are grouped into work plans for scheduling.
- **Collections & Payments** — Payments are generated from completed orders.
- **Statistics** — Order counts and status breakdowns power the Statistics dashboard.

#### How it works

**Table Columns:** Index, Order Code, Customer, Order Items, Status, Line, Driver, Price, Currency, Date

**Search & Filters:**
- Text search by order code or customer name
- Group filter by status (pending, inprocess, completed, cancelled, etc.)
- Time period filter: all / today / month / year

**Expandable rows:** Parent orders can be expanded to reveal child orders.

**Unique components:**

| Component              | What it does                                                                        |
| ---------------------- | ----------------------------------------------------------------------------------- |
| `OrderWizard.vue`      | Multi-step creation wizard with 3 modes (**delivery**, **return**, **exchange**). Steps: (1) Date (2) Customer (3) Items — name, quantity, price per item (4) Line (5) Driver (6) Summary + confirm |
| `OrdersTableCard.vue`  | Custom table rendering: order-item cells show name + quantity, statuses use `StatusBadge`, pricing is formatted, and rows expand to show child orders |
| `OrdersModals.vue`     | Container component managing the open/close state of all order modals — wizard, form, details, progress, confirmation |
| `OrderDetailsTabs.vue` | Tabbed detail view: **Details** tab (order info, customer, driver, pricing) + **Exchanged Orders** tab (related exchange orders) |
| `OrderChildOrders.vue` | Renders child orders inside an expanded parent row with their items and statuses    |
| `OrderItemProgress`    | Stepper showing each order item's journey through work plan steps: pending -> start -> pickup -> done/failed, with timestamps at each step |

**Soft-delete:** Yes — with bulk operations and bulk status changes.

**Store (`ordersStore.js`):**

Includes `transformOrder()` for normalizing deeply nested API responses (customer, company, currency, line, line price, discount objects) and `normalizeOrderStatus()` which converts "in_progress" to "inprocess" for consistent UI handling.

| Method | Endpoint          | Purpose                           |
| ------ | ----------------- | --------------------------------- |
| GET    | `/orders`         | List with status + time filters   |
| GET    | `/orders/trashed` | List deleted                      |
| POST   | `/orders`         | Create (delivery/return/exchange) |
| PATCH  | `/orders/{id}`    | Update                            |
| DELETE | `/orders/{id}`    | Soft-delete                       |
| GET    | `/orders/{id}`    | Single order details              |

---

### Statistics

> **Route:** `/statistics` | **Roles:** All

#### What it does

A read-only analytics dashboard showing aggregated KPIs across the system. It provides a high-level view of operational health — how many orders are pending, which drivers are active, which lines are most used, and which customers generate the most volume.

#### What it connects to

- **Orders** — Status counts (pending, completed, cancelled), order volume over time.
- **Drivers** — Active/inactive counts, delivery time stats.
- **Customers** — Total count, top customers by order volume.
- **Line Work** — Total/active counts, driver-to-line-work mappings.
- **Lines** — Most-used lines with usage counts.

#### How it works

**No data table or forms.** This module is purely a dashboard.

**Layout — 5 tabs:**

| Tab       | What it shows                                                                      |
| --------- | ---------------------------------------------------------------------------------- |
| Orders    | `StatCard` components for pending/completed/cancelled counts. Clicking a card filters the `OrdersTableCard` below to show matching orders. |
| Drivers   | `StatCard` for active/inactive/on-delivery counts. Min/max delivery time stats.    |
| Customers | `StatCard` for total/active counts. Best customers list (top by order volume).     |
| LineWork  | `StatCard` for total/active counts. Line-work-to-drivers mapping table.            |
| Lines     | `StatCard` for total/active counts. Most-used lines list with usage counts.        |

**Unique components:**

- **`StatCard`** — Displays a formatted value (number / currency / percentage), label, icon, optional trend arrow (up/down). Clickable cards emit a click event.
- **`OrdersTableCard`** — Reused from Orders module. Shows a filtered data table with a "Go to Order" navigation button.

**Store:** Does not have its own store. Reuses `ordersStore`, `driverStore`, `customerStore`, `lineworkStore`, and `linesStore` for aggregated data. Each tab loads data independently.

---
### Work Plans

**Route:** `/work-plans` | **Access:** All authenticated users (View), Admin/SuperAdmin (Create/Edit/Delete)

Manages driver work schedules — the daily plans that define which driver handles which orders on which date. Work plans are the bridge between orders and drivers: they bundle multiple orders together and assign them to a specific driver on a specific day.

#### What it connects to

- **Drivers** — Each work plan is assigned to a driver. The driver selection dropdown fetches from the driver store.
- **Orders** — Work plans contain order assignments with items and processing steps.
- **Companies** — Work plans belong to a company.
- **Driver Management** — When deleting a driver, the system checks for active work plans via this module's data.

#### How it works

**Two view modes:**
1. **Calendar View** — FullCalendar integration with day/week/month views. Work plans appear as clickable calendar events.
2. **Table View** — Standard data table.

**Table Columns:** Index, Name, Company, Date, Driver, Orders

**Search & Filters:** Company group filter.

**Unique component — `calender.vue`:** Wraps FullCalendar, rendering work plans as events. Click an event to open the details modal.

**Form Fields:**

| Field   | Type               | Validation                                      |
| ------- | ------------------ | ----------------------------------------------- |
| Name    | text               | Required                                        |
| Company | select             | Required, SuperAdmin only                       |
| Date    | date               | Required                                        |
| Driver  | select             | Required                                        |
| Orders  | dynamic order rows | Each row assigns an order with items and processing steps |

**Special behavior:** Bulk actions are filtered to only allow operations on plans the current user's role can modify.

**Soft-delete:** Yes.

**Store normalization:** Extracts driver info from nested `workplanorder` steps, transforms order items arrays, and parses dates from the first step when not explicitly provided.

**Store Endpoints:**

| Method | Endpoint                  | Purpose      |
| ------ | ------------------------- | ------------ |
| GET    | `/workplans`              | List         |
| GET    | `/workplans/trashed`      | List deleted |
| POST   | `/workplans`              | Create       |
| PATCH  | `/workplans/{id}`         | Update       |
| DELETE | `/workplans/{id}`         | Soft-delete  |
| POST   | `/workplans/{id}/restore` | Restore      |

---

Manages driver delivery schedules and order assignments with advanced filtering, calendar visualization, and real-time progress tracking.

**Main View (`workPlans.vue`):**
- **Dual View Modes:** 
  - **Calendar View** — FullCalendar integration showing work plans as interactive events on day/week/month views
  - **Table View** — Paginated data table with search, company filtering, and bulk operations
- **Smart Filtering System:**
  - Search by plan name or driver
  - Filter by company (SuperAdmin sees all, Admin sees only own company)
  - **Line Filter** — Filter orders by delivery line/route
  - **Case Filter** — Filter orders by type (Full/Part/Fast)
- **Role-Based Permissions:**
  - **Driver** — Read-only access, can only view assigned plans
  - **Admin** — Can create/edit/delete plans for their company
  - **SuperAdmin** — Can create/edit/delete only their own company's plans
- **Table Columns:** Index, Name, Date, Driver Name, Company Name
- **Bulk Actions:** Available only for plans the current user can modify (respects permissions)

**Components Used:**
- `workPlansHeader.vue` — Wraps `TableHeader` with company filter
- `calender.vue` — **Advanced FullCalendar Implementation:**
  - Displays work plans as calendar events with color-coded status
  - Shows order count per plan on event badge
  - **Multiple Plans Per Day:** Shows first plan + "+N" button for additional plans
  - **Interactive Tooltips:** Hover over events to see plan details (driver, orders, company)
  - **Plan Details Card:** Click event to view full plan info with orders list in side panel
  - Supports RTL layout and Arabic locale
  - Event grouping by date with visual ordering
- `DataTable` — Table view with sortable columns, row selection, and role-based row disabling
- `FormModal` — **Complex Multi-Section Form:**
  1. Basic Info: Plan name, driver (select), date, company (locked to user's company)
  2. **Filter Controls:** Line filter (dropdown), Case filter (Full/Part/Fast)
  3. **Dynamic Order Assignment:** 
     - `orderRows` field type with add/remove rows
     - Each row: Order dropdown → Auto-populated Items checkboxes
     - Filter-aware: Shows only orders matching selected Line/Case
     - Multi-item selection per order
- `DetailsModal` — Shows plan details with fields: ID, Name, Date, Driver, Company
- `OrderItemProgress` — **Expandable stepper component** showing work plan execution status:
  - Displays order item progress through workflow steps (pending → start → pickup → done/failed)
  - Visual timeline with color-coded status indicators
  - Shows timestamps for each completed step
  - Expandable/collapsible card view with step-by-step breakdown
- `ConfirmationModal` — Delete confirmation
- `BulkActionsBar` — Bulk delete (filtered to only modifiable plans)
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls (table view only)
- `Actions` — Per-row Edit, Details, Delete (conditionally shown based on `canModifyPlan()`)

**Store (`workPlansStore.js`):**
- **State:** `workPlans`, `trashedWorkPlans`, `loading`, `trashedLoading`, `workPlansPagination`, `trashedPagination`
- **Complex Data Normalization:** 
  - Extracts driver info from nested `workplanorder.steps` array
  - Parses date from first step if not explicitly provided
  - Groups order items by order code
  - Resolves driver names from driver store if missing
  - Transforms nested `workplanorder` structure into flat `orders` array
- **API Endpoints:**
  - `GET /work_plans` — Fetch with pagination, returns nested structure with `workplanorder`
  - `GET /trashed/work_plans` — Fetch deleted plans
  - `POST /work_plans` — Create with payload: `{name, driver_id, date?, company_id, Orderitems: [item_ids]}`
  - `PATCH /work_plans/{id}` — Update (same payload structure)
  - `DELETE /work_plans/{id}` — Soft-delete
  - `POST /restore/work_plans/{id}` — Restore
  - `DELETE /bulk-delete/work_plan/work_plans` — Bulk delete
  - `POST /bulk-restore/work_plan/work_plans` — Bulk restore
  - `GET /work_plans/{id}` — Fetch single plan with full `workplanorder` details for progress tracking

**Advanced Features:**
- **Orders with Items API Integration:** 
  - Calls `/orders_with_items?line_name=X&case=Y` to fetch filtered orders
  - Dynamically populates order dropdowns based on Line/Case selection
  - Extracts order items per order for checkbox selection
- **Permission-Based Bulk Actions:**
  - `canModifyPlan(plan)` checks if user can edit/delete based on role and company ownership
  - Bulk operations automatically filter out non-modifiable plans
  - Disabled rows appear greyed out in table with no checkbox
- **Calendar Event Details:**
  - Plans grouped by date with visual indicators
  - First plan shows as colored event with order count badge
  - Additional plans accessible via "+N" button → opens modal with all plans for that date
  - Click-to-select from modal updates details panel
- **Form State Persistence:**
  - Maintains filter state (Line/Case) during form editing
  - Re-fetches orders when filters change
  - Pre-populates edit form with existing order assignments
- **Progress Tracking:**
  - Fetches detailed work plan on Details modal open
  - Displays each order item's workflow progression
  - Shows status, timestamps, and current step for each item
  - Supports failed status with red styling

**Data Flow:**
1. User opens Add/Edit modal
2. Selects Line/Case filters (optional)
3. System calls `/orders_with_items` with filter params
4. Form populates order dropdown with matching orders
5. User selects order → Items checkboxes appear for that order
6. User selects items → System collects all selected item IDs
7. On submit → Sends `{name, driver_id, date, company_id, Orderitems: [ids]}`
8. Backend creates `workplan` + links to `order_items` via `workplanorder` table

**Calendar Data Flow:**
1. Store normalizes `workplans` → extracts date, driver, orders from nested structure
2. `calender.vue` groups plans by date
3. Creates calendar events: first plan = main event, rest = "+N" button
4. User clicks event → Updates `selectedPlan` ref → Shows in details card
5. User clicks "+N" → Opens modal with all plans for that date → Select to view

---
### Collections & Payments

**Route:** `/collections` | **Access:** Admin, Driver

Manages collection records linked to invoices with bulk invoice creation capability.

**Main View (`collections.vue`):**
- Search and filter by collection status
- Table columns: Index, Invoice Code, Driver Name, Note, Status
- Collections with `invoice_id` are disabled (non-interactive) - cannot be selected
- **Smart Bulk Actions:** 
  - If selected collections have `invoice_id` → Show "Mark as Paid" action
  - If selected collections have NO `invoice_id` → Show "Create Invoice" action
- Status updates only — collections are not created or deleted through this module

**Components Used:**
- `TableHeader` — Search and status filter
- `DataTable` — Collection list with disabled row styling for items with invoices (via `disableRowWhen` prop)
- `DetailsModal` — Full collection details display
- `ConfirmationModal` — Confirmation for bulk actions (Create Invoice / Mark as Paid)
- `SuccessModal` — Post-action success notification
- `BulkActionsBar` — Context-aware bulk operations
- `Pagination` — Page controls
- `StatusBadge` — Collection status display
- `Actions` — Per-row Details only (no edit/delete)

**Store (`collectionsManagement.js`):**
- **State:** `collections`, `loading`, `error`
- **Normalization:** Extracts `invoice_id` from nested `invoice_id.id`, `invoice_code` from `invoice_id.invoice_code`, `driver_name` from `received_by_driver.name`
- **API Endpoints:**
  - `GET /collections` — Fetch with pagination
  - `POST /invoices` with `{collection_ids}` — Create invoice from selected collections
  - `PATCH /collections` with `{collection_ids, status: 'completed'}` — Mark collections as paid

**Workflow:**
1. User selects collections without invoices → "Create Invoice" button appears
2. Click → Confirmation modal → API creates invoice → Success modal → Refresh data
3. User selects collections with invoices → "Mark as Paid" button appears
4. Click → Confirmation modal → API updates status → Success modal → Refresh data

---

### Invoices

**Route:** `/invoices` | **Access:** All authenticated users

Read-only invoice management with advanced PDF export and bulk payment processing.

**Main View (`invoices.vue`):**
- Search and filter by invoice status
- Table columns: Index, Invoice Code, Delivery Company, Client Company, Collection Amount, Due Amount, Status
- **Read-only module** — invoices are generated automatically from collections via backend
- **PDF Export:** Generate professional invoices with dual-logo layout using html2pdf.js
- **Bulk Actions:** 
  - Export PDF (single selection only)
  - Mark as Paid (multiple selections)

**Components Used:**
- `InvoiceHeader.vue` — Wraps `TableHeader` with invoice status filter
- `DataTable` — Invoice list display
- `DetailsModal` — Full invoice details with line items, amounts, tax, and totals
- `BulkActionsBar` — Context-aware actions (Export/Mark as Paid)
- `ConfirmationModal` — Confirmation for bulk mark as paid
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `StatusBadge` — Invoice status display
- `Actions` — Per-row Details only (no edit/delete)

**Store (`invoicesManagement.js`):**
- **State:** `invoices`, `loading`, `error`, `invoicesPagination`
- **Normalization:** Maps nested company objects:
  - `delivery_company.id` → `delivery_company_id`
  - `delivery_company.name` → `delivery_company_name`
  - `client_company.id` → `client_company_id`
  - `client_company.name` → `client_company_name`
- **API Endpoints:**
  - `GET /invoices` — Fetch with pagination and status filter
  - `GET /invoices/{id}` — Fetch single invoice with full collection details
  - `PATCH /invoices` with `{status, invoice_ids}` — Bulk mark as paid

**PDF Export Features:**
- **Dual-Logo Layout:** Balanced header with delivery company logo (left/right based on RTL) and client company logo (opposite side)
- **Fallback Design:** If logo missing, shows colored gradient badge with company name
- **Comprehensive Content:**
  - Invoice title with invoice code and date
  - Collections table: Order Code, Total Price, Delivery Price
  - Invoice details: Companies, period, amounts
  - Professional footer with generation date and branding
- **RTL Support:** Full Arabic layout support with proper alignment
- **Localization:** Date formatting based on user's locale (ar-SA / en-US)
- **Styling:** Modern gradient headers, hover effects, structured layout
- **Technology:** html2pdf.js with custom HTML template generation

**Workflow:**
1. Collections module creates invoice → Backend generates invoice record with `collection_ids`
2. User navigates to Invoices module → Views read-only invoice list
3. **Export PDF:** Select single invoice → Click Export → PDF generated with full details + collections table
4. **Mark as Paid:** Select multiple invoices → Click Mark as Paid → Confirmation → API updates status → Success notification

**Data Flow:**
- Collections (with no invoice) → Create Invoice button → Backend creates invoice record
- Invoice record stores reference to collections
- PDF export fetches full invoice via `GET /invoices/{id}` to retrieve nested collections array
- Each collection in PDF shows: order code, total price, delivery price, currency
---

### Driver Lines

> **Route:** `/driver-line` | **Roles:** All

#### What it does

Maps drivers to line work assignments. A driver-line record means "Driver X is authorized to handle Line Work Y." This is the assignment that connects the driver workforce to the operational line work types.

#### What it connects to

- **Drivers** — Via `driver_id`. The driver dropdown fetches options from `driverStore`.
- **Line Work** — Via `line_work_id`. The line work dropdown fetches options from `lineworkStore`.
- **Statistics** — Driver-line assignments are used to calculate driver utilization stats.

#### How it works

**Table Columns:** Index, Driver Name (sortable), Line Work Name (sortable), Created At (sortable)

**Search & Filters:** Text search. Status group filter.

**Form Fields:**

| Field     | Type   | Validation                                                            |
| --------- | ------ | --------------------------------------------------------------------- |
| Driver    | select | Required. Options loaded dynamically from driver store. Validates against known IDs. |
| Line Work | select | Required. Options loaded dynamically from line work store. Validates against known IDs. |

**Special behavior:**
- **Duplicate prevention:** Server-side validation returns an error if the driver-line combination already exists.
- **Custom header:** Shows an informational banner with a link to the Lines management page.
- **Pagination:** Uses 5 items per page (smaller page size than most modules).

**Soft-delete:** Yes.

**Store normalization:** Extracts driver and line work IDs/names from nested relationship objects. Handles `created_by` field normalization.

**Store Endpoints:**

| Method | Endpoint                      | Purpose      |
| ------ | ----------------------------- | ------------ |
| GET    | `/driver-lines`               | List         |
| POST   | `/driver-lines`               | Create       |
| PUT    | `/driver-lines/{id}`          | Update       |
| DELETE | `/driver-lines/{id}`          | Soft/force delete |
| GET    | `/driver-lines/trashed`       | List deleted |
| POST   | `/driver-lines/{id}/restore`  | Restore      |

---

### Line Work

> **Route:** `/line-work` | **Roles:** All

#### What it does

Defines the types of work that can be performed on delivery lines. Examples: "Standard Delivery", "Express Delivery", "COD Collection". These are company-specific operational classifications that categorize what kind of task a driver performs on a line.

#### What it connects to

- **Companies** — Each line work type belongs to a company.
- **Driver Lines** — Drivers are assigned to specific line work types through the Driver Lines module.
- **Discounts** — Discounts can target specific line work types.
- **Statistics** — Line work usage data appears on the Statistics dashboard.

#### How it works

**Table Columns:** Index, Name (sortable), Company (SuperAdmin only)

**Search & Filters:** Text search by name.

**Form Fields:**

| Field   | Type   | Validation              |
| ------- | ------ | ----------------------- |
| Name    | text   | Required, max 255       |
| Company | select | Required, auto-assigned for Admin, SuperAdmin only |

**Soft-delete:** Yes — with bulk operations.

**Store Endpoints:**

| Method | Endpoint                     | Purpose           |
| ------ | ---------------------------- | ----------------- |
| GET    | `/line-works`                | List              |
| POST   | `/line-works`                | Create            |
| PUT    | `/line-works/{id}`           | Update            |
| DELETE | `/line-works/{id}`           | Soft / force delete |
| GET    | `/line-works/trashed`        | List deleted      |
| POST   | `/line-works/{id}/restore`   | Restore           |
| DELETE | `/line-works/bulk`           | Bulk delete       |
| POST   | `/line-works/bulk/restore`   | Bulk restore      |

---

### Lines

> **Route:** `/lines` | **Roles:** All

#### What it does

Defines delivery lines — the fundamental geographic or service-based delivery routes in the system. A line represents a path like "Amman -> Zarqa" or a service area. Lines are the backbone that connects regions, drivers, pricing, and orders.

#### What it connects to

- **Regions** — Every line belongs to a region (geographic area).
- **Companies** — Every line belongs to a company.
- **Line Pricing** — Each line can have multiple price entries (per currency, per type).
- **Driver Lines** — Drivers are mapped to lines through line work assignments.
- **Orders** — Orders are assigned to a specific line during creation.
- **Discounts** — Discounts of type "Line" target specific lines.
- **Statistics** — Line usage counts appear on the Statistics dashboard.

#### How it works

**Table Columns:** Index, Name (sortable), Region, Company (SuperAdmin only)

**Search & Filters:** Text search by name.

**Form Fields:**

| Field   | Type   | Validation                                     |
| ------- | ------ | ---------------------------------------------- |
| Name    | text   | Required, max 255                              |
| Region  | select | Required, options from regions store            |
| Company | select | Required, auto-assigned for Admin, SuperAdmin only |

**Special behavior:**
- **No server-side pagination:** Loads all records (up to 1000) and paginates in memory using `paginateData()`.

**Soft-delete:** Yes — with bulk operations.

**Store Getters:** `linesByRegion` (grouped by region ID), `linesByCompany` (grouped by company ID).

**Store Endpoints:**

| Method | Endpoint                 | Purpose           |
| ------ | ------------------------ | ----------------- |
| GET    | `/lines`                 | List              |
| POST   | `/lines`                 | Create            |
| PUT    | `/lines/{id}`            | Update            |
| DELETE | `/lines/{id}`            | Soft / force delete |
| GET    | `/lines/trashed`         | List deleted      |
| POST   | `/lines/{id}/restore`    | Restore           |
| DELETE | `/lines/bulk`            | Bulk delete       |
| POST   | `/lines/bulk/restore`    | Bulk restore      |

---

### Line Pricing

> **Route:** `/line_price` | **Roles:** All

#### What it does

Defines how much a delivery costs on a specific line, in a specific currency, for a specific type of service. Supports two types: "delivery" and "return". This allows different pricing per line, per currency, and per direction — for example, delivering on Line A might cost $10 but returning costs $7.

#### What it connects to

- **Lines** — Each price entry references a line via `line_id`.
- **Currencies** — Each price entry is in a specific currency via `currency_id`.
- **Companies** — Each price entry belongs to a company.
- **Orders** — When creating an order on a line, the order price is pulled from the matching line price entry.

#### How it works

**Table Columns:** Index, Line Name, Price (sortable), Currency Code, Company (SuperAdmin only), Type

**Search & Filters:** Text search.

**Form Fields:**

| Field    | Type   | Validation                        |
| -------- | ------ | --------------------------------- |
| Line     | select | Required, options from lines store |
| Price    | number | Required, must be > 0, step 0.01 |
| Currency | select | Required, options from currencies store |
| Company  | select | Required, auto-assigned for Admin |
| Type     | select | Required, "delivery" or "return"  |

**Details modal fields:** ID, Line Name, Price, Currency Code, Company (SuperAdmin only), Type (translated), Created/Updated dates.

**Soft-delete:** Yes — with bulk operations.

**Store Getters:** `pricesByLine`, `pricesByCompany`, `pricesByType` ("delivery"/"return"), `pricesByCurrency` — each groups the data by the respective key.

**Store Endpoints:**

| Method | Endpoint                      | Purpose           |
| ------ | ----------------------------- | ----------------- |
| GET    | `/line-prices`                | List              |
| POST   | `/line-prices`                | Create            |
| PUT    | `/line-prices/{id}`           | Update            |
| DELETE | `/line-prices/{id}`           | Soft / force delete |
| GET    | `/line-prices/trashed`        | List deleted      |
| POST   | `/line-prices/{id}/restore`   | Restore           |
| DELETE | `/line-prices/bulk`           | Bulk delete       |
| POST   | `/line-prices/bulk/restore`   | Bulk restore      |

---

### Company Pricing

> **Route:** `/company-price` | **Roles:** All

#### What it does

Defines delivery pricing by company based on item characteristics. Items are classified into four size/weight categories, and each category can have a different price. This allows companies to charge differently for a small light package vs. a big heavy one.

#### What it connects to

- **Companies** — Each price entry belongs to a company.
- **Currencies** — Prices reference the company's default currency via `useAuthDefaults()`.

#### How it works

**Table Columns:** Index, Company Name (sortable), Item Type (sortable, localized), Price (sortable, formatted with currency symbol), Created At (sortable)

**Search & Filters:** Text search.

**Form Fields:**

| Field     | Type   | Validation                                                 |
| --------- | ------ | ---------------------------------------------------------- |
| Price     | number | Required, min 0.01                                         |
| Item Type | select | Required. Four options: Small & Light, Small & Heavy, Big & Light, Big & Heavy |
| Company   | select | Required, auto-assigned for Admin                          |

**Special behavior:**
- **Price formatting:** Displays as `$1,234.56` using the currency symbol from the company's currency.
- **Localized item types:** Item type labels use i18n translation keys (e.g. `companyPrice.itemTypes.smallLight`).

**Soft-delete:** Yes.

**Store Endpoints:**

| Method | Endpoint                        | Purpose           |
| ------ | ------------------------------- | ----------------- |
| GET    | `/company-prices`               | List              |
| POST   | `/company-prices`               | Create            |
| PUT    | `/company-prices/{id}`          | Update            |
| DELETE | `/company-prices/{id}`          | Soft / force delete |
| GET    | `/company-prices/trashed`       | List deleted      |
| POST   | `/company-prices/{id}/restore`  | Restore           |

---

### Discounts

> **Route:** `/discount` | **Roles:** All

#### What it does

Manages discount rules that reduce order prices. Discounts are flexible — they can target a specific customer, a geographic region, a delivery line, or apply as a flat price reduction. Each discount has a percentage, an optional value, and a validity period (start/end dates).

#### What it connects to

- **Companies** — Each discount belongs to a company.
- **Customers** — Discounts of type "Customer" target a specific customer via `target_id`.
- **Regions** — Discounts of type "Region" target a specific region via `target_id`.
- **Lines** — Discounts of type "Line" target a specific line via `target_id`.
- **Orders** — When creating an order, applicable discounts are applied to reduce the price.

#### How it works

**Table Columns:** Index, Type (sortable), Discount % (sortable, formatted as `X%`), Value (sortable, formatted as currency for "Price" type), Start Date (sortable), End Date (sortable), Company (sortable), Usage Count (sortable)

**Search & Filters:** Text search. Status group filter.

**Form Fields:**

| Field       | Type           | Validation                                                    |
| ----------- | -------------- | ------------------------------------------------------------- |
| Type        | select         | Required. Options: Customer, Region, Line, Price. Changing the type clears the target and value fields. |
| Discount %  | number         | Required, 0–100, step 0.1                                    |
| Start Date  | datetime-local | Required, format `YYYY-MM-DDTHH:MM`                          |
| End Date    | datetime-local | Optional, must be after start date                            |
| Company     | select         | Required, auto-assigned for Admin                             |
| Target      | select         | **Conditional** — required if type is Customer, Region, or Line. Options change dynamically based on type. Hidden if type is "Price". |
| Value       | number         | **Conditional** — required if type is "Price". Min > 0, step 0.01. Hidden if type is not "Price". |

**Special behavior:**
- **Dynamic field visibility:** The Target and Value fields toggle on/off based on the selected discount type.
- **Dynamic target options:** When type changes, the Target dropdown options are reloaded — customer list for "Customer", region list for "Region", line list for "Line".
- **Date normalization:** Converts between `YYYY-MM-DD HH:MM:SS` (API format) and `YYYY-MM-DDTHH:MM` (datetime-local input format).
- **Server-side pagination:** Uses pagination metadata from the API response (unlike Lines which paginates in memory).

**Soft-delete:** Yes — with bulk operations.

**Store Endpoints:**

| Method | Endpoint                    | Purpose           |
| ------ | --------------------------- | ----------------- |
| GET    | `/discounts`                | List (paginated)  |
| POST   | `/discounts`                | Create            |
| PUT    | `/discounts/{id}`           | Update            |
| DELETE | `/discounts/{id}`           | Soft / force delete |
| GET    | `/discounts/trashed`        | List deleted      |
| POST   | `/discounts/{id}/restore`   | Restore           |
| DELETE | `/discounts/bulk`           | Bulk delete       |
| POST   | `/discounts/bulk/restore`   | Bulk restore      |

---

### Branches

> **Route:** `/branches` | **Roles:** All

#### What it does

Manages the physical locations (offices, warehouses, distribution centers) of companies. Each branch has a name and geographic coordinates (latitude/longitude). These coordinates are used by the Map module to display branch locations visually and by the routing system for delivery planning.

#### What it connects to

- **Companies** — Every branch belongs to a company. Branches can also be created inline when creating a company.
- **Drivers** — Drivers are assigned to a branch (their home base).
- **Map** — Branch coordinates are rendered as markers on the interactive map.

#### How it works

**Table Columns:** Name (sortable), Company Name (sortable, SuperAdmin only)

**Search & Filters:** Text search by name.

**Form Fields:**

| Field     | Type       | Validation                                    |
| --------- | ---------- | --------------------------------------------- |
| Name      | text       | Required, max 255                             |
| Company   | select     | Required, auto-assigned for Admin             |
| Latitude  | text       | Required, -90 to 90                           |
| Longitude | text       | Required, -180 to 180                         |
| Location  | map picker | Interactive map for visual coordinate selection. Linked to the latitude/longitude fields — clicking the map updates both. |

**Details modal fields:** ID, Name, Company (SuperAdmin only), Latitude, Longitude.

**Special behavior:**
- **Location flattening:** The store handles both flat fields (`latitude`, `longitude`) and nested structures (`location.latitude`, `location.longitude`) from the API.
- **Company enrichment:** The store makes a separate API call to fetch company names and maps `company_id` to `company_name`.

**Soft-delete:** Yes — with bulk operations.

**Store Endpoints:**

| Method | Endpoint                    | Purpose           |
| ------ | --------------------------- | ----------------- |
| GET    | `/branches`                 | List (paginated)  |
| POST   | `/branches`                 | Create            |
| PUT    | `/branches/{id}`            | Update            |
| DELETE | `/branches/{id}`            | Soft / force delete |
| GET    | `/branches/trashed`         | List deleted      |
| POST   | `/branches/{id}/restore`    | Restore           |
| DELETE | `/branches/bulk`            | Bulk delete       |
| POST   | `/branches/bulk/restore`    | Bulk restore      |

---

### Regions

> **Route:** `/regions` | **Roles:** All (but editing is **SuperAdmin only**)

#### What it does

Defines geographic regions for organizing delivery areas. Regions are the top-level geographic grouping — lines belong to regions. Each region has bilingual names (English and Arabic) and an optional timezone.

#### What it connects to

- **Lines** — Lines belong to a region. The region determines the geographic scope of its lines.
- **Discounts** — Discounts of type "Region" target a specific region.

#### How it works

**Table Columns:** Index, Name (localized — shows Arabic or English based on current language), Timezone

**Search & Filters:** Text search.

**Form Fields:**

| Field        | Type | Validation       |
| ------------ | ---- | ---------------- |
| Key          | text | Required (unique identifier, e.g. "reg-001") |
| Name English | text | Required, max 255 |
| Name Arabic  | text | Required, max 255 |
| Timezone     | text | Optional, max 50 (e.g. "UTC+3") |

**Role Differences:**
- **SuperAdmin:** Full CRUD access, Active/Trashed tabs, bulk actions, Add button visible.
- **Admin:** Read-only. Can view details but cannot add, edit, or delete. Add button and action menu items are hidden.

**Special behavior:**
- **Localized display name:** The table automatically shows `namearabic` or `nameenglish` based on the current i18n locale.
- **No normalization:** Uses raw backend data directly without transformation.

**Soft-delete:** Yes (SuperAdmin only).

**Store Endpoints:**

| Method | Endpoint                   | Purpose           |
| ------ | -------------------------- | ----------------- |
| GET    | `/regions`                 | List (paginated)  |
| POST   | `/regions`                 | Create            |
| PUT    | `/regions/{id}`            | Update            |
| DELETE | `/regions/{id}`            | Soft / force delete |
| GET    | `/regions/trashed`         | List deleted      |
| POST   | `/regions/{id}/restore`    | Restore           |
| DELETE | `/regions/bulk`            | Bulk delete       |
| POST   | `/regions/bulk/restore`    | Bulk restore      |

---

### Currency

> **Route:** `/currency` | **Roles:** All (but editing is **SuperAdmin only**)

#### What it does

Manages the currencies used throughout the platform for pricing and payments. Each currency has a code (e.g. "USD"), bilingual names, a symbol (e.g. "$"), and an active/inactive status. Currencies are referenced by Line Pricing, Company Pricing, Payments, and user preferences.

#### What it connects to

- **Line Pricing** — Prices are defined in a specific currency.
- **Company Pricing** — Company prices reference currencies.
- **Payments** — Payment amounts are displayed with currency info.
- **Profile** — Users can select their preferred display currency.
- **Orders** — Order prices are displayed in the associated currency.

#### How it works

**Table Columns:** Index, Name (localized), Symbol (sortable), Key (sortable)

**Search & Filters:** Text search.

**Form Fields:**

| Field        | Type     | Validation                    |
| ------------ | -------- | ----------------------------- |
| Key          | text     | Required (code like "USD", "AED") |
| Name English | text     | Required                      |
| Name Arabic  | text     | Required                      |
| Symbol       | text     | Required (e.g. "$", "د.إ")   |
| Is Active    | checkbox | Active/inactive toggle        |

**Role Differences:**
- **SuperAdmin:** Full CRUD access.
- **Other roles:** Read-only — can only view currency details.

**Special behavior:**
- **Localized display name:** Shows `namearabic` or `nameenglish` based on current locale.

**Soft-delete:** Yes (SuperAdmin only).

**Store Endpoints:**

| Method | Endpoint                     | Purpose           |
| ------ | ---------------------------- | ----------------- |
| GET    | `/currencies`                | List (paginated)  |
| POST   | `/currencies`                | Create            |
| PUT    | `/currencies/{id}`           | Update            |
| DELETE | `/currencies/{id}`           | Soft / force delete |
| GET    | `/currencies/trashed`        | List deleted      |
| POST   | `/currencies/{id}/restore`   | Restore           |

---

### Map

> **Route:** `/map` | **Roles:** All

#### What it does

An interactive full-screen map powered by OpenLayers for visualizing the geographic state of the delivery operation — where drivers are, where branches are located, and where delivery points are. This module has no data table or forms — it is purely a visual tool.

#### What it connects to

- **Drivers** — Driver GPS coordinates are displayed as markers.
- **Branches** — Branch locations (from latitude/longitude) are shown as markers.
- **Customers** — Customer delivery/pickup point locations are rendered on the map.

#### How it works

**No table, no forms, no CRUD.** The entire view is a full-width, full-height map.

**Custom components — each adds a layer or control to the map:**

| Component            | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `displayDrivers.vue` | Renders driver markers at their GPS coordinates. Each shows name and status |
| `displayPoints.vue`  | Renders customer/delivery point markers with data popups on click           |
| `focusOnDriver.vue`  | A control button that centers and zooms the map on a selected driver        |
| `fullScreenMode.vue` | Toggle button for full-screen map display                                   |
| `layerSwitcher.vue`  | Dropdown for switching map tile layers (street view, satellite, etc.)       |
| `zoomCustom.vue`     | Custom zoom in/out buttons replacing the default OpenLayers controls        |
| `resetDirection.vue` | Button that resets map orientation and zoom to the default view             |

**Store:** Module-specific state for map layer visibility, currently focused driver, and viewport bounds.

---

### Permissions

> **Route:** `/permissions` | **Roles:** SuperAdmin, Admin

#### What it does

Provides a visual permission matrix for managing which users have which permissions. Instead of a table-and-form pattern, this module renders a grid where each row is a user and each column is a permission, with toggle switches in every cell.

#### What it connects to

- **Users** — The user list is fetched from `usersManagementStore`.
- **Auth** — Permission checks (like `hasPermission()`) are used throughout the app for conditional UI rendering.

#### How it works

**Layout — Permission matrix:**
- **Rows:** Each row shows a user's avatar (or initials), name, @username, and role.
- **Columns:** Each column is a system permission.
- **Cells:** Each cell has a toggle switch. Flipping it immediately calls the API to grant or revoke the permission.

**Features:**
- Search to filter users by name, username, email, or role.
- Loading spinner on each toggle during the API call.
- **Optimistic UI:** The toggle flips immediately, then reverts if the API call fails.
- Pagination for large user lists (reuses user store pagination).

**Store (`permissionsStore.js`):**

| State              | Type          | Purpose                                      |
| ------------------ | ------------- | -------------------------------------------- |
| `permissions`      | `ref([])`     | All available system permissions              |
| `userPermissionsMap` | `ref({})` | Map of user ID to array of granted permission IDs |
| `loading`          | `ref(false)`  | Loading state                                |

**Store Endpoints:**

| Method | Endpoint                                       | Purpose          |
| ------ | ---------------------------------------------- | ---------------- |
| GET    | `/permissions`                                 | List all permissions |
| GET    | `/user-permissions`                            | Get all user-permission mappings |
| POST   | `/user-permissions/{userId}/assign/{permId}`   | Grant permission |
| DELETE | `/user-permissions/{userId}/revoke/{permId}`   | Revoke permission |

---

### Profile

**Route:** `/profile` | **Access:** All authenticated users

Current user's profile management.

**Main View (`profile.vue`):**
- Displays the logged-in user's profile information
- Editable fields: Name, Email, Phone, Password (optional change)
- Read-only fields: ID, Username, Role, Region, Currency
- Profile image upload with preview
- Save button with form validation

**Components Used:**
- `FormLabel` — Labels for each form field with required indicator
- `TextField` — Text input fields with password visibility toggle for the password field
- `PrimaryButton` — Save button with loading state
- File upload input for profile image with image preview

**Store:** Uses the global `auth` store for current user data.
- **API Endpoints:**
  - `GET /user/profile` — Fetch current user profile
  - `PATCH /user/profile` — Update profile details
  - `POST /user/profile/upload-image` — Upload new profile image

---

## Routing & Navigation

Routes are defined in `src/router/index.js` with the following features:

- **Navigation Guards:** Authentication checks and role-based access enforcement on every route transition
- **Route Metadata:** Each route includes metadata for permissions, sidebar ordering, icon display, and translation keys
- **Automatic Redirects:** Unauthenticated users are redirected to the login page; authenticated users are redirected to their default/landing page when accessing guest-only routes
- **Sidebar Integration:** Routes marked with `showInSidebar: true` automatically appear in the sidebar navigation, ordered by the `sidebarOrder` property

**Route Table:**

| Order | Route           | Module           | Roles                |
| ----- | --------------- | ---------------- | -------------------- |
| 1     | `/user`         | User Management  | SuperAdmin, Admin    |
| 2     | `/driver`       | Driver           | All                  |
| 3     | `/company`      | Company          | SuperAdmin           |
| 4     | `/customer`     | Customer         | All                  |
| 5     | `/orders`       | Orders           | All                  |
| 6     | `/statistics`   | Statistics       | All                  |
| 7     | `/work-plans`   | Work Plans       | All                  |
| 8     | `/collections`  | Collections      | Admin, Driver        |
| 9     | `/invoices`     | Invoices         | All                  |
| 10    | `/driver-line`  | Driver Lines     | All                  |
| 11    | `/line-work`    | Line Work        | All                  |
| 12    | `/lines`        | Lines            | All                  |
| 13    | `/line_price`   | Line Pricing     | All                  |
| 14    | `/company-price`| Company Pricing  | All                  |
| 15    | `/discount`     | Discounts        | All                  |
| 16    | `/branches`     | Branches         | All                  |
| 17    | `/regions`      | Regions          | All                  |
| 18    | `/currency`     | Currency         | All                  |
| 19    | `/map`          | Map              | All                  |
| 20    | `/permissions`  | Permissions      | SuperAdmin, Admin    |

---
## Role-Based Access Control

The application supports three user roles:

| Role         | Description                                       |
| ------------ | ------------------------------------------------- |
| `SuperAdmin` | Full system access including company management   |
| `Admin`      | Administrative access excluding company management|
| `Driver`     | Operational access for delivery management        |

Access control is enforced at two levels:

1. **Route Level:** Navigation guards check user roles against route metadata before allowing access
2. **UI Level:** Components conditionally render elements based on the user's role using the auth store (e.g. hiding the Add button for read-only modules, disabling edit actions for lower roles)

---

## Shared Components Reference

All located in `src/components/shared/`. See the [Common Module Pattern](#common-module-pattern) section for how these fit together.

### Data Display

| Component           | Purpose                               | Key Props                                                            |
| ------------------- | ------------------------------------- | -------------------------------------------------------------------- |
| `DataTable`         | Main data table for all modules       | `columns`, `data`, `showCheckbox`, `disableRowWhen`, `isExpandable`  |
| `TrashedDataTable`  | Table for soft-deleted items          | `columns`, `data`, `showCheckbox`                                    |
| `Pagination`        | Page controls ("Showing X-Y of Z")    | `totalItems`, `itemsPerPage`, `currentPage`                          |
| `StatusBadge`       | Colored status pill                   | `status`, `type` (order / driver / discount / user / invoice / etc.) |
| `StatCard`          | Statistic card with icon and trend    | `value`, `label`, `formatType`, `clickable`, `trendValue`            |
| `OrderItemProgress` | Step-by-step order item tracker       | `orderItem` (with `steps` array)                                     |
| `ColumnSelector`    | Show/hide table columns               | `columns`, `modelValue`                                              |

`DataTable` provides 3 slots: `cell-{colKey}` (custom column rendering), `actions` (per-row buttons), `expand` (expanded row content).

### Modals

| Component             | Purpose                                      | Key Props                                          |
| --------------------- | -------------------------------------------- | -------------------------------------------------- |
| `FormModal`           | Create/edit form for all modules             | `fields`, `isOpen`, `serverErrors`, `showImageUpload` |
| `DetailsModal`        | Read-only detail view                        | `data`, `fields`, `isOpen`                         |
| `ConfirmationModal`   | "Are you sure?" dialog                       | `message`, `isOpen`, `confirmColor`                |
| `SuccessModal`        | Animated success checkmark                   | `message`, `isOpen`, `autoCloseDelay` (3s default) |
| `TrashedItemsModal`   | Manage deleted items (restore / perm-delete) | `trashedItems`, `columns`, `isOpen`                |
| `SwitchUserModal`     | SuperAdmin impersonates another user         | `isOpen`                                           |
| `DriverReassignModal` | Reassign work plans before driver deletion   | `driver`, `workPlans`, `availableDrivers`          |

**`FormModal` supports these field types:**

| Type             | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `text`           | Standard text input                                       |
| `select`         | Single-value dropdown                                     |
| `multiselect`    | Multi-value selection                                     |
| `checkbox`       | Boolean toggle                                            |
| `date`           | Date picker                                               |
| `file`           | File upload                                               |
| `orderRows`      | Dynamic rows for order items (name, qty, price)           |
| `branchRows`     | Dynamic rows for branches with embedded map picker        |
| `locationPicker` | Interactive map for selecting lat/lng coordinates          |

Additional features: image upload (5 MB limit, preview), password visibility toggle, dynamic select options via async functions, per-field server error display, body scroll lock.

### Form Inputs

| Component       | Purpose                        | Key Props                                         |
| --------------- | ------------------------------ | ------------------------------------------------- |
| `TextField`     | Text input with password toggle | `modelValue`, `type`, `placeholder`, `maxlength` |
| `FormLabel`     | Label with red asterisk         | `label`, `required`                              |
| `PrimaryButton` | Button with loading state       | `text`, `loading`, `iconBefore`, `bgColor`       |

### Actions & Controls

| Component          | Purpose                                | Key Props                                        |
| ------------------ | -------------------------------------- | ------------------------------------------------ |
| `Actions`          | Per-row dropdown (Edit/Details/Delete) | `row`, `showEdit`, `showDelete`, `showProgress`  |
| `BulkActionsBar`   | Toolbar for selected rows              | `selectedCount`, `entityName`, `actions`          |
| `TableHeader`      | Search + filters + Add button          | `modelValue`, `columns`, `showAddButton`          |
| `SharedLineToggle` | Inline on/off switch (companies)       | `companyId`, `sharedLine`                         |
| `CurrencySelector` | Currency picker dropdown               | `position`                                        |
| `BaseDropdown`     | Generic dropdown wrapper               | `menuPosition`, `closeOnScroll`                   |

### Filters (`src/components/filters/`)

| Component          | Purpose                            | Key Props                           |
| ------------------ | ---------------------------------- | ----------------------------------- |
| `SearchFilter`     | Text search input with icon        | `modelValue`, `placeholder`         |
| `GroupFilter`      | Multi-select category checkboxes   | `data`, `groupKey`, `modelValue`    |
| `TimePeriodFilter` | Button group: all/today/month/year | `modelValue`, `options`             |
| `MainFilters`      | Combines all three filters above   | All props from the three above      |

### Layout (`src/components/layout/`)

**`AppLayout.vue`** — Main wrapper. Sidebar on the left, Navbar at the top, page content in the center. RTL support. Removes padding for the map page.

**`Navbar.vue`** — Top bar with: page title, "Return to Admin" button (during user impersonation), language switcher (EN/AR), profile dropdown with avatar, "Switch User" option (SuperAdmin only), logout with confirmation.

**`Sidebar.vue`** — Left navigation: menu items auto-generated from routes and filtered by role, icons + labels, collapse toggle (70px icon-only mode with tooltips), active route highlighting, RTL support, mobile drawer at < 770px.

---

## Routing & Access Control

Routes are defined in `src/router/index.js`.

**Features:**
- Navigation guards enforce authentication and role checks on every transition
- Unauthenticated users are redirected to login
- Authenticated users on guest-only pages are redirected to their default page
- Routes with `showInSidebar: true` appear in the sidebar, ordered by `sidebarOrder`

**Route Table:**

| #  | Route            | Module          | Allowed Roles     |
| -- | ---------------- | --------------- | ----------------- |
| 1  | `/user`          | User Management | SuperAdmin, Admin |
| 2  | `/driver`        | Drivers         | All               |
| 3  | `/company`       | Companies       | SuperAdmin        |
| 4  | `/customer`      | Customers       | All               |
| 5  | `/orders`        | Orders          | All               |
| 6  | `/statistics`    | Statistics      | All               |
| 7  | `/work-plans`    | Work Plans      | All               |
| 8  | `/collections`   | Payments        | Admin, Driver     |
| 9  | `/invoices`      | Invoices        | All               |
| 10 | `/driver-line`   | Driver Lines    | All               |
| 11 | `/line-work`     | Line Work       | All               |
| 12 | `/lines`         | Lines           | All               |
| 13 | `/line_price`    | Line Pricing    | All               |
| 14 | `/company-price` | Company Pricing | All               |
| 15 | `/discount`      | Discounts       | All               |
| 16 | `/branches`      | Branches        | All               |
| 17 | `/regions`       | Regions         | All               |
| 18 | `/currency`      | Currency        | All               |
| 19 | `/map`           | Map             | All               |
| 20 | `/permissions`   | Permissions     | SuperAdmin, Admin |

**Three roles:**

| Role         | Access                                                   |
| ------------ | -------------------------------------------------------- |
| `SuperAdmin` | Everything, including company management and configuration modules |
| `Admin`      | Everything except company management. Read-only on Regions and Currency. |
| `Driver`     | Operational modules (orders, collections, etc.)          |

Access is enforced at two levels:
1. **Route guards** block unauthorized navigation
2. **UI-level** hides buttons/actions based on role

---

## State Management

Uses **Pinia** stores in two tiers.

### Global Stores (`src/stores/`)

| Store         | Purpose                                                                           |
| ------------- | --------------------------------------------------------------------------------- |
| `auth.js`     | Token, user data, `isAuthenticated`, `userRole`, `hasAnyRole()`, company/currency prefs, user switching |
| `user.js`     | User-related global state                                                         |
| `currency.js` | Active currency and available currencies list                                     |

### Module Stores (`src/modules/*/store/`)

Every module store follows the same Pinia Composition API pattern:

```
State:     items, trashedItems, loading, trashedLoading, pagination, error
Actions:   fetch(), create(), update(), delete(), restore(), bulkDelete(), bulkRestore()
Normalize: Flattens nested API objects into flat key/value pairs
```

**Two pagination strategies:**
- **Server-side:** Discounts, Invoices, Branches, Regions — API returns `meta.current_page`, `per_page`, `total`, `last_page`
- **Client-side:** Lines, Line Work, Line Prices — loads all data (up to 1000 records), paginates in memory using `paginateData()` utility

---

## API Layer

Located in `src/services/`.

### `api.js` — Axios Instance

- Base URL from `VITE_API_BASE_URL`, 30-second timeout
- **Request interceptor:** Adds `Authorization: Bearer <token>` from localStorage
- **Response interceptor:**

| Status | Handling                                         |
| ------ | ------------------------------------------------ |
| 401    | Clear auth, redirect to login                    |
| 403    | Log, redirect                                    |
| 404    | Log error                                        |
| 422    | Pass validation errors through for form display  |
| 429    | Log rate-limit warning                           |
| 500    | Log server error                                 |

### `apiServices.js` — Request Helper

- Methods: `get()`, `post()`, `put()`, `delete()`, `patch()`
- **Deduplication:** Cancels in-flight requests to the same endpoint before sending a new one (uses `AbortController`)
- **Auto FormData:** Converts payloads to `FormData` when file uploads are detected

### Standard Endpoint Pattern

Every CRUD module follows this REST pattern:

```
GET    /resource              → List (paginated or all)
POST   /resource              → Create
PUT    /resource/{id}         → Update
DELETE /resource/{id}         → Soft-delete
DELETE /resource/{id}?force=1 → Permanent delete
GET    /resource/trashed      → List deleted
POST   /resource/{id}/restore → Restore
DELETE /resource/bulk         → Bulk delete
POST   /resource/bulk/restore → Bulk restore
```

---

## Internationalization

Two languages with full **RTL** support:

| Language | File     | Direction |
| -------- | -------- | --------- |
| English  | `en.js`  | LTR       |
| Arabic   | `ar.js`  | RTL       |

- Auto-detects browser language on first visit
- Persists choice in `localStorage`
- Sets `dir="rtl"` / `dir="ltr"` on the document element
- Switch languages anytime from the Navbar (no reload)
- Covers all modules: labels, buttons, errors, statuses, modals, form placeholders

---

## Composables & Utilities

### Composables (`src/composables/`)

| Name               | Purpose                                                          |
| ------------------ | ---------------------------------------------------------------- |
| `useAuthDefaults`  | Returns current company ID, user role, currency, and permission helpers. Used by forms to auto-fill company and currency. |
| `useCurrency`      | Currency formatting, symbol lookup, and conversion utilities     |
| `useSidebar`       | Sidebar expand/collapse state shared between AppLayout and Sidebar |
| `useSuccessModal`  | Provides `showSuccess()` and `isOpen` for the success modal      |

### Utilities (`src/utils/`)

| Utility              | Purpose                                                                          |
| -------------------- | -------------------------------------------------------------------------------- |
| `currencyUtils.js`   | Currency formatting (e.g. `formatCurrency(100, "USD")` → "$100.00"), symbol lookup, and conversion between currencies |
| `dataHelpers.js`     | Data transformation helpers: `filterData`, `filterByGroups`, `paginateData` for array manipulation |
| `formErrors.js`      | `normalizeServerErrors()` function that maps API 422 validation error responses to per-field error messages for display in `FormModal` |
| `storageUtils.js`    | Type-safe `localStorage` wrapper with `getItem<T>()` and `setItem()` methods     |

---

## Running Tests

```bash
# Run unit tests
npm run test:unit

# Run tests in watch mode
npx vitest --watch
```

The project uses **Vitest** as the test runner alongside **Vue Test Utils** for component testing and **fast-check** for property-based testing.

---

## Testing, Building & Deployment

```bash
# Build for production
npm run build

# Preview production build locally
npm run preview
```

- Test runner: **Vitest** with **Vue Test Utils** and **fast-check** (property-based testing)
- Production output: `dist/` directory

---

## Key Features at a Glance

| Feature               | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| Multi-language        | English + Arabic with full RTL layout support                              |
| Role-based access     | SuperAdmin / Admin / Driver with route guards and UI-level enforcement     |
| Interactive maps      | OpenLayers with driver tracking, branch markers, delivery points           |
| Calendar scheduling   | FullCalendar with day / week / month views for work plans                  |
| Order wizard          | Multi-step creation for delivery, return, and exchange orders              |
| PDF export            | Download invoices as PDF via html2pdf.js                                   |
| Soft deletes          | Active / Trashed tabs with restore and permanent delete across all modules |
| Bulk operations       | Select multiple rows for bulk delete, restore, or status change            |
| Request deduplication | Auto-cancels in-flight requests to prevent race conditions                 |
| Responsive design     | Bootstrap 5, collapsible sidebar, mobile card views                        |
| Form validation       | Client-side + server-side 422 error display per field                      |
| User impersonation    | SuperAdmin can switch to another user's session and return                 |
