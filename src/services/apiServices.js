import api from "./api.js";

// ===== API Services Singleton =====
class ApiServices {
  constructor() {
    if (ApiServices.instance) {
      return ApiServices.instance;
    }
    ApiServices.instance = this;
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
    return api.get("/users");
  }

  async getTrashedUsers() {
    return api.get("/trashed/users");
  }

  async createUser(userData) {
    return api.post("/users", userData);
  }

  async updateUser(userId, userData) {
    return api.post(`/users/${userId}`, userData, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }

  async deleteUser(userId) {
    return api.delete(`/users/${userId}`);
  }

  async restoreUser(userId) {
    return api.post(`/restore/users/${userId}`);
  }

  async bulkDeleteUsers(userIds) {
    return api.delete("/bulk-delete/user/users?force=0", {
      data: { ids: userIds }
    });
  }

  async bulkRestoreUsers(userIds) {
    return api.post("/bulk-restore/user/users", { ids: userIds });
  }

  // ===== Driver Services =====
  async getDrivers() {
    return api.get("/drivers");
  }

  async createDriver(driverData) {
    return api.post("/drivers", driverData);
  }

  async updateDriver(driverId, driverData) {
    return api.patch(`/drivers/${driverId}`, driverData);
  }

  async deleteDriver(driverId) {
    return api.delete(`/drivers/${driverId}`);
  }

  async restoreDriver(driverId) {
    return api.post(`/drivers/${driverId}/restore`);
  }

  // ===== Currency Services =====
  async getCurrencies() {
    return api.get("/currencies");
  }

  async createCurrency(currencyData) {
    return api.post("/currencies", currencyData);
  }

  async updateCurrency(currencyId, currencyData) {
    return api.post(`/currencies/${currencyId}`, currencyData, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }

  async deleteCurrency(currencyId) {
    return api.delete(`/currencies/${currencyId}`);
  }

  async restoreCurrency(currencyId) {
    return api.post(`/currencies/${currencyId}/restore`);
  }

  // ===== Branches Services =====
  async getBranches() {
    return api.get("/branchs");
  }

  async createBranch(branchData) {
    return api.post("/branchs", branchData);
  }

  async updateBranch(branchId, branchData) {
    return api.post(`/branchs/${branchId}`, branchData, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }

  async deleteBranch(branchId) {
    return api.delete(`/branchs/${branchId}`);
  }

  async restoreBranch(branchId) {
    return api.post(`/restore/branchs/${branchId}`);
  }
  // ===== Customer Services =====
  async getCustomers() {
    return api.get("/customers");
  }

  async createCustomer(customerData) {
    return api.post("/customers", customerData);
  }

  async updateCustomer(customerId, customerData) {
    return api.patch(`/customers/${customerId}`, customerData);
  }

  async deleteCustomer(customerId) {
    return api.delete(`/customers/${customerId}`);
  }

  async restoreCustomer(customerId) {
    return api.post(`/customers/${customerId}/restore`);
  }
  // ===== Company Services =====
  async getCompanies() {
    return api.get("/companies");
  }

  async getTrashedCompanies() {
    return api.get("/trashed/companies");
  }

  async createCompany(companyData) {
    return api.post("/companies", companyData);
  }

  async updateCompany(companyId, companyData) {
    return api.post(`/companies/${companyId}`, companyData, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }

  async deleteCompany(companyId, force = false) {
    return api.delete(`/companies/${companyId}?force=${force ? 1 : 0}`);
  }

  async restoreCompany(companyId) {
    return api.post(`/restore/companies/${companyId}`);
  }

  async bulkDeleteCompanies(companyIds, force = false) {
    const endpoint = force
      ? "/bulk-delete/company/companies?force=1"
      : "/bulk-delete/company/companies";
    return api.delete(endpoint, {
      data: { ids: companyIds }
    });
  }

  async bulkRestoreCompanies(companyIds) {
    return api.post("/bulk-restore/company/companies", { ids: companyIds });
  }

  // ===== Customer Services =====
  async getCustomers() {
    return api.get("/customers");
  }

  // ===== Line Price Services =====
  // ===== Line Price Services =====
  async getLinePrices() {
    return api.get("/line_prices");
  }

  async createLinePrice(priceData) {
    return api.post("/line_prices", priceData);
  }

  async updateLinePrice(priceId, priceData) {
    return api.post(`/line_prices/${priceId}`, priceData, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }

  async deleteLinePrice(priceId) {
    return api.delete(`/line-prices/${priceId}`);
  }

  async restoreLinePrice(priceId) {
    return api.post(`/restore/line-prices/${priceId}`);
  }

  // ===== Lines Services =====
  async getLines() {
    return api.get("/lines");
  }

  async createLine(lineData) {
    return api.post("/lines", lineData);
  }

  async updateLine(lineId, lineData) {
    return api.post(`/lines/${lineId}`, lineData, {
      headers: {
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }

  async deleteLine(lineId) {
    return api.delete(`/lines/${lineId}`);
  }

  async restoreLine(lineId) {
    return api.post(`/restore/lines/${lineId}`);
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
        'X-HTTP-Method-Override': 'PATCH'
      }
    });
  }

  async deleteRegion(regionId) {
    return api.delete(`/regions/${regionId}`);
  }

  async restoreRegion(regionId) {
    return api.post(`/regions/${regionId}/restore`);
  }

  // ===== Company Price Services =====
  async getCompanyPrices() {
    return api.get("/company-prices");
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
    return api.get("/orders");
  }

  // ===== Line Work Services =====
  async getLineWorks() {
    return api.get("/line-works");
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