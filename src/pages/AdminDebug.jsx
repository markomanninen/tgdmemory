import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminDebug = () => {
  const { user, token, isLoading, authError, refreshUserData } = useAuth();
  const [apiTest, setApiTest] = useState({
    status: null,
    isRunning: false,
    result: null,
    error: null
  });

  const runApiTest = async (endpoint) => {
    setApiTest({ status: 'running', isRunning: true, result: null, error: null });
    
    try {
      let response;
      switch (endpoint) {
        case 'ping':
          response = await api.ping();
          break;
        case 'me':
          response = await api.getMe();
          break;
        case 'comments':
          response = await api.getAdminComments();
          break;
        case 'users':
          response = await api.getUsers();
          break;
        default:
          throw new Error(`Unknown endpoint: ${endpoint}`);
      }
      
      setApiTest({
        status: 'success',
        isRunning: false,
        result: {
          status: response.status,
          data: response.data
        },
        error: null
      });
    } catch (err) {
      setApiTest({
        status: 'error',
        isRunning: false,
        result: null,
        error: {
          message: err.userMessage || err.message,
          response: err.response ? {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          } : 'No response',
          request: err.request ? 'Request was sent but no response was received' : 'Request setup error'
        }
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-sky-50 to-blue-100 pt-24 sm:pt-32 pb-12 sm:pb-16">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold mb-8 sm:mb-10 text-gray-900 text-center sm:text-left">Admin Debug Panel</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {/* Authentication Status */}
          <section className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-lg border border-white/50">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-gray-800">Authentication Status</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-semibold mb-1">Loading State: <span className={isLoading ? "text-yellow-500" : "text-green-500"}>{isLoading ? "Loading..." : "Completed"}</span></p>
                <p className="font-semibold mb-1">Token: <span className={token ? "text-green-500" : "text-red-500"}>{token ? "Present" : "Missing"}</span></p>
                <p className="font-semibold mb-1">User Object: <span className={user ? "text-green-500" : "text-red-500"}>{user ? "Loaded" : "Not loaded"}</span></p>
                {authError && (
                  <p className="font-semibold text-red-500">Error: {authError}</p>
                )}
                
                {user && (
                  <div className="mt-4">
                    <p className="font-semibold">User Details:</p>
                    <ul className="list-disc pl-5 mt-1 text-sm">
                      <li>ID: {user._id}</li>
                      <li>Username: {user.username || 'Not set'}</li>
                      <li>Email: {user.email}</li>
                      <li>Roles: {user.roles?.join(', ') || 'None'}</li>
                    </ul>
                  </div>
                )}
                
                <button
                  onClick={refreshUserData}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  disabled={isLoading}
                >
                  Refresh Auth Data
                </button>
              </div>
            </div>
          </section>
          
          {/* API Testing */}
          <section className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-lg border border-white/50">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-gray-800">API Endpoint Tests</h2>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2"> {/* Added flex-wrap and gap for better responsiveness */}
                <button
                  onClick={() => runApiTest('ping')}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  disabled={apiTest.isRunning}
                >
                  Test Ping
                </button>
                <button
                  onClick={() => runApiTest('me')}
                  className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  disabled={apiTest.isRunning}
                >
                  Test /auth/me
                </button>
                <button
                  onClick={() => runApiTest('comments')}
                  className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  disabled={apiTest.isRunning}
                >
                  Test Comments
                </button>
                <button
                  onClick={() => runApiTest('users')}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  disabled={apiTest.isRunning}
                >
                  Test Users
                </button>
              </div>
              
              {apiTest.isRunning && (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              )}
              
              {apiTest.status === 'success' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-semibold text-green-700 mb-2">Success! Status: {apiTest.result.status}</p>
                  <div className="bg-white p-2 rounded overflow-auto max-h-60 text-xs">
                    <pre>{JSON.stringify(apiTest.result.data, null, 2)}</pre>
                  </div>
                </div>
              )}
              
              {apiTest.status === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="font-semibold text-red-700 mb-2">Error: {apiTest.error.message}</p>
                  <div className="bg-white p-2 rounded overflow-auto max-h-60 text-xs">
                    <pre>{JSON.stringify(apiTest.error, null, 2)}</pre>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        
        {/* Token Management */}
        <section className="mt-8 sm:mt-10 bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-xl shadow-lg border border-white/50">
          <h2 className="text-2xl sm:text-3xl font-semibold mb-6 sm:mb-8 text-gray-800">JWT Token</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-semibold mb-2">Current Token:</p>
              <div className="bg-gray-100 p-2 rounded overflow-auto max-h-40 text-xs">
                <pre className="break-all whitespace-pre-wrap">{token || 'No token'}</pre>
              </div>
              
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.reload();
                  }}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  Clear Token
                </button>
                
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(token || '');
                    alert('Token copied to clipboard');
                  }}
                  disabled={!token}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-gray-400"
                >
                  Copy Token
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDebug;
