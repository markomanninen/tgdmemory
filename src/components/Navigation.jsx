import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex items-center space-x-4">
      {!isAuthenticated ? (
        <>
          <Link 
            to="/login" 
            className="text-white hover:text-sky-200 transition-colors duration-200"
          >
            Login
          </Link>
          <Link 
            to="/register" 
            className="bg-white text-sky-600 px-4 py-2 rounded hover:bg-sky-100 transition-colors duration-200"
          >
            Register
          </Link>
        </>
      ) : (
        <>
          <span className="text-white">
            Welcome, {user.username}
          </span>
          {user.roles && user.roles.includes('admin') && (
            <Link 
              to="/admin" 
              className="text-yellow-200 hover:text-yellow-100 transition-colors duration-200"
            >
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-white hover:text-sky-200 transition-colors duration-200"
          >
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navigation;
