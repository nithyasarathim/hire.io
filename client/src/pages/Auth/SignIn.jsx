import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import { useAuth } from '../../auth/AuthProvider';
import { registerUser } from '../../api/auth.api';

const SignIn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [role, setRole] = useState('student');
    const [formData, setFormData] = useState({
        student_name: '',
        company_name: '',
        email: '',
        password: '',
        portfolio_url: ''
    });
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const payload = {
                role,
                email: formData.email,
                password: formData.password,
            };

            if (role === 'student') {
                payload.student_name = formData.student_name;
                payload.portfolio_url = formData.portfolio_url;
            }

            if (role === 'company') {
                payload.company_name = formData.company_name;
            }

            const response = await registerUser(payload);
            login(response.data.token, response.data.user, role);
            navigate(`/${role}/dashboard`);
        } catch (err) {
            setError(err.response?.data?.message || `${role} registration failed.`);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
                <img src={Logo} className='h-20 w-fit mx-auto' />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign Up
                </h2>
                {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    >
                        <option value="student">Student</option>
                        <option value="company">Company</option>
                    </select>
                    {role === 'student' && (
                        <>
                            <input type="text" name="student_name" placeholder="Full Name" onChange={handleInputChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                            <input type="url" name="portfolio_url" placeholder="Portfolio URL (optional)" onChange={handleInputChange} className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                        </>
                    )}
                    {role === 'company' && (
                        <input type="text" name="company_name" placeholder="Company Name" onChange={handleInputChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    )}
                    <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    <input type="password" name="password" placeholder="Password" onChange={handleInputChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Register {role.charAt(0).toUpperCase() + role.slice(1)}
                    </button>
                </form>
                
                <div className="text-center text-sm">
                    <Link to="/login" className="font-medium text-sky-600 hover:text-sky-500">
                        Already have an account? Log In
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default SignIn;
