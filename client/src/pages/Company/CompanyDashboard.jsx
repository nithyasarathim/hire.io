import React from 'react';
import { useAuth } from '../../auth/AuthProvider';

const CompanyDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Company Dashboard</h2>
      <p>Welcome back, {user?.company_name || user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default CompanyDashboard;