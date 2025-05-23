import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const LoginPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      setError('');
      const response = await api.login(credentials);
      login(response.data.user, response.data.token);
      navigate('/'); // Redirect to home or dashboard after login
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      console.error('Login error:', err);
    }
  };

  return <AuthForm formType="login" onSubmit={handleLogin} error={error} />;
};

export default LoginPage;
