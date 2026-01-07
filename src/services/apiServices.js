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
    return api.post(`/${entityPlural}`, data);
  }

  async updateEntity(entityPlural, id, data, usePatch = false) {
    if (usePatch) {
      return api.patch(`/${entityPlural}/${id}`, data);
    } else {
      return api.post(`/${entityPlural}/${id}`, data, {
        headers: {
          "X-HTTP-Method-Override": "PATCH",
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
    return api.post("/forgot-password", { email });
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

  async createCurrency(currencyData) {
    return this.createEntity("currencies", currencyData);
  }

  async updateCurrency(currencyId, currencyData) {
    return this.updateEntity("currencies", currencyId, currencyData, false);
  }

  // ===== Branches Services =====
  async getBranches() {
    return this.getEntities("branchs");
  }

  async getTrashedBranches() {
    return this.getTrashedEntities("branchs");
  }

  async createBranch(branchData) {
    return this.createEntity("branchs", branchData);
  }

  async updateBranch(branchId, branchData) {
    return this.updateEntity("branchs", branchId, branchData, false);
  }

  async deleteBranch(branchId, force = false) {
    return this.deleteEntity("branchs", branchId, force);
  }

  async restoreBranch(branchId) {
    return this.restoreEntity("branchs", branchId);
  }

  async bulkDeleteBranches(branchIds, force = false) {
    return this.bulkDeleteEntities("branch", "branchs", branchIds, force);
  }

  async bulkRestoreBranches(branchIds) {
    return this.bulkRestoreEntities("branch", "branchs", branchIds);
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

  async createCompany(companyData) {
    return this.createEntity("companies", companyData);
  }

  async updateCompany(companyId, companyData) {
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

  // ===== Customer Services =====
  async getCustomers() {
    return api.get("/customers");
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

  // ===== Company Price Services =====
  async getCompanyPrices() {
    return api.get("/company_item_prices");
  }

  // ===== Discount Services =====
  async getDiscounts() {
    return api.get("/discounts");
  }

  // ===== Driver Line Services =====
  async getDriverLines() {
    return api.get("/driver-lines");
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
  return api.get("/lineworks");
}

async createLineWork(lineWorkData) {
  return api.post("/lineworks", lineWorkData);
}

async updateLineWork(lineWorkId, lineWorkData) {
  return api.post(`/lineworks/${lineWorkId}`, lineWorkData, {
    headers: {
      'X-HTTP-Method-Override': 'PATCH'
    }
  });
}

async deleteLineWork(lineWorkId) {
  return api.delete(`/lineworks/${lineWorkId}`);
}

async restoreLineWork(lineWorkId) {
  return api.post(`/restore/lineworks/${lineWorkId}`);
}

  // ===== Work Plans Services =====
  async getWorkPlans() {
    return api.get("/work-plans");
  }

  // ===== Map Services =====
  async getMapData() {
    return api.get("/map-data");
  }
}

// Create and freeze the singleton instance
const apiServices = Object.freeze(new ApiServices());

export default apiServices;
