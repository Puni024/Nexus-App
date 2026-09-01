import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

let logoutHandler: (() => void) | null = null;

export const setLogoutHandler = (handler: () => void) => {
  logoutHandler = handler;
};

let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    const isMiddlewareAuthFailure = response?.status === 401 //&& !!response?.data?.code;
    const isRefreshCall = config?.url === "/auth/refresh";

    if (isMiddlewareAuthFailure && !isRefreshCall && !config._retried) {
      config._retried = true;

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await api.post("/auth/refresh");

          pendingQueue.forEach((resolve) => resolve());
          pendingQueue = [];
          isRefreshing = false;
          return api(config);

        } catch {
          pendingQueue = [];
          isRefreshing = false;

          if (logoutHandler && config?.url !== "/auth/verify") {
            logoutHandler();
          }
          return Promise.reject(error);
        }
      }

      return new Promise((resolve, reject) => {
        pendingQueue.push(() => api(config).then(resolve).catch(reject));
      });
    }


    if (
      logoutHandler &&
      isMiddlewareAuthFailure &&
      isRefreshCall
    ) {
      logoutHandler();
    }

    return Promise.reject(error);
  }
);

export default api;