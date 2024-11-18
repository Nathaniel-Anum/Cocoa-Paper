// import axios from "axios";

// export const baseURL = "http://localhost:5000";

// export const axiosInstance = axios.create({
//   baseURL,
// });

// axiosInstance.interceptors.request.use((req) => {
//   const authAccess = localStorage.getItem("accessToken");
//   req.headers.Authorization = `Bearer ${authAccess}`;
//   console.log("interceptor run");

//   return req;
// });

// export default axiosInstance;

import axios from "axios";

export const baseURL = "http://localhost:5000";

export const axiosInstance = axios.create({
  baseURL,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (req) => {
    const authAccess = localStorage.getItem("accessToken");
    if (authAccess) {
      req.headers.Authorization = `Bearer ${authAccess}`;
    }
    console.log("Request interceptor run");
    return req;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Successful response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to unauthorized access and retry with refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite retry loops

      try {
        console.log("Access token expired, attempting refresh...");
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("Refresh token not found in localStorage");
        }

        // Fetch new access token
        const refreshResponse = await axios.post(
          `${baseURL}/refresh/${refreshToken}`
        );

        // Log the response data for debugging
        console.log("Refresh token response:", refreshResponse.data);

        // Update tokens in localStorage
        localStorage.setItem("accessToken", refreshResponse.data.token);
        localStorage.setItem("refreshToken", refreshResponse.data.refreshToken);

        console.log("Access token refreshed successfully");

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
        console.log("Retrying original request:", originalRequest);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Failed to refresh token:", refreshError);
        // Optional: Redirect to login or handle logout if refresh fails
      }
    }

    console.error("Response interceptor error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
