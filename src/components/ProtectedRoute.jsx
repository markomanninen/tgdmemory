import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, token, isLoading, isAuthenticated } = useAuth();

  // Show detailed debugging information in development
  const debugInfo = {
    isLoading,
    isAuthenticated,
    hasToken: !!token,
    userExists: !!user,
    userRoles: user?.roles || [],
    requiredRoles
  };

  console.log('ProtectedRoute Debug:', debugInfo);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="text-lg mb-4">Loading authentication...</div>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 p-4 bg-gray-100 rounded text-xs max-w-md">
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Check if user has required roles
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.some(role => 
      user.roles && user.roles.includes(role)
    );
    
    if (!hasRequiredRole) {
      console.log('ProtectedRoute: Missing required role, showing access denied');
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
            <p>You don't have the required permissions to access this page.</p>
            <p className="text-sm mt-2">Required roles: {requiredRoles.join(', ')}</p>
            <p className="text-sm mt-2">Your roles: {user.roles?.join(', ') || 'None'}</p>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-xs">
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}
        </div>
      );
    }
  }

  console.log('ProtectedRoute: Access granted, rendering children');
  return children;
};

export default ProtectedRoute;
