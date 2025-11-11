import React from 'react';
import { useAuth } from '../../auth/AuthProvider';

const CompanyDashboard = () => {
    const { user, logout } = useAuth();
    return (
        <div className="max-w-4xl mx-auto p-6 mt-10 bg-white shadow-xl rounded-xl border-l-4 border-teal-500">
            <h2 className="text-3xl font-bold text-teal-700 mb-4">Company Dashboard</h2>
            <p className="text-lg text-gray-700 mb-6">Welcome, <span className="font-semibold">{user?.company_name}</span>!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-600">Company Email:</p>
                    <p className="text-gray-800">{user?.email}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-600">Website:</p>
                    <p className="text-gray-800">{user?.company_website || 'Not provided'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg col-span-full">
                    <p className="font-medium text-gray-600">Description:</p>
                    <p className="text-gray-800">{user?.company_description || 'No description available.'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium text-gray-600">Total Jobs Posted:</p>
                    <p className="text-gray-800 font-bold">{user?.jobs?.length || 0}</p>
                </div>
            </div>

            <button onClick={logout} className="mt-8 w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition duration-150">
                Logout
            </button>
        </div>
    );
};

export default CompanyDashboard;