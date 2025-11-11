// src/components/GoogleSSOButton.jsx
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { ssoStudentLogin } from '../api/auth.api';
import toast from 'react-hot-toast';

const GoogleSSOButton = ({ isRegister = false }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const googleLoginHook = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        });

        const userInfo = await userInfoResponse.json();

        if (!userInfo.email) {
          throw new Error("Google did not provide email");
        }
        const res = await ssoStudentLogin({
          name: userInfo.name || userInfo.given_name || "Student",
          email: userInfo.email,
        });
        const { token, user } = res.data;
        const role = 'student';
        login(token, user, role);
        toast.success(`Welcome, ${user.name || user.email}!`, {
          style: { borderRadius: '8px', background: '#f0f9ff', color: '#0369a1' },
          iconTheme: { primary: '#0ea5e9', secondary: '#f0f9ff' },
        });

        navigate('/student/dashboard', { replace: true });

      } catch (err) {
        console.error('Google SSO Failed:', err);
        const msg = err.response?.data?.message || err.message || 'Login failed';
        toast.error(msg, {
          style: { borderRadius: '8px', background: '#fef2f2', color: '#991b1b' },
          iconTheme: { primary: '#ef4444', secondary: '#fee2e2' },
        });
      }
    },

    onError: () => {
      toast.error('Google login failed. Please try again.', {
        style: { borderRadius: '8px', background: '#fef2f2', color: '#991b1b' },
      });
    },
  });

  return (
    <button
      type="button"
      onClick={() => googleLoginHook()}
      className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-gradient-to-r from-white to-gray-50 px-5 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:shadow-md hover:border-gray-400 hover:from-gray-50 hover:to-white"
      aria-label={isRegister ? "Sign up with Google" : "Log in with Google"}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-inner group-hover:scale-105 transition-transform duration-150">
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google logo"
          className="h-4 w-4"
        />
      </div>
      <span className="tracking-wide">
        {isRegister ? "Sign Up with Google" : "Log In with Google"}
      </span>
    </button>
  );
};

export default GoogleSSOButton;