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
    Manager: "Manager",
    Supervisor: "Supervisor",
    Employee: "Employee",
  },
  
  // Driver Status Values
  statuses: {
    available: "Available",
    busy: "Busy",
    offline: "In Holiday",
  },
  
  // Driver Type Values
  driverTypes: {
    customDriver: "Custom Driver",
    deliveryDriver: "Delivery Driver",
  },
  
  pagination: {
    showing: "Showing",
    of: "of",
    previous: "Previous",
    next: "Next",
  },
};