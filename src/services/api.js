export const submitFeedback = (feedback) =>
  client.post("/feedback/", { feedback });
import axios from "axios";

// Base URL from environment variable
const API_BASE = import.meta.env.VITE_API_BASE;
console.log("[DEBUG] VITE_API_BASE:", API_BASE);

// Create Axios client
const client = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
});
console.log("[DEBUG] Axios baseURL:", client.defaults.baseURL);

// Add JWT token to all requests if present
client.interceptors.request.use((config) => {
  let token = null;

  // Try both new and legacy token storage
  const tokenData = localStorage.getItem("tokenData");
  if (tokenData) {
    try {
      const parsed = JSON.parse(tokenData);
      token = parsed.token;
    } catch {
      console.warn("Failed to parse tokenData");
    }
  }

  if (!token) {
    token = localStorage.getItem("token");
  }

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  } else {
    console.warn("No token found in localStorage");
  }

  return config;
});

// ---------------------- API Endpoints ----------------------

// Auth
export const register = (payload) => client.post("/register/", payload);
export const login = (payload) => client.post("/login/", payload);
export const validateLogin = (payload) =>
  client.post("/login/validate", payload);
export const getProfile = () => client.get("/users/profile");

// Forgot Password
export const forgotPassword = (payload) =>
  client.post("/forgot-password/", payload);
export const resetPassword = (payload) =>
  client.post("/reset-password/", payload);

// Dashboard
export const fetchDashboard = () => client.get("/dashboard");

// Cycles
export const fetchCycles = () => client.get("/cycles");
export const createCycle = (payload) => client.post("/cycles", payload);
export const updateCycle = (id, payload) =>
  client.put(`/cycles/${id}`, payload);
export const deleteCycle = (id) => client.delete(`/cycles/${id}`);

// Get cycle by ID
export const getCycleById = (id) => client.get(`/cycles/${id}`);

// Symptoms
export const fetchSymptoms = () => client.get("/symptoms");
export const createSymptom = (payload) => client.post("/symptoms", payload);
export const deleteSymptom = (id) => client.delete(`/symptoms/${id}`);

// Get symptom by ID
export const getSymptomById = (id) => client.get(`/symptoms/${id}`);

// Update symptom by ID
export const updateSymptom = (id, payload) =>
  client.put(`/symptoms/${id}`, payload);

// Reminders / Medication
export const fetchMedReminders = () => client.get("/reminders/medications");
export const createMedReminder = (payload) =>
  client.post("/reminders/medications", payload);
export const updateMedReminder = (id, payload) =>
  client.put(`/reminders/medications/${id}`, payload);
export const deleteMedReminder = (id) =>
  client.delete(`/reminders/medications/${id}`);
// Removed sendTestMedReminderEmail and triggerPeriodPredictionEmails (email-related)

// Get reminder by ID
export const getReminderById = (id) =>
  client.get(`/reminders/medications/${id}`);

// Insights & Notifications
export const fetchInsightsSummary = () => client.get("/insights/summary");
export const fetchInsightsPredictions = () =>
  client.get("/insights/predictions");
export const fetchUpcomingNotifications = () =>
  client.get("/notifications/upcoming");
export const fetchAllNotifications = () => client.get("/notifications/all");
export const markNotificationRead = (id) =>
  client.post(`/notifications/${id}/read`);
export const snoozeNotification = (id, minutes) =>
  client.post(`/notifications/${id}/snooze`, { minutes });
export const updateNotificationSettings = (payload) =>
  client.put("/notifications/settings", payload);

export default client;
