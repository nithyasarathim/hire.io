import React from 'react';
import { useAuth } from '../../auth/AuthProvider';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div>
      <h2>Student Dashboard</h2>
      <p>Welcome back, {user?.student_name || user?.email}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default StudentDashboard;