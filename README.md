# Delivery Management System

A comprehensive delivery and logistics management web application built with Vue 3. The system provides end-to-end management of delivery operations including orders, drivers, customers, invoicing, route lines, pricing, work scheduling, and real-time map visualization.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Modules Overview](#modules-overview)
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
- [Routing & Navigation](#routing--navigation)
- [Role-Based Access Control](#role-based-access-control)
- [State Management](#state-management)
- [API Services Layer](#api-services-layer)
- [Internationalization (i18n)](#internationalization-i18n)
- [Shared Components](#shared-components)
  - [Data Display Components](#data-display-components)
  - [Modal Components](#modal-components)
  - [Form Components](#form-components)
  - [Action & Interaction Components](#action--interaction-components)
  - [Filter Components](#filter-components)
  - [Layout Components](#layout-components)
- [Composables](#composables)
- [Utilities](#utilities)
- [Running Tests](#running-tests)
- [Build & Deployment](#build--deployment)

---

## Tech Stack

| Category             | Technology                          |
| -------------------- | ----------------------------------- |
| Framework            | Vue 3 (Composition API)             |
| Build Tool           | Vite                                |
| CSS Framework        | Bootstrap 5                         |
| State Management     | Pinia                               |
| Routing              | Vue Router 4                        |
| HTTP Client          | Axios                               |
| Internationalization | vue-i18n                            |
| Mapping              | OpenLayers / vue3-openlayers        |
| Calendar             | FullCalendar 6 (Vue 3 plugin)       |
| PDF Generation       | html2pdf.js                         |
| Testing              | Vitest + Vue Test Utils + fast-check|

---

## Prerequisites

- **Node.js** `^20.19.0` or `>=22.12.0`
- **npm** (comes with Node.js)

---

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd front-end

# Install dependencies
npm install

# Start the development server
npm run dev
```

The development server will start with Hot Module Replacement (HMR) enabled.

---

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://your-api-server/api
```

| Variable             | Description                  | Default                            |
| -------------------- | ---------------------------- | ---------------------------------- |
| `VITE_API_BASE_URL`  | Base URL for the backend API | `http://192.168.100.35/api`        |

---

## Project Structure

```
src/
├── App.vue                    # Root component with layout routing
├── main.js                    # Application entry point
├── assets/                    # Static assets (images, stylesheets)
├── components/
│   ├── layout/                # AppLayout, Navbar, Sidebar
│   ├── shared/                # Reusable UI components
│   ├── filters/               # Filter components
│   └── unique/                # Module-specific components
├── composables/               # Reusable Vue composables
├── i18n/                      # Localization (en.js, ar.js)
├── modules/                   # Feature modules (see below)
├── router/                    # Route definitions & guards
├── services/                  # Axios instance & API service layer
├── stores/                    # Global Pinia stores
└── utils/                     # Utility functions
```

Each feature module follows a consistent structure:

```
modules/<module-name>/
├── view/
│   └── <ModuleName>.vue       # Main view component
├── components/                # Module-specific components
├── store/                     # Pinia store for the module
└── constants/                 # Module constants (if needed)
```

---

## Modules Overview

---

### User Management

**Route:** `/user` | **Access:** SuperAdmin, Admin

Manages system user accounts with full CRUD operations.

**Main View (`user.vue`):**
- Renders a paginated data table with **Active** and **Trashed** tabs for managing the user lifecycle
- Supports search by name, username, or email
- Provides a role-based group filter with grouped display (e.g. Admin, SuperAdmin, Employee, Supervisor)
- Table columns: Index, Full Name, Username, Email, Phone Number, User Role, Company
- Automatically filters out SuperAdmin users and the currently logged-in user from the list

**Components Used:**
- `usersHeader.vue` — Wraps the shared `TableHeader` component, passing search placeholder, role filter config, column selector options, and action buttons
- `DataTable` — Displays users with sortable columns, row checkboxes for bulk selection, and per-row action dropdown
- `FormModal` — Handles Add/Edit user forms with fields: name, username, email, phone, password, role (select), company (select), and profile image upload
- `DetailsModal` — Shows user details in a grid layout with profile image display
- `ConfirmationModal` — Confirms delete and permanent delete actions
- `TrashedItemsModal` — Lists soft-deleted users with restore and permanent delete options
- `BulkActionsBar` — Appears when rows are selected, offering bulk delete (active tab) or bulk restore/delete (trashed tab)
- `SuccessModal` — Animated success notification after create/update/delete operations
- `Pagination` — Page navigation controls below the table
- `StatusBadge` — Renders the user role as a colored badge
- `Actions` — Per-row dropdown with Edit, Details, and Delete buttons

**Store (`usersManagement.js`):**
- **State:** `users`, `trashedUsers`, `loading`, `trashedLoading`, `error`, `usersPagination`, `trashedPagination`
- **API Endpoints:**
  - `GET /users` — Fetch paginated users with search and role filters
  - `GET /users/trashed` — Fetch soft-deleted users
  - `POST /users` — Create a new user
  - `PATCH /users/{id}` — Update user details
  - `DELETE /users/{id}` — Soft-delete a user
  - `POST /users/{id}/restore` — Restore a soft-deleted user
  - `DELETE /users/bulk` — Bulk soft-delete
  - `POST /users/bulk/restore` — Bulk restore

**Constants (`userConstants.js`):**
- `NAME_MAX_LENGTH`: 255
- `USERNAME_MAX_LENGTH`: 255
- `EMAIL_MAX_LENGTH`: 255
- `PHONE_MAX_LENGTH`: 20
- `PASSWORD_MIN_LENGTH`: 6
- `IMAGE_MAX_SIZE`: 200 KB

---

### Driver Management

**Route:** `/driver` | **Access:** All authenticated users

Manages delivery drivers with status tracking.

**Main View (`driver.vue`):**
- Paginated data table with **Active** and **Trashed** tabs
- Search by name/username and filter by driver status (available, busy, in_holiday, offline)
- Table columns: Index, Name, Username, Status, Type, Branch Name, Vehicle Number, Phone
- When deleting a driver who has assigned work plans, a reassignment modal appears to transfer those plans to another driver

**Components Used:**
- `driversHeader.vue` — Wraps `TableHeader` with driver-specific search and status filter configuration
- `DataTable` — Renders drivers with sortable columns and row selection checkboxes
- `FormModal` — Add/Edit driver form with fields: name, username, email, password, phone number, type (custom/delivery), vehicle number, branch (select), company (select), status (select)
- `DetailsModal` — Displays full driver profile with image
- `ConfirmationModal` — Delete confirmation
- `DriverReassignModal` — When a driver with active work plans is being deleted, this modal shows the list of assigned work plans and lets the admin either delete them or reassign them to a different driver from a searchable driver list
- `TrashedItemsModal` — Restore or permanently remove deleted drivers
- `BulkActionsBar` — Bulk delete/restore operations
- `SuccessModal` — Post-action success notification
- `Pagination` — Page navigation
- `StatusBadge` — Color-coded driver status display (green for available, yellow for busy, grey for offline, blue for in_holiday)
- `Actions` — Per-row dropdown with Edit, Details, Delete

**Store (`driverStore.js`):**
- **State:** `drivers`, `trashedDrivers`, `loading`, `trashedLoading`, `driversPagination`, `trashedPagination`
- **Computed Getters:** `activeDrivers`, `busyDrivers`, `offlineDrivers` (filtered by status)
- **API Endpoints:**
  - `GET /drivers` — Fetch with pagination and status filter
  - `GET /drivers/trashed` — Fetch soft-deleted drivers
  - `POST /drivers` — Create driver (requires company_id, branch_id)
  - `PATCH /drivers/{id}` — Update driver
  - `DELETE /drivers/{id}` — Soft-delete with optional force flag
  - `POST /drivers/{id}/restore` — Restore driver
  - `DELETE /drivers/bulk` — Bulk delete
  - `POST /drivers/bulk/restore` — Bulk restore
  - `GET /drivers/{id}/workplans` — Fetch assigned work plans before deletion
  - `POST /drivers/reassign-workplans` — Reassign work plans to another driver

---

### Company Management

**Route:** `/company` | **Access:** SuperAdmin only

Manages companies in the system.

**Main View (`company.vue`):**
- Paginated data table with **Active** and **Trashed** tabs
- Search and filter by company type (delivery company, admin company, customer company)
- Table columns: Index, Name, Type, Shared Line (inline toggle)
- The Shared Line column features an inline toggle switch that SuperAdmins can flip directly in the table
- Details modal displays company information along with associated branches and lines as card sections

**Components Used:**
- `companyHeader.vue` — Wraps `TableHeader` with company type filter
- `DataTable` — Renders companies with inline `SharedLineToggle` in the Shared Line column
- `SharedLineToggle` — An inline switch component that calls the API to update a company's `shared_line` setting. Only SuperAdmin can toggle it; on API failure it reverts the checkbox
- `FormModal` — Add/Edit company form with fields: name, type (select). Includes a **dynamic branch rows** section where users can add/remove branch entries, each with name, latitude, and longitude fields, plus an embedded map location picker
- `DetailsModal` — Shows company details with branches displayed as cards (name + location) and associated lines displayed as cards
- `ConfirmationModal` — Delete confirmation
- `TrashedItemsModal` — Restore or permanently remove deleted companies
- `BulkActionsBar` — Bulk operations
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row Edit, Details, Delete

**Store (`companyManagement.js`):**
- **State:** `companies`, `trashedCompanies`, `loading`, `trashedLoading`, `companiesPagination`, `trashedPagination`
- **Computed:** `activeCompanies`, `inactiveCompanies`
- **API Endpoints:**
  - `GET /companies` — Fetch with pagination and type filter
  - `GET /companies/trashed` — Fetch deleted companies
  - `POST /companies` — Create with name, type, and branches array
  - `PATCH /companies/{id}` — Update company and branches
  - `DELETE /companies/{id}` — Soft-delete or force delete
  - `POST /companies/{id}/restore` — Restore
  - `DELETE /companies/bulk` — Bulk delete
  - `POST /companies/bulk/restore` — Bulk restore

---

### Customer Management

**Route:** `/customer` | **Access:** All authenticated users

Manages customer records with optional geolocation data.

**Main View (`customer.vue`):**
- Paginated data table with **Active** and **Trashed** tabs
- Search by customer name or phone
- Company filter visible only to SuperAdmin users
- Table columns vary by role: Admin sees (Index, Name, Phone), SuperAdmin sees (Index, Name, Phone, Company)

**Components Used:**
- `customerHeader.vue` — Wraps `TableHeader` with role-conditional company filter
- `DataTable` — Customer list with row selection
- `FormModal` — Add/Edit customer form with fields: name (required, min 3, max 255), phone number (required, max 20), company (select, locked for Admin role), latitude (-90 to 90), longitude (-180 to 180), and an embedded **map location picker** for visual coordinate selection
- `DetailsModal` — Displays customer info including latitude/longitude
- `ConfirmationModal` — Delete confirmation
- `TrashedItemsModal` — Restore or permanently remove
- `BulkActionsBar` — Bulk delete/restore
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row Edit, Details, Delete

**Store (`customerStore.js`):**
- **State:** `customers`, `trashedCustomers`, `loading`, `trashedLoading`, `customersPagination`, `trashedPagination`
- **Computed:** `customersByCompany` (grouped)
- **API Endpoints:**
  - `GET /customers` — Fetch with pagination and company filter
  - `GET /customers/trashed` — Fetch deleted customers
  - `POST /customers` — Create with name, phone, company_id, latitude, longitude
  - `PATCH /customers/{id}` — Update customer
  - `DELETE /customers/{id}` — Soft-delete
  - `POST /customers/{id}/restore` — Restore
  - `DELETE /customers/bulk` — Bulk delete
  - `POST /customers/bulk/restore` — Bulk restore

---

### Orders

**Route:** `/orders` | **Access:** All authenticated users

The core module of the application managing the full order lifecycle.

**Main View (`orderPage.vue`):**
- Paginated data table with **Active** and **Trashed** tabs
- Search by order code, customer name, or other fields
- Filter by order status (pending, inprocess, completed, cancelled, etc.)
- Time period filter (all, today, month, year)
- Expandable table rows that reveal child/related orders
- Table columns: Index, Order Code, Customer, Order Items, Status, Line, Driver, Price, Currency, Date

**Components Used:**
- `ordersHeader.vue` — Wraps `TableHeader` with order status group filter and time period filter (all/today/month/year)
- `OrdersTableCard.vue` — The main table rendering component with custom cell rendering for order items (name + quantity), status badges, pricing display, and expandable child order rows
- `OrderWizard.vue` — A multi-step wizard modal supporting three order modes: **delivery**, **return**, and **exchange**. Steps include:
  1. Date selection
  2. Customer selection
  3. Order items entry (name, quantity, price per item)
  4. Line selection
  5. Driver assignment
  6. Summary review and confirmation
- `OrdersModals.vue` — Container component that manages the visibility state of all order-related modals (wizard, form, details, progress, confirmation)
- `OrderDetailsTabs.vue` — Tabbed details view with a **Details** tab (order info, customer, driver, pricing) and an **Exchanged Orders** tab (showing related exchange orders)
- `OrderChildOrders.vue` — Renders child/related orders within an expanded parent row, displaying their items and statuses
- `FormModal` — Used for editing existing orders with fields for status, driver, line, pricing
- `DetailsModal` — Order details display
- `OrderItemProgress` — Stepper component showing the status progression of each order item through work plan steps (pending → start → pickup → done/failed), with timestamps and color-coded status indicators
- `ConfirmationModal` — Delete and status change confirmation
- `TrashedItemsModal` — Restore or permanently remove deleted orders
- `BulkActionsBar` — Bulk status changes, bulk delete, bulk restore
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `StatusBadge` — Color-coded order status (type: "order")
- `Actions` — Per-row dropdown with Edit, Details, Progress, Delete

**Store (`ordersStore.js`):**
- **State:** `orders`, `trashedOrders`, `statistics`, `loading`, `trashedLoading`, `statisticsLoading`, `ordersPagination`, `trashedPagination`
- **Normalization:** `transformOrder` function maps API response to frontend format, extracting nested customer, company, currency, line, line price, and discount data. `normalizeOrderStatus` converts "in_progress" to "inprocess" for consistent status handling
- **API Endpoints:**
  - `GET /orders` — Fetch with pagination, status filter, and time period filter
  - `GET /orders/trashed` — Fetch deleted orders
  - `POST /orders` — Create order (delivery/return/exchange)
  - `PATCH /orders/{id}` — Update order
  - `DELETE /orders/{id}` — Soft-delete
  - `GET /orders/{id}` — Fetch single order details

---

### Statistics

**Route:** `/statistics` | **Access:** All authenticated users

Dashboard displaying analytical data and KPIs.

**Main View (`statistics.vue`):**
- Tabbed interface with tabs: **Orders**, **Drivers**, **Customers**, **LineWork**, **Lines**
- The Orders tab displays multiple `StatCard` components in a responsive 3-column grid layout (lg-4, md-6)
- Each stat card is clickable and shows a count, label, icon, and styling
- Below the stat cards, an `OrdersTableCard` renders a filtered table of orders for the selected statistic
- Other tabs display relevant metrics for drivers, customers, line work, and lines

**Components Used:**
- `StatCard` — Displays a single statistic with icon, formatted value (number/currency/percentage), label, optional subtitle, and optional trend arrow (up/down). Clickable cards emit a click event to filter the table below
- `OrdersTableCard` — Reused from the Orders module to display a detailed data table, including a "Go to Order" action button for navigating to specific orders
- `StatusBadge` — Status display for filtered data

**Store:** Uses the existing `ordersStore` and other module stores to fetch aggregated statistics data.

---

### Work Plans

**Route:** `/work-plans` | **Access:** All authenticated users

Manages driver work schedules and delivery planning.

**Main View (`workPlans.vue`):**
- Two view modes: **Calendar View** tab and **Table View** tab
- Search and filter by company
- Calendar view uses FullCalendar for visual scheduling
- Table columns: Index, Name, Company, Date, Driver, Orders
- Role-based permissions: Add/Edit/Delete only available to authorized users
- Bulk actions are filtered to only allow operations on plans the current user can modify

**Components Used:**
- `workPlansHeader.vue` — Wraps `TableHeader` with company filter and view toggle buttons
- `calender.vue` — FullCalendar integration component rendering work plans on a day/week/month calendar. Plans are displayed as events that can be clicked for details
- `DataTable` — Table view with sortable columns and row selection
- `FormModal` — Add/Edit work plan form with fields: name, company (select), date, driver (select), and a dynamic **work plan orders** section for assigning orders with items and processing steps
- `DetailsModal` — Shows work plan details including assigned driver and orders
- `ConfirmationModal` — Delete confirmation
- `TrashedItemsModal` — Restore or permanently remove
- `BulkActionsBar` — Bulk operations with role-based filtering
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls (table view)
- `Actions` — Per-row Edit, Details, Delete

**Store (`workPlansStore.js`):**
- **State:** `workPlans`, `trashedWorkPlans`, `loading`, `trashedLoading`, `workPlansPagination`, `trashedPagination`
- **Normalization:** Extracts driver info from nested `workplanorder` steps, transforms order items arrays, and parses dates from first step if not explicitly provided
- **API Endpoints:**
  - `GET /workplans` — Fetch with pagination and driver name resolution
  - `GET /workplans/trashed` — Fetch deleted work plans
  - `POST /workplans` — Create work plan with orders and steps
  - `PATCH /workplans/{id}` — Update
  - `DELETE /workplans/{id}` — Soft-delete
  - `POST /workplans/{id}/restore` — Restore

---

### Collections & Payments

**Route:** `/collections` | **Access:** Admin, Driver

Tracks payment and collection records for deliveries.

**Main View (`payment.vue`):**
- Search and filter by payment status (pending, completed, etc.)
- Table columns: Index, Amount, Status, Order Code, Client Company, Delivery Company, Driver Received, Driver Paid
- Completed payment rows are visually disabled (non-interactive)
- Status updates only — payments are not created or deleted through this module

**Components Used:**
- `TableHeader` — Search and status filter
- `DataTable` — Payment list with disabled row styling for completed payments (via `disableRowWhen` prop)
- `FormModal` — Edit-only form for updating payment status and notes
- `DetailsModal` — Full payment details display
- `PaymentMethodModal.vue` — Module-specific modal for bulk payment processing. Allows selecting a payment method and a driver, then marking multiple selected payments as completed in one operation
- `BulkActionsBar` — Bulk mark as completed
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `StatusBadge` — Payment status display
- `Actions` — Per-row Edit, Details

**Store (`paymentsManagement.js`):**
- **State:** `payments`, `trashedPayments`, `loading`, `trashedLoading`, `paymentsPagination`, `trashedPagination`
- **Normalization:** Maps fields like "Clinet company", "Delivery company", "Driver received", "Driver paid", extracts `order_code` from nested Order object, and cleans up currency field whitespace
- **API Endpoints:**
  - `GET /payments` — Fetch with pagination and status filter
  - `PATCH /payments/{id}` — Update payment status/notes
  - `POST /payments/bulk-mark` — Mark multiple payments as completed

---

### Invoices

**Route:** `/invoices` | **Access:** All authenticated users

Read-only invoice management with PDF export.

**Main View (`invoices.vue`):**
- Search and filter by invoice status
- Table columns: Index, Invoice Number, Amount, Status, Customer, Date
- Read-only module — invoices are generated by the backend; this module only displays and exports them
- Supports PDF export using the html2pdf.js library

**Components Used:**
- `InvoiceHeader.vue` — Wraps `TableHeader` with invoice status filter
- `DataTable` — Invoice list display
- `DetailsModal` — Full invoice details with line items, amounts, tax, and totals
- `TrashedItemsModal` — View and manage deleted invoices
- `BulkActionsBar` — Bulk mark as paid/sent
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `StatusBadge` — Invoice status display
- `Actions` — Per-row Details only (no edit/delete)

**Store (`invoicesManagement.js`):**
- **State:** `invoices`, `trashedInvoices`, `loading`, `trashedLoading`, `invoicesPagination`, `trashedPagination`
- **API Endpoints:**
  - `GET /invoices` — Fetch with pagination and status filter
  - `GET /invoices/trashed` — Fetch deleted invoices
  - `PATCH /invoices/{id}` — Update invoice status
  - `POST /invoices/bulk-mark` — Bulk status update
  - `GET /invoices/{id}/pdf` — Download invoice as PDF

---

### Driver Lines

**Route:** `/driver-line` | **Access:** All authenticated users

Maps drivers to delivery lines (routes).

**Main View (`driverLine.vue`):**
- Search and filter capabilities
- Table displaying driver-to-line associations with priority/ordering
- Add/Edit modal for creating and modifying assignments

**Components Used:**
- `driverLineHeader.vue` — Wraps `TableHeader` with module-specific filters
- `DataTable` — Displays driver-line relationships
- `FormModal` — Add/Edit form with fields: driver (select), line (select), priority/order
- `DetailsModal` — Shows assignment details
- `ConfirmationModal` — Delete confirmation
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row Edit, Details, Delete

**Store (`driverLineStore.js`):** Standard CRUD operations for driver-line relationships.

---

### Line Work

**Route:** `/line-work` | **Access:** All authenticated users

Manages work assignments on delivery lines.

**Main View (`lineWork.vue`):**
- Search and filter capabilities
- Table displaying line work items with associated data

**Components Used:**
- `lineWorkHeader.vue` — Wraps `TableHeader`
- `DataTable` — Line work item list
- `FormModal` — Add/Edit form
- `DetailsModal` — Work assignment details
- `ConfirmationModal` — Delete confirmation
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row Edit, Details, Delete

**Store (`lineworkStore.js`):** Standard CRUD operations.

---

### Lines

**Route:** `/lines` | **Access:** All authenticated users

Defines and manages delivery lines (routes).

**Main View (`lines.vue`):**
- Search and filter by line status
- Table columns: Index, Name, Status, Region, Company

**Components Used:**
- `linesHeader.vue` — Wraps `TableHeader` with status filter
- `DataTable` — Line list with sortable columns
- `FormModal` — Add/Edit form for line definition with metadata
- `DetailsModal` — Full line details
- `ConfirmationModal` — Delete confirmation
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `StatusBadge` — Line status display
- `Actions` — Per-row Edit, Details, Delete

**Store (`linesStore.js`):** Standard CRUD operations with pagination.

---

### Line Pricing

**Route:** `/line_price` | **Access:** All authenticated users

Configures pricing for delivery lines.

**Main View (`linePrice.vue`):**
- Search and filter capabilities
- Table displaying price, currency, line, and company information

**Components Used:**
- `linePriceHeader.vue` — Wraps `TableHeader`
- `DataTable` — Price list display
- `FormModal` — Add/Edit form with fields: price, currency (select), line (select), company (select)
- `DetailsModal` — Pricing details
- `ConfirmationModal` — Delete confirmation
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row Edit, Details, Delete

**Store (`linespriceStore.js`):** Standard CRUD operations.

---

### Company Pricing

**Route:** `/company-price` | **Access:** All authenticated users

Manages company-specific pricing configurations.

**Main View (`companyPrice.vue`):**
- Search and filter capabilities
- Table displaying company pricing entries

**Components Used:**
- `companyPriceHeader.vue` — Wraps `TableHeader`
- `DataTable` — Company price list
- `FormModal` — Add/Edit form for company-specific pricing
- `DetailsModal` — Pricing details
- `ConfirmationModal` — Delete confirmation
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row Edit, Details, Delete

**Store (`companyPriceStore.js`):** Standard CRUD operations.

---

### Discounts

**Route:** `/discount` | **Access:** All authenticated users

Manages discount rules and promotional offers.

**Main View (`discountPage.vue`):**
- Search and filter by discount status
- Table displaying discount name, percentage, valid dates, and applicable items

**Components Used:**
- `discountHeader.vue` — Wraps `TableHeader` with status filter
- `DataTable` — Discount list
- `FormModal` — Add/Edit form with fields: discount name, percentage, start date, end date, applicable items
- `DetailsModal` — Full discount details including validity period and applicable items
- `ConfirmationModal` — Delete confirmation
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `StatusBadge` — Discount status display (type: "discount")
- `Actions` — Per-row Edit, Details, Delete

**Store (`discountStore.js`):** Standard CRUD operations with status filtering.

---

### Branches

**Route:** `/branches` | **Access:** All authenticated users

Manages physical branch/office locations.

**Main View (`branches.vue`):**
- Paginated data table with **Active** and **Trashed** tabs
- Search and filter capabilities
- Table columns: Index, Name, Location, Manager, Contact

**Components Used:**
- `branchesHeader.vue` — Wraps `TableHeader`
- `DataTable` — Branch list with row selection
- `FormModal` — Add/Edit form with location fields (name, latitude, longitude) and map location picker
- `DetailsModal` — Branch details with geographic coordinates
- `ConfirmationModal` — Delete confirmation
- `TrashedItemsModal` — Restore or permanently remove
- `BulkActionsBar` — Bulk delete/restore
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row Edit, Details, Delete

**Store (`branchesStore.js`):** Standard CRUD operations with soft-delete/restore support.

---

### Regions

**Route:** `/regions` | **Access:** All authenticated users

Manages geographic regions for delivery coverage.

**Main View (`regions.vue`):**
- SuperAdmin has full Create/Edit/Delete access
- Admin users have **read-only** access — they can only view region details
- Active/Trashed tabs available only to SuperAdmin
- Search functionality
- Bulk actions restricted to SuperAdmin

**Components Used:**
- `regionsHeader.vue` — Wraps `TableHeader` with role-conditional Add button visibility
- `DataTable` — Region list
- `FormModal` — Add/Edit form (SuperAdmin only)
- `DetailsModal` — Region details (all roles)
- `ConfirmationModal` — Delete confirmation (SuperAdmin only)
- `TrashedItemsModal` — Restore/permanent delete (SuperAdmin only)
- `BulkActionsBar` — Bulk operations (SuperAdmin only)
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `Actions` — Per-row actions with role-based button visibility

**Store (`regionsManagement.js`):** Standard CRUD operations.

---

### Currency

**Route:** `/currency` | **Access:** All authenticated users

Manages currencies and exchange rates for multi-currency operations.

**Main View (`currency.vue`):**
- Search and filter capabilities
- Table displaying currency symbol, code, name, and exchange rate information

**Components Used:**
- `currencyHeader.vue` — Wraps `TableHeader`
- `DataTable` — Currency list
- `FormModal` — Add/Edit form with fields: currency name, symbol, code, exchange rate
- `DetailsModal` — Full currency details
- `ConfirmationModal` — Delete confirmation
- `SuccessModal` — Post-action notification
- `Pagination` — Page controls
- `StatusBadge` — Currency status display (type: "currency")
- `Actions` — Per-row Edit, Details, Delete

**Store (`currenciesManagement.js`):** Standard CRUD operations.

---

### Map

**Route:** `/map` | **Access:** All authenticated users

Interactive mapping module powered by OpenLayers for visualizing drivers, branches, and delivery points.

**Main View (`mapPage.vue`):**
- Full-width map display (no content padding) using vue3-openlayers
- Renders driver locations, customer/delivery points, and branch markers on an interactive map
- Supports multiple map layers and overlay controls

**Components:**
- `displayDrivers.vue` — Renders driver markers on the map at their current or last-known GPS coordinates. Each marker shows the driver's name and status
- `focusOnDriver.vue` — A control that centers and zooms the map view on a specific selected driver's location
- `fullScreenMode.vue` — Toggle button that switches the map between normal and full-screen display mode
- `layerSwitcher.vue` — UI control for switching between different map tile layers (e.g. street view, satellite)
- `resetDirection.vue` — Button that resets the map orientation and zoom level to the default view
- `zoomCustom.vue` — Custom zoom in/out controls replacing the default OpenLayers zoom buttons
- `displayPoints.vue` — Renders customer and delivery point markers on the map with associated data popups

**Store:** Module-specific state management for map layer visibility, currently focused driver, and map bounds/viewport.

---

### Permissions

**Route:** `/permissions` | **Access:** SuperAdmin, Admin

Role and permission management through a visual permission matrix.

**Main View (`permissions.vue`):**
- Displays a matrix grid with users as rows and permissions as columns
- Each cell contains a toggle switch for granting or revoking a specific permission for a specific user
- Search functionality to filter users by name
- Loading state indicators during toggle operations

**Components Used:**
- Custom permission matrix table (built directly in the view)
- Toggle switches for each user-permission combination

**Store (`permissionsStore.js`):**
- **State:** `permissions` (all available permissions), `userPermissions` (map of user ID to granted permission IDs)
- **Methods:** `hasPermission()`, `grantPermission()`, `revokePermission()`
- **API Endpoints:**
  - `GET /permissions` — Fetch all available permissions
  - `GET /user-permissions/{userId}` — Get a user's granted permissions
  - `POST /user-permissions` — Grant a permission to a user
  - `DELETE /user-permissions` — Revoke a permission from a user

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
## Login

**Route:** `/login` | **Access:** Guest users only

Handles user authentication and access to the system.

**Main View (`Login.vue`):**
- Simple form with fields: **Username / Email** and **Password**
- Login button with **loading state**
- Error message on failed login (invalid credentials)
- **Forgot Password** link opens the reset password page
- Language switch support via navbar or on-page toggle
- Validation:
  - Username / Email: required
  - Password: required, min 6 characters

**Components Used:**
- `TextField.vue` — Input with password visibility toggle
- `PrimaryButton.vue` — Login button with loading state
- `ErrorAlert.vue` — Displays login errors
- `FormLabel.vue` — Labels with required indicators

**Store (`auth.js`):**
- **State:** `user`, `token`, `loading`, `error`
- **Actions:**
  - `login(credentials)` — POST `/auth/login`, stores `token` and `user` in state/localStorage
  - `logout()` — clears `token` and `user` from state/localStorage
  - `checkAuth()` — validates token on page load
- **Computed Getters:** `isAuthenticated`, `userRole`, `hasAnyRole()`

**API Endpoints:**
- `POST /auth/login` — Login with `username/email` and `password`
- `POST /auth/logout` — Logout
- `GET /auth/me` — Get current user data using the token

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

## State Management

State is managed through **Pinia** stores organized in two tiers:

### Global Stores (`src/stores/`)

| Store           | Purpose                                                                       |
| --------------- | ----------------------------------------------------------------------------- |
| `auth.js`       | Authentication state, token management, user data, role helpers (`hasAnyRole`, `userRole`, `isAuthenticated`), company/currency preferences, user switching |
| `user.js`       | User-related global state                                                     |
| `currency.js`   | Active currency selection and available currencies                            |

### Module Stores (`src/modules/*/store/`)

Each module has its own Pinia store following a consistent pattern:

- **State:** Managed with `ref()` and `computed()`
- **Actions:** Async functions that call `apiServices` methods
- **Pagination:** Standard pagination support with meta data extraction (`current_page`, `per_page`, `total`, `last_page`)
- **Soft Deletes:** Most stores support active/trashed data toggling with separate arrays and pagination
- **Normalization:** Each store includes data transformation logic to map API responses to the frontend data format, handling nested objects, arrays, and inconsistent field naming

---

## API Services Layer

Located in `src/services/`:

### `api.js` - Axios Instance

- Configures base URL from `VITE_API_BASE_URL`
- Sets a 30-second request timeout
- **Request Interceptor:** Automatically attaches the Bearer token from localStorage (`auth_token`) to every outgoing request as an `Authorization: Bearer <token>` header
- **Response Interceptor:** Handles HTTP errors:
  - `401` — Token expired or invalid: clears auth and redirects to login
  - `403` — Forbidden: logs and redirects
  - `404` — Not found: logs error
  - `422` — Validation error: passes error data through for form display
  - `429` — Rate limited: logs warning
  - `500` — Server error: logs error

### `apiServices.js` - Service Singleton

Provides a centralized API service with:

- Generic request method with `AbortController` cancellation support
- Helper methods: `get()`, `post()`, `put()`, `delete()`, `patch()`
- **Request deduplication:** Cancels in-flight requests to the same endpoint before issuing a new one, preventing race conditions during rapid navigation
- **Automatic `FormData` support:** When the request body contains file uploads, the service automatically converts the payload to `FormData`

---

## Internationalization (i18n)

The application supports two languages with full RTL support:

| Language | File       | Direction |
| -------- | ---------- | --------- |
| English  | `en.js`    | LTR       |
| Arabic   | `ar.js`    | RTL       |

### Features

- **Auto-Detection:** Detects the browser's language preference on first visit
- **Persistence:** Language selection is saved to `localStorage`
- **RTL Support:** The document `dir` attribute is dynamically set based on the active language; all components and layouts adapt accordingly
- **Dynamic Switching:** Users can switch languages at any time from the Navbar without reloading the page
- **Comprehensive Coverage:** Translation keys cover all modules, form labels, error messages, status values, button text, modal titles, and validation messages

---

## Shared Components

Located in `src/components/shared/`, these reusable components form the UI building blocks used across all modules.

### Data Display Components

#### `DataTable.vue`
The primary data table component used by nearly every module.
- **Props:** `columns` (array of column definitions), `data` (row data array), `showCheckbox` (enable row selection), `actionsLabel`, `modelValue` (selected row IDs), `isExpandable` (function to determine if a row can expand), `disableRowWhen` (function to grey-out specific rows)
- **Events:** `update:modelValue` (emits selected IDs)
- **Slots:** `cell-{colKey}` (custom column cell rendering), `actions` (per-row action buttons), `expand` (expanded row content)
- **Features:** Sortable column headers (click to sort ascending/descending), expand/collapse rows, checkbox selection with select-all, disabled row styling, responsive design with mobile card view, RTL support

#### `TrashedDataTable.vue`
Table variant specifically for displaying soft-deleted items.
- **Props:** `columns`, `data`, `actionsLabel`, `showCheckbox`, `modelValue`
- **Events:** `update:modelValue`
- **Slots:** `actions` (row-scoped slot)
- **Features:** Same responsive layout as DataTable with desktop table and mobile card views, StatusBadge integration for status columns

#### `Pagination.vue`
Table pagination controls.
- **Props:** `totalItems`, `itemsPerPage`, `currentPage`, `totalPages` (optional)
- **Events:** `update:currentPage`
- **Features:** Displays "Showing X-Y of Z" text, smart page number display with ellipsis (1, 2, 3 ... n-2, n-1, n), disabled state for boundary pages, previous/next navigation arrows

#### `StatusBadge.vue`
Color-coded status indicator badge.
- **Props:** `status` (string), `type` ("default" | "order" | "driver" | "discount" | "currency" | "driverLine" | "user")
- **Features:** Uses i18n translation based on type prefix, maps statuses to Bootstrap badge colors (success = green, warning = yellow, danger = red, info = blue, secondary = grey)

#### `StatCard.vue`
Statistics display card used in the Statistics module.
- **Props:** `value`, `label`, `subtitle`, `icon`, `iconComponent`, `iconClass`, `clickable`, `formatType` ("number" | "currency" | "percentage"), `currency`, `showTrend`, `trendValue`
- **Events:** `click`
- **Features:** Formats values based on type, shows trend arrow (up/down) with color, hover effects when clickable

#### `OrderItemProgress.vue`
Stepper component showing order item status progression.
- **Props:** `orderItem` (object with `steps` array)
- **Features:** Collapsible card showing chronological step progression (pending → start → pickup → done/failed), timestamps per step, red styling for failed status, connected step line visualization

#### `ColumnSelector.vue`
Dropdown for toggling table column visibility.
- **Props:** `columns` (array of available columns), `modelValue` (array of visible column keys)
- **Events:** `update:modelValue`
- **Features:** Checkbox list of columns with "Select All" toggle, RTL support, dropdown positioning

### Modal Components

#### `FormModal.vue`
The primary modal for all create/edit operations across the application.
- **Props:** `isOpen`, `title`, `fields` (array of field definitions), `showImageUpload`, `imageUploadLabel`, `imageRequired`, `initialImage`, `serverErrors`
- **Events:** `close`, `submit` (emits form data with optional image file)
- **Field Types Supported:**
  - `text` — Standard text input
  - `select` — Single-value dropdown with options
  - `multiselect` — Multi-value selection
  - `checkbox` — Boolean toggle
  - `date` — Date picker
  - `file` — File upload
  - `orderRows` — Dynamic row entry for order items with linked sub-items
  - `branchRows` — Dynamic row entry for branches with embedded map location picker
  - `locationPicker` — Interactive map for selecting latitude/longitude coordinates
- **Features:** Dynamic field validation, image upload with 5 MB limit and preview, password visibility toggle, dynamic select options via async functions, server error display per field, body scroll lock when open

#### `DetailsModal.vue`
Modal for displaying item details in a grid layout.
- **Props:** `isOpen`, `title`, `data` (object), `fields` (array of field definitions)
- **Events:** `close`
- **Slots:** `before-details`, `after-details`
- **Features:** Filters out fields with no data, normalizes display values (handles arrays, objects, nested properties), supports field translator functions and i18n translation keys, optional image display

#### `ConfirmationModal.vue`
Generic confirmation dialog for destructive actions.
- **Props:** `isOpen`, `title`, `message`, `confirmText`, `cancelText`, `confirmColor` (default: red)
- **Events:** `close`, `confirm`
- **Features:** Backdrop overlay, body scroll lock, customizable button colors

#### `SuccessModal.vue`
Animated success notification modal.
- **Props:** `isOpen`, `title` (default: "Success!"), `message`, `autoClose` (default: true), `autoCloseDelay` (default: 3000ms)
- **Events:** `close`
- **Features:** Animated checkmark SVG, animated background circles, auto-closes after configurable delay

#### `TrashedItemsModal.vue`
Modal for managing soft-deleted items.
- **Props:** `isOpen`, `title`, `emptyMessage`, `columns`, `trashedItems`, `showDeleteButton`, `actionsLabel`, `restoreLabel`, `deleteLabel`, `confirmDelete`, `bulkActions`, `bulkLoading`, `entityName`
- **Events:** `close`, `restore`, `delete`, `bulk-action`
- **Features:** Embeds `TrashedDataTable` with restore/delete actions per row, dual confirmation modals for single and bulk delete, `BulkActionsBar` integration, selection state management

#### `SwitchUserModal.vue`
Admin user-switching modal for impersonation.
- **Props:** `isOpen`
- **Events:** `close`
- **Features:** Fetches user list via API, filters out SuperAdmin and current user, searchable by name/username/email/company, shows avatar or initials fallback, switches user session on selection

#### `DriverReassignModal.vue`
Modal for handling driver deletion when work plans exist.
- **Props:** `isOpen`, `driver` (object), `workPlans` (array), `availableDrivers` (array), `canDelete`
- **Events:** `close`, `delete`, `reassign`
- **Features:** Two-option workflow (delete work plans or reassign to another driver), driver selection dropdown, validation, processing state indicator

### Form Components

#### `TextField.vue`
Text input component with password toggle.
- **Props:** `id`, `modelValue`, `type`, `placeholder`, `required`, `minlength`, `maxlength`, `disabled`
- **Events:** `update:modelValue`
- **Features:** Password type shows/hides visibility eye icon toggle

#### `FormLabel.vue`
Form field label with required indicator.
- **Props:** `label`, `forId`, `required`
- **Features:** Displays red asterisk for required fields

#### `PrimaryButton.vue`
Styled action button with loading state.
- **Props:** `text`, `loadingText` (default: "Loading..."), `loading`, `disabled`, `type`, `iconBefore`, `iconAfter`, `bgColor`, `textColor`, `iconColor`
- **Events:** `click`
- **Features:** Custom color support, loading text swap, icon rendering with color filtering

### Action & Interaction Components

#### `Actions.vue`
Per-row action dropdown used in every data table.
- **Props:** `row`, `editLabel`, `detailsLabel`, `deleteLabel`, `confirmDelete`, `confirmTitle`, `confirmMessage`, `confirmText`, `cancelText`, `showDelete`, `showEdit`, `showDetails`, `showProgress`, `showRestore`, `showPermanentDelete`
- **Events:** `edit`, `details`, `delete`, `restore`, `permanent-delete`, `progress`
- **Features:** Dropdown menu with configurable action items, built-in `ConfirmationModal` for delete operations, auto-close after action

#### `BulkActionsBar.vue`
Toolbar that appears when table rows are selected.
- **Props:** `selectedCount`, `entityName`, `actions` (array of action definitions), `loading`, `position` ("sticky"), `showCount`
- **Events:** `action` (emits `{actionId, selectedCount}`)
- **Features:** Slide-in animation, smart pluralization via i18n, configurable action buttons

#### `SharedLineToggle.vue`
Inline toggle for company shared-line setting.
- **Props:** `companyId`, `sharedLine`
- **Events:** `updated` (emits `{companyId, sharedLine}`)
- **Features:** SuperAdmin-only editing, API call on toggle, reverts state on error

#### `CurrencySelector.vue`
Currency picker dropdown.
- **Props:** `position` ("start" | "end")
- **Events:** `currencyChanged`
- **Features:** Integrates with currency store, displays symbol + code + name per currency option

#### `BaseDropdown.vue`
Generic dropdown wrapper used by other components.
- **Props:** `menuPosition` ("start" | "end"), `dropdownClass`, `menuClass`, `closeOnScroll`
- **Events:** `open`, `close`, `toggle`
- **Slots:** `trigger`, `menu` (receives `close` function)
- **Features:** Teleported menu with fixed positioning, dynamic position calculation based on available viewport space, click-outside to close, scroll auto-close, RTL aware

#### `TableHeader.vue`
Composed header component used by every module.
- **Props:** `modelValue` (search text), `searchPlaceholder`, `data`, `groupKey`, `groupModelValue`, `groupLabel`, `translationKey`, `showTimeFilter`, `timeModelValue`, `timeOptions`, `columns`, `visibleColumns`, `showAddButton`, `addButtonText`, `showTrashedButton`
- **Events:** `update:modelValue`, `update:groupModelValue`, `update:timeModelValue`, `update:visibleColumns`, `add-click`, `trashed-click`, `refresh-click`
- **Features:** Composes `MainFilters` and `ColumnSelector` into a single header bar with Add and Trashed buttons

### Filter Components

Located in `src/components/filters/`:

#### `SearchFilter.vue`
Text search input with icon.
- **Props:** `modelValue`, `placeholder` (default: "Search...")
- **Events:** `update:modelValue`
- **Features:** RTL aware, search icon

#### `GroupFilter.vue`
Multi-select group/category filter dropdown.
- **Props:** `data` (array), `groupKey`, `modelValue` (array of selected values), `label`, `translationKey`
- **Events:** `update:modelValue`
- **Features:** Dynamic menu positioning, checkbox list of available groups, "Clear All" button, selected count chips

#### `TimePeriodFilter.vue`
Button group for time period selection.
- **Props:** `modelValue` (default: "all"), `options` (array)
- **Events:** `update:modelValue`
- **Features:** Default options: all / today / month / year, highlighted active selection

#### `MainFilters.vue`
Composed container combining all filter types.
- **Props:** `modelValue`, `placeholder`, `data`, `groupKey`, `groupModelValue`, `groupLabel`, `translationKey`, `timeModelValue`, `timeOptions`, `showTimeFilter`
- **Events:** `update:modelValue`, `update:groupModelValue`, `update:timeModelValue`
- **Features:** Conditionally renders SearchFilter, GroupFilter, and TimePeriodFilter based on provided props, responsive layout

### Layout Components

Located in `src/components/layout/`:

#### `AppLayout.vue`
Main application layout wrapper.
- **Renders:** Sidebar on the left, Navbar at the top, main content area in the center
- **Features:** RTL direction binding based on locale, sidebar collapse state integration via `useSidebar` composable, removes content padding for the map page

#### `Navbar.vue`
Top navigation bar.
- **Props:** `pageTitle`
- **Features:**
  - Page title display
  - "Return to Admin" button visible only when an admin is impersonating another user (switched user mode)
  - Language selector for switching between English and Arabic
  - User profile dropdown with avatar (fallback to initials), name display
  - "Switch User" option (SuperAdmin only) opening `SwitchUserModal`
  - Logout button with `ConfirmationModal` confirmation dialog
  - Notification area

#### `Sidebar.vue`
Collapsible left navigation panel.
- **Features:**
  - Dynamic menu items generated from the router configuration, filtered by user role
  - Each menu item displays an icon and label, derived from route metadata
  - Collapse/expand toggle button — collapsed mode shows 70px-wide icon-only sidebar with hover tooltips
  - Active route highlighting
  - Full RTL support (sidebar moves to the right side in Arabic)
  - Mobile responsive: drawer mode with overlay backdrop at < 770px breakpoint

---

## Composables

Located in `src/composables/`:

| Composable             | Purpose                                                                           |
| ---------------------- | --------------------------------------------------------------------------------- |
| `useAuthDefaults.js`   | Provides current company ID, user role, and permission helpers for form defaults  |
| `useCurrency.js`       | Currency formatting, symbol lookup, and conversion utilities                      |
| `useSidebar.js`        | Sidebar collapse/expand state management shared between AppLayout and Sidebar     |
| `useSuccessModal.js`   | Success notification modal state — provides `showSuccess()` and `isOpen` reactive state |

---

## Utilities

Located in `src/utils/`:

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

## Build & Deployment

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

The production build is output to the `dist/` directory, ready for deployment to any static hosting service.

---

## Key Features Summary

- **Multi-language** — Full English and Arabic support with RTL layout
- **Role-based access** — SuperAdmin, Admin, and Driver roles with route and UI-level enforcement
- **Interactive maps** — OpenLayers-powered map visualization with driver tracking, branch locations, and delivery points
- **Calendar scheduling** — FullCalendar integration for work plan management with day/week/month views
- **Order wizard** — Multi-step order creation supporting delivery, return, and exchange workflows
- **PDF export** — Generate PDF documents for orders and invoices via html2pdf.js
- **Soft deletes** — Recover or permanently remove deleted records across all modules via Active/Trashed tabs
- **Bulk operations** — Perform actions on multiple selected items simultaneously (delete, restore, status change)
- **Request management** — Automatic request deduplication and cancellation via AbortController
- **Responsive design** — Bootstrap 5 based responsive layout with collapsible sidebar and mobile card views
- **Real-time validation** — Client-side form validation with server-side error display per field
- **User impersonation** — SuperAdmin can switch to another user's session and return to their own
