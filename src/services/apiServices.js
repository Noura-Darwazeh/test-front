// src/services/apiServices.js
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
  }

  // ===== Dynamic CRUD Methods =====
  async getEntities(entityPlural) {
    return api.get(`/${entityPlural}`);
  }

  async getEntityById(entityPlural, id) {
    return api.get(`/${entityPlural}/${id}`);
  }

  async getTrashedEntities(entityPlural) {
    return api.get(`/trashed/${entityPlural}`);
  }

  async createEntity(entityPlural, data) {
    const hasFile = containsFile(data);
    const isFormData = data instanceof FormData;

    if (hasFile && !isFormData) {
      data = toFormData(data);
    }

    return api.post(`/${entityPlural}`, data, {
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
      return api.post(`/${entityPlural}/${id}`, data, {
        headers: {
          "X-HTTP-Method-Override": "PATCH",
          "Content-Type": "multipart/form-data"
        },
      });
    }

    return api.patch(`/${entityPlural}/${id}`, data);
  }

  async deleteEntity(entityPlural, id, force = false) {
    const endpoint = `/${entityPlural}/${id}?force=${force ? 1 : 0}`;
    return api.delete(endpoint);
  }

  async restoreEntity(entityPlural, id) {
    return api.post(`/restore/${entityPlural}/${id}`);
  }

  async bulkDeleteEntities(entitySingular, entityPlural, ids, force = false) {
    const endpoint = `/bulk-delete/${entitySingular}/${entityPlural}?force=${
      force ? 1 : 0
    }`;
    return api.delete(endpoint, {
      data: { ids },
    });
  }

  async bulkRestoreEntities(entitySingular, entityPlural, ids) {
    return api.post(`/bulk-restore/${entitySingular}/${entityPlural}`, { ids });
  }

  // ===== Authentication Services =====
  async login(credentials) {
    return api.post("/login", credentials);
  }

  async forgotPassword(email) {
    return api.post("/forgot_password", { email });
  }

  async resetPassword(data) {
    return api.post("/reset_password", data, {
      params: {
        token: data.token,
        email: data.email
      }
    });
  }

  async getUserProfile(userId) {
    return api.get(`/users/${userId}`);
  }

  async changePassword(passwordData) {
    return api.patch("/change_password", passwordData);
  }

  // ===== User Services =====
  async getUsers() {
    return this.getEntities("users");
  }

  async getTrashedUsers() {
    return this.getTrashedEntities("users");
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
  async getDrivers() {
    return this.getEntities("drivers");
  }

  async getTrashedDrivers() {
    return this.getTrashedEntities("drivers");
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
  async getCurrencies() {
    return this.getEntities("currencies");
  }

  async getTrashedCurrencies() {
    return this.getTrashedEntities("currencies");
  }

  async createCurrency(currencyData) {
    return this.createEntity("currencies", currencyData);
  }

  async updateCurrency(currencyId, currencyData) {
    return this.updateEntity("currencies", currencyId, currencyData);
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
      force
    );
  }

  async bulkRestoreCurrencies(currencyIds) {
    return this.bulkRestoreEntities("currency", "currencies", currencyIds);
  }

  // ===== Branches Services =====
  async getBranches() {
    return this.getEntities("branches");
  }

  async getTrashedBranches() {
    return this.getTrashedEntities("branches");
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
  async getCustomers() {
    return this.getEntities("customers");
  }

  async getTrashedCustomers() {
    return this.getTrashedEntities("customers");
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
  async getCompanies() {
    return this.getEntities("companies");
  }

  async getTrashedCompanies() {
    return this.getTrashedEntities("companies");
  }

  async createCompany(companyData) {
    if (companyData.branches && companyData.branches.length > 0) {
      const formData = new FormData();
      formData.append('name', companyData.name);
      formData.append('type', companyData.type);
      
      companyData.branches.forEach((branch, index) => {
        if (branch.name && branch.name.trim() !== '') {
          formData.append(`branches[${index}][name]`, branch.name);
          if (branch.latitude !== undefined && branch.latitude !== "") {
            formData.append(`branches[${index}][latitude]`, branch.latitude);
          }
          if (branch.longitude !== undefined && branch.longitude !== "") {
            formData.append(`branches[${index}][longitude]`, branch.longitude);
          }
        }
      });
      
      return api.post('/companies', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    }
    
    return this.createEntity("companies", companyData);
  }

  async updateCompany(companyId, companyData) {
    if (companyData.branches && companyData.branches.length > 0) {
      const formData = new FormData();
      formData.append('name', companyData.name);
      formData.append('type', companyData.type);
      
      companyData.branches.forEach((branch, index) => {
        if (branch.name && branch.name.trim() !== '') {
          formData.append(`branches[${index}][name]`, branch.name);
          if (branch.latitude !== undefined && branch.latitude !== "") {
            formData.append(`branches[${index}][latitude]`, branch.latitude);
          }
          if (branch.longitude !== undefined && branch.longitude !== "") {
            formData.append(`branches[${index}][longitude]`, branch.longitude);
          }
        }
      });
      
      return api.post(`/companies/${companyId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'X-HTTP-Method-Override': 'PATCH'
        }
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
  async getLinePrices() {
    return this.getEntities("line_prices");
  }

  async getTrashedLinePrices() {
    return this.getTrashedEntities("line_prices");
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
      force
    );
  }

  async bulkRestoreLinePrices(priceIds) {
    return this.bulkRestoreEntities("line_price", "line_prices", priceIds);
  }

  // ===== Lines Services =====
  async getLines() {
    return this.getEntities("lines");
  }

  async getTrashedLines() {
    return this.getTrashedEntities("lines");
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
  async getRegions() {
    return api.get("/regions");
  }

  async getTrashedRegions() {
    return this.getTrashedEntities("regions");
  }

  async createRegion(regionData) {
    return api.post("/regions", regionData);
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
  async getCompanyPrices() {
    return api.get("/company_item_prices");
  }

  async getTrashedCompanyPrices() {
    return this.getTrashedEntities("company_item_prices");
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
      force
    );
  }

  async bulkRestoreCompanyPrices(priceIds) {
    return this.bulkRestoreEntities(
      "company_item_price",
      "company_item_prices",
      priceIds
    );
  }

  // ===== Discount Services =====
  async getDiscounts() {
    return api.get("/discounts");
  }

  async getTrashedDiscounts() {
    return this.getTrashedEntities("discounts");
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
  async getDriverLines() {
    return this.getEntities("driver_lines");
  }

  async getTrashedDriverLines() {
    return this.getTrashedEntities("driver_lines");
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
      force
    );
  }

  async bulkRestoreDriverLines(driverLineIds) {
    return this.bulkRestoreEntities(
      "driver_line",
      "driver_lines",
      driverLineIds
    );
  }

  // ===== Orders Services =====
  async getOrders() {
    return this.getEntities("orders");
  }

  async getOrderById(orderId) {
    return this.getEntityById("orders", orderId);
  }

  async getTrashedOrders() {
    return this.getTrashedEntities("orders");
  }

  async createOrder(orderData) {
    return this.createEntity("orders", orderData);
  }

  async createOrderExchange(orderId, exchangeData) {
    return api.post(`/orders/exchange/${orderId}`, exchangeData);
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
    return api.get("/statistics/orders");
  }

  async getOrdersWithItems() {
    return api.get("/orders_with_items");
  }

  // ===== Line Work Services =====
  async getLineWorks() {
    return this.getEntities("line_works");
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

  async getTrashedLineWorks() {
    return this.getTrashedEntities("line_works");
  }

  async bulkDeleteLineWorks(lineWorkIds, force = false) {
    return this.bulkDeleteEntities(
      "line_work",
      "line_works",
      lineWorkIds,
      force
    );
  }

  async bulkRestoreLineWorks(lineWorkIds) {
    return this.bulkRestoreEntities("line_work", "line_works", lineWorkIds);
  }

  // ===== Work Plans Services =====
  async getWorkPlans() {
    return this.getEntities("work_plans");
  }

  async getTrashedWorkPlans() {
    return this.getTrashedEntities("work_plans");
  }

  async createWorkPlan(workPlanData) {
    const cleanData = Object.entries(workPlanData).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    return api.post("/work_plans", cleanData);
  }

  async updateWorkPlan(workPlanId, workPlanData) {
    console.log("🔄 API updateWorkPlan called for ID:", workPlanId);
    console.log("📤 API payload:", workPlanData);
    
    const cleanData = Object.entries(workPlanData).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    console.log("🧹 Cleaned data:", cleanData);

    return api.patch(`/work_plans/${workPlanId}`, cleanData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
// ===== Payment Services =====
async getPayments() {
  return this.getEntities("payments");
}

async getTrashedPayments() {
  return this.getTrashedEntities("payments");
}

async createPayment(paymentData) {
  return this.createEntity("payments", paymentData);
}

async updatePayment(paymentId, paymentData) {
  return this.updateEntity("payments", paymentId, paymentData);
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
      force
    );
  }

  async bulkRestoreWorkPlans(workPlanIds) {
    return this.bulkRestoreEntities("work_plan", "work_plans", workPlanIds);
  }

  // ===== Switch User Service (SuperAdmin only) =====
  async switchToUser(userId) {
    return api.post(`/login_as/${userId}`);
  }

  // ===== Map Services =====
  async getMapData() {
    return api.get("/map-data");
  }
}

// Create and freeze the singleton instance
const apiServices = Object.freeze(new ApiServices());

export default apiServices;