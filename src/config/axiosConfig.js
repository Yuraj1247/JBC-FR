import axios from 'axios';

// Create an axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add tokens
axiosInstance.interceptors.request.use(
  (config) => {
    // Check for admin token first
    const adminToken = localStorage.getItem('adminToken');
    const employeeToken = localStorage.getItem('employeeToken');

    if (adminToken) {
      config.headers['Authorization'] = `Bearer ${adminToken}`;
    } else if (employeeToken) {
      config.headers['Authorization'] = `Bearer ${employeeToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem('adminToken');
      localStorage.removeItem('employeeToken');
      window.location.href = '/admin/login';
    } else if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      switch (error.response.status) {
        case 403:
          // Forbidden
          console.error('Access denied');
          break;
        case 404:
          // Not Found
          console.error('Resource not found');
          break;
        case 500:
          // Internal Server Error
          console.error('Server error');
          break;
        default:
          console.error('An error occurred');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
