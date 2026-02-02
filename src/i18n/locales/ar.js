export default {
  navbar: {
    notifications: "الإشعارات",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    SwitchUser: "تبديل المستخدم",
    logout: "تسجيل الخروج",
    signedInAs: "مسجل الدخول كـ",
    confirmLogout: "هل أنت متأكد من تسجيل الخروج؟",
    switchToUser: "تسجيل الدخول",

    confirmLogoutTitle: "تأكيد تسجيل الخروج",
    confirmLogout: "هل أنت متأكد من تسجيل الخروج؟",
    logout: "تسجيل الخروج",
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

  forgotPassword: {
    title: "نسيت كلمة المرور؟",
    subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابطاً لإعادة تعيين كلمة المرور.",
    emailLabel: "عنوان البريد الإلكتروني",
    emailPlaceholder: "example@example.com",
    sendResetLink: "إرسال رابط إعادة التعيين",
    sending: "جاري الإرسال...",
    backToLogin: "تذكرت كلمة المرور؟ تسجيل الدخول",
    resetInfo: "إعادة تعيين كلمة المرور",
    resetInfoSubtitle: "طريقة آمنة وبسيطة لاستعادة الوصول إلى حسابك.",
    successMessage: "تحقق من بريدك الإلكتروني للحصول على رابط إعادة تعيين كلمة المرور.",

    validation: {
      emailRequired: "البريد الإلكتروني مطلوب",
      emailInvalid: "يرجى إدخال عنوان بريد إلكتروني صالح",
    },

    errors: {
      emailNotFound: "البريد الإلكتروني غير موجود في نظامنا",
      sendFailed: "فشل إرسال رابط إعادة التعيين. يرجى المحاولة مرة أخرى.",
    },
  },

  resetPassword: {
    title: "إعادة تعيين كلمة المرور",
    subtitle: "أدخل كلمة المرور الجديدة لاستعادة الوصول إلى حسابك.",
    newPasswordLabel: "كلمة المرور الجديدة",
    confirmPasswordLabel: "تأكيد كلمة المرور",
    passwordPlaceholder: "••••••••",
    resetButton: "إعادة تعيين كلمة المرور",
    resetting: "جاري إعادة التعيين...",
    backToLogin: "العودة إلى تسجيل الدخول",
    validating: "جاري التحقق من الرابط...",
    validatingMessage: "يرجى الانتظار بينما نتحقق من رمز إعادة التعيين.",
    invalidTitle: "رابط إعادة التعيين غير صالح",
    expirationMessage: "تنتهي صلاحية روابط إعادة التعيين بعد 60 دقيقة لأسباب أمنية.",
    requestNewLink: "طلب رابط إعادة تعيين جديد",
    redirectingIn5: "جاري التحويل خلال 5 ثواني...",
    redirectingToLogin: "جاري التحويل إلى صفحة تسجيل الدخول...",
    secureResetTitle: "إعادة تعيين كلمة المرور الآمنة",
    secureResetSubtitle: "أنشئ كلمة مرور قوية لحماية حسابك.",
    successMessage: "تم إعادة تعيين كلمة المرور بنجاح!",

    validation: {
      passwordRequired: "كلمة المرور مطلوبة",
      passwordMin: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
      confirmRequired: "يرجى تأكيد كلمة المرور",
      passwordsNotMatch: "كلمات المرور غير متطابقة",
    },

    errors: {
      expiredLink: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. قد يكون الرابط قد انتهت صلاحيته بعد 60 دقيقة.",
      invalidLink: "رابط إعادة التعيين غير صالح أو منتهي الصلاحية. يرجى طلب إعادة تعيين كلمة مرور جديدة.",
      missingToken: "رابط إعادة التعيين غير صالح. يرجى طلب إعادة تعيين كلمة مرور جديدة.",
      validationFailed: "يرجى التحقق من المدخلات والمحاولة مرة أخرى.",
      resetFailed: "فشل في إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى.",
    },
  },

  sidebar: {
    logoText: "توصيل PITS",
  },
  user: {
    // عناوين الصفحة
    title: "جدول المستخدمين",
    pageTitle: "إدارة المستخدمين",
    pageSubtitle: "إدارة مستخدمي النظام وصلاحياتهم",
    addSuccess: "تمت إضافة المستخدم بنجاح!",
    updateSuccess: "تم تحديث المستخدم بنجاح!",
    deleteSuccess: "تم حذف المستخدم بنجاح!",
    restoreSuccess: "تم استعادة المستخدم بنجاح!",
    permanentDeleteSuccess: "تم حذف المستخدم بشكل دائم!",
    bulkDeleteSuccess: "{count} مستخدم تم حذفهم بنجاح!",
    bulkRestoreSuccess: "{count} مستخدم تم استعادتهم بنجاح!",
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
    languages: {
      english: "الإنجليزية",
      arabic: "العربية",
    },
    sharedLine: "خطوط مشتركة",
    sharedLineHelp: "السماح لهذا المسؤول برؤية جميع الخطوط التي أنشأها المسؤول الأعلى",
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
    pageTitle: "إدارة السائقين",
    pageSubtitle: "إدارة سائقي التوصيل وتفاصيلهم",
    name: "الاسم",
    username: "اسم المستخدم",
    email: "البريد الإلكتروني",
    phoneNumber: "رقم الهاتف",
    status: "الحالة",
    type: "النوع",
    branchName: "الفرع",
    vehicleNumber: "رقم المركبة",
    searchPlaceholder: "ابحث عن السائقين...",
    addNew: "إضافة سائق",
    edit: "تعديل السائق",
    details: "تفاصيل السائق",
    delete: "حذف",
    actions: "الإجراءات",
    columns: "الأعمدة",
    filterByStatus: "تصفية حسب الحالة",
    activeDrivers: "السائقون النشطون",
    entitySingular: "سائق",
    entityPlural: "سائقين",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    addSuccess: "تمت إضافة السائق بنجاح",
    updateSuccess: "تم تحديث السائق بنجاح",
    deleteSuccess: "تم حذف السائق بنجاح",
    permanentDeleteSuccess: "تم حذف السائق نهائياً بنجاح",
    restoreSuccess: "تمت استعادة السائق بنجاح",
    bulkDeleteSuccess: "تم حذف {count} سائق بنجاح",
    bulkRestoreSuccess: "تمت استعادة {count} سائق بنجاح",
    workPlansFound: "خطط عمل موجودة",
    workPlansFoundTitle: "هذا السائق لديه خطط عمل مخصصة",
    deleteOptions: "يمكنك حذف السائق دون إعادة تعيين أو إعادة تعيين خطط العمل لسائق آخر أولاً.",
    selectDeleteOption: "اختر خيار الحذف",
    deleteWithoutReassign: "حذف بدون إعادة تعيين",
    deleteWithoutReassignDesc: "ستبقى خطط العمل غير مخصصة. يمكنك تعيينها لسائق آخر لاحقاً.",
    reassignToDriver: "إعادة التعيين لسائق آخر",
    reassignToDriverDesc: "نقل جميع خطط العمل إلى سائق آخر قبل الحذف.",
    deleteDriver: "حذف السائق",
    processing: "جاري المعالجة...",
    selectNewDriver: "اختر السائق الجديد",
    reassignWorkPlansTitle: "السائق لديه خطط عمل",
    workPlansFound: "تم العثور على خطط عمل",
    reassignRequired: "هذا السائق لديه خطط عمل. يرجى إعادة تعيينها لسائق آخر قبل الحذف.",
    cannotDelete: "لا يمكن حذف السائق",
    hasActiveSteps: "هذا السائق لديه خطوات خطة عمل غير معلقة ولا يمكن حذفه.",
    selectNewDriver: "اختر سائق جديد",
    chooseDriver: "اختر سائقاً...",
    reassignAndDelete: "إعادة التعيين والحذف",
    reassigning: "جاري إعادة تعيين خطط العمل...",
    reassignSuccess: "تم إعادة تعيين خطط العمل بنجاح",
    reassignFailed: "فشل في إعادة تعيين خطط العمل",
    orders: "طلبات",
    workPlans: "خطط العمل",
    addSuccess: "تم اضافة السائق بنجاح!",
    updateSuccess: "تم تحديث بيانات السائق بنجاح!",
    deleteSuccess: "تم حذف السائق بنجاح!",
    restoreSuccess: "تم استعادة السائق بنجاح!",
    bulkDeleteSuccess: "{count} سائق تم حذفهم بنجاح!",
    permanentDeleteSuccess: "تم حذف السائق نهائيًا",
    bulkDeleteSuccess: "تم حذف {count} سائق بنجاح",
    bulkPermanentDeleteSuccess: "تم حذف {count} سائق نهائيًا",
    bulkRestoreSuccess: "تم استرجاع {count} سائق بنجاح",
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
    entitySingular: "سائق",
    entityPlural: "سائقين",

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
    // عناوين الصفحة
    title: "جدول العملاء",
    pageTitle: "إدارة العملاء",
    pageSubtitle: "إدارة العملاء وتفاصيلهم",
    addSuccess: "تمت إضافة العميل بنجاح!",
    updateSuccess: "تم تحديث العميل بنجاح!",
    deleteSuccess: "تم حذف العميل بنجاح!",
    restoreSuccess: "تمت استعادة العميل بنجاح!",
    permanentDeleteSuccess: "تم حذف العميل نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} عميل بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} عميل بنجاح!",
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
    fullName: "الاسم الكامل",
    name: "الاسم",
    image: "الصورة",
    phoneNumber: "رقم الهاتف",
    landingPage: "الصفحة الرئيسية",
    language: "اللغة",
    location: "الموقع",
    companyName: "الشركة",

    // قيم الحالة
    active: "نشط",
    inactive: "غير نشط",
    activeCustomers: "العملاء النشطين",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "عميل",
    entityPlural: "عملاء",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByCompany: "تصفية حسب الشركة",
    filterByType: "تصفية حسب النوع",

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
      latitude: "خط العرض",
      latitudePlaceholder: "أدخل خط العرض (مثال: 31.5)",
      longitude: "خط الطول",
      longitudePlaceholder: "أدخل خط الطول (مثال: 34.4)",
      locationPicker: "محدد الموقع",
    },

    // رسائل التحقق
    validation: {
      nameRequired: "اسم العميل مطلوب",
      nameMax: "يجب ألا يتجاوز الاسم 255 حرفاً",
      nameMin: "يجب أن يكون الاسم 3 أحرف على الأقل",
      usernameRequired: "اسم المستخدم مطلوب",
      usernameMax: "يجب ألا يتجاوز اسم المستخدم 255 حرفاً",
      usernameExists: "اسم المستخدم موجود بالفعل",
      phoneRequired: "رقم الهاتف مطلوب",
      phoneMax: "يجب ألا يتجاوز رقم الهاتف 20 حرفاً",
      companyRequired: "الشركة مطلوبة",
      locationRequired: "الموقع مطلوب",
      latitudeInvalid: "خط العرض غير صالح (يجب أن يكون بين -90 و 90)",
      longitudeInvalid: "خط الطول غير صالح (يجب أن يكون بين -180 و 180)",
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
      latitudeInvalid: "خط العرض غير صالح (يجب أن يكون بين -90 و 90)",
      longitudeInvalid: "خط الطول غير صالح (يجب أن يكون بين -180 و 180)",
      imageRequired: "صورة الشركة مطلوبة",
      imageSize: "يجب ألا يتجاوز حجم الصورة 200 كيلوبايت",
      imageFormat: "يجب أن تكون الصورة بصيغة JPEG أو JPG أو PNG",
      branchNameRequired: "اسم الفرع مطلوب",
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
    addSuccess: "تمت إضافة الفرع بنجاح!",
    updateSuccess: "تم تحديث الفرع بنجاح!",
    deleteSuccess: "تم حذف الفرع بنجاح!",
    restoreSuccess: "تمت استعادة الفرع بنجاح!",
    permanentDeleteSuccess: "تم حذف الفرع نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} فرع بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} فرع بنجاح!",
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
    entitySingular: "فرع",
    entityPlural: "فروع",

    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    filterByLocation: "تصفية حسب الموقع",
    filterByCompany: "تصفية حسب الشركة",
    locations: {
      nablus: "نابلس",
      ramallah: "رام الله",
    },
    form: {
      name: "اسم الفرع",
      namePlaceholder: "أدخل اسم الفرع",
      location: "موقع الفرع",
      locationPlaceholder: "حدد موقع الفرع",
      latitude: "خط العرض",
      longitude: "خط الطول",
      latitudePlaceholder: "32.2270",
      longitudePlaceholder: "35.2544",
      locationPicker: "الموقع على الخريطة",

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
    addSuccess: "تمت إضافة الخط بنجاح!",
    updateSuccess: "تم تحديث الخط بنجاح!",
    deleteSuccess: "تم حذف الخط بنجاح!",
    restoreSuccess: "تمت استعادة الخط بنجاح!",
    permanentDeleteSuccess: "تم حذف الخط نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} خط بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} خط بنجاح!",
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
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التحديث",

    // قيم الحالة
    activeLines: "الخطوط النشطة",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "خط",
    entityPlural: "خطوط",

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
    addSuccess: "تمت إضافة سعر الخط بنجاح!",
    updateSuccess: "تم تحديث سعر الخط بنجاح!",
    deleteSuccess: "تم حذف سعر الخط بنجاح!",
    restoreSuccess: "تمت استعادة سعر الخط بنجاح!",
    permanentDeleteSuccess: "تم حذف سعر الخط نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} سعر خط بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} سعر خط بنجاح!",
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
    line: "الخط",
    price: "السعر",
    currency: "العملة",
    type: "النوع",
    company: "الشركة",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التحديث",

    // قيم الحالة
    activeLinePrices: "أسعار الخطوط النشطة",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "سعر خط",
    entityPlural: "أسعار الخطوط",

    // الرسائل
    noData: "لا توجد بيانات متاحة",
    rowsPerPage: "عدد الصفوف في الصفحة",
    showingEntries: "عرض {from} إلى {to} من {total} إدخال",

    // الفلاتر
    filterByCompany: "تصفية حسب الشركة",

    // حقول النموذج
    form: {
      line: "الخط",
      linePlaceholder: "اختر الخط",
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
      pricePositive: "يجب أن يكون السعر أكبر من 0",
      currencyRequired: "العملة مطلوبة",
      companyRequired: "الشركة مطلوبة",
      typeRequired: "النوع مطلوب",
      invalidType: "النوع المحدد غير صالح. الخيارات الصحيحة: إرجاع، توصيل",
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
    addSuccess: "تمت إضافة عمل الخط بنجاح!",
    updateSuccess: "تم تحديث عمل الخط بنجاح!",
    deleteSuccess: "تم حذف عمل الخط بنجاح!",
    restoreSuccess: "تمت استعادة عمل الخط بنجاح!",
    permanentDeleteSuccess: "تم حذف عمل الخط نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} عمل خط بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} عمل خط بنجاح!",
    // الإجراءات
    searchPlaceholder: "البحث عن خطوط العمل...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة خط عمل",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    actions: "الإجراءات",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "خط عمل",
    entityPlural: "خطوط عمل",

    // أعمدة الجدول
    id: "المعرف",
    name: "اسم خط العمل",
    company: "الشركة",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التحديث",

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
    addSuccess: "تمت إضافة المنطقة بنجاح!",
    updateSuccess: "تم تحديث المنطقة بنجاح!",
    deleteSuccess: "تم حذف المنطقة بنجاح!",
    restoreSuccess: "تمت استعادة المنطقة بنجاح!",
    permanentDeleteSuccess: "تم حذف المنطقة نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} منطقة بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} منطقة بنجاح!",
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
      nameEnglish: "الاسم بالإنجليزية",
      nameEnglishPlaceholder: "أدخل اسم المنطقة بالإنجليزية",
      nameArabic: "الاسم بالعربية",
      nameArabicPlaceholder: "أدخل اسم المنطقة بالعربية",

      timezone: "المنطقة الزمنية ",
      timezonePlaceholder: "ادخل المنطقة الزمنية",
    },

    // رسائل التحقق
    validation: {
      nameRequired: "اسم المنطقة مطلوب",
      nameMax: "يجب ألا يتجاوز 255 حرفاً",
      nameEnglishRequired: "الاسم بالإنجليزية مطلوب",
      nameArabicRequired: "الاسم بالعربية مطلوب",

      keyRequired: "مفتاح المنطقة مطلوب",

      timezoneMax: "يجب ألا يتجاوز 50 حرفاً",
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
    popup: {
      company: "الشركة",
      branch: "الفرع",
      coordinates: "الإحداثيات",
      viewDetails: "عرض تفاصيل الشركة",
    },
  },

  orders: {
    // عناوين الصفحة
    title: "إدارة الطلبات",
    pageTitle: "إدارة الطلبات",
    pageSubtitle: "إدارة طلبات التوصيل وتتبع حالتها",
    addSuccess: "تمت إضافة الطلب بنجاح!",
    updateSuccess: "تم تحديث الطلب بنجاح!",
    deleteSuccess: "تم حذف الطلب بنجاح!",
    restoreSuccess: "تمت استعادة الطلب بنجاح!",
    permanentDeleteSuccess: "تم حذف الطلب نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} طلب بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} طلب بنجاح!",
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
      deliveryPrice: "سعر التوصيل",
      totalPrice: "السعر الإجمالي",
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
      selectCurrency: "اختر العملة",
      selectLinePrice: "اختر سعر الخط",
      selectCompanyPrice: "اختر سعر الشركة",
      selectBranch: "اختر الفرع",
      selectParentOrder: "اختر الطلب الأصلي",
      price: "السعر",
      totalPrice: "السعر الإجمالي",
      pricePlaceholder: "أدخل مبلغ السعر",
      deliveryPrice: "سعر التوصيل",
      returnPrice: "سعر الإرجاع",
      currencyId: "العملة",
      linepriceId: "سعر الخط",
      discountId: "الخصم",
      noDiscount: "بدون خصم",
      companyItemPriceId: "سعر عنصر الشركة",
      type: "نوع الطلب",
      typeDelivery: "توصيل",
      typeReturn: "إرجاع",
      typeExchange: "تبديل",
      package: "نوع الحزمة",
      packageOne: "حزمة واحدة",
      packageMulti: "حزم متعددة",
      case: "نوع الحالة",
      caseFull: "كامل",
      casePart: "جزئي",
      caseFast: "سريع",
      deliveryPriceFromCustomer:
        "\u0633\u0639\u0631\u0020\u0627\u0644\u062a\u0648\u0635\u064a\u0644\u0020\u0645\u0646\u0020\u0627\u0644\u0639\u0645\u064a\u0644",
      priceFromCustomer:
        "\u0627\u0644\u0633\u0639\u0631\u0020\u0645\u0646\u0020\u0627\u0644\u0639\u0645\u064a\u0644",
      parentOrderId: "الطلب الأصلي",
      noParentOrder: "لا يوجد طلب أصلي",
      companyId: "الشركة",
      branchCustomerCompanyId: "من الفرع",
      branchDeliveryCompanyId: "إلى الفرع",
    },

    // المعالج
    wizard: {
      title: "إنشاء طلب جديد",
      // اختيار الوضع (3 تبويبات)
      modeDelivery: "توصيل",
      modeReturn: "إرجاع",
      modeExchange: "تبديل",
      modeDeliveryDesc: "إنشاء طلب توصيل جديد لإرسال عناصر للعميل",
      modeReturnDesc: "إنشاء طلب إرجاع لاستلام عناصر من العميل",
      modeExchangeDesc:
        "تبديل طلب قائم - العميل يُرجع عناصر ويستلم عناصر جديدة",
      // الخطوات
      step1: "المعلومات الأساسية",
      step2: "التسعير والتفاصيل",
      step3: "عناصر الطلب",
      stepSelectOrder: "اختر الطلب",
      stepSelectParent: "اختر الطلب الأصلي",
      selectParentForReturn: "اختر الطلب الأصلي للإرجاع",
      // عناوين المحتوى
      basicInfo: "معلومات الطلب الأساسية",
      pricingDetails: "التسعير والتفاصيل",
      orderItems: "عناصر الطلب",
      selectOriginalOrder: "اختر الطلب الأصلي للتبديل",
      originalOrder: "الطلب الأصلي",
      selectedOrderDetails: "تفاصيل الطلب المحدد",
      // خاص بالتبديل
      caseDelivery: "نوع حالة التوصيل",
      caseReturn: "نوع حالة الإرجاع",
      newDeliveryPrice: "سعر التوصيل الجديد",
      originalOrderPrice: "سعر الطلب الأصلي (الإرجاع)",
      exchangeItem: "عنصر التبديل",
      exchangeItemsInfo:
        "أضف العناصر التي سيتم توصيلها للعميل والعناصر التي سيتم إرجاعها",
      noDeliveryItems: "لا توجد عناصر توصيل مضافة",
      noReturnItems: "لا توجد عناصر إرجاع مضافة",
      // العناصر
      itemsList: "قائمة عناصر الطلب",
      addItem: "إضافة عنصر",
      nestedItems: "العناصر الفرعية",
      deliveryItems: "عناصر التوصيل",
      returnItems: "عناصر الإرجاع",
      addDeliveryItem: "إضافة عنصر توصيل",
      addReturnItem: "إضافة عنصر إرجاع",
      addNestedItem: "إضافة عنصر فرعي",
      noItems: "لم يتم إضافة عناصر بعد. انقر على 'إضافة عنصر' للبدء.",
      noNestedItems: "لا توجد عناصر فرعية مضافة",
      fromParentOrder: "من الطلب الأصلي",
      returnItemsFromParent:
        "هذه العناصر من الطلب الأصلي. يمكنك إزالة العناصر أو تعديل الكميات.",
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
      parentOrderPriceMissing: "سعر الطلب الأصلي مطلوب للتبديل",
      noOrderItems: "مطلوب عنصر واحد على الأقل في الطلب",
      singlePackageOneItem:
        "الطلبات أحادية الحزمة يجب أن تحتوي على عنصر واحد فقط",
      multiPackageMinItems:
        "الطلبات متعددة الحزم يجب أن تحتوي على عنصرين على الأقل",
      incompleteOrderItem:
        "عنصر الطلب {index} غير مكتمل. يرجى ملء جميع الحقول المطلوبة.",
      sameBranchNotAllowed:
        "عنصر الطلب {index} يجب أن يستخدم فروعاً مختلفة للعميل والتوصيل.",
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
      detailsTab: "التفاصيل",
      exchangedTab: "التبديل",
      notExchanged: "غير مبدّل",
      noExchange: "لم يتم تبديل هذا الطلب.",
    },

    // تفاصيل طلب التبديل (للصف القابل للتوسيع)
    exchange: {
      title: "تفاصيل طلب التبديل",
      childOrders: "طلبات التبديل",
      deliveryPart: "جزء التوصيل",
      returnPart: "جزء الإرجاع",
      parentOrder: "الطلب الأصلي",
      viewExchange: "عرض التبديل",
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

  statistics: {
    title: "الإحصائيات",
    goToOrder: "الذهاب إلى الطلب",
    tabs: {
      orders: "الطلبات",
      drivers: "السائقين",
      customers: "العملاء",
      lineWork: "خطوط العمل",
      lines: "الخطوط",
    },
    labels: {
      totalCustomers: "إجمالي العملاء",
      bestCustomers: "أفضل العملاء",
      totalLineWorks: "إجمالي خطوط العمل",
      lineWorkDrivers: "سائقي خطوط العمل",
      lineWorkName: "خط العمل",
      driversCount: "عدد السائقين",
      totalLines: "إجمالي الخطوط",
      mostUsedLines: "الخطوط الأكثر استخداماً",
      linesByRegion: "الخطوط حسب المنطقة",
      regionName: "المنطقة",
      linesCount: "عدد الخطوط",
      totalDrivers: "إجمالي السائقين",
      availableDrivers: "السائقون المتاحون",
      busyDrivers: "السائقون المشغولون",
      holidayDrivers: "في إجازة",
      deliveryTime: "وقت التوصيل",
      minimumHours: "الحد الأدنى من الساعات",
      maximumHours: "الحد الأقصى من الساعات",
    },
  },

  // مفاتيح ترجمة حالة الطلب
  orderStatus: {
    pending: "في الانتظار",
    inprocess: "قيد التنفيذ",
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
    addSuccess: "تمت إضافة الخصم بنجاح!",
    updateSuccess: "تم تحديث الخصم بنجاح!",
    deleteSuccess: "تم حذف الخصم بنجاح!",
    restoreSuccess: "تمت استعادة الخصم بنجاح!",
    permanentDeleteSuccess: "تم حذف الخصم نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} خصم بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} خصم بنجاح!",
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
      customer: "العميل",
      region: "المنطقة",
      line: "الخط",
      selectCustomer: "اختر العميل",
      selectRegion: "اختر المنطقة",
      selectLine: "اختر الخط",
      priceValue: "السعر",
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
    addSuccess: "تمت إضافة خط السائق بنجاح!",
    updateSuccess: "تم تحديث خط السائق بنجاح!",
    deleteSuccess: "تم حذف خط السائق بنجاح!",
    restoreSuccess: "تمت استعادة خط السائق بنجاح!",
    permanentDeleteSuccess: "تم حذف خط السائق نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} خط سائق بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} خط سائق بنجاح!",
    // الإجراءات
    searchPlaceholder: "البحث في تعيينات خطوط السائقين...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "تعيين سائق لخط",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "خط سائق",
    entityPlural: "خطوط السائقين",

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
    addSuccess: "تمت إضافة سعر الشركة بنجاح!",
    updateSuccess: "تم تحديث سعر الشركة بنجاح!",
    deleteSuccess: "تم حذف سعر الشركة بنجاح!",
    restoreSuccess: "تمت استعادة سعر الشركة بنجاح!",
    permanentDeleteSuccess: "تم حذف سعر الشركة نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} سعر شركة بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} سعر شركة بنجاح!",
    // الإجراءات
    searchPlaceholder: "البحث في أسعار الشركات...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة سعر",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    bulkDelete: "حذف المحدد",
    bulkRestore: "استعادة المحدد",
    actions: "الإجراءات",

    // أسماء الكيانات للإجراءات الجماعية
    entitySingular: "سعر شركة",
    entityPlural: "أسعار الشركات",

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
    addSuccess: "تمت إضافة العملة بنجاح!",
    updateSuccess: "تم تحديث العملة بنجاح!",
    deleteSuccess: "تم حذف العملة بنجاح!",
    restoreSuccess: "تمت استعادة العملة بنجاح!",
    permanentDeleteSuccess: "تم حذف العملة نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} عملة بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} عملة بنجاح!",
    // الإجراءات
    searchPlaceholder: "البحث في العملات...",
    search: "بحث",
    columns: "الأعمدة",
    addNew: "إضافة عملة",
    export: "تصدير",
    edit: "تعديل",
    delete: "حذف",
    details: "تفاصيل العملة",
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

    details: {
      id: "المعرف",
      key: "الرمز",
      nameEnglish: "الاسم (بالإنجليزية)",
      nameArabic: "الاسم (بالعربية)",
      symbol: "الرمز",
      status: "الحالة",
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
      details: "التفاصيل",
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
    order: "طلب",
    title: "ادارة خطط العمل",
    addSuccess: "تمت إضافة خطة العمل بنجاح!",
    updateSuccess: "تم تحديث خطة العمل بنجاح!",
    deleteSuccess: "تم حذف خطة العمل بنجاح!",
    restoreSuccess: "تمت استعادة خطة العمل بنجاح!",
    permanentDeleteSuccess: "تم حذف خطة العمل نهائياً!",
    bulkDeleteSuccess: "تم حذف {count} خطة عمل بنجاح!",
    bulkRestoreSuccess: "تمت استعادة {count} خطة عمل بنجاح!",
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
    orderItems: 'عناصر الطلب',
    driver: 'السائق',
    status: {
      pending: 'قيد الانتظار',
      start: 'بدأ',
      pickup: 'تم الاستلام',
      done: 'مكتمل',
      failed: 'فشل',
    },
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

      filterByLine: "فلترة حسب الخط",
      filterByCase: "فلترة حسب الحالة"
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
    cases: {
      full: "كامل",
      part: "جزئي",
      fast: "سريع",

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
      english: "الإنجليزية",
      arabic: "العربية",
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

  collection: {
    title: "التحصيلات",
    id: "المعرف",
    invoiceCode: "رمز الفاتورة",
    driverName: "اسم السائق",
    note: "ملاحظة",
    status: "الحالة",
    actions: "الإجراءات",
    edit: "تعديل",
    details: "التفاصيل",
    searchPlaceholder: "البحث عن التحصيلات...",
    filterByStatus: "تصفية حسب الحالة",
    markAsPaid: "وضع علامة كمدفوع",
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التحديث",
    makeInvoice: "إنشاء فاتورة",
    createInvoiceTitle: "إنشاء فاتورة",
    createInvoiceConfirm:
      "هل أنت متأكد من إنشاء فاتورة لـ {count} تحصيلات؟",
    invoiceCreatedSuccess: "تم إنشاء الفاتورة بنجاح!",

    form: {
      status: "الحالة",
      note: "ملاحظة",
      notePlaceholder: "أدخل ملاحظة...",
    },
    entitySingular: "تحصيل",
    entityPlural: "تحصيلات",
  },

  collectionStatus: {
    pending: "قيد الانتظار",
    completed: "مكتمل",
    failed: "فشل",
  },

  // الترجمات المشتركة
  common: {
    create: "انشاء",

    actions: "الإجراءات",
    noDataAvailable: "لا توجد بيانات",
    uploadImage: "رفع صورة",
    remove: "حذف",
    order: "طلب",
    items: "عناصر",
    selectOrder: "اختر الطلب",
    selectItems: "اختر العناصر",
    restore: "استعادة",
    permanentDelete: "حذف نهائي",
    noCompanyAssigned: "لا توجد شركة معينة",
    selectMultiple: "اختر عدة عناصر",
    selected: "محدد",
    selectOrderFirst: "الرجاء اختيار طلب أولاً",

    save: "حفظ",
    cancel: "إلغاء",
    locateOnMap: "تحديد الموقع على الخريطة",
    selectLocation: "اختر الموقع",
    mapClickHint: "انقر على الخريطة لتحديد الموقع.",
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
    expand: "توسيع",
    collapse: "طي",
    saveChanges: "حفظ التغييرات",
    confirmCancel:
      "هل أنت متأكد من الإلغاء؟ سيتم فقدان جميع التغييرات غير المحفوظة.",
    deleteConfirmMessage: "هل أنت متأكد من حذف هذا العنصر؟",
    validation: {
      requiredField: "{field} مطلوب",
      invalidEmail: "صيغة البريد الإلكتروني غير صحيحة",
      minLength: "يجب أن يكون على الأقل {min} حرف",
      imageRequired: "الصورة مطلوبة",
      invalidImageFile: "يرجى اختيار ملف صورة صالح",
      imageMaxSize: "يجب ألا يتجاوز حجم الصورة {size} ميجابايت",
      orderRowRequired: "الطلب والعناصر مطلوبة",
      branchNameRequired: "اسم الفرع مطلوب",
    },

    bulkDeleteConfirmTitle: "تأكيد الحذف الجماعي",
    bulkDeleteConfirmMessage: "هل أنت متأكد من حذف {count} {entity}؟",
    bulkRestoreConfirmTitle: "تأكيد الاستعادة الجماعية",
    bulkRestoreConfirmMessage: "هل أنت متأكد من استعادة {count} {entity}؟",
    bulkDeleteConfirm: "هل أنت متأكد من حذف {count} {entity}؟",
    bulkPermanentDeleteConfirm:
      "هل أنت متأكد من الحذف النهائي لـ {count} {entity}؟",
    bulkRestoreConfirm: "هل أنت متأكد من استعادة {count} {entity}؟",

    all: "الكل",
    ok: "موافق",
    success: "نجح!",
    operationSuccess: "تمت العملية بنجاح",
  },

  payment: {
    createdAt: "تاريخ الإنشاء",
    updatedAt: "تاريخ التحديث",
  },
  collections: {
    makeInvoice: "إنشاء فاتورة",
    createInvoiceTitle: "إنشاء فاتورة",
    createInvoiceConfirm: "هل أنت متأكد من إنشاء فاتورة لـ {count} تحصيل؟",
    invoiceCreatedSuccess: "تم إنشاء الفاتورة بنجاح!",
  },
  invoice: {
    title: "الفواتير",
    searchPlaceholder: "ابحث عن فاتورة...",
    filterByStatus: "فلتر حسب الحالة",
    id: "رقم الفاتورة",
    invoiceCode: "رمز الفاتورة",
    deliveryCompany: "شركة التوصيل",
    clientCompany: "شركة العميل",
    collectionAmount: "مبلغ التحصيل",
    dueAmount: "المبلغ المستحق",
    periodStart: "بداية الفترة",
    periodEnd: "نهاية الفترة",
    status: "الحالة",
    createdAt: "تاريخ الإنشاء",
    actions: "الإجراءات",
    details: "التفاصيل",
    delete: "حذف",
    deleteConfirm: "هل أنت متأكد من حذف هذه الفاتورة؟",
    permanentDeleteConfirm: "هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع!",
    trashedInvoices: "الفواتير المحذوفة",
    noTrashedInvoices: "لا توجد فواتير محذوفة",
    entitySingular: "فاتورة",
    entityPlural: "فواتير",
    exportPDF: "تصدير PDF",
    logoPlaceholder: "شعارك هنا",
    number: "رقم",
    date: "التاريخ",
    billedTo: "الفاتورة إلى",
    from: "من",
    item: "البند",
    quantity: "الكمية",
    price: "السعر",
    amount: "المبلغ",
    total: "الإجمالي",
    paymentMethod: "طريقة الدفع",
    cash: "نقدي",
    note: "ملاحظة",
    thankYou: "شكراً لاختياركم لنا!",
    generatedOn: "تم الإنشاء في",
    companyName: "اسم شركتك",
    invoiceDate: "تاريخ الفاتورة",
    orderCode: "رمز الطلب",
    totalPrice: "السعر الإجمالي",
    deliveryPrice: "سعر التوصيل",
    poweredBy: "بواسطة",
    noCollections: "لا يوجد تحصيلات",
    markAsPaid: "مدفوع",
    to: "الى",
  },

  invoiceStatus: {
    pending: "قيد الانتظار",
    completed: "مكتملة",
  },

  // إدارة الصلاحيات
  permissions: {
    title: "إدارة الصلاحيات",
    subtitle: "إدارة صلاحيات المستخدمين والتحكم في الوصول",
    searchUsers: "البحث عن مستخدمين...",
    availablePermissions: "الصلاحيات المتاحة",
    noPermissions: "لا توجد صلاحيات متاحة",
    userPermissions: "صلاحيات المستخدم",
    noPermissionsAvailable: "لا توجد صلاحيات متاحة",
    noUsersFound: "لم يتم العثور على مستخدمين",
  },
};
