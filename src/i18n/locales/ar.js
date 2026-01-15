export default {
  navbar: {
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    SwitchUser: "تبديل المستخدم",
    logout: "تسجيل الخروج",
    signedInAs: "مسجل الدخول كـ",
    confirmLogout: "هل أنت متأكد من تسجيل الخروج؟",
  },

  login: {
    title: "مرحباً بعودتك",
    subtitle: "سجل الدخول للوصول إلى لوحة التحكم",
    emailLabel: "البريد الإلكتروني أو اسم المستخدم",
    emailPlaceholder: "أدخل البريد الإلكتروني أو اسم المستخدم",
    passwordLabel: "كلمة المرور",
    passwordPlaceholder: "********",
    forgotPassword: "نسيت كلمة المرور؟",
    signIn: "تسجيل الدخول",
    signingIn: "جاري تسجيل الدخول...",

    // Validation
    validation: {
      emailRequired: "البريد الإلكتروني أو اسم المستخدم مطلوب",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMinLength: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      invalidCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
    },

    // Success messages
    loginSuccess: "تم تسجيل الدخول بنجاح! جاري التحويل...",
  },

  sidebar: {
    logoText: "توصيل PITS",
  },
  user: {
    // عناوين الصفحة
    title: "جدول المستخدمين",
    pageTitle: "إدارة المستخدمين",
    pageSubtitle: "إدارة مستخدمي النظام وصلاحياتهم",

    // الإجراءات
    searchPlaceholder: "البحث عن المستخدمين...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة مستخدم",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    fullName: "الاسم الكامل",
    name: "الاسم",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    image: "الصورة",
    phoneNumber: "رقم الهاتف",
    role: "الدور",
    userRole: "دور المستخدم",
    landingPage: "الصفحة الرئيسية",
    language: "اللغة",
    sharedLine: "الخط المشترك",
    status: "الحالة",
    company: "الشركة",

    // قيم الحالة
    active: "نشط",
    inactive: "غير نشط",
    activeUsers: "المستخدمون النشطون",

    // Entity names for bulk actions
    entitySingular: "مستخدم",
    entityPlural: "مستخدمين",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",
    confirmDeleteTitle: "تأكيد الحذف",
    confirmDelete: "هل أنت متأكد من حذف هذا المستخدم؟ يمكنك استعادته لاحقًا.",

    // الفلاتر
    filterByRole: "تصفية حسب الدور",

    // حقول النموذج
    form: {
      name: "الاسم الكامل",
      namePlaceholder: "أدخل الاسم الكامل",
      username: "اسم المستخدم",
      usernamePlaceholder: "أدخل اسم مستخدم فريد",
      email: "البريد الإلكتروني",
      emailPlaceholder: "أدخل عنوان البريد الإلكتروني (اختياري)",
      password: "كلمة المرور",
      passwordPlaceholder: "6 أحرف على الأقل",
      phoneNumber: "رقم الهاتف",
      phoneNumberPlaceholder: "0599000000",
      role: "دور المستخدم",
      rolePlaceholder: "اختر الدور",
      region: "المنطقة",
      regionPlaceholder: "اختر المنطقة (اختياري)",
      noRegion: "لا توجد منطقة",
      currency: "العملة",
      currencyPlaceholder: "اختر العملة (اختياري)",
      noCurrency: "لا توجد عملة",
      company: "الشركة",
      companyPlaceholder: "اختر الشركة",
      uploadImage: "رفع صورة",
      removeImage: "إزالة",
    },

    // رسائل التحقق
    validation: {
      nameRequired: "الاسم مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      usernameRequired: "اسم المستخدم مطلوب",
      usernameMax: "يجب ألا يتجاوز اسم المستخدم 255 حرفاً",
      usernameExists: "اسم المستخدم موجود بالفعل",
      emailInvalid: "صيغة البريد الإلكتروني غير صحيحة",
      emailMax: "يجب ألا يتجاوز البريد الإلكتروني 255 حرفاً",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMin: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      phoneRequired: "رقم الهاتف مطلوب",
      phoneMax: "يجب ألا يتجاوز رقم الهاتف 20 حرفاً",
      roleRequired: "الدور مطلوب",
      companyRequired: "الشركة مطلوبة",
      imageRequired: "صورة الملف الشخصي مطلوبة",
      imageSize: "يجب ألا يتجاوز حجم الصورة 200 كيلوبايت",
      imageFormat: "يجب أن تكون الصورة بصيغة JPEG أو JPG أو PNG",
    },

    // العناصر المحذوفة
    trashed: {
      title: "المستخدمون المحذوفون",
      empty: "لا يوجد مستخدمون محذوفون",
      restore: "استعادة",
      delete: "حذف نهائي",
    },
    //التعديل والتفاصيل
    edit: "تعديل",
    details: "التفاصيل",
  },

  driver: {
    // عناوين الصفحة
    title: "جدول السائقين",

    // الإجراءات
    searchPlaceholder: "البحث عن سائقين...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة سائق",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "الاسم",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    status: "الحالة",
    type: "النوع",
    branchId: "الفرع",
    branchName: "الفرع",
    vehicleNumber: "رقم المركبة",
    company: "الشركة",

    // قيم الحالة
    active: "نشط",
    inactive: "غير نشط",
    activeDrivers: "السائقين النشطين",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "driver",
    entityPlural: "drivers",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByStatus: "تصفية حسب الحالة",

    // حقول النموذج
    form: {
      name: "اسم السائق",
      namePlaceholder: "أدخل الاسم الكامل للسائق",

      username: "اسم المستخدم",
      usernamePlaceholder: "أدخل اسم مستخدم فريد",

      email: "البريد الإلكتروني",
      emailPlaceholder: "أدخل عنوان البريد الإلكتروني (اختياري)",

      password: "كلمة المرور",
      passwordPlaceholder: "6 أحرف على الأقل",

      phoneNumber: "رقم الهاتف",
      phoneNumberPlaceholder: "0599000000",

      type: "نوع السائق",
      typePlaceholder: "اختر نوع السائق",
      driverTypes: {
        customDriver: "سائق مخصص",
        deliveryDriver: "سائق توصيل",
      },

      vehicleNumber: "رقم المركبة",
      vehicleNumberPlaceholder: "22-5566",

      branch: "الفرع",
      branchPlaceholder: "اختر الفرع",

      company: "الشركة",
      companyPlaceholder: "اختر الشركة",

      status: "الحالة",
      statusPlaceholder: "اختر الحالة",

      location: "الموقع",
      setLocation: "تحديد الموقع على الخريطة",

      uploadImage: "رفع صورة",
      removeImage: "إزالة",
    },

    // رسائل التحقق
    validation: {
      nameRequired: "اسم السائق مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      usernameRequired: "اسم المستخدم مطلوب",
      usernameMax: "يجب ألا يتجاوز اسم المستخدم 255 حرفاً",
      usernameExists: "اسم المستخدم موجود بالفعل",
      emailInvalid: "صيغة البريد الإلكتروني غير صحيحة",
      emailMax: "يجب ألا يتجاوز البريد الإلكتروني 255 حرفاً",
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMin: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      phoneRequired: "رقم الهاتف مطلوب",
      phoneMax: "يجب ألا يتجاوز رقم الهاتف 20 حرفاً",
      typeRequired: "نوع السائق مطلوب",
      vehicleNumberRequired: "رقم المركبة مطلوب",
      branchRequired: "الفرع مطلوب",
      companyRequired: "الشركة مطلوبة",
      locationRequired: "الموقع مطلوب",
      imageRequired: "صورة الملف الشخصي مطلوبة",
      imageSize: "يجب ألا يتجاوز حجم الصورة 200 كيلوبايت",
      imageFormat: "يجب أن تكون الصورة بصيغة JPEG أو JPG أو PNG",
      usernameAlreadyTaken:
        "اسم المستخدم مستخدم بالفعل. الرجاء اختيار اسم مستخدم آخر.",
      phoneAlreadyInCompany: "هذا المستخدم مسجل بالفعل كسائق في هذه الشركة.",
    },

    // العناصر المحذوفة
    trashed: {
      title: "السائقون المحذوفون",
      empty: "لا يوجد سائقون محذوفون",
      restore: "استعادة",
      delete: "حذف نهائي",
    },
    //التعديل والتفاصيل
    edit: "تعديل",
    details: "تفاصيل ",
  },
  customer: {
    // Page Headers
    title: "جدول العملاء",

    // الإجراءات
    searchPlaceholder: "البحث عن عملاء...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة عميل",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "الاسم",
    phoneNumber: "رقم الهاتف",
    location: "الموقع",
    companyName: "الشركة",

    // قيم الحالة
    active: "نشط",
    inactive: "غير نشط",
    activeCustomers: "العملاء النشطين",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "customer",
    entityPlural: "customers",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByCompany: "تصفية حسب الشركة",

    // حقول النموذج
    form: {
      name: "اسم العميل",
      namePlaceholder: "أدخل الاسم الكامل للعميل",
      phoneNumber: "رقم الهاتف",
      phoneNumberPlaceholder: "0599000000",
      company: "الشركة",
      companyPlaceholder: "اختر الشركة",
      location: "الموقع",
      setLocation: "تحديد الموقع على الخريطة",
      uploadImage: "تحميل صورة",
    },

    // رسائل التحقق
    validation: {
      nameRequired: "اسم العميل مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      phoneRequired: "رقم الهاتف مطلوب",
      phoneMax: "يجب ألا يتجاوز رقم الهاتف 20 حرفاً",
      companyRequired: "الشركة مطلوبة",
      locationRequired: "الموقع مطلوب",
    },

    // العناصر المحذوفة
    trashed: {
      title: "العملاء المحذوفون",
      empty: "لا يوجد عملاء محذوفون",
      restore: "استعادة",
      delete: "حذف نهائي",
    },
    //التعديل والتفاصيل
    edit: "تعديل",
    details: "تفاصيل ",
  },

  companyNames: {
    "company 1": "شركة 1",
    "company 2": "شركة 2",
    "company 3": "شركة 3",
  },

  company: {
    // عناوين الصفحة
    title: "جدول الشركات",
    pageTitle: "إدارة الشركات",
    pageSubtitle: "إدارة الشركات وتفاصيلها",

    // الإجراءات
    searchPlaceholder: "البحث عن شركات...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة شركة",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "طلب",
    entityPlural: "طلبات",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "خطة عمل",
    entityPlural: "خطط عمل",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "سعر الشركة",
    entityPlural: "أسعار الشركات",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "خصم",
    entityPlural: "خصومات",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "خط عمل",
    entityPlural: "خطوط عمل",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "خط سائق",
    entityPlural: "خطوط السائقين",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "منطقة",
    entityPlural: "مناطق",

    // أعمدة الجدول
    id: "المعرف",
    name: "اسم الشركة",
    image: "الصورة",
    type: "نوع الشركة",

    active: "نشط",
    inactive: "غير نشط",

    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    filterByType: "تصفية حسب النوع",
    companyTypes: {
      "delivery company": "شركة توصيل",
      "admin company": "شركة إدارية",
      "customer company": "شركة عملاء",
    },

    form: {
      name: "اسم الشركة",
      namePlaceholder: "أدخل اسم الشركة",
      type: "نوع الشركة",
      typePlaceholder: "اختر نوع الشركة",
      uploadImage: "رفع صورة",
      removeImage: "إزالة",
      branches: "الفروع",
      branchName: "اسم الفرع",
      types: {
        delivery: "شركة توصيل",
        admin: "شركة إدارية",
        customer: "شركة عملاء",
      },
    },

    validation: {
      nameRequired: "اسم الشركة مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      typeRequired: "نوع الشركة مطلوب",
      imageRequired: "صورة الشركة مطلوبة",
      imageSize: "يجب ألا يتجاوز حجم الصورة 200 كيلوبايت",
      imageFormat: "يجب أن تكون الصورة بصيغة JPEG أو JPG أو PNG",
      branchNameRequired: "اسم الفرع مطلوب"

    },

    trashed: {
      title: "الشركات المحذوفة",
      empty: "لا توجد شركات محذوفة",
      restore: "استعادة",
      delete: "حذف نهائي",
    },

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "شركة",
    entityPlural: "شركات",

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    branches: {
      title: "الفروع",
      empty: "لا توجد فروع متاحة",
    },

    lines: {
      title: "الخطوط",
      empty: "لا توجد خطوط متاحة",
    },
    edit: "تعديل",
    details: "التفاصيل",
  },
  //

  branch: {
    // Page Headers
    title: "جدول الفروع ",

    searchPlaceholder: "البحث عن فروع...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة فرع",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "اسم الفرع",
    company: "الشركة",
    location: "الموقع",

    // قيم الحالة
    activeBranches: "الفروع النشطة",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "branch",
    entityPlural: "branchs",

    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    filterByLocation: "تصفية حسب الموقع",
    locations: {
      nablus: "نابلس",
      ramallah: "رام الله",
    },
    form: {
      name: "اسم الفرع",
      namePlaceholder: "أدخل اسم الفرع",
      location: "موقع الفرع",
      typePlaceholder: "اختر نوع الفرع",

      company: "الشركة",
      companyPlaceholder: "حدد الشركة",

      companies: {
        company1: "شركة 1",
        company2: "شركة 2",
      },
    },

    validation: {
      nameRequired: "اسم الفرع مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      typeRequired: "نوع الفرع مطلوب",
    },

    trashed: {
      title: "الفروع المحذوفة",
      empty: "لا توجد فروع محذوفة",
      restore: "استعادة",
      delete: "حذف نهائي",
    },

    edit: "تعديل",
    details: "التفاصيل",
  },

  lines: {
    // Page Headers
    title: "جدول الخطوط",

    searchPlaceholder: "البحث عن خطوط...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة خط",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "الاسم",
    region: "المنطقة",
    company: "الشركة",

    // قيم الحالة
    activeLines: "الخطوط النشطة",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "line",
    entityPlural: "lines",

    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    filterByRegion: "تصفية حسب المنطقة",

    form: {
      name: "اسم الخط",
      namePlaceholder: "ادخل اسم الخط",
      region: "المنطقة",
      regionPlaceholder: "حدد المنطقة",
      regions: {
        region1: "فلسطين",
        region2: "الأردن",
      },
      company: "الشركة",
      companyPlaceholder: "حدد الشركة",
      companies: {
        company1: "شركة 1",
        company2: "شركة 2",
      },
    },

    validation: {
      nameRequired: "اسم الخط مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      regionRequired: "المنطقة مطلوبة",
      companyRequired: "الشركة مطلوبة",
    },

    trashed: {
      title: "الخطوط المحذوفة",
      empty: "لا توجد خطوط محذوفة",
      restore: "استعادة",
      delete: "حذف نهائي",
    },

    edit: "تعديل",
    details: "التفاصيل",
  },

  //linePrice
  // إضافة هذا الجزء إلى ملف src/i18n/locales/ar.js

  linePrice: {
    // عناوين الصفحة
    title: "جدول أسعار الخطوط",

    // الإجراءات
    searchPlaceholder: "البحث عن أسعار الخطوط...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة سعر",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "اسم الخط",
    price: "السعر",
    currency: "العملة",
    type: "النوع",
    company: "الشركة",

    // قيم الحالة
    activeLinePrices: "أسعار الخطوط النشطة",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "line_price",
    entityPlural: "line_prices",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByCompany: "تصفية حسب الشركة",

    // حقول النموذج
    form: {
      name: "اسم الخط",
      namePlaceholder: "أدخل اسم الخط",

      price: "السعر",
      pricePlaceholder: "أدخل سعر الخط",

      currency: "العملة",
      currencyPlaceholder: "حدد العملة",
      currencies: {
        currency1: "دولار أمريكي",
        currency2: "دينار أردني",
        currency3: "شيكل",
      },

      company: "الشركة",
      companyPlaceholder: "حدد الشركة",
      companies: {
        company1: "شركة 1",
        company2: "شركة 2",
      },

      type: "نوع الخط",
      typePlaceholder: "حدد نوع الخط",
      types: {
        type1: "توصيل",
        type2: "إرجاع",
        delivery: "توصيل",
        return: "إرجاع",
      },
    },

    // رسائل التحقق
    validation: {
      nameRequired: "اسم الخط مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      priceRequired: "السعر مطلوب ويجب أن يكون أكبر من 0",
      currencyRequired: "العملة مطلوبة",
      companyRequired: "الشركة مطلوبة",
      typeRequired: "النوع مطلوب",
    },

    // العناصر المحذوفة
    trashed: {
      title: "أسعار الخطوط المحذوفة",
      empty: "لا توجد أسعار خطوط محذوفة",
      restore: "استعادة",
      delete: "حذف نهائي",
    },

    // التعديل والتفاصيل
    edit: "تعديل",
    details: "التفاصيل",
  },
  lineWork: {
    // عناوين الصفحة
    title: "جدول خطوط العمل",
    pageTitle: "إدارة خطوط العمل",
    pageSubtitle: "إدارة خطوط العمل وتفاصيلها",

    // الإجراءات
    searchPlaceholder: "البحث عن خطوط العمل...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة خط عمل",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "اسم خط العمل",
    company: "الشركة",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByCompany: "تصفية حسب الشركة",

    // حقول النموذج
    form: {
      name: "اسم خط العمل",
      namePlaceholder: "أدخل اسم خط العمل",
      company: "الشركة",
      companyPlaceholder: "اختر الشركة",
      companies: {
        company1: "شركة 1",
        company2: "شركة 2",
      },
    },

    // رسائل التحقق
    validation: {
      nameRequired: "اسم خط العمل مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      companyRequired: "الشركة مطلوبة",
    },

    // العناصر المحذوفة
    trashed: {
      title: "خطوط العمل المحذوفة",
      empty: "لا توجد خطوط عمل محذوفة",
      restore: "استعادة",
      delete: "حذف نهائي",
    },

    // التعديل والتفاصيل
    edit: "تعديل",
    details: "التفاصيل",
  },
  companyTypes: {
    "delivery company": "شركة توصيل",
    "admin company": "شركة إدارية",
  },
  filters: {
    selectAll: "تحديد الكل",
    clearAll: "مسح الكل",
    allGroupsSelected: "تم تحديد جميع المجموعات",
    manageColumns: "إدارة الأعمدة",
    filterBy: "تصفية حسب",
  },

  roles: {
    Admin: "مسؤول",
    User: "مستخدم",
    Manager: "مدير",
    Supervisor: "مشرف",
    Employee: "موظف",
  },

  statuses: {
    available: "متاح",
    busy: "مشغول",
    in_holiday: "في عطلة",
  },

  driverTypes: {
    customDriver: "سائق مخصص",
    deliveryDriver: "سائق توصيل",
  },

  regions: {
    // عناوين الصفحة
    title: "جدول المناطق",

    // الإجراءات
    searchPlaceholder: "البحث عن مناطق...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "اضافة منطقة",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // Entity names for bulk actions
    entitySingular: "منطقة",
    entityPlural: "مناطق",

    // أعمدة الجدول
    id: "المعرف",
    key: "المفتاح",
    name: "الاسم",
    timezone: "المنطقة الزمنية",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByStatus: "تصفية حسب الحالة",

    // حقول النموذج
    form: {
      key: "مفتاح المنطقة",
      keyPlaceholder: "ادخل مفتاح المنطقة",

      name: "اسم المنطقة",
      namePlaceholder: "ادخل اسم المنطقة",

      timezone: "المنطقة الزمنية ",
      timezonePlaceholder: "ادخل المنطقة الزمنية",
    },

    // رسائل التحقق
    validation: {
      nameRequired: "اسم المنطقة مطلوب",
      nameMax: "يجب ألا يتجاوز 255 حرفاً",

      keyRequired: "مفتاح المنطقة مطلوب",

      timezoneMax: "يجب ألا يتجاوز 255 حرفاً",
    },

    // العناصر المحذوفة
    trashed: {
      title: "المناطق المحذوفة",
      empty: "لا يوجد مناطق محذوفة",
      restore: "استعادة",
      delete: "حذف نهائي",
    },
    //التعديل والتفاصيل
    edit: "تعديل",
    details: "تفاصيل ",
  },

  pagination: {
    showing: "عرض",
    of: "من",
    previous: "السابق",
    next: "التالي",
  },
  map: {
    title: "الخريطة",
    pageTitle: "خريطة تتبع السائقين",
    pageSubtitle: "خريطة التتبع",
  },

  orders: {
    // عناوين الصفحة
    title: "إدارة الطلبات",
    pageTitle: "إدارة الطلبات",
    pageSubtitle: "إدارة طلبات التوصيل وتتبع حالتها",

    // الإجراءات
    searchPlaceholder: "البحث في الطلبات...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة طلب",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actionsLabel: "الإجراءات",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // Entity names for bulk actions
    entitySingular: "طلب",
    entityPlural: "طلبات",

    // بطاقات الإحصائيات
    stats: {
      timePeriod: "الفترة الزمنية",
      total: "إجمالي الطلبات",
      totalProfit: "إجمالي الأرباح",
      pending: "في الانتظار",
      inProgress: "قيد التنفيذ",
      done: "مكتمل",
      failed: "فشل",
      allTime: "كل الأوقات",
      today: "اليوم",
      thisMonth: "هذا الشهر",
      thisYear: "هذا العام",
    },

    // أعمدة الجدول
    table: {
      id: "رقم الطلب",
      customer: "العميل",
      company: "الشركة",
      type: "النوع",
      package: "الحزمة",
      case: "الحالة",
      price: "السعر",
      currency: "العملة",
      status: "الحالة",
      createdAt: "تاريخ الإنشاء",
    },

    // قيم حالة الطلب
    status: {
      pending: "في الانتظار",
      in_progress: "قيد التنفيذ",
      done: "مكتمل",
      failed: "فشل",
    },

    // الإجراءات
    actions: {
      view: "عرض التفاصيل",
      edit: "تعديل الطلب",
      delete: "حذف",
      deletePermanently: "حذف نهائي",
      assignDriver: "تعيين سائق",
      updateStatus: "تحديث الحالة",
      track: "تتبع الطلب",
      print: "طباعة",
      cancel: "إلغاء الطلب",
    },

    // الرسائل
    noData: "لا توجد طلبات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByStatus: "تصفية حسب الحالة",
    filterByCompany: "تصفية حسب الشركة",
    filterByDriver: "تصفية حسب السائق",

    // حقول النموذج
    form: {
      toId: "الموقع المقصود",
      customerId: "العميل",
      selectCustomer: "اختر العميل",
      selectLocation: "اختر الموقع",
      selectParentOrder: "اختر الطلب الأصلي",
      price: "السعر",
      pricePlaceholder: "أدخل مبلغ السعر",
      currencyId: "العملة",
      linepriceId: "سعر الخط",
      discountId: "الخصم",
      noDiscount: "بدون خصم",
      companyItemPriceId: "سعر عنصر الشركة",
      type: "نوع الطلب",
      typeDelivery: "توصيل",
      typeReturn: "إرجاع",
      package: "نوع الحزمة",
      packageOne: "حزمة واحدة",
      packageMulti: "حزم متعددة",
      case: "نوع الحالة",
      caseFull: "كامل",
      casePart: "جزئي",
      caseFast: "سريع",
      parentOrderId: "الطلب الأصلي",
      noParentOrder: "لا يوجد طلب أصلي",
      companyId: "الشركة",
      branchCustomerCompanyId: "فرع العميل",
      branchDeliveryCompanyId: "فرع التوصيل",
    },

    // المعالج
    wizard: {
      title: "إنشاء طلب جديد",
      step1: "المعلومات الأساسية",
      step2: "التسعير والتفاصيل",
      step3: "عناصر الطلب",
      basicInfo: "معلومات الطلب الأساسية",
      pricingDetails: "التسعير والتفاصيل",
      orderItems: "عناصر الطلب",
      itemsList: "قائمة عناصر الطلب",
      addItem: "إضافة عنصر",
      noItems: "لم يتم إضافة عناصر بعد. انقر على 'إضافة عنصر' للبدء.",
      itemName: "اسم العنصر",
      itemQuantity: "الكمية",
      itemDescription: "الوصف",
      singlePackageInfo:
        "الطلبات أحادية الحزمة يمكن أن تحتوي على عنصر واحد فقط",
      singlePackageLimit:
        "الحزمة الواحدة يمكن أن تحتوي على عنصر طلب واحد فقط. يمكنك إضافة عدة عناصر فرعية داخل هذا العنصر.",
      multiPackageInfo:
        "الطلبات متعددة الحزم يجب أن تحتوي على عنصرين على الأقل",
      packageRules: "قواعد نوع الحزمة",
      fullCaseRule: "الحالة الكاملة: يمكن أن تكون حزمة واحدة أو عدة حزم",
      fastPartCaseRule: "الحالة السريعة/الجزئية: يمكن أن تكون حزمة واحدة فقط",
      previous: "السابق",
      next: "التالي",
      submit: "إنشاء الطلب",
      note: "يمكن إضافة عناصر الطلب بشكل منفصل بعد إنشاء الطلب",
    },

    // رسائل التحقق
    validation: {
      priceInvalid: "يجب أن يكون السعر رقماً موجباً صحيحاً",
      multiPackageMustBeFull: "الطلبات متعددة الحزم يجب أن تكون من نوع 'كامل'",
      multiPackageOnlyWithFull:
        "يمكن اختيار الحزم المتعددة فقط عندما تكون الحالة 'كامل'",
      returnRequiresParentOrder:
        "طلبات الإرجاع يجب أن تحتوي على رقم الطلب الأصلي",
      noOrderItems: "مطلوب عنصر واحد على الأقل في الطلب",
      singlePackageOneItem:
        "الطلبات أحادية الحزمة يجب أن تحتوي على عنصر واحد فقط",
      multiPackageMinItems:
        "الطلبات متعددة الحزم يجب أن تحتوي على عنصرين على الأقل",
      incompleteOrderItem:
        "عنصر الطلب {index} غير مكتمل. يرجى ملء جميع الحقول المطلوبة.",
      multiGroupIdRequired: "عنصر الحزمة المتعددة {index} يتطلب معرف مجموعة.",
      fromCompanyRequired: "عنصر الطلب {index} يتطلب شركة مصدر للحالة السريعة.",
      toCompanyRequired: "عنصر الطلب {index} يتطلب شركة وجهة للحالة الجزئية.",
    },

    // العناصر المحذوفة
    trashed: {
      title: "الطلبات الملغية",
      empty: "لا توجد طلبات ملغية",
      restore: "استعادة الطلب",
      delete: "حذف نهائي",
    },

    // تفاصيل الطلب
    details: {
      title: "تفاصيل الطلب",
      orderInfo: "معلومات الطلب",
      customerInfo: "معلومات العميل",
      deliveryInfo: "معلومات التوصيل",
      timeline: "الجدول الزمني للطلب",
      notes: "الملاحظات",
      discountPercentage: "نسبة الخصم",
      orderItems: "عناصر الطلب",
      quantity: "الكمية",
      subItems: "العناصر الفرعية",
    },

    // تحديثات الحالة
    statusUpdate: {
      title: "تحديث حالة الطلب",
      currentStatus: "الحالة الحالية",
      newStatus: "الحالة الجديدة",
      notes: "ملاحظات التحديث",
      notesPlaceholder: "أضف ملاحظات حول تحديث الحالة",
      confirm: "تحديث الحالة",
    },

    // تعيين السائق
    driverAssignment: {
      title: "تعيين سائق",
      currentDriver: "السائق الحالي",
      newDriver: "اختر سائق جديد",
      availableDrivers: "السائقون المتاحون",
      noDrivers: "لا يوجد سائقون متاحون",
      confirm: "تعيين السائق",
    },
  },

  // مفاتيح ترجمة حالة الطلب
  orderStatus: {
    pending: "في الانتظار",
    in_progress: "قيد التنفيذ",
    done: "مكتمل",
    failed: "فشل",
  },

  // مفاتيح ترجمة أنواع عناصر الطلب
  orderItemTypes: {
    multi: "متعدد",
    part: "جزئي",
    fast: "سريع",
  },

  // حقول نموذج عناصر الطلب (مستخدمة في معالج الطلبات)
  orderItems: {
    form: {
      namePlaceholder: "أدخل اسم العنصر",
      type: "نوع العنصر",
      typeMulti: "متعدد",
      typePart: "جزئي",
      typeFast: "سريع",
      weight: "الوزن (كغ)",
      fromCompany: "من الشركة",
      noFromCompany: "لا توجد شركة مصدر",
      toCompany: "إلى الشركة",
      noToCompany: "لا توجد شركة وجهة",
      warehouse: "المستودع",
      descriptionPlaceholder: "أدخل وصف العنصر",
      multiGroupId: "معرف مجموعة الحزم المتعددة",
      multiGroupIdPlaceholder: "مثال: group_1, shipment_abc",
      noWeightSelected: "لا يوجد وزن محدد",
      typeNotSelected: "لم يتم تحديد نوع الطرد",
    },
  },

  // إدارة الخصومات
  discount: {
    // عناوين الصفحة
    title: "إدارة الخصومات",
    pageTitle: "إدارة الخصومات",
    pageSubtitle: "إدارة قواعد الخصم واستراتيجيات التسعير",

    // الإجراءات
    searchPlaceholder: "البحث في الخصومات...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة خصم",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // Entity names for bulk actions
    entitySingular: "خصم",
    entityPlural: "خصومات",

    // أعمدة الجدول
    table: {
      id: "المعرف",
      type: "النوع",
      percentage: "نسبة الخصم %",
      value: "القيمة",
      startDate: "تاريخ البداية",
      endDate: "تاريخ النهاية",
      company: "الشركة",
      usageCount: "عدد الاستخدامات",
      status: "الحالة",
      actions: "الإجراءات",
      createdAt: "تاريخ الإنشاء",
    },

    // الفلاتر
    filterByType: "تصفية حسب النوع",

    // حقول النموذج
    form: {
      type: "نوع الخصم",
      typePlaceholder: "اختر نوع الخصم",
      percentage: "نسبة الخصم",
      percentagePlaceholder: "أدخل النسبة المئوية (0-100)",
      startDate: "تاريخ البداية",
      startDatePlaceholder: "اختر تاريخ ووقت البداية",
      endDate: "تاريخ النهاية (اختياري)",
      endDatePlaceholder: "اختر تاريخ ووقت النهاية",
      company: "الشركة",
      companyPlaceholder: "اختر الشركة",
      value: "القيمة",
      valuePlaceholder: "أدخل القيمة حسب النوع",
    },

    // رسائل التحقق
    validation: {
      typeInvalid: "يجب أن يكون النوع أحد: عميل، منطقة، خط، سعر",
      percentageRange: "يجب أن تكون نسبة الخصم بين 0 و 100",
      startDateRequired: "تاريخ البداية مطلوب",
      dateFormat: "يرجى اختيار تاريخ ووقت صحيح",
      endDateAfterStart: "يجب أن يكون تاريخ النهاية بعد أو يساوي تاريخ البداية",
      companyRequired: "الشركة مطلوبة",
      valueRequired: "القيمة مطلوبة",
      valueNumeric: "يجب أن تكون القيمة رقماً موجباً لأنواع السعر والوزن",
      valueMinLength:
        "يجب أن تكون القيمة 3 أحرف على الأقل لأنواع العميل والمنطقة والخط",
    },

    // قيم الحالة
    status: {
      active: "نشط",
      expired: "منتهي الصلاحية",
      inactive: "غير نشط",
      stopped: "متوقف",
      deleted: "محذوف",
    },

    // نافذة التفاصيل
    details: {
      title: "تفاصيل الخصم",
    },

    // الإجراءات
    actions: {
      stop: "إيقاف",
      activate: "تفعيل",
      edit: "تعديل",
      details: "التفاصيل",
      delete: "حذف",
    },

    // العناصر المحذوفة
    trashed: {
      title: "الخصومات المحذوفة",
      empty: "لا توجد خصومات محذوفة",
      restore: "استعادة الخصم",
      delete: "حذف نهائي",
    },
  },

  // مفاتيح ترجمة أنواع الخصم
  discountTypes: {
    Customer: "عميل",
    Region: "منطقة",
    Line: "خط",
    Weight: "وزن",
    Price: "سعر",
  },

  // إدارة خطوط السائقين
  driverLine: {
    // عناوين الصفحة
    title: "إدارة خطوط السائقين",
    pageTitle: "تعيينات خطوط السائقين",
    pageSubtitle: "إدارة تعيين السائقين لخطوط العمل",

    // الإجراءات
    searchPlaceholder: "البحث في تعيينات خطوط السائقين...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "تعيين سائق لخط",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",

    // أعمدة الجدول
    table: {
      id: "المعرف",
      driver: "السائق",
      lineWork: "خط العمل",
      status: "الحالة",
      assignedAt: "تاريخ التعيين",
      createdAt: "تاريخ الإنشاء",
      actions: "الإجراءات",
    },

    // الفلاتر
    filterByStatus: "تصفية حسب الحالة",

    // حقول النموذج
    form: {
      driver: "السائق",
      driverPlaceholder: "اختر السائق",
      drivers: "السائقون",
      driversPlaceholder:
        "اختر سائق أو أكثر (اضغط Ctrl/Cmd لاختيار عدة سائقين)",
      lineWork: "خط العمل",
      lineWorkPlaceholder: "اختر خط العمل",
    },

    // قيم الحالة
    status: {
      active: "نشط",
      inactive: "غير نشط",
    },

    // رسائل التحقق
    validation: {
      driverRequired: "السائق مطلوب",
      driversRequired: "مطلوب سائق واحد على الأقل",
      lineWorkRequired: "خط العمل مطلوب",
      duplicateAssignment: "هذا السائق مُعيَّن بالفعل لهذا الخط",
      driverAlreadyAssigned: "هذا السائق مُعيَّن بالفعل لخط عمل نشط آخر",
      missingFields: "يرجى ملء جميع الحقول المطلوبة",
      invalidDriver: "السائق المحدد غير صالح",
      invalidLineWork: "خط العمل المحدد غير صالح",
      invalidData: "بيانات السائق أو خط العمل غير صالحة",
      generalError: "حدث خطأ أثناء إنشاء التعيين",
    },

    // التعيين الجماعي
    bulkAssignment: {
      summary: "{success} تعيين ناجح، {failed} فشل",
      failedHeader: "التعيينات الفاشلة:",
    },

    // الإجراءات
    actions: {
      activate: "تفعيل",
      deactivate: "إلغاء تفعيل",
      edit: "تعديل",
      details: "التفاصيل",
      delete: "حذف",
    },

    // رسائل معلوماتية
    info: {
      manageLines: "لإنشاء أو إدارة خطوط العمل، قم بزيارة صفحة إدارة الخطوط.",
      goToLines: "إدارة الخطوط",
    },

    // نافذة التفاصيل
    details: {
      title: "تفاصيل تعيين خط السائق",
    },

    // العناصر المحذوفة
    trashed: {
      title: "تعيينات خطوط السائقين المحذوفة",
      empty: "لا توجد تعيينات محذوفة",
      restore: "استعادة التعيين",
      delete: "حذف نهائي",
    },
  },

  // مفاتيح ترجمة حالة خط السائق
  driverLineStatus: {
    active: "نشط",
    inactive: "غير نشط",
  },

  // إدارة أسعار الشركات
  companyPrice: {
    // عناوين الصفحة
    title: "إدارة أسعار الشركات",
    pageTitle: "إدارة أسعار الشركات",
    pageSubtitle: "إدارة التسعير لأنواع العناصر المختلفة حسب الشركة",

    // الإجراءات
    searchPlaceholder: "البحث في أسعار الشركات...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة سعر",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",

    // أعمدة الجدول
    table: {
      id: "المعرف",
      company: "الشركة",
      itemType: "نوع العنصر",
      price: "السعر",
      currency: "العملة",
      createdAt: "تاريخ الإنشاء",
      actions: "الإجراءات",
    },

    // الفلاتر
    filterByItemType: "تصفية حسب نوع العنصر",

    // عرض العملة
    displayCurrency: "عملة العرض",
    currencyNote: "سيتم عرض جميع الأسعار بالعملة المحددة",

    // حقول النموذج
    form: {
      price: "السعر",
      pricePlaceholder: "أدخل مبلغ السعر",
      itemType: "نوع العنصر",
      itemTypePlaceholder: "اختر نوع العنصر",
      company: "الشركة",
      companyPlaceholder: "اختر الشركة",
    },

    // أنواع العناصر
    itemTypes: {
      "small_size&light_weight": "حجم صغير ووزن خفيف",
      "small_size&heavy_weight": "حجم صغير ووزن ثقيل",
      "big_size&light_weight": "حجم كبير ووزن خفيف",
      "big_size&heavy_weight": "حجم كبير ووزن ثقيل",
      smallLight: "حجم صغير ووزن خفيف",
      smallHeavy: "حجم صغير ووزن ثقيل",
      bigLight: "حجم كبير ووزن خفيف",
      bigHeavy: "حجم كبير ووزن ثقيل",
    },

    // رسائل التحقق
    validation: {
      priceRequired: "السعر مطلوب ويجب أن يكون أكبر من 0",
      itemTypeRequired: "نوع العنصر مطلوب",
      companyRequired: "الشركة مطلوبة",
      duplicateItemType: "نوع العنصر هذا موجود بالفعل للشركة المحددة",
    },

    // الإجراءات
    actions: {
      edit: "تعديل",
      details: "التفاصيل",
      delete: "حذف",
    },

    // نافذة التفاصيل
    details: {
      title: "تفاصيل سعر الشركة",
    },

    // العناصر المحذوفة
    trashed: {
      title: "أسعار الشركات المحذوفة",
      empty: "لا توجد أسعار شركات محذوفة",
      restore: "استعادة السعر",
      delete: "حذف نهائي",
    },
  },

  // مفاتيح ترجمة أنواع عناصر أسعار الشركات
  companyPriceItemTypes: {
    "small_size & light_weight": "صغير وخفيف",
    "small_size & heavy_weight": "صغير وثقيل",
    "big_size & light_weight": "كبير وخفيف",
    "big_size & heavy_weight": "كبير وثقيل",
  },

  // إدارة العملات
  currency: {
    // عناوين الصفحة
    title: "إدارة العملات",
    pageTitle: "إدارة العملات",
    pageSubtitle: "إدارة عملات النظام",

    // الإجراءات
    searchPlaceholder: "البحث في العملات...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة عملة",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",

    // أعمدة الجدول
    table: {
      id: "المعرف",
      key: "رمز العملة",
      name: "الاسم",
      symbol: "الرمز",
      actions: "الإجراءات",
    },

    // حقول النموذج
    form: {
      key: "رمز العملة",
      keyPlaceholder: "أدخل رمز العملة (مثل: USD, EUR)",
      nameEnglish: "الاسم بالإنجليزية",
      nameEnglishPlaceholder: "أدخل اسم العملة بالإنجليزية",
      nameArabic: "الاسم بالعربية",
      nameArabicPlaceholder: "أدخل اسم العملة بالعربية",
      symbol: "رمز العملة",
      symbolPlaceholder: "أدخل رمز العملة (مثل: $, €)",
    },

    // رسائل التحقق
    validation: {
      keyRequired: "رمز العملة مطلوب",
      keyExists: "رمز العملة موجود بالفعل",
      nameEnglishRequired: "الاسم بالإنجليزية مطلوب",
      nameArabicRequired: "الاسم بالعربية مطلوب",
      symbolRequired: "رمز العملة مطلوب",
    },

    // الإجراءات
    actions: {
      edit: "تعديل",
      delete: "حذف",
    },

    // الإجراءات الجماعية
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيان للإجراءات الجماعية
    entitySingular: "عملة",
    entityPlural: "عملات",

    // العناصر المحذوفة
    trashed: {
      title: "العملات المحذوفة",
      empty: "لا توجد عملات محذوفة",
      restore: "استعادة العملة",
      delete: "حذف نهائي",
    },
  },
  //خطط العمل
  workPlan: {
    // عناوين الصفحة
    title: "ادارة خطط العمل",
    planDetails: "تفاصيل الخطة",
    orderName: "اسم الطلب",
    orderType: "نوع الطلب",
    orderItems: "عناصر الطلب",
    orders: "الطلبات",
    noOrders: "لا توجد طلبات متاحة لهذه الخطة",
    selectDate: "اختر تاريخ من التقويم لعرض تفاصيل الخطة",
    driverName: "اسم السائق",
    companyName: "اسم الشركة",
    date: "التاريخ",
    today: "اليوم",

    tabs: {
      calendar: "التقويم",
      table: "الجدول",
    },

    // الإجراءات
    searchPlaceholder: "البحث عن خطة عمل...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة خطة عمل",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "الاسم",
    description: "الوصف",

    // قيم الحالة
    active: "نشط",
    inactive: "غير نشط",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByCompany: "تصفية حسب الشركة",

    // حقول النموذج
    form: {
      name: "اسم الخطة",
      namePlaceholder: "أدخل اسم خطة العمل",

      company: "الشركة",
      companyPlaceholder: "اختر الشركة",

      date: "التاريخ",
      datePlaceholder: "اختر التاريخ",

      driverName: "اسم السائق",
      driverNamePlaceholder: "اختر اسم السائق",

      orders: "الطلبات",
      orderName: "اسم الطلب",
      orderNamePlaceholder: "اختر اسم الطلب",

      orderItems: "عناصر الطلب",
      orderItemsPlaceholder: "اختر عناصر الطلب",
    },

    // رسائل التحقق
    validation: {
      nameRequired: "الاسم مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      nameMin: "يجب أن يكون الاسم 3 أحرف على الأقل",
      companyRequired: "الشركة مطلوبة",
    },

    // العناصر المحذوفة
    trashed: {
      title: "خطط العمل المحذوفة",
      empty: "لا يوجد خطط عمل محذوفة",
      restore: "استعادة",
      delete: "حذف نهائي",
    },

    // التعديل والتفاصيل
    edit: "تعديل",
    details: "التفاصيل",
  },
  profile: {
    title: "الملف الشخصي",
    personalInfo: "المعلومات الشخصية",
    accountSettings: "إعدادات الحساب",
    editProfile: "تعديل الملف الشخصي",
    changePassword: "تغيير كلمة المرور",
    changeProfileImage: "تغيير صورة الملف الشخصي",
    currentPassword: "كلمة المرور الحالية",
    newPassword: "كلمة المرور الجديدة",
    confirmPassword: "تأكيد كلمة المرور",
    currentPasswordPlaceholder: "أدخل كلمة المرور الحالية",
    newPasswordPlaceholder: "أدخل كلمة المرور الجديدة",
    confirmPasswordPlaceholder: "أكد كلمة المرور الجديدة",
    language: "اللغة",
    languages: {
      english: "??????????",
      arabic: "???????",
    },
    defaultLandingPage: "الصفحة الافتراضية",
    noEmail: "لم يتم تقديم بريد إلكتروني",
    updateSuccess: "تم تحديث الملف الشخصي بنجاح!",
    updateError: "فشل تحديث الملف الشخصي. يرجى المحاولة مرة أخرى.",
    passwordChangeSuccess: "تم تغيير كلمة المرور بنجاح!",
    passwordChangeError: "فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.",
    passwordMismatch: "كلمات المرور غير متطابقة!",
    imageUpdateSuccess: "تم تحديث صورة الملف الشخصي بنجاح!",
    imageUpdateError: "فشل تحديث صورة الملف الشخصي.",
    noImageSelected: "الرجاء اختيار صورة أولاً.",
  },
  roles: {
    SuperAdmin: "مدير عام",
    Admin: "مدير",
    Employee: "موظف",
    Supervisor: "مشرف",
    Driver: "سائق",
  },
  // الترجمات المشتركة
  common: {
    actions: "?????????",
    noDataAvailable: "?? ???? ??????",
    uploadImage: "??? ????",
    remove: "?????",
    order: "???",
    items: "?????",
    selectOrder: "???? ?????",
    selectItems: "???? ???????",
    restore: "???????",
    permanentDelete: "??? ?????",
    noCompanyAssigned: "?? ???? ???? ??????",
    selectMultiple: "اختر عدة عناصر",
    selected: "محدد",
    selectOrderFirst: "الرجاء اختيار طلب أولاً",

    save: "حفظ",
    cancel: "إلغاء",
    close: "إغلاق",
    delete: "حذف",
    saving: "جاري الحفظ...",
    loading: "جاري التحميل...",
    confirm: "تأكيد",
    yes: "نعم",
    no: "لا",
    required: "مطلوب",
    optional: "اختياري",
    back: "العودة",
    validationError: "خطأ في التحقق من الصحة",
    validationFailed: "فشل التحقق من الصحة",
    saveFailed: "فشل في الحفظ",
    restoreFailed: "فشل في الاستعادة",
    selected: "محدد",
    active: "نشط",
    saveChanges: "حفظ التغييرات",
    confirmCancel:
      "هل أنت متأكد من الإلغاء؟ سيتم فقدان جميع التغييرات غير المحفوظة.",
    validation: {
      requiredField: "{field} ?????",
      invalidEmail: "???? ?????? ?????????? ??? ?????",
      minLength: "???? ?????? {min} ????",
      imageRequired: "?????? ??????",
      invalidImageFile: "???? ?????? ??? ???? ????",
      imageMaxSize: "??? ??? ?????? ??? ?????? {size}MB",
      orderRowRequired: "????? ???????? ??????",
    },

    bulkDeleteConfirmTitle: "تأكيد الحذف الجماعي",
    bulkDeleteConfirmMessage: "هل أنت متأكد من حذف {count} {entity}؟",
    bulkRestoreConfirmTitle: "تأكيد الاستعادة الجماعية",
    bulkRestoreConfirmMessage: "هل أنت متأكد من استعادة {count} {entity}؟",
    bulkDeleteConfirm: "?? ??? ????? ?? ??? {count} {entity}?",
    bulkPermanentDeleteConfirm:
      "?? ??? ????? ?? ????? ??????? ?? {count} {entity}?",
    bulkRestoreConfirm: "?? ??? ????? ?? ??????? {count} {entity}?",
  },
};
