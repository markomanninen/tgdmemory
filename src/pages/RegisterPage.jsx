import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const RegisterPage = () => {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth(); // Use login to set user and token after successful registration

  const handleRegister = async (userData) => {
    try {
      setError('');
      const response = await api.register(userData);
      // Assuming the register endpoint logs the user in directly or returns user and token
      // If it just registers, you might want to redirect to login or auto-login here
      if (response.data.token && response.data.user) {
        login(response.data.user, response.data.token);
        navigate('/'); // Redirect to home or dashboard after registration
      } else {
        // Handle cases where registration doesn't auto-login (e.g., email verification needed)
        navigate('/login'); // Or show a message: "Registration successful, please login."
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      console.error('Registration error:', err);
    }
  };

  return <AuthForm formType="register" onSubmit={handleRegister} error={error} />;
};

export default RegisterPage;
