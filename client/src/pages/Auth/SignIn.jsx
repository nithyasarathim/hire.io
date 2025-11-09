import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { registerUser } from '../../api/auth.api';
import GoogleSSOButton from '../../components/GoogleSSOButton';

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    role: 'company', 
    company_name: '', 
    email: '', 
    password: '' 
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCompanySubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await registerUser({ ...formData, role: 'company' });
      login(response.data.token, response.data.user, 'company');
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Company registration failed.');
    }
  };
  const handleGoogleSuccess = async (tokenResponse) => {
    const googleEmail = 'student_sso_' + Date.now() + '@example.com'; 
    const googleName = 'SSO Student';

    try {
      const response = await registerUser({
        role: 'student',
        student_name: googleName,
        email: googleEmail,
        password: 'SSO_DEFAULT_PASSWORD',
      });
      
      login(response.data.token, response.data.user, 'student');
      navigate('/student/complete-profile'); 
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.message.includes('exists')) {
        navigate('/login', { state: { ssoError: 'Student already registered. Please log in.' } });
      } else {
        setError(err.response?.data?.message || 'SSO registration failed.');
      }
    }
  };


  return (
    <div className="auth-container">
      <h2>Sign In (Register)</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <section style={{ marginBottom: '30px' }}>
        <h3>Student Sign In</h3>
        <GoogleSSOButton onGoogleSuccess={handleGoogleSuccess} isRegister={true} />
      </section>

      <section>
        <h3>Company Sign In</h3>
        <form onSubmit={handleCompanySubmit}>
          <input type="text" name="company_name" placeholder="Company Name" onChange={handleInputChange} required />
          <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleInputChange} required />
          <button type="submit">Register Company</button>
        </form>
      </section>
    </div>
  );
};

export default SignIn;