// Drop this file into the frontend at: src/api/client.js
// Then replace mock data imports with calls like:
//   import api from "../../api/client";
//   const { data } = await api.get("/policies");
//
// Requires: npm install axios  (in the frontend project)

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the JWT (stored after login) to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecosphere_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 (expired/invalid token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ecosphere_token");
      localStorage.removeItem("ecosphere_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ---------------------------------------------------------------------
// Example: real Login.jsx handleSubmit (replaces the mock navigate-only version)
// ---------------------------------------------------------------------
//
// import api from "../../api/client";
// import { useNavigate } from "react-router-dom";
//
// const navigate = useNavigate();
//
// const handleSubmit = async (e) => {
//   e.preventDefault();
//   try {
//     const { data } = await api.post("/auth/login", { email, password });
//     localStorage.setItem("ecosphere_token", data.token);
//     localStorage.setItem("ecosphere_user", JSON.stringify(data.user));
//     navigate("/dashboard");
//   } catch (err) {
//     setError(err.response?.data?.message || "Login failed");
//   }
// };
//
// ---------------------------------------------------------------------
// Example: Governance page data fetch (replaces static import from data/governanceData)
// ---------------------------------------------------------------------
//
// useEffect(() => {
//   (async () => {
//     const [{ data: policies }, { data: audits }, { data: issues }] = await Promise.all([
//       api.get("/policies"),
//       api.get("/audits"),
//       api.get("/issues"),
//     ]);
//     setPolicies(policies.data);
//     setAudits(audits.data);
//     setIssues(issues.data);
//   })();
// }, []);
