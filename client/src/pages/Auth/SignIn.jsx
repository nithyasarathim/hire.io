import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Logo from '../../assets/logo.png';
import { useAuth } from '../../auth/AuthProvider';
import { registerUser, ssoStudentLogin } from '../../api/auth.api'; 
import GoogleSSOButton from '../../components/GoogleSSOButton';
import axios from 'axios';

const SignIn = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [companyFormData, setCompanyFormData] = useState({ 
        company_name: '', 
        email: '', 
        password: '' 
    });
    const [error, setError] = useState('');

    const getGoogleProfile = async (accessToken) => {
        const response = await axios.get(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
        );
        return { name: response.data.name, email: response.data.email };
    };

    const handleCompanyInputChange = (e) => {
        setCompanyFormData({ ...companyFormData, [e.target.name]: e.target.value });
    };

    const handleCompanySubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const registerData = {
                role: 'company',
                ...companyFormData,
            };
            const response = await registerUser(registerData);
            login(response.data.token, response.data.user, 'company');
            navigate('/company/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Company registration failed.');
        }
    };
    
    const handleGoogleSuccess = async (tokenResponse) => {
        setError('');
        try {
            const googleUser = await getGoogleProfile(tokenResponse.access_token);
            const response = await ssoStudentLogin({
                name: googleUser.name,
                email: googleUser.email
            });
            
            login(response.data.token, response.data.user, 'student');
            navigate('/student/dashboard'); 

        } catch (err) {
            console.error("SSO Registration Error:", err);
            setError(err.response?.data?.message || 'Student SSO registration failed. See console for details.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
                <img src={Logo} className='h-20 w-fit mx-auto'></img>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign Up
                </h2>
                {error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{error}</p>}

                {/* Student SSO Sign Up */}
                <section>
                    <GoogleSSOButton onGoogleSuccess={handleGoogleSuccess} isRegister={true} />
                </section>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">
                            Or register your company
                        </span>
                    </div>
                </div>

                {/* Company Traditional Registration (Requires all fields) */}
                <form onSubmit={handleCompanySubmit} className="mt-8 space-y-6">
                    <input type="text" name="company_name" placeholder="Company Name" onChange={handleCompanyInputChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    <input type="email" name="email" placeholder="Email" onChange={handleCompanyInputChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    <input type="password" name="password" placeholder="Password" onChange={handleCompanyInputChange} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        Register Company
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