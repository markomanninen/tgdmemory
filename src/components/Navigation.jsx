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
            className="text-white hover:text-sky-200 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd"/>
            </svg>
            <span>Login</span>
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-3 text-white bg-white/10 backdrop-blur-sm px-3 py-2 rounded-lg border border-white/20">
            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
              {(user.username || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Welcome</span>
              <span className="text-xs text-sky-200">{user.username}</span>
            </div>
          </div>
          
          {user.roles && user.roles.includes('admin') && (
            <Link 
              to="/admin" 
              className="text-yellow-200 hover:text-yellow-100 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-yellow-500/20 backdrop-blur-sm flex items-center space-x-2 border border-yellow-400/20"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
              </svg>
              <span>Admin</span>
            </Link>
          )}
          
          <button
            onClick={handleLogout}
            className="text-white hover:text-red-200 transition-colors duration-200 px-3 py-2 rounded-lg hover:bg-red-500/20 backdrop-blur-sm flex items-center space-x-2 border border-red-400/20"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd"/>
            </svg>
            <span>Logout</span>
          </button>
        </>
      )}
    </nav>
  );
};

export default Navigation;
