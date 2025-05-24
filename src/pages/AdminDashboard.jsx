import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import CommentModeration from '../components/admin/CommentModeration';
import UserManagement from '../components/admin/UserManagement';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { user, token, isLoading } = useAuth();
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({
    hasToken: false,
    userContent: null,
    tokenContent: null
  });

  useEffect(() => {
    console.log("Admin Dashboard Mount - User:", user);
    console.log("Auth state:", { isLoading, hasToken: !!token });
    
    // Collect debugging information
    setDebugInfo({
      hasToken: !!token,
      userContent: user ? JSON.stringify(user, null, 2) : 'No user data',
      tokenContent: token ? `${token.substring(0, 10)}...` : 'No token'
    });
  }, [user, token, isLoading]);

  // Show loading state first
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-lg">Loading authentication information...</p>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-semibold">Debug Info:</p>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold mb-2">Authentication Required</h2>
          <p>You need to be logged in to access the admin dashboard.</p>
          <p className="mt-4 text-sm">Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to continue.</p>
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-semibold">Debug Info:</p>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (!user.roles || !user.roles.includes('admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <h2 className="text-lg font-semibold mb-2">Access Denied</h2>
          <p>You don't have the required admin permissions to access this page.</p>
          {user.roles && (
            <p className="text-sm mt-2">Your roles: {user.roles.join(', ')}</p>
          )}
        </div>
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm font-semibold">Debug Info:</p>
          <pre className="text-xs mt-2 overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Navigation section */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Link 
            to="/admin/debug" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Troubleshooting Tools
          </Link>
        </div>
      </div>
      
      {/* Debug information - can be toggled with a button for production */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">Debug Information</p>
          <button 
            onClick={() => document.getElementById('debugInfo').classList.toggle('hidden')}
            className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
          >
            Toggle
          </button>
        </div>
        <div id="debugInfo" className="hidden mt-2">
          <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Comment Moderation</h2>
          <CommentModeration />
        </section>
        <section className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">User Management</h2>
          <UserManagement />
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
