import React from "react";

const GoogleSSOButton = ({ isRegister = false }) => {
  return (
    <button
      type="button"
      disabled
      className="group relative flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-medium text-gray-500 opacity-80 cursor-not-allowed"
      aria-label={isRegister ? "Sign up with Google unavailable" : "Log in with Google unavailable"}
    >
      <span className="tracking-wide">
        {isRegister ? "Student sign-up now uses email and password" : "Student login now uses email and password"}
      </span>
    </button>
  );
};

export default GoogleSSOButton;
