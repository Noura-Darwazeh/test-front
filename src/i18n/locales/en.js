export default {
  navbar: {
    notifications: "Notifications",
    profile: "Profile",
    settings: "Settings",
    SwitchUser: "Switch User",
    logout: "Logout",
  },
  sidebar: {
    logoText: "PITS Delivery",
  },
  user: {
    // Page Headers
    title: "User Table",

    // Actions
    searchPlaceholder: "Search users...",
    search: "Search",
    columns: "Columns",
    addNew: "Add User",
    export: "Export",
    edit: "Edit",
    delete: "Delete",
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
    sharedLine: "Shared Line",
    status: "Status",
    company: "Company",

    // Status Values
    active: "Active",
    inactive: "Inactive",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByRole: "Filter by Role",

    // Form Fields
    form: {
      name: "Full Name",
      namePlaceholder: "Enter full name",
      username: "Username",
      usernamePlaceholder: "Enter unique username",
      email: "Email Address",
      emailPlaceholder: "user@example.com (optional)",
      password: "Password",
      passwordPlaceholder: "Minimum 6 characters",
      phoneNumber: "Phone Number",
      phoneNumberPlaceholder: "0599000000",
      role: "User Role",
      rolePlaceholder: "Select role",
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
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Name",
    username: "Username",
    email: "Email",
    phoneNumber: "Phone Number",
    location: "Location",
    status: "Status",
    type: "Type",
    branchId: "Branch",
    branchName: "Branch",
    vehicleNumber: "Vehicle Number",
    createdBy: "Created By",
    landingPage: "Landing Page",
    language: "Language",
    company: "Company",

    // Status Values
    active: "Active",
    inactive: "Inactive",

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
      emailPlaceholder: "driver@example.com (optional)",
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

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByCompany: "Filter by Company",

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
    },

    // Validation Messages
    validation: {
      nameRequired: "Name is required",
      nameMax: "Name must not exceed 255 characters",
      usernameRequired: "Username is required",
      usernameMax: "Username must not exceed 255 characters",
      usernameExists: "Username already exists",
      phoneRequired: "Phone number is required",
      phoneMax: "Phone number must not exceed 20 characters",
      companyRequired: "Company is required",
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
    },
    // Form Fields
    form: {
      name: "Company Name",
      namePlaceholder: "Enter company full name",
      type: "Company Type",
      typePlaceholder: "Select company type",
      uploadImage: "Upload Image",
      removeImage: "Remove",
      types: {
        delivery: "Delivery Company",
        admin: "Admin Company",
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
      title: "Trashed Companies",
      empty: "No Trashed Companies",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    branches: {
      title: "Branches",
      empty: "No branches available"
    },

    lines: {
      title: "Lines",
      empty: "No lines available"
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
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Name",
    company: "company",
    location: "Location",


    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByLocation: "Filter by Location",
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
      company: "Company",
      companyPlaceholder: "Select company",
      companies: {
        "company1": "Company 1",
        "company2": "Company 2",
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
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Name",
    region: "Region",
    company: "Company",


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
    actions: "Actions",

    // Table Columns
    id: "ID",
    name: "Line Name",
    price: "Price",
    currency: "Currency",
    type: "Type",
    company: "Company",

    // Messages
    noData: "No data available",
    rowsPerPage: "Rows per page",
    showingEntries: "Showing {from} to {to} of {total} entries",

    // Filters
    filterByCompany: "Filter by Company",

    // Form Fields
    form: {
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
      currencyRequired: "Currency is required",
      companyRequired: "Company is required",
      typeRequired: "Type is required",
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

  // Common Translations
  common: {
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    saving: "Saving...",
    loading: "Loading...",
    confirm: "Confirm",
    yes: "Yes",
    no: "No",
    required: "Required",
    optional: "Optional",
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
    offline: "In Holiday",
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

      timezone: "Region Timezone",
      timezonePlaceholder: "Enter Region Timezone",
    },

    // Validation Messages
    validation: {
      nameRequired: "Region name is required",
      nameMax: "Name must not exceed 255 characters",

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
};