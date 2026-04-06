import React from 'react';
import AuthProvider from './auth/AuthProvider';
import PrivateRoute from './auth/PrivateRoute';
import { Toaster } from "react-hot-toast";
import { Routes, Route } from 'react-router-dom';
import Login from "./pages/Auth/Login"
import SignIn from './pages/Auth/SignIn';
import StudentDashboard from './pages/Dashboards/StudentDashboard';
import CompanyDashboard from './pages/Dashboards/CompanyDashboard';
import Home from './pages/Home';

const AdminDashboard = () => (
  <div className="p-8 text-center text-gray-700">
    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
    <p>Admin panel goes here.</p>
  </div>
);

const App = () => {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signin" element={<SignIn />} />

          <Route element={<PrivateRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={['company']} />}>
            <Route path="/company/dashboard" element={<CompanyDashboard />} />
          </Route>
          <Route element={<PrivateRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route
            path="*"
            element={
              <div className="text-center p-10 mt-10 text-red-600">
                404 Not Found
              </div>
            }
          />
        </Routes>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#f0f9ff",
              color: "#0369a1",
              borderRadius: "8px",
            },
            success: {
              iconTheme: { primary: "#0ea5e9", secondary: "#f0f9ff" },
            },
          }}
        />
      </div>
    </AuthProvider>
  );
};

export default App;
