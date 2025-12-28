import api from "./api.js";
export { CurrencyService } from "./currencyService.js";

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

  async createUser(userData) {
    return api.post("/users", userData);
  }

  async updateUser(userId, userData) {
    return api.put(`/users/${userId}`, userData);
  }

  async deleteUser(userId) {
    return api.delete(`/users/${userId}`);
  }

  async restoreUser(userId) {
    return api.post(`/users/${userId}/restore`);
  }

  // ===== Currency Services =====
  async getCurrencies() {
    return api.get("/currencies");
  }

  // ===== Branches Services =====
  async getBranches() {
    return api.get("/branches");
  }

  // ===== Company Services =====
  async getCompanies() {
    return api.get("/companies");
  }

  // ===== Customer Services =====
  async getCustomers() {
    return api.get("/customers");
  }

  // ===== Driver Services =====
  async getDrivers() {
    return api.get("/drivers");
  }

  // ===== Line Price Services =====
  async getLinePrices() {
    return api.get("/line-prices");
  }

  // ===== Lines Services =====
  async getLines() {
    return api.get("/lines");
  }

  // ===== Regions Services =====
  async getRegions() {
    return api.get("/regions");
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
