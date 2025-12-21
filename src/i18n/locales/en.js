import { descending } from "ol/array";

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
      nameMin: "The name must be at least 3 characters",
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

    // Table Columns
    id: "ID",
    name: "Line Work Name",
    company: "Company",

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
  map: {
    title: "Map",
    pageTitle: "Tracking Drivers Map",
    pageSubtitle: "Tracking Map",
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
    actions: "Actions",

    // Statistics Cards
    stats: {
      total: "Total Orders",
      delivered: "Delivered",
      onWay: "On the Way",
      pending: "Pending",
    },

    // Table Columns
    table: {
      id: "Order ID",
      customer: "Customer",
      customerPhone: "Phone",
      company: "Company",
      driver: "Driver",
      status: "Status",
      total: "Total Amount",
      weight: "Weight (kg)",
      items: "Items",
      pickup: "Pickup Location",
      delivery: "Delivery Location",
      date: "Order Date",
      estimatedDelivery: "Est. Delivery",
    },

    // Order Status Values
    status: {
      pending: "Pending",
      assigned: "Assigned",
      picked_up: "Picked Up",
      on_way: "On the Way",
      delivered: "Delivered",
      cancelled: "Cancelled",
      returned: "Returned",
    },

    // Actions
    actions: {
      view: "View Details",
      edit: "Edit Order",
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
      customerName: "Customer Name",
      customerNamePlaceholder: "Enter customer full name",
      customerPhone: "Customer Phone",
      customerPhonePlaceholder: "0599000000",
      items: "Items Description",
      itemsPlaceholder: "Describe the items to be delivered",
      weight: "Weight (kg)",
      weightPlaceholder: "Enter total weight",
      totalPrice: "Total Amount",
      totalPricePlaceholder: "Enter total price",
      pickupLocation: "Pickup Location",
      pickupLocationPlaceholder: "Enter pickup address",
      deliveryLocation: "Delivery Location",
      deliveryLocationPlaceholder: "Enter delivery address",
      estimatedDelivery: "Estimated Delivery Date",
      driver: "Assign Driver",
      driverPlaceholder: "Select driver",
      company: "Company",
      companyPlaceholder: "Select company",
      status: "Order Status",
      statusPlaceholder: "Select status",
      notes: "Special Notes",
      notesPlaceholder: "Any special delivery instructions",
    },

    // Validation Messages
    validation: {
      customerNameRequired: "Customer name is required",
      customerNameMax: "Customer name must not exceed 255 characters",
      customerPhoneRequired: "Customer phone is required",
      phoneMax: "Phone number must not exceed 20 characters",
      itemsRequired: "Items description is required",
      weightRequired: "Weight is required",
      weightMin: "Weight must be greater than 0",
      totalPriceRequired: "Total amount is required",
      totalPriceMin: "Total amount must be greater than 0",
      pickupLocationRequired: "Pickup location is required",
      deliveryLocationRequired: "Delivery location is required",
      driverRequired: "Driver assignment is required",
      companyRequired: "Company is required",
    },

    // Trashed Items
    trashed: {
      title: "Cancelled Orders",
      empty: "No cancelled orders",
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
    assigned: "Assigned",
    picked_up: "Picked Up",
    on_way: "On the Way",
    delivered: "Delivered",
    cancelled: "Cancelled",
    returned: "Returned",
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
      deleted: "Deleted",
    },

    // Actions
    actions: {
      stop: "Stop",
      activate: "Activate",
      edit: "Edit",
      delete: "Delete",
    },

    // Trashed Items
    trashed: {
      title: "Deleted Discounts",
      empty: "No deleted discounts",
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
    actions: "Actions",

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
      delete: "Delete",
    },

    // Trashed Items
    trashed: {
      title: "Deleted Company Prices",
      empty: "No deleted company prices",
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
    },

    // Trashed Items
    trashed: {
      title: "Deleted Currencies",
      empty: "No deleted currencies",
      restore: "Restore Currency",
      delete: "Delete Permanently",
    },
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
    back: "Back",
  },

  workPlan: {
    // Page Headers
    title: "Work Plan Management",

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

      description: "Description",
      descriptionPlaceholder: "Enter description",

      company: "Company",
      companyPlaceholder: "Select company",

      orderName: "Order Name",
      orderNamePlaceholder: "Select Order Name",

      orderType: "Order Type",
      orderTypePlaceholder: "Select Order Type",


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
    },

    // Trashed Items
    trashed: {
      title: "Trashed Work Plans",
      empty: "No trashed Work Plans",
      restore: "Restore",
      delete: "Delete Permanently",
    },
    //Edit / Details Modal
    edit: "Edit",
    details: "Details",
  },
};
