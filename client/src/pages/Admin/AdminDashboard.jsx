import React from 'react';
import { useAuth } from '../../auth/AuthProvider';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <p>Welcome, Administrator!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default AdminDashboard;