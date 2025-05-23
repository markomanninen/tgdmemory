
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/api' // Your backend server URL for development
  : '/api'; // Relative path for production (if frontend is served by the same server or proxied)

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout to prevent indefinite waiting
});

// Interceptor to add JWT token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log(`Token exists: ${!!token}`);
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for logging and error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method.toUpperCase()} ${response.config.url}`);
    return response;
  },
  (error) => {
    let errorMessage = 'An unknown error occurred';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });
      
      errorMessage = error.response.data?.message || 
                    `Server error: ${error.response.status} ${error.response.statusText}`;
      
      // Handle token errors specifically
      if (error.response.status === 401) {
        console.log('Unauthorized access - Token may be invalid or expired');
        // You could perform auto-logout here if needed
        // localStorage.removeItem('token');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Request error (no response):', error.request);
      errorMessage = 'No response from server. Please check your network connection.';
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
      errorMessage = error.message;
    }
    
    error.userMessage = errorMessage;
    return Promise.reject(error);
  }
);

export default {
  // Auth
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  getMe: () => apiClient.get('/auth/me'),
  
  // Comments
  getComments: (pageUrl, userId, targetUserGroup, tag) => {
    const params = { pageUrl };
    if (userId) params.userId = userId;
    if (targetUserGroup) params.targetUserGroup = targetUserGroup;
    if (tag) params.tag = tag;
    return apiClient.get('/comments', { params });
  },
  createComment: (commentData) => apiClient.post('/comments', commentData),

  // Admin - Comments
  getAdminComments: (params) => apiClient.get('/comments/admin', { params }),
  updateCommentStatus: (commentId, status) => apiClient.put(`/comments/admin/${commentId}/status`, { status }),
  updateAdminComment: (commentId, commentData) => apiClient.put(`/comments/admin/${commentId}`, commentData),
  deleteAdminComment: (commentId) => apiClient.delete(`/comments/admin/${commentId}`),

  // Admin - Users
  getUsers: (params) => apiClient.get('/users', { params }),
  updateUserRoles: (userId, roles) => apiClient.put(`/users/${userId}/roles`, { roles }),
  deleteUser: (userId) => apiClient.delete(`/users/${userId}`),
  
  // Utility function to test connection
  ping: () => apiClient.get('/ping'),
  
  // Helper to get the current JWT token
  getAuthToken: () => localStorage.getItem('token')
};
