import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';

const GoogleSSOButton = ({ onGoogleSuccess, isRegister }) => {
  const login = useGoogleLogin({
    onSuccess: onGoogleSuccess,
    onError: (error) => console.log('Login Failed:', error),
  });

  return (
    <button 
      onClick={login}
      className="google-sso-button"
      style={{ padding: '10px', backgroundColor: '#4285F4', color: 'white', border: 'none', borderRadius: '5px' }}
    >
      {isRegister ? 'Sign In with Google (Student)' : 'Log In with Google (Student)'}
    </button>
  );
};

export default GoogleSSOButton;