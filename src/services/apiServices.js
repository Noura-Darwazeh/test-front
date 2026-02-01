import api from "./api.js";

// ===== Helper Functions =====
const containsFile = (value) => {
  if (!value) return false;
  if (typeof File !== "undefined" && value instanceof File) return true;
  if (typeof Blob !== "undefined" && value instanceof Blob) return true;
  if (typeof FileList !== "undefined" && value instanceof FileList) {
    return Array.from(value).some((entry) => containsFile(entry));
  }
  if (value instanceof FormData) {
    for (const entry of value.values()) {
      if (containsFile(entry)) return true;
    }
    return false;
  }
  if (Array.isArray(value)) {
    return value.some((entry) => containsFile(entry));
  }
  if (typeof value === "object") {
    return Object.values(value).some((entry) => containsFile(entry));
  }
  return false;
};

const toFormData = (data) => {
  const formData = new FormData();
  Object.keys(data || {}).forEach((key) => {
    const value = data[key];
    if (value === null || value === undefined || value === "") {
      return;
    }
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry !== null && entry !== undefined && entry !== "") {
          formData.append(`${key}[]`, entry);
        }
      });
      return;
    }
    formData.append(key, value);
  });
  return formData;
};

// ===== API Services Singleton =====
class ApiServices {
  constructor() {
    if (ApiServices.instance) {
      return ApiServices.instance;
    }
    ApiServices.instance = this;
    this.pendingRequests = new Map();
  }

  _buildCancelKey(method, url, cancelKey) {
    if (cancelKey) return cancelKey;
    const baseUrl = url.split("?")[0];
    return `${String(method).toUpperCase()}:${baseUrl}`;
  }

  _cancelPendingRequest(cancelKey) {
    const controller = this.pendingRequests.get(cancelKey);
    if (!controller) return;
    controller.abort();
    this.pendingRequests.delete(cancelKey);
  }

  async request(method, url, config = {}) {
    const { cancelKey, ...axiosConfig } = config || {};
    const requestKey = this._buildCancelKey(method, url, cancelKey);
    this._cancelPendingRequest(requestKey);

    const controller = new AbortController();
    this.pendingRequests.set(requestKey, controller);

    try {
      return await api.request({
        method,
        url,
        ...axiosConfig,
        signal: controller.signal,
      });
    } finally {
      const current = this.pendingRequests.get(requestKey);
      if (current === controller) {
        this.pendingRequests.delete(requestKey);
      }
    }
  }

  cancelAllRequests() {
    this.pendingRequests.forEach((controller) => {
      controller.abort();
    });
    this.pendingRequests.clear();
  }

  get(url, config) {
    return this.request("get", url, config);
  }

  post(url, data, config) {
    return this.request("post", url, { ...config, data });
  }

  patch(url, data, config) {
    return this.request("patch", url, { ...config, data });
  }

  delete(url, config) {
    return this.request("delete", url, config);
  }

  // ===== Dynamic CRUD Methods =====
  async getEntities(entityPlural, { page = 1, perPage = 10, cancelKey } = {}) {
    return this.get(`/${entityPlural}`, {
      params: { page, per_page: perPage },
      cancelKey: cancelKey ?? `${entityPlural}:list`,
    });
  }

  async getEntityById(entityPlural, id) {
    return this.get(`/${entityPlural}/${id}`);
  }

  async getTrashedEntities(entityPlural, { page = 1, perPage = 10, cancelKey } = {}) {
    return this.get(`/trashed/${entityPlural}`, {
      params: { page, per_page: perPage },
      cancelKey: cancelKey ?? `${entityPlural}:list`,
    });
  }

  async createEntity(entityPlural, data) {
    const hasFile = containsFile(data);
    const isFormData = data instanceof FormData;

    if (hasFile && !isFormData) {
      data = toFormData(data);
    }

    return this.post(`/${entityPlural}`, data, {
      headers:
        hasFile || data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
    });
  }

