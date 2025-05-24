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
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-xl p-6 rounded-xl shadow-lg border border-white/50">
            <p className="text-lg text-gray-700 mb-4">Loading authentication information...</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-600">Debug Info:</p>
              <pre className="text-xs mt-2 overflow-auto bg-white p-2 rounded border max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-yellow-50/90 backdrop-blur-xl border border-yellow-200 text-yellow-700 px-6 py-4 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Authentication Required</h2>
            <p className="mb-2">You need to be logged in to access the admin dashboard.</p>
            <p className="text-sm">Please <Link to="/login" className="text-blue-600 hover:underline font-medium">login</Link> to continue.</p>
          </div>
          <div className="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-semibold text-gray-600">Debug Info:</p>
            <pre className="text-xs mt-2 overflow-auto bg-gray-50 p-3 rounded border max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has admin role
  if (!user.roles || !user.roles.includes('admin')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="bg-red-50/90 backdrop-blur-xl border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">Access Denied</h2>
            <p className="mb-2">You don't have the required admin permissions to access this page.</p>
            {user.roles && (
              <p className="text-sm">Your roles: {user.roles.join(', ')}</p>
            )}
          </div>
          <div className="mt-6 bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-semibold text-gray-600">Debug Info:</p>
            <pre className="text-xs mt-2 overflow-auto bg-gray-50 p-3 rounded border max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 pt-24 sm:pt-32 pb-12 sm:pb-16">
      {/* Main container with proper top padding for fixed header */}
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-gray-900 text-center sm:text-left">Admin Dashboard</h1>
        
        {/* Navigation section */}
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-4 items-center elevated-content">
          <Link 
            to="/admin/debug" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg clickable-layer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Troubleshooting Tools
          </Link>
        </div>
        
        {/* Debug information - collapsible */}
        <div className="mb-8 sm:mb-10 bg-white/70 backdrop-blur-xl p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-gray-700">Debug Information</p>
            <button 
              onClick={() => {
                const debugInfo = document.getElementById('debugInfo');
                if (debugInfo) {
                  debugInfo.classList.toggle('hidden');
                }
              }}
              className="text-xs bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded transition-colors"
            >
              Toggle
            </button>
          </div>
          <div id="debugInfo" className="hidden mt-3">
            <pre className="text-xs bg-gray-50 p-3 rounded border overflow-auto max-h-40">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        </div>

        {/* Main dashboard content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          <section className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-lg border border-white/50">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-gray-800">Comment Moderation</h2>
            <CommentModeration />
          </section>
          <section className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-lg border border-white/50">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-gray-800">User Management</h2>
            <UserManagement />
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
