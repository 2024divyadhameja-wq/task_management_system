const API_BASE = "/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("taskFlowToken");

  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

// ================= AUTH APIs =================

export function registerUser(userData) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export function loginUser(credentials) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function getCurrentUser() {
  return apiRequest("/auth/me");
}

export function getAllUsers() {
  return apiRequest("/auth/users");
}

// ================= TASK APIs =================

export function getTasks(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.append("search", params.search);
  if (params.status && params.status !== "All") query.append("status", params.status);
  if (params.priority && params.priority !== "All") query.append("priority", params.priority);
  if (params.myTasks) query.append("myTasks", "true");
  if (params.project && params.project !== "All") query.append("project", params.project);

  const queryString = query.toString();
  return apiRequest(`/tasks${queryString ? `?${queryString}` : ""}`);
}

export function getTaskStats() {
  return apiRequest("/tasks/stats/summary");
}

export function getTaskById(id) {
  return apiRequest(`/tasks/${id}`);
}

export function createTask(taskData) {
  return apiRequest("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export function updateTask(id, taskData) {
  return apiRequest(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });
}

export function deleteTask(id) {
  return apiRequest(`/tasks/${id}`, {
    method: "DELETE",
  });
}

// ================= PROJECT APIs =================

export function getProjects() {
  return apiRequest("/projects");
}

export function createProject(projectData) {
  return apiRequest("/projects", {
    method: "POST",
    body: JSON.stringify(projectData),
  });
}

export function updateProject(id, projectData) {
  return apiRequest(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(projectData),
  });
}

export function deleteProject(id) {
  return apiRequest(`/projects/${id}`, {
    method: "DELETE",
  });
}