  async updateEntity(entityPlural, id, data) {
    const hasFile = containsFile(data);
    const isFormData = data instanceof FormData;

    if (hasFile && !isFormData) {
      data = toFormData(data);
    }

    if (hasFile || isFormData) {
      return this.post(`/${entityPlural}/${id}`, data, {
        headers: {
          "X-HTTP-Method-Override": "PATCH",
          "Content-Type": "multipart/form-data",
        },
      });
    }

    return this.patch(`/${entityPlural}/${id}`, data);
  }

  async deleteEntity(entityPlural, id, force = false) {
    const endpoint = `/${entityPlural}/${id}?force=${force ? 1 : 0}`;
    return this.delete(endpoint);
  }

  async restoreEntity(entityPlural, id) {
    return this.post(`/restore/${entityPlural}/${id}`);
  }

  async bulkDeleteEntities(entitySingular, entityPlural, ids, force = false) {
    const endpoint = `/bulk-delete/${entitySingular}/${entityPlural}?force=${force ? 1 : 0
      }`;
    return this.delete(endpoint, {
      data: { ids },
    });
  }

  async bulkRestoreEntities(entitySingular, entityPlural, ids) {
    return this.post(`/bulk-restore/${entitySingular}/${entityPlural}`, { ids });
  }

  // ===== Authentication Services =====
  async login(credentials) {
    return this.post("/login", credentials);
  }

  async forgotPassword(email) {
    return this.post("/forgot_password", { email });
  }

  async resetPassword(data) {
    return this.post("/reset_password", data, {
      params: {
        token: data.token,
        email: data.email,
      },
    });
  }

  async getUserProfile(userId) {
    return this.get(`/users/${userId}`);
  }

  async changePassword(passwordData) {
    return this.patch("/change_password", passwordData);
  }

