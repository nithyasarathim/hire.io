import React from 'react';
import { useAuth } from '../auth/AuthProvider';
import { Navigate } from 'react-router-dom';

const Home = () => {
    const { isAuthenticated, role, checkedSession } = useAuth();
    if (!checkedSession) {
        return <div className="text-center p-8 text-xl text-blue-600">Checking session...</div>;
    }
    if (isAuthenticated) {
        return <Navigate to={`/${role}/dashboard`} replace />;
    }
    return <Navigate to="/login" replace />;
};

export default Home;