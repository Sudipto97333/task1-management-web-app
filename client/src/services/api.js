const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    const error = new Error("Can't reach the API. Start the backend and check its database connection.");
    error.isNetworkError = true;
    throw error;
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body.error) message = body.error;
    } catch {
      // Keep the HTTP status message when the server doesn't return JSON.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const taskApi = {
  health: () => request("/health"),
  list: () => request("/tasks"),
  create: (task) => request("/tasks", { method: "POST", body: JSON.stringify(task) }),
  update: (id, changes) =>
    request(`/tasks/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: JSON.stringify(changes),
    }),
  remove: (id) => request(`/tasks/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