  // ===== User Services =====
  async getUsers({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/users", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "users:list",
    });
  }

  async getTrashedUsers({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/trashed/users", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "users:list",
    });
  }

  async createUser(userData) {
    return this.createEntity("users", userData);
  }

  async updateUser(userId, userData) {
    return this.updateEntity("users", userId, userData);
  }

  async deleteUser(userId, force = false) {
    return this.deleteEntity("users", userId, force);
  }

  async restoreUser(userId) {
    return this.restoreEntity("users", userId);
  }

  async bulkDeleteUsers(userIds, force = false) {
    return this.bulkDeleteEntities("user", "users", userIds, force);
  }

  async bulkRestoreUsers(userIds) {
    return this.bulkRestoreEntities("user", "users", userIds);
  }

  // ===== Driver Services =====
  async getDrivers({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/drivers", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "drivers:list",
    });
  }

  async getTrashedDrivers({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/trashed/drivers", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "drivers:list",
    });
  }

  async createDriver(driverData) {
    return this.createEntity("drivers", driverData);
  }

  async updateDriver(driverId, driverData) {
    return this.updateEntity("drivers", driverId, driverData);
  }

  async deleteDriver(driverId, force = false) {
    return this.deleteEntity("drivers", driverId, force);
  }

  async restoreDriver(driverId) {
    return this.restoreEntity("drivers", driverId);
  }

  async bulkDeleteDrivers(driverIds, force = false) {
    return this.bulkDeleteEntities("driver", "drivers", driverIds, force);
  }

  async bulkRestoreDrivers(driverIds) {
    return this.bulkRestoreEntities("driver", "drivers", driverIds);
  }

  // ===== Currency Services =====
  async getCurrencies({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("currencies", { page, perPage });
  }

  async getTrashedCurrencies({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("currencies", { page, perPage });
  }

  async createCurrency(currencyData) {
    return this.createEntity("currencies", currencyData);
  }

  async updateCurrency(currencyId, currencyData) {
    try {
      return this.patch(`/currencies/${currencyId}`, currencyData, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
    } catch (error) {
      console.error('❌ Error updating currency:', error);
      throw error;
    }
  }

  async deleteCurrency(currencyId, force = false) {
    return this.deleteEntity("currencies", currencyId, force);
  }

  async restoreCurrency(currencyId) {
    return this.restoreEntity("currencies", currencyId);
  }

  async bulkDeleteCurrencies(currencyIds, force = false) {
    return this.bulkDeleteEntities(
      "currency",
      "currencies",
      currencyIds,
      force,
    );
  }

  async bulkRestoreCurrencies(currencyIds) {
    return this.bulkRestoreEntities("currency", "currencies", currencyIds);
  }

  // ===== Branches Services =====
  async getBranches({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("branches", { page, perPage });
  }

  async getTrashedBranches({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("branches", { page, perPage });
  }

  async createBranch(branchData) {
    return this.createEntity("branches", branchData);
  }

  async updateBranch(branchId, branchData) {
    return this.updateEntity("branches", branchId, branchData);
  }

  async deleteBranch(branchId, force = false) {
    return this.deleteEntity("branches", branchId, force);
  }

  async restoreBranch(branchId) {
    return this.restoreEntity("branches", branchId);
  }

  async bulkDeleteBranches(branchIds, force = false) {
    return this.bulkDeleteEntities("branch", "branches", branchIds, force);
  }

  async bulkRestoreBranches(branchIds) {
    return this.bulkRestoreEntities("branch", "branches", branchIds);
  }

  // ===== Customer Services =====
  async getCustomers({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/customers", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "customers:list",
    });
  }

  async getTrashedCustomers({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/trashed/customers", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "customers:list",
    });
  }

  async createCustomer(customerData) {
    return this.createEntity("customers", customerData);
  }

  async updateCustomer(customerId, customerData) {
    return this.updateEntity("customers", customerId, customerData);
  }

  async deleteCustomer(customerId, force = false) {
    return this.deleteEntity("customers", customerId, force);
  }

  async restoreCustomer(customerId) {
    return this.restoreEntity("customers", customerId);
  }

  async bulkDeleteCustomers(customerIds, force = false) {
    return this.bulkDeleteEntities("customer", "customers", customerIds, force);
  }

  async bulkRestoreCustomers(customerIds) {
    return this.bulkRestoreEntities("customer", "customers", customerIds);
  }

  // ===== Company Services =====
  async getCompanies({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("companies", { page, perPage });
  }

  async getTrashedCompanies({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("companies", { page, perPage });
  }

  async createCompany(companyData) {
    if (companyData.branches && companyData.branches.length > 0) {
      const formData = new FormData();
      formData.append("name", companyData.name);
      formData.append("type", companyData.type);

      companyData.branches.forEach((branch, index) => {
        if (branch.name && branch.name.trim() !== "") {
          formData.append(`branches[${index}][name]`, branch.name);
          if (branch.latitude !== undefined && branch.latitude !== "") {
            formData.append(`branches[${index}][latitude]`, branch.latitude);
          }
          if (branch.longitude !== undefined && branch.longitude !== "") {
            formData.append(`branches[${index}][longitude]`, branch.longitude);
          }
        }
      });

      return this.post("/companies", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    return this.createEntity("companies", companyData);
  }

  async updateCompany(companyId, companyData) {
    if (companyData.branches && companyData.branches.length > 0) {
      const formData = new FormData();
      formData.append("name", companyData.name);
      formData.append("type", companyData.type);

      companyData.branches.forEach((branch, index) => {
        if (branch.name && branch.name.trim() !== "") {
          formData.append(`branches[${index}][name]`, branch.name);
          if (branch.latitude !== undefined && branch.latitude !== "") {
            formData.append(`branches[${index}][latitude]`, branch.latitude);
          }
          if (branch.longitude !== undefined && branch.longitude !== "") {
            formData.append(`branches[${index}][longitude]`, branch.longitude);
          }
        }
      });

      return this.post(`/companies/${companyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "X-HTTP-Method-Override": "PATCH",
        },
      });
    }

    return this.updateEntity("companies", companyId, companyData);
  }

  async deleteCompany(companyId, force = false) {
    return this.deleteEntity("companies", companyId, force);
  }

  async restoreCompany(companyId) {
    return this.restoreEntity("companies", companyId);
  }

  async bulkDeleteCompanies(companyIds, force = false) {
    return this.bulkDeleteEntities("company", "companies", companyIds, force);
  }

  async bulkRestoreCompanies(companyIds) {
    return this.bulkRestoreEntities("company", "companies", companyIds);
  }

  // ===== Line Price Services =====
  async getLinePrices({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("line_prices", { page, perPage });
  }

  async getTrashedLinePrices({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("line_prices", { page, perPage });
  }

  async createLinePrice(priceData) {
    return this.createEntity("line_prices", priceData);
  }

  async updateLinePrice(priceId, priceData) {
    return this.updateEntity("line_prices", priceId, priceData);
  }

  async deleteLinePrice(priceId, force = false) {
    return this.deleteEntity("line_prices", priceId, force);
  }

  async restoreLinePrice(priceId) {
    return this.restoreEntity("line_prices", priceId);
  }

  async bulkDeleteLinePrices(priceIds, force = false) {
    return this.bulkDeleteEntities(
      "line_price",
      "line_prices",
      priceIds,
      force,
    );
  }

  async bulkRestoreLinePrices(priceIds) {
    return this.bulkRestoreEntities("line_price", "line_prices", priceIds);
  }

  // ===== Lines Services =====
  async getLines({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("lines", { page, perPage });
  }

  async getTrashedLines({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("lines", { page, perPage });
  }

  async createLine(lineData) {
    return this.createEntity("lines", lineData);
  }

  async updateLine(lineId, lineData) {
    return this.updateEntity("lines", lineId, lineData);
  }

  async deleteLine(lineId, force = false) {
    return this.deleteEntity("lines", lineId, force);
  }

  async restoreLine(lineId) {
    return this.restoreEntity("lines", lineId);
  }

  async bulkDeleteLines(lineIds, force = false) {
    return this.bulkDeleteEntities("line", "lines", lineIds, force);
  }

  async bulkRestoreLines(lineIds) {
    return this.bulkRestoreEntities("line", "lines", lineIds);
  }

  // ===== Regions Services =====
  async getRegions({ page = 1, perPage = 10 } = {}) {
    return this.get(`/regions?page=${page}&per_page=${perPage}`);
  }

  async getTrashedRegions({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("regions", { page, perPage });
  }

  async createRegion(regionData) {
    return this.post("/regions", regionData);
  }

  async updateRegion(regionId, regionData) {
    return this.updateEntity("regions", regionId, regionData);
  }

  async deleteRegion(regionId, force = false) {
    return this.deleteEntity("regions", regionId, force);
  }

  async restoreRegion(regionId) {
    return this.restoreEntity("regions", regionId);
  }

  async bulkDeleteRegions(regionIds, force = false) {
    return this.bulkDeleteEntities("region", "regions", regionIds, force);
  }

  async bulkRestoreRegions(regionIds) {
    return this.bulkRestoreEntities("region", "regions", regionIds);
  }

  // ===== Company Price Services =====
  async getCompanyPrices({ page = 1, perPage = 10 } = {}) {
    return this.get(`/company_item_prices?page=${page}&per_page=${perPage}`);
  }

  async getTrashedCompanyPrices({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("company_item_prices", { page, perPage });
  }

  async createCompanyPrice(priceData) {
    return this.createEntity("company_item_prices", priceData);
  }

  async updateCompanyPrice(priceId, priceData) {
    return this.updateEntity("company_item_prices", priceId, priceData);
  }

  async deleteCompanyPrice(priceId, force = false) {
    return this.deleteEntity("company_item_prices", priceId, force);
  }

  async restoreCompanyPrice(priceId) {
    return this.restoreEntity("company_item_prices", priceId);
  }

  async bulkDeleteCompanyPrices(priceIds, force = false) {
    return this.bulkDeleteEntities(
      "company_item_price",
      "company_item_prices",
      priceIds,
      force,
    );
  }

  async bulkRestoreCompanyPrices(priceIds) {
    return this.bulkRestoreEntities(
      "company_item_price",
      "company_item_prices",
      priceIds,
    );
  }

  // ===== Discount Services =====
  async getDiscounts({ page = 1, perPage = 10 } = {}) {
    return this.get(`/discounts?page=${page}&per_page=${perPage}`);
  }

  async getTrashedDiscounts({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("discounts", { page, perPage });
  }

  async createDiscount(discountData) {
    return this.createEntity("discounts", discountData);
  }

  async updateDiscount(discountId, discountData) {
    return this.updateEntity("discounts", discountId, discountData);
  }

  async deleteDiscount(discountId, force = false) {
    return this.deleteEntity("discounts", discountId, force);
  }

  async restoreDiscount(discountId) {
    return this.restoreEntity("discounts", discountId);
  }

  async bulkDeleteDiscounts(discountIds, force = false) {
    return this.bulkDeleteEntities("discount", "discounts", discountIds, force);
  }

  async bulkRestoreDiscounts(discountIds) {
    return this.bulkRestoreEntities("discount", "discounts", discountIds);
  }

  // ===== Driver Line Services =====
  async getDriverLines({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("driver_lines", { page, perPage });
  }

  async getTrashedDriverLines({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("driver_lines", { page, perPage });
  }

  async createDriverLine(driverLineData) {
    return this.createEntity("driver_lines", driverLineData);
  }

  async updateDriverLine(driverLineId, driverLineData) {
    return this.updateEntity("driver_lines", driverLineId, driverLineData);
  }

  async deleteDriverLine(driverLineId, force = false) {
    return this.deleteEntity("driver_lines", driverLineId, force);
  }

  async restoreDriverLine(driverLineId) {
    return this.restoreEntity("driver_lines", driverLineId);
  }

  async bulkDeleteDriverLines(driverLineIds, force = false) {
    return this.bulkDeleteEntities(
      "driver_line",
      "driver_lines",
      driverLineIds,
      force,
    );
  }

  async bulkRestoreDriverLines(driverLineIds) {
    return this.bulkRestoreEntities(
      "driver_line",
      "driver_lines",
      driverLineIds,
    );
  }

  // ===== Orders Services =====
  async getOrders({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/orders", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "orders:list",
    });
  }

  async getOrderById(orderId) {
    return this.getEntityById("orders", orderId);
  }

  async getTrashedOrders({ page = 1, perPage = 10, filters = {}, cancelKey } = {}) {
    return this.get("/trashed/orders", {
      params: { page, per_page: perPage, ...filters },
      cancelKey: cancelKey ?? "orders:list",
    });
  }

  async createOrder(orderData) {
    return this.createEntity("orders", orderData);
  }

  async createOrderExchange(orderId, exchangeData) {
    return this.post(`/orders/exchange/${orderId}`, exchangeData);
  }

  async updateOrder(orderId, orderData) {
    return this.updateEntity("orders", orderId, orderData);
  }

  async deleteOrder(orderId, force = false) {
    return this.deleteEntity("orders", orderId, force);
  }

  async restoreOrder(orderId) {
    return this.restoreEntity("orders", orderId);
  }

  async bulkDeleteOrders(orderIds, force = false) {
    return this.bulkDeleteEntities("order", "orders", orderIds, force);
  }

  async bulkRestoreOrders(orderIds) {
    return this.bulkRestoreEntities("order", "orders", orderIds);
  }

  async getOrderStatistics() {
    return this.get("/statistics/orders");
  }

  async getDriverStatistics() {
    return this.get("/statistics/drivers");
  }

  async getCustomerStatistics() {
    return this.get("/statistics/clients");
  }

  async getLineWorkStatistics() {
    return this.get("/statistics/line_works");
  }

  async getLineStatistics() {
    return this.get("/statistics/lines");
  }

  // ✅ Add new function for filtered orders
async getOrdersWithItems(filters = {}) {
  const params = new URLSearchParams();
  
  if (filters.line_name) {
    params.append('line_name', filters.line_name);
  }
  
  if (filters.case) {
    params.append('case', filters.case);
  }
  
  const queryString = params.toString();
  const url = queryString ? `/orders_with_items?${queryString}` : '/orders_with_items';
  
  return api.get(url);
}

  // ===== Line Work Services =====
  async getLineWorks({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("line_works", { page, perPage });
  }

  async createLineWork(lineWorkData) {
    return this.createEntity("line_works", lineWorkData);
  }

  async updateLineWork(lineWorkId, lineWorkData) {
    return this.updateEntity("line_works", lineWorkId, lineWorkData);
  }

  async deleteLineWork(lineWorkId, force = false) {
    return this.deleteEntity("line_works", lineWorkId, force);
  }

  async restoreLineWork(lineWorkId) {
    return this.restoreEntity("line_works", lineWorkId);
  }

  async getTrashedLineWorks({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("line_works", { page, perPage });
  }

  async bulkDeleteLineWorks(lineWorkIds, force = false) {
    return this.bulkDeleteEntities(
      "line_work",
      "line_works",
      lineWorkIds,
      force,
    );
  }

  async bulkRestoreLineWorks(lineWorkIds) {
    return this.bulkRestoreEntities("line_work", "line_works", lineWorkIds);
  }

  // ===== Work Plans Services =====
  async getWorkPlans({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("work_plans", { page, perPage });
  }

  async getTrashedWorkPlans({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("work_plans", { page, perPage });
  }

  async getDriverWorkPlans(driverId) {
    return this.get(`/work_plan/driver/${driverId}`);
  }

async reassignDriverWorkPlans(workplanIds, oldDriverId, newDriverId) {
  try {
    console.log('🔄 API: Reassigning work plans and deleting driver:', {
      workplan: workplanIds,
      driver_id_old: oldDriverId,
      driver_id_new: newDriverId
    });

    return this.patch("/work_plan/reassign_driver", {
      workplan: workplanIds,
      driver_id_old: oldDriverId,
      driver_id_new: newDriverId
    });
  } catch (error) {
    console.error('❌ Error in reassignDriverWorkPlans:', error);
    throw error;
  }
}

  async createWorkPlan(workPlanData) {
    const cleanData = Object.entries(workPlanData).reduce(
      (acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    return this.post("/work_plans", cleanData);
  }

  async updateWorkPlan(workPlanId, workPlanData) {
    const cleanData = Object.entries(workPlanData).reduce(
      (acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          acc[key] = value;
        }
        return acc;
      },
      {},
    );

    return this.patch(`/work_plans/${workPlanId}`, cleanData, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  async deleteWorkPlan(workPlanId, force = false) {
    return this.deleteEntity("work_plans", workPlanId, force);
  }

  async restoreWorkPlan(workPlanId) {
    return this.restoreEntity("work_plans", workPlanId);
  }

  async bulkDeleteWorkPlans(workPlanIds, force = false) {
    return this.bulkDeleteEntities(
      "work_plan",
      "work_plans",
      workPlanIds,
      force,
    );
  }

  async bulkRestoreWorkPlans(workPlanIds) {
    return this.bulkRestoreEntities("work_plan", "work_plans", workPlanIds);
  }
  // ===== Payment Services =====
  async getPayments({ page = 1, perPage = 10 } = {}) {
    return this.getEntities("payments", { page, perPage });
  }

  async getTrashedPayments({ page = 1, perPage = 10 } = {}) {
    return this.getTrashedEntities("payments", { page, perPage });
  }

  async updatePayment(paymentId, paymentData) {
    try {
      return this.post(`/payments/${paymentId}`, paymentData, {
        headers: {
          "X-HTTP-Method-Override": "PATCH",
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("❌ Error in updatePayment:", error);
      throw error;
    }
  }

  async deletePayment(paymentId, force = false) {
    return this.deleteEntity("payments", paymentId, force);
  }

  async restorePayment(paymentId) {
    return this.restoreEntity("payments", paymentId);
  }

  async bulkDeletePayments(paymentIds, force = false) {
    return this.bulkDeleteEntities("payment", "payments", paymentIds, force);
  }

  async bulkRestorePayments(paymentIds) {
    return this.bulkRestoreEntities("payment", "payments", paymentIds);
  }

  // Mark payments as paid
  async markPaymentsAsPaid(paymentData) {
    return this.patch("/payments", paymentData);
  }

  async deleteWorkPlan(workPlanId, force = false) {
    return this.deleteEntity("work_plans", workPlanId, force);
  }

  async restoreWorkPlan(workPlanId) {
    return this.restoreEntity("work_plans", workPlanId);
  }

  async bulkDeleteWorkPlans(workPlanIds, force = false) {
    return this.bulkDeleteEntities(
      "work_plan",
      "work_plans",
      workPlanIds,
      force,
    );
  }

  async bulkRestoreWorkPlans(workPlanIds) {
    return this.bulkRestoreEntities("work_plan", "work_plans", workPlanIds);
  }

  // ===== Permissions Services =====
  async getPermissions({ page = 1, perPage = 10 } = {}) {
    return this.get(`/permissions?page=${page}&per_page=${perPage}`);
  }

  async getUsersWithPermissions({ page = 1, perPage = 10 } = {}) {
    return this.get(`/user_permissions?page=${page}&per_page=${perPage}`);
  }

  async assignPermissionToUser(userId, permissionId) {
    return this.post("/user_permissions", {
      user_id: userId,
      permission_id: permissionId,
    });
  }

  async removePermissionFromUser(userId, permissionId) {
    return this.delete(`/user_permissions/${userId}/${permissionId}`);
  }

  // ===== Switch User Service (SuperAdmin only) =====
  async switchToUser(userId) {
    return this.post(`/login_as/${userId}`);
  }


  async returnToOriginalUser() {
    return this.post("/return_login");
  }
  // ===== Map Services =====
  async getMapData() {
    return this.get("/map-data");
  }

  async markPaymentsAsPaid(paymentData) {
    return this.patch("/payments", paymentData);
  }

  // في src/services/apiServices.js
// أضيفي هاي الدوال الجديدة

// ===== Collections Services =====
async getCollections({ page = 1, perPage = 10 } = {}) {
  return this.get(`/collections?page=${page}&per_page=${perPage}`);
}

async getTrashedCollections({ page = 1, perPage = 10 } = {}) {
  return this.getTrashedEntities("collections", { page, perPage });
}

async updateCollection(collectionId, collectionData) {
  try {
    return this.post(`/collections/${collectionId}`, collectionData, {
      headers: {
        "X-HTTP-Method-Override": "PATCH",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Error in updateCollection:", error);
    throw error;
  }
}

async deleteCollection(collectionId, force = false) {
  return this.deleteEntity("collections", collectionId, force);
}

async restoreCollection(collectionId) {
  return this.restoreEntity("collections", collectionId);
}

async bulkDeleteCollections(collectionIds, force = false) {
  return this.bulkDeleteEntities("collection", "collections", collectionIds, force);
}

async bulkRestoreCollections(collectionIds) {
  return this.bulkRestoreEntities("collection", "collections", collectionIds);
}

async markCollectionsAsPaid(collectionData) {
  return this.patch("/collections", collectionData);
}


// ===== Invoice Services =====
async getInvoices({ page = 1, perPage = 10 } = {}) {
  return this.get(`/invoices?page=${page}&per_page=${perPage}`);
}

async getTrashedInvoices({ page = 1, perPage = 10 } = {}) {
  return this.getTrashedEntities("invoices", { page, perPage });
}

async deleteInvoice(invoiceId, force = false) {
  return this.deleteEntity("invoices", invoiceId, force);
}

async restoreInvoice(invoiceId) {
  return this.restoreEntity("invoices", invoiceId);
}

async bulkDeleteInvoices(invoiceIds, force = false) {
  return this.bulkDeleteEntities("invoice", "invoices", invoiceIds, force);
}

async bulkRestoreInvoices(invoiceIds) {
  return this.bulkRestoreEntities("invoice", "invoices", invoiceIds);
}

// ===== Invoice Creation from Collections =====
async createInvoiceFromCollections(collectionIds) {
  return this.post("/invoices", {
    collection_ids: collectionIds
  });
}
}

// Create and freeze the singleton instance
const apiServices = Object.freeze(new ApiServices());

export default apiServices;
