import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthProvider";
import { loginUser } from "../../api/auth.api";
import Logo from "../../assets/logo.png";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [roleToggle, setRoleToggle] = useState("student");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTraditionalSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
        role: roleToggle,
      });
      login(response.data.token, response.data.user, roleToggle);
      navigate(`/${roleToggle}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.message || `${roleToggle} login failed.`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-lg">
        <img src={Logo} className="h-20 w-fit mx-auto" />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Log In
        </h2>
        {error && (
          <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </p>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleTraditionalSubmit}>
          <div>
            <label htmlFor="role-toggle" className="sr-only">
              Select Role
            </label>
            <select
              id="role-toggle"
              name="role-toggle"
              value={roleToggle}
              onChange={(e) => setRoleToggle(e.target.value)}
              className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm mb-3"
            >
              <option value="student">Student</option>
              <option value="company">Company</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
          />

          <button
            type="submit"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
          >
            Log In as {roleToggle.charAt(0).toUpperCase() + roleToggle.slice(1)}
          </button>
        </form>

        <div className="text-center text-sm">
          <Link
            to="/signin"
            className="font-medium text-sky-600 hover:text-sky-500"
          >
            Don't have an account? Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
