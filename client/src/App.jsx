import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PrivateRoute from './auth/PrivateRoute';

// Auth Pages
import SignIn from './pages/Auth/SignIn';
import Login from './pages/Auth/Login';

// Student Pages
import StudentDashboard from './pages/Student/StudentDashboard';
import StudentProfileComplete from './pages/Student/StudentProfileComplete';

// Company Pages
import CompanyDashboard from './pages/Company/CompanyDashboard';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> 
        <Route path="/signin" element={<SignIn />} /> 
        <Route path="/login" element={<Login />} />

        {/* --- Protected Routes --- */}
        <Route element={<PrivateRoute allowedRoles={['student']} />}>
          <Route path="/student/complete-profile" element={<StudentProfileComplete />} />
          <Route path="/student/dashboard" element={<StudentDashboard />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={['company']} />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
        </Route>
        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<h2>404 - Page Not Found</h2>} />
      </Routes>
    </Router>
  );
};

export default App;