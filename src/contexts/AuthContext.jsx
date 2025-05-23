import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api'; // Your API service

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('AuthProvider: Initializing auth, token exists:', !!token);
      setIsLoading(true);
      setAuthError(null);
      
      if (token) {
        try {
          console.log('AuthProvider: Fetching user data with token');
          const response = await api.getMe(); // Fetch user data
          console.log('AuthProvider: User data fetched:', response.data);
          setUser(response.data);
        } catch (error) {
          console.error('AuthProvider: Failed to fetch user on initial load', error);
          const errorMessage = error.response?.data?.message || 'Failed to authenticate';
          console.log('AuthProvider: Setting error:', errorMessage);
          setAuthError(errorMessage);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      } else {
        console.log('AuthProvider: No token found');
      }
      setIsLoading(false);
    };
    
    initializeAuth();
  }, [token]);

  const login = (userData, userToken) => {
    console.log('AuthProvider: Logging in user:', userData.username || userData.email);
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
    setAuthError(null);
  };

  const logout = () => {
    console.log('AuthProvider: Logging out user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setAuthError(null);
    // Optionally, redirect to login page or home page
    // window.location.href = '/login'; 
  };

  // Add a refresh function to manually retry fetching user data
  const refreshUserData = async () => {
    console.log('AuthProvider: Manually refreshing user data');
    setIsLoading(true);
    
    if (token) {
      try {
        const response = await api.getMe();
        console.log('AuthProvider: User data refreshed:', response.data);
        setUser(response.data);
        setAuthError(null);
      } catch (error) {
        console.error('AuthProvider: Failed to refresh user data', error);
        const errorMessage = error.response?.data?.message || 'Failed to authenticate';
        setAuthError(errorMessage);
      }
    } else {
      setAuthError('No authentication token available');
    }
    
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        login, 
        logout, 
        isLoading, 
        authError,
        refreshUserData, 
        isAuthenticated: !!user 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
