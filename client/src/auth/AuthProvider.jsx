import React, { createContext, useState, useEffect, useContext } from 'react';
import { fetchProfile } from '../api/auth.api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkedSession, setCheckedSession] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      console.log('[DEBUG-Auth] Token on refresh:', token ? `Found (length: ${token.length})` : 'MISSING');

      if (!token) {
        console.log('[DEBUG-Auth] No token → Skip profile fetch');
        setLoading(false);
        setCheckedSession(true);
        return;
      }

      try {
        console.log('[DEBUG-Auth] Fetching profile with token...');
        const response = await fetchProfile();
        console.log('[DEBUG-Auth] Profile SUCCESS:', { user: response.data.user?.name || 'No name', role: response.data.role });

        setUser(response.data.user);
        setRole(response.data.role);
      } catch (error) {
        console.error('[DEBUG-Auth] Profile ERROR:', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          fullError: error
        });
        if (error.response?.status === 401) {
          console.log('[DEBUG-Auth] 401 → Clearing token');
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
        setCheckedSession(true);
        console.log('[DEBUG-Auth] Session check COMPLETE. isAuthenticated:', !!user);
      }
    };

    loadUser();
  }, []);

  const login = (token, userData, userRole) => {
    console.log('[DEBUG-Auth] Manual login:', { user: userData?.name, role: userRole });
    localStorage.setItem('token', token);
    setUser(userData);
    setRole(userRole);
    setCheckedSession(true);
  };

  const logout = () => {
    console.log('[DEBUG-Auth] Logout');
    localStorage.removeItem('token');
    setUser(null);
    setRole(null);
    setCheckedSession(true);
  };

  const updateProfile = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  const value = {
    user,
    role,
    loading,
    login,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    checkedSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;