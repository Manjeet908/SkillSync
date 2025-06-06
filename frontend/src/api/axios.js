import axios from 'axios';

const apiUrl = import.meta.env.VITE_APP_API_URL;

const axiosInstance = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Response interceptor for handling token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const errorMessage = error.response?.data;
    if (
      error.response?.status === 401 && 
      typeof errorMessage === 'string' && errorMessage.includes('jwt expired') &&
      !originalRequest._retry && 
      originalRequest.url !== '/users/auth/refresh-token'
    ) {
      originalRequest._retry = true;

      try {
        const response = await axiosInstance.post(`/users/auth/refresh-token`,
          {},
          {
            withCredentials: true,
          }
        );
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('user');
        sessionStorage.clear();
        document.cookie.split(";").forEach(cookie => {
          document.cookie = cookie
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
        });
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 