import { descending } from "ol/array";

export default {
  navbar: {
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    SwitchUser: "Switch User",
    logout: "Log Out",
    signedInAs: "Signed in as",
    confirmLogout: "Are you sure you want to logout?",
    switchToUser: "Log in",
    returnToAdmin: "Return"
  },

  login: {
    title: "Welcome Back",
    subtitle: "Sign in to access your delivery dashboard",
    emailLabel: "Email or Username",
    emailPlaceholder: "Enter your email or username",
    passwordLabel: "Password",
    passwordPlaceholder: "********",
    forgotPassword: "Forgot Password?",
    signIn: "Sign In",
    signingIn: "Signing In...",

    // Validation
    validation: {
      emailRequired: "Email or username is required",
      passwordRequired: "Password is required",
      passwordMinLength: "Password must be at least 6 characters",
      invalidCredentials: "Invalid email or password",
    },

    // Success messages
    loginSuccess: "Login successful! Redirecting...",
  },

  sidebar: {
    logoText: "PITS Delivery",
  },

  user: {
    // Page Headers
    title: "User Table",
    pageTitle: "Users Management",
    pageSubtitle: "Manage system users and their permissions",

    // Actions
    searchPlaceholder: "Search users...",
    search: "Search",
    columns: "Columns",
    addNew: "Add User",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Table Columns
    id: "ID",
    fullName: "Full Name",
    name: "Name",
    username: "Username",
    email: "Email",
    image: "Image",
    phoneNumber: "Phone Number",
    role: "Role",
    userRole: "User Role",
    landingPage: "Landing Page",
    language: "Language",
    languages: {
      english: "English",
      arabic: "Arabic",
    },
    sharedLine: "Shared Line",
    status: "Status",
    company: "Company",

    // Status Values
    active: "Active",
    inactive: "Inactive",
    activeUsers: "Active Users",

    // Entity names for bulk actions
    entitySingular: "user",
    entityPlural: "users",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",
    confirmDeleteTitle: "Confirm Delete",
    confirmDelete:
      "Are you sure you want to delete this user? You can restore them later.",

    // Filters
    filterByRole: "Filter by Role",

    // Form Fields
    form: {
      name: "Full Name",
      namePlaceholder: "Enter full name",
      username: "Username",
      usernamePlaceholder: "Enter unique username",
      email: "Email Address",
      emailPlaceholder: "Enter email address (optional)",
      password: "Password",
      passwordPlaceholder: "Minimum 6 characters",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "0599000000",
      role: "User Role",
      rolePlaceholder: "Select role",
      region: "Region",
      regionPlaceholder: "Select region (optional)",
      noRegion: "No region",
      currency: "Currency",
      currencyPlaceholder: "Select currency (optional)",
      noCurrency: "No currency",
      company: "Company",
      companyPlaceholder: "Select company",
      uploadImage: "Upload Image",
      removeImage: "Remove",
    },

    // Validation Messages
    validation: {
      nameRequired: "Name is required",
      nameMax: "Name must not exceed 255 characters",
      usernameRequired: "Username is required",
      usernameMax: "Username must not exceed 255 characters",
      usernameExists: "Username already exists",
      emailInvalid: "Invalid email format",
      emailMax: "Email must not exceed 255 characters",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters",
      phoneRequired: "Phone number is required",
      phoneMax: "Phone number must not exceed 20 characters",
      roleRequired: "Role is required",
      companyRequired: "Company is required",
      imageRequired: "Profile picture is required",
      imageSize: "Image size must not exceed 200 KB",
      imageFormat: "Image must be in JPEG, JPG, or PNG format",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Users",
      empty: "No trashed users",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },

  driver: {
    // Page Headers
    title: "Driver Table",
    pageTitle: "Drivers Management",
    pageSubtitle: "Manage delivery drivers and their details",

    // Actions
    searchPlaceholder: "Search drivers...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Driver",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Name",
    username: "Username",
    email: "Email",
    phoneNumber: "Phone Number",
    status: "Status",
    type: "Type",
    branchId: "Branch",
    branchName: "Branch",
    vehicleNumber: "Vehicle Number",
    company: "Company",

    // Status Values
    active: "Active",
    inactive: "Inactive",
    activeDrivers: "Active Drivers",

    // Entity names for bulk actions
    entitySingular: "driver",
    entityPlural: "drivers",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByStatus: "Filter by Status",

    // Form Fields
    form: {
      name: "Driver Name",
      namePlaceholder: "Enter driver full name",
      username: "Username",
      usernamePlaceholder: "Enter unique username",
      email: "Email Address",
      emailPlaceholder: "Enter email address (optional)",
      password: "Password",
      passwordPlaceholder: "Minimum 6 characters",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "0599000000",
      type: "Driver Type",
      typePlaceholder: "Select driver type",
      vehicleNumber: "Vehicle Number",
      vehicleNumberPlaceholder: "22-5566",
      branch: "Branch",
      branchPlaceholder: "Select branch",
      company: "Company",
      companyPlaceholder: "Select company",
      status: "Status",
      statusPlaceholder: "Select status",
      location: "Location",
      setLocation: "Set Location on Map",
      uploadImage: "Upload Image",
      removeImage: "Remove",
      driverTypes: {
        customDriver: "Custom Driver",
        deliveryDriver: "Delivery Driver",
      },
    },

    // Validation Messages
    validation: {
      nameRequired: "Driver name is required",
      nameMax: "Name must not exceed 255 characters",
      usernameRequired: "Username is required",
      usernameMax: "Username must not exceed 255 characters",
      usernameExists: "Username already exists",
      emailInvalid: "Invalid email format",
      emailMax: "Email must not exceed 255 characters",
      passwordRequired: "Password is required",
      passwordMin: "Password must be at least 6 characters",
      phoneRequired: "Phone number is required",
      phoneMax: "Phone number must not exceed 20 characters",
      typeRequired: "Driver type is required",
      vehicleNumberRequired: "Vehicle number is required",
      branchRequired: "Branch is required",
      companyRequired: "Company is required",
      locationRequired: "Location is required",
      imageRequired: "Profile picture is required",
      imageSize: "Image size must not exceed 200 KB",
      imageFormat: "Image must be in JPEG, JPG, or PNG format",
      usernameAlreadyTaken: "This username has already been taken. Please choose another username.",
      phoneAlreadyInCompany: "This user is already registered as a driver in this company."

    },

    // Trashed Items
    trashed: {
      title: "Trashed Drivers",
      empty: "No trashed drivers",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },
  customer: {
    // Page Headers
    title: "Customer Table",

    // Actions
    searchPlaceholder: "Search customers...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Customer",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Table Columns
    id: "ID",
    fullName: "Full Name",
    name: "Name",
    image: "Image",
    phoneNumber: "Phone Number",
    landingPage: "Landing Page",
    language: "Language",
    companyName: "Company",

    // Status Values
    active: "Active",
    inactive: "Inactive",
    activeCustomers: "Active Customers",

    // Entity names for bulk actions
    entitySingular: "customer",
    entityPlural: "customers",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByCompany: "Filter by Company",
    filterByType: "Filter by Type",

    // Form Fields
    form: {
      name: "Full Name",
      namePlaceholder: "Enter full name",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "0599000000",
      company: "Company",
      companyPlaceholder: "Select company",
      location: "Location",
      setLocation: "Set Location on Map",
      uploadImage: "Upload Image",
      latitude: "Latitude",
      latitudePlaceholder: "Enter latitude (e.g., 31.5)",
      longitude: "Longitude",
      longitudePlaceholder: "Enter longitude (e.g., 34.4)",
      locationPicker: "Location Picker",
    },

    // Validation Messages
    validation: {
      nameRequired: "Name is required",
      nameMax: "Name must not exceed 255 characters",
      nameMin: "The name must be at least 3 characters",
      usernameRequired: "Username is required",
      usernameMax: "Username must not exceed 255 characters",
      usernameExists: "Username already exists",
      phoneRequired: "Phone number is required",
      phoneMax: "Phone number must not exceed 20 characters",
      companyRequired: "Company is required",
      latitudeInvalid: "Invalid latitude (must be between -90 and 90)",
      longitudeInvalid: "Invalid longitude (must be between -180 and 180)",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Customers",
      empty: "No trashed Customers",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },

  companyNames: {
    "company 1": "Company 1",
    "company 2": "Company 2",
    "company 3": "Company 3",
  },
  company: {
    // Page Headers
    title: "Company Table",

    // Actions
    searchPlaceholder: "Search companies...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Company",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "order",
    entityPlural: "orders",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "work plan",
    entityPlural: "work plans",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "company price",
    entityPlural: "company prices",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "discount",
    entityPlural: "discounts",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "line work",
    entityPlural: "line works",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "driver line",
    entityPlural: "driver lines",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "region",
    entityPlural: "regions",

    // Table Columns
    id: "ID",
    name: "Name",
    image: "Image",
    type: "Type",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByType: "Filter by Type",
    companyTypes: {
      "delivery company": "Delivery Company",
      "admin company": "Admin Company",
      "customer company": "Customer Company",
    },
    // Form Fields
    form: {
      name: "Company Name",
      namePlaceholder: "Enter company full name",
      type: "Company Type",
      typePlaceholder: "Select company type",
      uploadImage: "Upload Image",
      removeImage: "Remove",
      branches: "Branches",
      branchName: "Branch Name",
      types: {
        delivery: "Delivery Company",
        admin: "Admin Company",
        customer: "Customer Company",
      },
    },

    // Validation Messages
    validation: {
      nameRequired: "Name is required",
      nameMax: "Name must not exceed 255 characters",
      typeRequired: "Type is required",
      latitudeInvalid: "Invalid latitude (must be between -90 and 90)",
      longitudeInvalid: "Invalid longitude (must be between -180 and 180)",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Companies",
      empty: "No Trashed Companies",
      restore: "Restore",
      delete: "Delete Permanently",
    },

    // Entity Names for Bulk Actions
    entitySingular: "company",
    entityPlural: "companies",

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    branches: {
      title: "Branches",
      empty: "No branches available",
    },

    lines: {
      title: "Lines",
      empty: "No lines available",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },
  //branches
  branch: {
    // Page Headers
    title: "Branches Table",

    // Actions
    searchPlaceholder: "Search branches...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Branch",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Name",
    company: "company",
    location: "Location",

    // Status Values
    activeBranches: "Active Branches",

    // Entity names for bulk actions
    entitySingular: "branch",
    entityPlural: "branchs",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByLocation: "Filter by Location",
    filterByCompany: "Filter by Company",
    locations: {
      nablus: "Nablus",
      ramallah: "Ramallah",
    },
    // Form Fields
    form: {
      name: "Branch Name",
      namePlaceholder: "Enter full name",
      location: "Branch location",
      locationPlaceholder: "Select branch location",
      latitude: "Latitude",
      longitude: "Longitude",
      latitudePlaceholder: "32.2270",
      longitudePlaceholder: "35.2544",
      locationPicker: "Location on Map",
      company: "Company",
      companyPlaceholder: "Select company",
      companies: {
        company1: "Company 1",
        company2: "Company 2",
      },
    },

    // Validation Messages
    validation: {
      nameRequired: "Name is required",
      nameMax: "Name must not exceed 255 characters",
      typeRequired: "Type is required",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Branches",
      empty: "No trashed Branches",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },
  //lines
  lines: {
    // Page Headers
    title: "Lines Table",

    // Actions
    searchPlaceholder: "Search Lines...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Line",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Name",
    region: "Region",
    company: "Company",
    createdAt: "Created At",
    updatedAt: "Updated At",

    // Status Values
    activeLines: "Active Lines",

    // Entity names for bulk actions
    entitySingular: "line",
    entityPlural: "lines",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByRegion: "Filter by Region",

    // Form Fields
    form: {
      name: "Line Name",
      namePlaceholder: "Enter full name",
      region: "Line Region",
      regionPlaceholder: "Select region location",
      regions: {
        region1: "Palestine",
        region2: "Jordan",
      },
      company: "Line Company",
      companyPlaceholder: "Select company",
      companies: {
        company1: "Company 1",
        company2: "Company 2",
      },
    },
    // Validation Messages
    validation: {
      nameRequired: "Name is required",
      nameMax: "Name must not exceed 255 characters",
      regionRequired: "Region is required",
      companyRequired: "Company is required",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Lines",
      empty: "No trashed Lines",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },
  //linePrice

  // إضافة هذا الجزء إلى ملف src/i18n/locales/en.js

  linePrice: {
    // Page Headers
    title: "Line Price Table",

    // Actions
    searchPlaceholder: "Search line prices...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Price",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Line Name",
    line: "Line",
    price: "Price",
    currency: "Currency",
    type: "Type",
    company: "Company",
    createdAt: "Created At",
    updatedAt: "Updated At",

    // Status Values
    activeLinePrices: "Active Line Prices",

    // Entity names for bulk actions
    entitySingular: "line_price",
    entityPlural: "line_prices",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByCompany: "Filter by Company",

    // Form Fields
    form: {
      line: "Line",
      linePlaceholder: "Select line",
      name: "Line Name",
      namePlaceholder: "Enter line name",

      price: "Price",
      pricePlaceholder: "Enter price",

      currency: "Currency",
      currencyPlaceholder: "Select Currency",
      currencies: {
        currency1: "USD",
        currency2: "JOD",
        currency3: "ILS",
      },

      company: "Company",
      companyPlaceholder: "Select company",
      companies: {
        company1: "Company 1",
        company2: "Company 2",
      },

      type: "Line Type",
      typePlaceholder: "Select Type",
      types: {
        type1: "Delivery",
        type2: "Return",
        delivery: "Delivery",
        return: "Return",
      },
    },

    // Validation Messages
    validation: {
      nameRequired: "Line name is required",
      nameMax: "Name must not exceed 255 characters",
      priceRequired: "Price is required and must be greater than 0",
      pricePositive: "Price must be greater than 0",
      currencyRequired: "Currency is required",
      companyRequired: "Company is required",
      typeRequired: "Type is required",
      invalidType: "Invalid type selected. Valid options: return, delivery",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Line Prices",
      empty: "No trashed line prices",
      restore: "Restore",
      delete: "Delete Permanently",
    },

    // Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },

  lineWork: {
    // Page Headers
    title: "Line Work Table",
    pageTitle: "Line Work Management",
    pageSubtitle: "Manage line work and their details",

    // Actions
    searchPlaceholder: "Search line work...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Line Work",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "line work",
    entityPlural: "line works",

    // Table Columns
    id: "ID",
    name: "Line Work Name",
    company: "Company",
    createdAt: "Created At",
    updatedAt: "Updated At",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByCompany: "Filter by Company",

    // Form Fields
    form: {
      name: "Line Work Name",
      namePlaceholder: "Enter line work name",
      company: "Company",
      companyPlaceholder: "Select company",
      companies: {
        company1: "Company 1",
        company2: "Company 2",
      },
    },

    // Validation Messages
    validation: {
      nameRequired: "Line work name is required",
      nameMax: "Name must not exceed 255 characters",
      companyRequired: "Company is required",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Line Work",
      empty: "No trashed line work",
      restore: "Restore",
      delete: "Delete Permanently",
    },

    // Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },
  //regions

  regions: {
    title: "Regions Table",
  },
  filters: {
    selectAll: "Select All",
    clearAll: "Clear All",
    allGroupsSelected: "All groups selected",
    manageColumns: "Manage Columns",
    filterBy: "Filter By",
  },

  // Role Values
  roles: {
    Admin: "Admin",
    User: "User",
    Supervisor: "Supervisor",
    Employee: "Employee",
  },

  //  Status Values
  statuses: {
    available: "Available",
    busy: "Busy",
    in_holiday: "In Holiday",
  },

  // Regions
  regions: {
    // Page Headers
    title: "Regions Table",
    // Actions
    searchPlaceholder: "Search Regions...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Region",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "region",
    entityPlural: "regions",

    // Table Columns
    id: "ID",
    key: "Key",
    name: "Name",
    timezone: "Timezone",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByStatus: "Filter by Status",

    // Form Fields
    form: {
      key: "Region Key",
      keyPlaceholder: "Enter Region Key",

      name: "Region Name",
      namePlaceholder: "Enter Region name",
      nameEnglish: "English Name",
      nameEnglishPlaceholder: "Enter region name in English",
      nameArabic: "Arabic Name",
      nameArabicPlaceholder: "Enter region name in Arabic",

      timezone: "Region Timezone",
      timezonePlaceholder: "Enter Region Timezone",
    },

    // Validation Messages
    validation: {
      nameRequired: "Region name is required",
      nameMax: "Name must not exceed 255 characters",
      nameEnglishRequired: "English name is required",
      nameArabicRequired: "Arabic name is required",

      keyRequired: "Region key is required",

      timezoneMax: "timezone must not exceed 50 characters",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Regions",
      empty: "No trashed region",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },
  pagination: {
    showing: "Showing",
    of: "of",
    previous: "Previous",
    next: "Next",
  },
  map: {
    title: "Map",
    pageTitle: "Tracking Drivers Map",
    pageSubtitle: "Tracking Map",
    popup: {
      company: "Company",
      branch: "Branch",
      coordinates: "Coordinates",
      viewDetails: "View Company Details",
    },
  },

  orders: {
    // Page Headers
    title: "Orders Management",
    pageTitle: "Orders Management",
    pageSubtitle: "Manage delivery orders and track their status",

    // Actions
    searchPlaceholder: "Search orders...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Order",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    actionsLabel: "Actions",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "order",
    entityPlural: "orders",

    // Statistics Cards
    stats: {
      timePeriod: "Time Period",
      total: "Total Orders",
      totalProfit: "Total Profit",
      pending: "Pending",
      inProgress: "In Progress",
      done: "Completed",
      failed: "Failed",
      allTime: "All Time",
      today: "Today",
      thisMonth: "This Month",
      thisYear: "This Year",
    },

    // Table Columns
    table: {
      id: "Order ID",
      customer: "Customer",
      company: "Company",
      type: "Type",
      package: "Package",
      case: "Case",
      price: "Price",
      currency: "Currency",
      status: "Status",
      createdAt: "Created At",
    },

    // Order Status Values
    status: {
      pending: "Pending",
      in_progress: "In Progress",
      done: "Completed",
      failed: "Failed",
    },

    // Actions
    actions: {
      view: "View Details",
      edit: "Edit Order",
      delete: "Delete",
      deletePermanently: "Delete Permanently",
      assignDriver: "Assign Driver",
      updateStatus: "Update Status",
      track: "Track Order",
      print: "Print",
      cancel: "Cancel Order",
    },

    // Messages
    noData: "No orders available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByStatus: "Filter by Status",
    filterByCompany: "Filter by Company",
    filterByDriver: "Filter by Driver",

    // Form Fields
    form: {
      toId: "To Location",
      customerId: "Customer",
      selectCustomer: "Select Customer",
      selectLocation: "Select Location",
      selectCurrency: "Select Currency",
      selectLinePrice: "Select Line Price",
      selectCompanyPrice: "Select Company Price",
      selectBranch: "Select Branch",
      selectParentOrder: "Select Parent Order",
      price: "Price",
      pricePlaceholder: "Enter price amount",
      deliveryPrice: "Delivery Price",
      returnPrice: "Return Price",
      currencyId: "Currency",
      linepriceId: "Line Price",
      discountId: "Discount",
      noDiscount: "No Discount",
      companyItemPriceId: "Company Item Price",
      type: "Order Type",
      typeDelivery: "Delivery",
      typeReturn: "Return",
      typeExchange: "Exchange",
      package: "Package Type",
      packageOne: "Single Package",
      packageMulti: "Multiple Packages",
      case: "Case Type",
      caseFull: "Full",
      casePart: "Partial",
      caseFast: "Fast",
      deliveryPriceFromCustomer: "Delivery Price From Customer",
      priceFromCustomer: "Price From Customer",
      parentOrderId: "Parent Order",
      noParentOrder: "No Parent Order",
      companyId: "Company",
      branchCustomerCompanyId: "Customer Branch",
      branchDeliveryCompanyId: "Delivery Branch",
    },

    // Wizard
    wizard: {
      title: "Create New Order",
      // Mode selection (3 tabs)
      modeDelivery: "Delivery",
      modeReturn: "Return",
      modeExchange: "Exchange",
      modeDeliveryDesc: "Create a new delivery order to send items to a customer",
      modeReturnDesc: "Create a return order to collect items from a customer",
      modeExchangeDesc: "Exchange an existing order - customer returns items and receives new ones",
      // Steps
      step1: "Basic Info",
      step2: "Pricing & Details",
      step3: "Order Items",
      stepSelectOrder: "Select Order",
      stepSelectParent: "Select Parent",
      selectParentForReturn: "Select Parent Order for Return",
      // Content titles
      basicInfo: "Basic Order Information",
      pricingDetails: "Pricing & Details",
      orderItems: "Order Items",
      selectOriginalOrder: "Select Original Order to Exchange",
      originalOrder: "Original Order",
      selectedOrderDetails: "Selected Order Details",
      // Exchange specific
      caseDelivery: "Delivery Case Type",
      caseReturn: "Return Case Type",
      newDeliveryPrice: "New Delivery Price",
      originalOrderPrice: "Original Order Price (Return)",
      exchangeItem: "Exchange Item",
      exchangeItemsInfo: "Add items that will be delivered to the customer and items that will be returned",
      noDeliveryItems: "No delivery items added",
      noReturnItems: "No return items added",
      // Items
      itemsList: "Order Items List",
      addItem: "Add Item",
      nestedItems: "Nested Items",
      deliveryItems: "Delivery Items",
      returnItems: "Return Items",
      addDeliveryItem: "Add Delivery Item",
      addReturnItem: "Add Return Item",
      addNestedItem: "Add Nested Item",
      noItems: "No items added yet. Click 'Add Item' to start.",
      noNestedItems: "No nested items added",
      fromParentOrder: "From Parent",
      returnItemsFromParent: "These items are from the parent order. You can remove items or adjust quantities.",
      itemName: "Item Name",
      itemQuantity: "Quantity",
      itemDescription: "Description",
      singlePackageInfo: "Single package orders can only have 1 item",
      singlePackageLimit:
        "Single package can only have 1 order item. You can add multiple sub-items inside this item.",
      multiPackageInfo: "Multi-package orders must have at least 2 items",
      packageRules: "Package Type Rules",
      fullCaseRule: "Full case: Can be either Single or Multiple packages",
      fastPartCaseRule: "Fast/Partial case: Can ONLY be Single package",
      previous: "Previous",
      next: "Next",
      submit: "Create Order",
      note: "Order items can be added separately after creating the order",
    },

    // Validation Messages
    validation: {
      priceInvalid: "Price must be a valid positive number",
      multiPackageMustBeFull: "Multi-package orders must have 'Full' case type",
      multiPackageOnlyWithFull:
        "Multi-package can only be selected when case is 'Full'",
      returnRequiresParentOrder: "Return orders must have a parent order ID",
      parentOrderPriceMissing: "Parent order price is required for exchange",
      noOrderItems: "At least one order item is required",
      singlePackageOneItem: "Single package orders must have exactly one item",
      multiPackageMinItems: "Multi-package orders must have at least 2 items",
      incompleteOrderItem:
        "Order item {index} is incomplete. Please fill all required fields.",
      sameBranchNotAllowed:
        "Order item {index} must use different customer and delivery branches.",
      multiGroupIdRequired: "Multi-package item {index} requires a group ID.",
      fromCompanyRequired: "Order item {index} requires a from company for Fast case.",
      toCompanyRequired: "Order item {index} requires a to company for Part case.",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Orders",
      empty: "No trashed orders",
      restore: "Restore Order",
      delete: "Delete Permanently",
    },

    // Order Details
    details: {
      title: "Order Details",
      orderInfo: "Order Information",
      customerInfo: "Customer Information",
      deliveryInfo: "Delivery Information",
      timeline: "Order Timeline",
      notes: "Notes",
      discountPercentage: "Discount Percentage",
      orderItems: "Order Items",
      quantity: "Quantity",
      subItems: "Sub-Items",
      detailsTab: "Details",
      exchangedTab: "Exchanged",
      notExchanged: "Not Exchanged",
      noExchange: "This order has not been exchanged.",
    },

    // Exchange Order Details (for expandable row)
    exchange: {
      title: "Exchange Order Details",
      childOrders: "Exchange Orders",
      deliveryPart: "Delivery Part",
      returnPart: "Return Part",
      parentOrder: "Parent Order",
      viewExchange: "View Exchange",
    },

    // Status Updates
    statusUpdate: {
      title: "Update Order Status",
      currentStatus: "Current Status",
      newStatus: "New Status",
      notes: "Update Notes",
      notesPlaceholder: "Add notes about this status update",
      confirm: "Update Status",
    },

    // Driver Assignment
    driverAssignment: {
      title: "Assign Driver",
      currentDriver: "Current Driver",
      newDriver: "Select New Driver",
      availableDrivers: "Available Drivers",
      noDrivers: "No available drivers",
      confirm: "Assign Driver",
    },
  },

  // Order Status Translation Keys
  orderStatus: {
    pending: "Pending",
    in_progress: "In Progress",
    done: "Completed",
    failed: "Failed",
  },

  // Order Item Types Translation Keys
  orderItemTypes: {
    multi: "Multi",
    part: "Part",
    fast: "Fast",
  },

  // Order Items Form Fields (used in OrderWizard)
  orderItems: {
    form: {
      namePlaceholder: "Enter item name",
      type: "Item Type",
      typeMulti: "Multi",
      typePart: "Part",
      typeFast: "Fast",
      weight: "Weight (kg)",
      fromCompany: "From Company",
      noFromCompany: "No Source Company",
      toCompany: "To Company",
      noToCompany: "No Destination Company",
      warehouse: "Warehouse",
      descriptionPlaceholder: "Enter item description",
      multiGroupId: "Multi-Package Group ID",
      multiGroupIdPlaceholder: "e.g., group_1, shipment_abc",
      noWeightSelected: "No selected weight",
      typeNotSelected: "No selected Type",
    },
  },

  // Discount Management
  discount: {
    // Page Headers
    title: "Discount Management",
    pageTitle: "Discount Management",
    pageSubtitle: "Manage discount rules and pricing strategies",

    // Actions
    searchPlaceholder: "Search discounts...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Discount",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "discount",
    entityPlural: "discounts",

    // Table Columns
    table: {
      id: "ID",
      type: "Type",
      percentage: "Discount %",
      value: "Value",
      startDate: "Start Date",
      endDate: "End Date",
      company: "Company",
      usageCount: "Usage Count",
      status: "Status",
      actions: "Actions",
      createdAt: "Created At",
    },

    // Filters
    filterByType: "Filter by Type",

    // Form Fields
    form: {
      type: "Discount Type",
      typePlaceholder: "Select discount type",
      percentage: "Discount Percentage",
      percentagePlaceholder: "Enter percentage (0-100)",
      startDate: "Start Date",
      startDatePlaceholder: "Select start date and time",
      endDate: "End Date (Optional)",
      endDatePlaceholder: "Select end date and time",
      company: "Company",
      companyPlaceholder: "Select company",
      value: "Value",
      valuePlaceholder: "Enter value based on type",
    },

    // Validation Messages
    validation: {
      typeInvalid: "Type must be one of: Customer, Region, Line, Price",
      percentageRange: "Discount percentage must be between 0 and 100",
      startDateRequired: "Start date is required",
      dateFormat: "Please select a valid date and time",
      endDateAfterStart: "End date must be after or equal to start date",
      companyRequired: "Company is required",
      valueRequired: "Value is required",
      valueNumeric:
        "Value must be a positive number for Price and Weight types",
      valueMinLength:
        "Value must be at least 3 characters for Customer, Region, and Line types",
    },

    // Status Values
    status: {
      active: "Active",
      expired: "Expired",
      inactive: "Inactive",
      stopped: "Stopped",
      deleted: "Trashed",
    },

    // Details Modal
    details: {
      title: "Discount Details",
    },

    // Actions
    actions: {
      stop: "Stop",
      activate: "Activate",
      edit: "Edit",
      details: "Details",
      delete: "Delete",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Discounts",
      empty: "No trashed discounts",
      restore: "Restore Discount",
      delete: "Delete Permanently",
    },
  },

  // Discount Types Translation Keys
  discountTypes: {
    Customer: "Customer",
    Region: "Region",
    Line: "Line",
    Weight: "Weight",
    Price: "Price",
  },

  // Driver Line Management
  driverLine: {
    // Page Headers
    title: "Driver Line Management",
    pageTitle: "Driver Line Assignments",
    pageSubtitle: "Manage driver assignments to work lines",

    // Actions
    searchPlaceholder: "Search driver line assignments...",
    search: "Search",
    columns: "Columns",
    addNew: "Assign Driver to Line",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Entity names for bulk actions
    entitySingular: "driver line",
    entityPlural: "driver lines",

    // Table Columns
    table: {
      id: "ID",
      driver: "Driver",
      lineWork: "Work Line",
      status: "Status",
      assignedAt: "Assigned At",
      createdAt: "Created At",
      actions: "Actions",
    },

    // Filters
    filterByStatus: "Filter by Status",

    // Form Fields
    form: {
      driver: "Driver",
      driverPlaceholder: "Select driver",
      drivers: "Drivers",
      driversPlaceholder:
        "Select one or more drivers (hold Ctrl/Cmd to select multiple)",
      lineWork: "Work Line",
      lineWorkPlaceholder: "Select work line",
    },

    // Status Values
    status: {
      active: "Active",
      inactive: "Inactive",
    },

    // Validation Messages
    validation: {
      driverRequired: "Driver is required",
      driversRequired: "At least one driver is required",
      lineWorkRequired: "Work line is required",
      duplicateAssignment: "This driver is already assigned to this work line",
      driverAlreadyAssigned:
        "This driver is already assigned to another active work line",
      missingFields: "Please fill in all required fields",
      invalidDriver: "Selected driver is not valid",
      invalidLineWork: "Selected work line is not valid",
      invalidData: "Invalid driver or work line data",
      generalError: "An error occurred while creating the assignment",
    },

    // Bulk Assignment
    bulkAssignment: {
      summary: "{success} assignment(s) successful, {failed} failed",
      failedHeader: "Failed Assignments:",
    },

    // Actions
    actions: {
      activate: "Activate",
      deactivate: "Deactivate",
      edit: "Edit",
      details: "Details",
      delete: "Delete",
    },

    // Info Messages
    info: {
      manageLines:
        "To create or manage work lines, visit the Lines Management page.",
      goToLines: "Manage Lines",
    },

    // Details Modal
    details: {
      title: "Driver Line Assignment Details",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Driver Line Assignments",
      empty: "No trashed assignments",
      restore: "Restore Assignment",
      delete: "Delete Permanently",
    },
  },

  // Driver Line Status Translation Keys
  driverLineStatus: {
    active: "Active",
    inactive: "Inactive",
  },

  // Company Price Management
  companyPrice: {
    // Page Headers
    title: "Company Price Management",
    pageTitle: "Company Price Management",
    pageSubtitle: "Manage pricing for different item types by company",

    // Actions
    searchPlaceholder: "Search company prices...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Price",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",
    actions: "Actions",

    // Entity names for bulk actions
    entitySingular: "company price",
    entityPlural: "company prices",

    // Table Columns
    table: {
      id: "ID",
      company: "Company",
      itemType: "Item Type",
      price: "Price",
      currency: "Currency",
      createdAt: "Created At",
      actions: "Actions",
    },

    // Filters
    filterByItemType: "Filter by Item Type",

    // Currency Display
    displayCurrency: "Display Currency",
    currencyNote: "All prices will be displayed in the selected currency",

    // Form Fields
    form: {
      price: "Price",
      pricePlaceholder: "Enter price amount",
      itemType: "Item Type",
      itemTypePlaceholder: "Select item type",
      company: "Company",
      companyPlaceholder: "Select company",
    },

    // Item Types
    itemTypes: {
      "small_size&light_weight": "Small Size & Light Weight",
      "small_size&heavy_weight": "Small Size & Heavy Weight",
      "big_size&light_weight": "Big Size & Light Weight",
      "big_size&heavy_weight": "Big Size & Heavy Weight",
      smallLight: "Small Size & Light Weight",
      smallHeavy: "Small Size & Heavy Weight",
      bigLight: "Big Size & Light Weight",
      bigHeavy: "Big Size & Heavy Weight",
    },

    // Validation Messages
    validation: {
      priceRequired: "Price is required and must be greater than 0",
      itemTypeRequired: "Item type is required",
      companyRequired: "Company is required",
      duplicateItemType:
        "This item type already exists for the selected company",
    },

    // Actions
    actions: {
      edit: "Edit",
      details: "Details",
      delete: "Delete",
    },

    // Details Modal
    details: {
      title: "Company Price Details",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Company Prices",
      empty: "No trashed company prices",
      restore: "Restore Price",
      delete: "Delete Permanently",
    },
  },

  // Company Price Item Types Translation Keys
  companyPriceItemTypes: {
    "small_size & light_weight": "Small & Light",
    "small_size & heavy_weight": "Small & Heavy",
    "big_size & light_weight": "Big & Light",
    "big_size & heavy_weight": "Big & Heavy",
  },

  // Currency Management
  currency: {
    // Page Headers
    title: "Currency Management",
    pageTitle: "Currency Management",
    pageSubtitle: "Manage system currencies",

    // Actions
    searchPlaceholder: "Search currencies...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Currency",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",

    // Table Columns
    table: {
      id: "ID",
      key: "Currency Code",
      name: "Name",
      symbol: "Symbol",
      actions: "Actions",
    },

    // Form Fields
    form: {
      key: "Currency Code",
      keyPlaceholder: "Enter currency code (e.g., USD, EUR)",
      nameEnglish: "English Name",
      nameEnglishPlaceholder: "Enter currency name in English",
      nameArabic: "Arabic Name",
      nameArabicPlaceholder: "Enter currency name in Arabic",
      symbol: "Currency Symbol",
      symbolPlaceholder: "Enter currency symbol (e.g., $, €)",
    },
    details: {
      id: "ID",
      key: "Key",
      nameEnglish: "Name (English)",
      nameArabic: "Name (Arabic)",
      symbol: "Symbol",
      status: "Status"
    },
    // Validation Messages
    validation: {
      keyRequired: "Currency code is required",
      keyExists: "Currency code already exists",
      nameEnglishRequired: "English name is required",
      nameArabicRequired: "Arabic name is required",
      symbolRequired: "Currency symbol is required",
    },

    // Actions
    actions: {
      edit: "Edit",
      delete: "Delete",
      details: "Details",

    },

    // Bulk Actions
    bulkDelete: "Delete Selected",
    bulkRestore: "Restore Selected",

    // Entity names for bulk actions
    entitySingular: "currency",
    entityPlural: "currencies",

    // Trashed Items
    trashed: {
      title: "Trashed Currencies",
      empty: "No trashed currencies",
      restore: "Restore Currency",
      delete: "Delete Permanently",
    },
  },

  // Common Translations
  common: {
    create: "Create",
    actions: "Actions",
    noDataAvailable: "No data available",
    uploadImage: "Upload Image",
    remove: "Remove",
    order: "Order",
    items: "Items",
    selectOrder: "Select order",
    selectItems: "Select items",
    selectMultiple: "Select Multiple Items",
    selected: "selected",
    selectOrderFirst: "Please select an order first",
    restore: "Restore",
    permanentDelete: "Delete Permanently",
    noCompanyAssigned: "No company assigned",
    save: "Save",
    cancel: "Cancel",
    locateOnMap: "Locate on Map",
    selectLocation: "Select Location",
    mapClickHint: "Click on the map to set the location.",
    close: "Close",
    delete: "Delete",
    saving: "Saving...",
    loading: "Loading...",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    required: "Required",
    optional: "Optional",
    back: "Back",
    validationError: "Validation Error",
    validationFailed: "Validation failed",
    saveFailed: "Failed to save",
    restoreFailed: "Failed to restore",
    selected: "selected",
    active: "Active",
    expand: "Expand",
    collapse: "Collapse",
    saveChanges: "Save Changes",
    confirmCancel: "Are you sure you want to cancel? All unsaved changes will be lost.",
    deleteConfirmMessage: "Are you sure you want to delete this item?",
    validation: {
      requiredField: "{field} is required",
      invalidEmail: "Invalid email format",
      minLength: "Must be at least {min} characters",
      imageRequired: "Profile picture is required",
      invalidImageFile: "Please select a valid image file",
      imageMaxSize: "Image size should not exceed {size}MB",
      orderRowRequired: "Order and items are required",
      branchNameRequired: "Branch name is required"

    },

    // Bulk action confirmation messages
    bulkDeleteConfirmTitle: "Confirm Bulk Delete",
    bulkDeleteConfirmMessage:
      "Are you sure you want to delete {count} {entity}?",
    bulkRestoreConfirmTitle: "Confirm Bulk Restore",
    bulkRestoreConfirmMessage:
      "Are you sure you want to restore {count} {entity}?",
    bulkDeleteConfirm:
      "Are you sure you want to delete {count} {entity}?",
    bulkPermanentDeleteConfirm:
      "Are you sure you want to permanently delete {count} {entity}?",
    bulkRestoreConfirm:
      "Are you sure you want to restore {count} {entity}?",
  },

  // Updated English translations for Work Plans
  workPlan: {
    // Page Headers
    title: "Work Plan Management",
    planDetails: "Plan Details",
    orderName: "Order Name",
    orderType: "Order Type",
    orderItems: "Order Items",
    orders: "Orders",
    noOrders: "No orders available for this plan",
    selectDate: "Select a date from calendar to view plan details",
    driverName: "Driver Name",
    companyName: "Company Name",
    date: "Date",
    today: "Today",
    order: "Order",
    tabs: {
      calendar: "Calendar",
      table: "Table",
    },

    // Actions
    searchPlaceholder: "Search Work Plans...",
    search: "Search",
    columns: "Columns",
    addNew: "Add Work Plan",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Name",
    description: "Description",

    // Status Values
    active: "Active",
    inactive: "Inactive",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByCompany: "Filter by Company",

    // Form Fields
    form: {
      name: "Plan Name",
      namePlaceholder: "Enter work plan name",

      company: "Company",
      companyPlaceholder: "Select company",

      date: "Date",
      datePlaceholder: "Select Date",

      driverName: "Driver Name",
      driverNamePlaceholder: "Select Driver Name",

      orders: "Orders",
      orderName: "Order Name",
      orderNamePlaceholder: "Select Order Name",

      orderItems: "Order Items",
      orderItemsPlaceholder: "Select Order Items",
    },

    // Validation Messages
    validation: {
      nameRequired: "Name is required",
      nameMax: "Name must not exceed 255 characters",
      nameMin: "The name must be at least 3 characters",
      companyRequired: "Company is required",
    },

    // Trashed Items
    trashed: {
      title: "Trashed Work Plans",
      empty: "No trashed Work Plans",
      restore: "Restore",
      delete: "Delete Permanently",
    },

    // Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },

  profile: {
    title: "Profile",
    personalInfo: "Personal Information",
    accountSettings: "Account Settings",
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    changeProfileImage: "Change Profile Image",
    currentPassword: "Current Password",
    newPassword: "New Password",
    confirmPassword: "Confirm Password",
    currentPasswordPlaceholder: "Enter current password",
    newPasswordPlaceholder: "Enter new password",
    confirmPasswordPlaceholder: "Confirm new password",
    language: "Language",
    languages: {
      english: "English",
      arabic: "Arabic",
    },
    defaultLandingPage: "Default Landing Page",
    noEmail: "No email provided",
    updateSuccess: "Profile updated successfully!",
    updateError: "Failed to update profile. Please try again.",
    passwordChangeSuccess: "Password changed successfully!",
    passwordChangeError: "Failed to change password. Please try again.",
    passwordMismatch: "Passwords do not match!",
    imageUpdateSuccess: "Profile image updated successfully!",
    imageUpdateError: "Failed to update profile image.",
    noImageSelected: "Please select an image first.",
  },

  collection: {
    title: "Collections",
    id: "ID",
    invoiceCode: "Invoice Code",
    driverName: "Driver Name",
    note: "Note",
    status: "Status",
    actions: "Actions",
    edit: "Edit",
    details: "Details",
    searchPlaceholder: "Search collections...",
    filterByStatus: "Filter by Status",
    markAsPaid: "Mark as Paid",
    createdAt: "Created At",
    updatedAt: "Updated At",
    makeInvoice: 'Make Invoice',
    createInvoiceTitle: 'Create Invoice',
    createInvoiceConfirm: 'Are you sure you want to create an invoice for {count} collections?',
    invoiceCreatedSuccess: 'Invoice created successfully!',

    form: {
      status: "Status",
      note: "Note",
      notePlaceholder: "Enter note..."
    },
    entitySingular: "collection",
    entityPlural: "collections"
  },
  collectionStatus: {
    pending: "Pending",
    completed: "Completed",
    failed: "Failed"
  },

  roles: {
    SuperAdmin: "Super Admin",
    Admin: "Admin",
    Employee: "Employee",
    Supervisor: "Supervisor",
    Driver: "Driver",
  },
  invoice: {
    title: "Invoices",
    searchPlaceholder: "Search for invoice...",
    filterByStatus: "Filter by Status",
    id: "Invoice ID",
    invoiceCode: "Invoice Code",
    deliveryCompany: "Delivery Company",
    clientCompany: "Client Company",
    collectionAmount: "Collection Amount",
    dueAmount: "Due Amount",
    periodStart: "Period Start",
    periodEnd: "Period End",
    status: "Status",
    createdAt: "Created At",
    actions: "Actions",
    details: "Details",
    delete: "Delete",
    deleteConfirm: "Are you sure you want to delete this invoice?",
    permanentDeleteConfirm: "Are you sure? This cannot be undone!",
    trashedInvoices: "Trashed Invoices",
    noTrashedInvoices: "No trashed invoices",
    entitySingular: "invoice",
    entityPlural: "invoices"
  },
  invoiceStatus: {
    pending: "Pending",
    completed: "Completed"
  },
  // Permissions Management
  permissions: {
    title: "Permissions Management",
    subtitle: "Manage user permissions and access control",
    searchUsers: "Search users...",
    availablePermissions: "Available Permissions",
    noPermissions: "No permissions available",
    userPermissions: "User Permissions",
    noPermissionsAvailable: "No permissions available",
    noUsersFound: "No users found",
  },
};
