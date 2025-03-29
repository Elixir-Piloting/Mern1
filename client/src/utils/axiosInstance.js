import axios from "axios";
import { toast } from "react-toastify";

const PROXY = import.meta.env.VITE_API_URL;

// Create a single Axios instance
const axiosInstance = axios.create({
  baseURL: PROXY,
  withCredentials: true, // This is critical for cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add request interceptor for debugging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log('Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      withCredentials: config.withCredentials
    });
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Response:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      response: error.response?.data,
      headers: error.response?.headers
    });
    
    // If the response is 401 (Unauthorized), log out the user
    if (error.response?.status === 401) {
      toast.error("Session expired. Please log in again.");
      
      // Clear session storage (just in case)
      sessionStorage.clear();

      // Redirect user to login page
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
