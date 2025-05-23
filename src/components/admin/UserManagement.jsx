import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: adminUser, token } = useAuth(); // To ensure the current user is an admin

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("UserManagement: Fetching users for admin management");
      console.log("UserManagement: Auth token exists:", !!token);
      console.log("UserManagement: Admin user:", adminUser?.username || adminUser?.email || 'Not available');
      
      const response = await api.getUsers(); // Assumes getUsers fetches all users for admin
      console.log("UserManagement: Users response:", response);
      
      // Handle different response structures
      if (response && response.data) {
        const usersData = response.data.users || response.data || [];
        console.log(`UserManagement: Retrieved ${usersData.length} users`);
        setUsers(usersData);
      } else {
        console.error("UserManagement: Unexpected response format:", response);
        throw new Error("Invalid response format from server");
      }
    } catch (err) {
      console.error("UserManagement: Error fetching users:", err);
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "Failed to load users.";
      setError(errorMessage);
      
      // Additional error details for debugging
      console.log("UserManagement: Error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data
      });
    }
    setIsLoading(false);
  }, [token, adminUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId, newRoles) => {
    // Prevent admin from removing their own admin role if they are the only admin
    if (userId === adminUser?._id && !newRoles.includes('admin')) {
        const adminUsers = users.filter(u => u.roles.includes('admin'));
        if (adminUsers.length === 1) {
            alert("You cannot remove your own admin role as you are the only admin.");
            return;
        }
    }

    try {
      console.log(`UserManagement: Updating roles for user ${userId}:`, newRoles);
      await api.updateUserRoles(userId, newRoles);
      console.log("UserManagement: User roles updated successfully");
      
      // Refresh users list or update locally
      setUsers(prevUsers =>
        prevUsers.map(u => (u._id === userId ? { ...u, roles: newRoles } : u))
      );
      alert("User roles updated successfully.");
    } catch (err) {
      console.error("UserManagement: Error updating user roles:", err);
      const errorMessage = err.response?.data?.message || "Failed to update roles.";
      alert(errorMessage);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Prevent admin from deleting themselves
    if (userId === adminUser?._id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    try {
      console.log(`UserManagement: Deleting user ${userId}`);
      await api.deleteUser(userId);
      console.log("UserManagement: User deleted successfully");
      setUsers(prevUsers => prevUsers.filter(u => u._id !== userId));
      alert("User deleted successfully.");
    } catch (err) {
      console.error("UserManagement: Error deleting user:", err);
      const errorMessage = err.response?.data?.message || "Failed to delete user.";
      alert(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-4">
        <p className="mb-2">Loading users...</p>
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        <h3 className="font-semibold mb-1">Error loading users</h3>
        <p>{error}</p>
        <button 
          onClick={fetchUsers}
          className="mt-3 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const availableRoles = ['user', 'editor', 'reviewer', 'admin'];

  return (
    <div>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <ul className="space-y-4">
          {users.map(u => (
            <li key={u._id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{u.username || 'No username'} ({u.email || 'No email'})</p>
                  <p className="text-sm text-gray-600">Joined: {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Unknown'}</p>
                </div>
                {u._id !== adminUser?._id && (
                  <button
                    onClick={() => handleDeleteUser(u._id)}
                    className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                    title="Delete this user"
                  >
                    Delete
                  </button>
                )}
              </div>

              <div className="mt-2">
                <p className="text-sm font-medium mb-1">Roles:</p>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map(role => (
                    <label key={role} className="flex items-center space-x-2 text-sm">
                      <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                        checked={u.roles?.includes(role) || false}
                        onChange={(e) => {
                          const newRoles = e.target.checked
                            ? [...(u.roles || []), role]
                            : (u.roles || []).filter(r => r !== role);
                          
                          // Ensure 'user' role is always present if no roles would be left
                          if (newRoles.length === 0) {
                            handleRoleChange(u._id, ['user']);
                          } else {
                            handleRoleChange(u._id, newRoles);
                          }
                        }}
                        disabled={
                          // Disable if this is admin's checkbox and they're the only admin
                          (u._id === adminUser?._id && role === 'admin' && 
                           users.filter(usr => usr.roles?.includes('admin')).length === 1)
                        }
                      />
                      <span>{role.charAt(0).toUpperCase() + role.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserManagement;
