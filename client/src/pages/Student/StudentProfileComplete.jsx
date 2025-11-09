import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthProvider';
import axiosInstance from '../../api/axiosInstance';

const StudentProfileComplete = () => {
  const { user, role, login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    student_description: '',
    skills: '',
  });
  const [error, setError] = useState('');

  if (role !== 'student' || !user) {
    return <p>Unauthorized access.</p>;
  }

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(s => s);
    const updateData = {
      student_description: formData.student_description,
      skills: skillsArray,
    };

    try {
      const response = await axiosInstance.put(`/api/students/${user.student_id}`, updateData);
      login(localStorage.getItem('token'), response.data, role); 

      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Profile completion failed.');
    }
  };

  return (
    <div className="profile-complete-container">
      <h2>Complete Your Student Profile</h2>
      <p>Welcome, {user.student_name || user.email}! Just a few more details to get started.</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <textarea
          name="student_description"
          placeholder="Tell us about yourself (summary, goals)"
          rows="4"
          value={formData.student_description}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="skills"
          placeholder="Skills (comma-separated: React, Node.js, SQL)"
          value={formData.skills}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Save Profile & Go to Dashboard</button>
      </form>
    </div>
  );
};

export default StudentProfileComplete;