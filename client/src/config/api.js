if (!import.meta.env.VITE_API_URL) {
  console.error("API URL not defined in environment variables!");
}

export const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
