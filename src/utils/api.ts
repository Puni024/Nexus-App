import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.BACKEND_URL,
  withCredentials: true,
});

let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      logoutHandler &&
      error.response?.status === 401 &&
      error.config?.url !== "/auth/verify"
    ) {
      logoutHandler();
    }

    return Promise.reject(error);
  }
);

export default api;