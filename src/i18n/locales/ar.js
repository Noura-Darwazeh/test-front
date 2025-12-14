export default {
  navbar: {
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    SwitchUser: "تبديل المستخدم",
    logout: "تسجيل الخروج",
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

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByRole: "تصفية حسب الدور",

    // حقول النموذج
    form: {
      name: "الاسم الكامل",
      namePlaceholder: "أدخل الاسم الكامل",
      username: "اسم المستخدم",
      usernamePlaceholder: "أدخل اسم مستخدم فريد",
      email: "البريد الإلكتروني",
      emailPlaceholder: "user@example.com (اختياري)",
      password: "كلمة المرور",
      passwordPlaceholder: "6 أحرف على الأقل",
      phoneNumber: "رقم الهاتف",
      phoneNumberPlaceholder: "0599000000",
      role: "دور المستخدم",
      rolePlaceholder: "اختر الدور",
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
    pageTitle: "إدارة السائقين",
    pageSubtitle: "إدارة سائقي التوصيل وتفاصيلهم",

    // الإجراءات
    searchPlaceholder: "البحث عن سائقين...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة سائق",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",

    // أعمدة الجدول
    id: "المعرف",
    name: "الاسم",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    location: "الموقع",
    status: "الحالة",
    type: "النوع",
    branchId: "الفرع",
    branchName: "الفرع",
    vehicleNumber: "رقم المركبة",
    createdBy: "أنشئ من قبل",
    landingPage: "الصفحة الرئيسية",
    language: "اللغة",
    company: "الشركة",

    // قيم الحالة
    active: "نشط",
    inactive: "غير نشط",

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
      emailPlaceholder: "driver@example.com (اختياري)",
      password: "كلمة المرور",
      passwordPlaceholder: "6 أحرف على الأقل",
      phoneNumber: "رقم الهاتف",
      phoneNumberPlaceholder: "0599000000",
      type: "نوع السائق",
      typePlaceholder: "اختر نوع السائق",
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

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByStatus: "تصفية حسب الحالة",

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
  filters: {
    selectAll: "تحديد الكل",
    clearAll: "مسح الكل",
    allGroupsSelected: "تم تحديد جميع المجموعات",
    manageColumns: "إدارة الأعمدة",
    filterBy: "تصفية حسب",
  },

  // الترجمات المشتركة
  common: {
    save: "حفظ",
    cancel: "إلغاء",
    close: "إغلاق",
    saving: "جاري الحفظ...",
    loading: "جاري التحميل...",
    confirm: "تأكيد",
    yes: "نعم",
    no: "لا",
    required: "مطلوب",
    optional: "اختياري",
  },

  // قيم الأدوار
  roles: {
    Admin: "مسؤول",
    User: "مستخدم",
    Manager: "مدير",
    Supervisor: "مشرف",
    Employee: "موظف",
  },

  // قيم حالة السائق
  statuses: {
    available: "متاح",
    busy: "مشغول",
    offline: "في عطلة",
  },

  // قيم نوع السائق
  driverTypes: {
    customDriver: "سائق مخصص",
    deliveryDriver: "سائق توصيل",
  },

  pagination: {
    showing: "عرض",
    of: "من",
    previous: "السابق",
    next: "التالي",
  },
};