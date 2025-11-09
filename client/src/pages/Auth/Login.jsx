import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import { loginUser } from '../../api/auth.api';
import GoogleSSOButton from '../../components/GoogleSSOButton';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    role: 'company', 
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
      const response = await loginUser({ ...formData, role: 'company' });
      login(response.data.token, response.data.user, 'company');
      navigate('/company/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Company login failed.');
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    const googleEmail = 'student_sso_existing@example.com'; 
    try {
      const response = await loginUser({
        role: 'student',
        email: googleEmail,
        password: 'SSO_DEFAULT_PASSWORD',
      });
      
      login(response.data.token, response.data.user, 'student');
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Student SSO login failed. Did you sign in first?');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Student SSO Login */}
      <section style={{ marginBottom: '30px' }}>
        <h3>Student Login</h3>
        <GoogleSSOButton onGoogleSuccess={handleGoogleSuccess} isRegister={false} />
      </section>

      <section>
        <h3>Company Login</h3>
        <form onSubmit={handleCompanySubmit}>
          <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required />
          <input type="password" name="password" placeholder="Password" onChange={handleInputChange} required />
          <button type="submit">Login Company</button>
        </form>
      </section>
    </div>
  );
};

export default Login;