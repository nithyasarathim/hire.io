// ProfileModal.jsx
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, Save, Edit2, LogOut, User } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../auth/AuthProvider';
import { updateStudentProfile, uploadStudentResume } from '../api/student.api';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState({
    name: user?.name || '',
    student_description: user?.student_description || '',
    skills: user?.skills?.join(', ') || '',
  });
  const resumeRef = useRef();

  const handleChange = (e) =>
    setData({ ...data, [e.target.name]: e.target.value });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const skills = data.skills.split(',').map((s) => s.trim());
    try {
      const res = await updateStudentProfile(user._id, {
        name: data.name,
        student_description: data.student_description,
        skills,
      });
      updateProfile(res.data);
      toast.success('Profile updated successfully', {
        style: { borderRadius: '8px', background: '#f0f9ff', color: '#0369a1' },
        iconTheme: { primary: '#0ea5e9', secondary: '#f0f9ff' },
      });
      setEditing(false);
    } catch {
      toast.error('Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    const file = resumeRef.current.files[0];
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a valid PDF');
      return;
    }
    setLoading(true);
    try {
      const res = await uploadStudentResume(user._id, file);
      updateProfile({ resumeId: res.data.resumeId });
      toast.success('Resume uploaded successfully', {
        style: { borderRadius: '8px', background: '#f0fdf4', color: '#166534' },
        iconTheme: { primary: '#22c55e', secondary: '#f0fdf4' },
      });
    } catch {
      toast.error('Resume upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setEditing(false); // exit edit mode on close
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-sky-900/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
            className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-gradient-to-br from-sky-50 to-sky-100 shadow-2xl rounded-l-3xl p-6 overflow-y-auto flex flex-col"
          >
            <div className="flex justify-between items-center mb-4 border-b border-sky-200 pb-2">
              <h2 className="text-xl font-bold text-sky-800">
                {editing ? 'Edit Profile' : 'Your Profile'}
              </h2>
              <button
                onClick={handleClose}
                className="text-sky-500 hover:text-sky-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {!editing ? (
                <>
                  <table className='items-center'>
                    <tbody>
                      <tr>
                        <td>
                          <p className="text-gray-800 font-semibold">Name</p>
                        </td>
                        <td>
                          <p className="text-sky-700 px-10">{user.name || 'No name set'}</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <p className="text-gray-800 font-semibold mt-2 ">Resume ID</p>
                        </td>
                        <td>
                          <p className="text-sky-700 px-10">{user.resumeId || 'Not uploaded'}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <p className="text-gray-800 font-semibold mt-1">Description:</p>
                  <p className="text-sky-700">
                    {user.student_description || 'No description yet'}
                  </p>

                  {user.skills?.length > 0 && (
                    <>
                      <p className="text-gray-800 font-semibold mt-2">Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="bg-sky-100 text-sky-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <input
                      type="text"
                      name="name"
                      value={data.name}
                      placeholder={user.name || 'Name'}
                      disabled={true}
                      className="w-full border border-sky-300 disabled bg-gray-50 text-gray-400 focus:bg-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <textarea
                      name="student_description"
                      value={data.student_description}
                      onChange={handleChange}
                      rows={3}
                      placeholder={user.student_description || 'Describe yourself...'}
                      className="w-full border border-sky-300 bg-sky-50 focus:bg-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-400 resize-none"
                    />
                    <input
                      name="skills"
                      value={data.skills}
                      onChange={handleChange}
                      placeholder={user.skills?.join(', ') || 'Skills (comma separated)'}
                      className="w-full border border-sky-300 bg-sky-50 focus:bg-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-sky-400"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 w-full bg-sky-500 text-white py-2 rounded-md font-semibold hover:bg-sky-700 transition duration-150"
                    >
                      <Save className="w-5 h-5" />
                      {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </form>

                  <form
                    onSubmit={handleResumeUpload}
                    className="mt-6 space-y-4 border-t border-sky-200 pt-4"
                  >
                    {user?.resumeId && (
                      <p className="text-sky-700 text-sm mb-2">
                        Current Resume ID: {user.resumeId}
                      </p>
                    )}
                    <input
                      type="file"
                      ref={resumeRef}
                      accept="application/pdf"
                      className="block w-full text-sm text-sky-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-sky-100 file:text-sky-700 hover:file:bg-sky-200 cursor-pointer"
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 w-full bg-sky-500 text-white py-2 rounded-md font-semibold hover:bg-sky-600 transition duration-150"
                    >
                      <UploadCloud className="w-5 h-5" />
                      {loading ? 'Uploading...' : 'Upload Resume'}
                    </button>
                  </form>
                </>
              )}
            </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-2 bg-sky-500 text-white px-2 py-2 rounded-full hover:bg-sky-600 transition"
            >
              <span className="bg-white/20 p-1.5 rounded-full">
                <Edit2 size={16} className="text-white" />
              </span>
              Edit
            </button>
            <button
              onClick={() => { logout(); handleClose(); }}
              className="flex items-center gap-2 bg-red-400 text-white px-2 py-2 rounded-full hover:bg-red-500 transition"
            >
              <span className="bg-white/20 p-1.5 rounded-full">
                <LogOut size={16} className="text-white" />
              </span>
              Logout
            </button>
          </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );  
};

export default ProfileModal;
