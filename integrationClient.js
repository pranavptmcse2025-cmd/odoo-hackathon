import axios from "axios";

// Thin wrapper around axios for calling the Environmental and Social
// modules built by other teammates. Their base URLs are configurable via
// .env so this works whether their routes are mounted on the same server
// or deployed as separate services.
const envClient = axios.create({
  baseURL: process.env.ENV_MODULE_API_URL || "http://localhost:5000/api",
  timeout: 5000,
});

const socialClient = axios.create({
  baseURL: process.env.SOCIAL_MODULE_API_URL || "http://localhost:5000/api",
  timeout: 5000,
});

// Wraps a call so a downed/unbuilt teammate module degrades gracefully
// instead of crashing the aggregate dashboard/report endpoints.
const safeGet = async (client, path, forwardHeaders = {}) => {
  try {
    const { data } = await client.get(path, { headers: forwardHeaders });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.response?.data?.message || err.message || "Module unreachable",
    };
  }
};

export const fetchEnvironmentDashboard = (headers) =>
  safeGet(envClient, "/dashboard/environment", headers);

export const fetchEnvironmentReport = (headers) =>
  safeGet(envClient, "/reports/environment", headers);

export const fetchSocialDashboard = (headers) =>
  safeGet(socialClient, "/dashboard/social", headers);

export const fetchLeaderboard = (headers) =>
  safeGet(socialClient, "/leaderboard", headers);

export const fetchActivities = (headers) =>
  safeGet(socialClient, "/activities", headers);
