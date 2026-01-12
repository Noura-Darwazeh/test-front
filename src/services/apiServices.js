import api from "./api.js";

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
    // Check if data contains a file (image)
    const hasFile = data instanceof FormData || (data.image && data.image instanceof File);
    
    if (hasFile && !(data instanceof FormData)) {
      // Convert to FormData if it has a file but isn't already FormData
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      data = formData;
    }

    return api.post(`/${entityPlural}`, data, {
      headers: hasFile ? { 'Content-Type': 'multipart/form-data' } : {}
    });
  }

  async updateEntity(entityPlural, id, data, usePatch = false) {
    // Check if data contains a file (image)
    const hasFile = data instanceof FormData || (data.image && data.image instanceof File);
    
    if (hasFile && !(data instanceof FormData)) {
      // Convert to FormData if it has a file but isn't already FormData
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          formData.append(key, data[key]);
        }
      });
      data = formData;
    }

    if (usePatch) {
      return api.patch(`/${entityPlural}/${id}`, data, {
        headers: hasFile ? { 'Content-Type': 'multipart/form-data' } : {}
      });
    } else {
      return api.post(`/${entityPlural}/${id}`, data, {
        headers: {
          "X-HTTP-Method-Override": "PATCH",
          ...(hasFile ? { 'Content-Type': 'multipart/form-data' } : {})
        },
      });
    }
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
    return this.updateEntity("users", userId, userData, false);
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
    return this.updateEntity("drivers", driverId, driverData, true);
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
    return this.updateEntity("currencies", currencyId, currencyData, false);
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
    return this.updateEntity("branches", branchId, branchData, false);
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
    return this.updateEntity("customers", customerId, customerData, true);
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

// Updated createCompany method for apiServices.js
// Replace the existing createCompany method with this:

async createCompany(companyData) {
  // If there are branches, send them as form data to match API format
  if (companyData.branches && companyData.branches.length > 0) {
    const formData = new FormData();
    formData.append('name', companyData.name);
    formData.append('type', companyData.type);
    
    // Add branches as indexed array: branches[0][name], branches[1][name], etc.
    companyData.branches.forEach((branch, index) => {
      if (branch.name && branch.name.trim() !== '') {
        formData.append(`branches[${index}][name]`, branch.name);
      }
    });
    
    return api.post('/companies', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
  
  // If no branches, send as regular JSON
  return this.createEntity("companies", companyData);
}

// Also update updateCompany to support branches:
async updateCompany(companyId, companyData) {
  // If there are branches, send them as form data
  if (companyData.branches && companyData.branches.length > 0) {
    const formData = new FormData();
    formData.append('name', companyData.name);
    formData.append('type', companyData.type);
    
    // Add branches as indexed array
    companyData.branches.forEach((branch, index) => {
      if (branch.name && branch.name.trim() !== '') {
        formData.append(`branches[${index}][name]`, branch.name);
      }
    });
    
    return api.post(`/companies/${companyId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }
  
  // If no branches, use default method
  return this.updateEntity("companies", companyId, companyData, false);
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
    return this.updateEntity("line_prices", priceId, priceData, false);
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
    return this.updateEntity("lines", lineId, lineData, false);
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
    return api.post(`/regions/${regionId}`, regionData, {
      headers: {
        "X-HTTP-Method-Override": "PATCH",
      },
    });
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
    return this.updateEntity("company_item_prices", priceId, priceData, false);
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
    return this.updateEntity("discounts", discountId, discountData, false);
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
    return this.updateEntity(
      "driver_lines",
      driverLineId,
      driverLineData,
      true
    );
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

  async updateOrder(orderId, orderData) {
    return this.updateEntity("orders", orderId, orderData, false);
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

    // ===== Line Work Services =====
    async getLineWorks() {
      return this.getEntities("line_works");
    }

    async createLineWork(lineWorkData) {
      return this.createEntity("line_works", lineWorkData);
    }

  async updateLineWork(lineWorkId, lineWorkData) {
    return api.post(`/line_works/${lineWorkId}`, lineWorkData, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }
  async updateLineWork(lineWorkId, lineWorkData) {
    return this.updateEntity("line_works", lineWorkId, lineWorkData, true);
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
    return this.createEntity("work_plans", workPlanData);
  }

  async updateWorkPlan(workPlanId, workPlanData) {
    return this.updateEntity("work_plans", workPlanId, workPlanData, false);
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

  // ===== Map Services =====
  async getMapData() {
    return api.get("/map-data");
  }
}

// Create and freeze the singleton instance
const apiServices = Object.freeze(new ApiServices());

export default apiServices;