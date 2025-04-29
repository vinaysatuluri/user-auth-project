import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login() {
  const [formData, setFormData] = useState({
    usernameOrEmail: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.usernameOrEmail.trim()) tempErrors.usernameOrEmail = 'Username or Email is required';
    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Login form submitted', formData);
      // Add API call or redirect logic
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        backgroundColor: '#0d0d0d',
      }}
    >
      <div
        className="p-3 shadow-lg animate__animated animate__fadeIn"
        style={{
          width: '22rem',
          borderRadius: '1.25rem',
          background: 'linear-gradient(145deg, #1a1a1a, #111)',
          boxShadow: '0 0 30px rgba(0, 0, 0, 0.6)',
          color: '#ffffff',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <h3 className="text-center mb-3" style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#ffffff' }}>
            Welcome Back
          </h3>

          {/* Username or Email */}
          <div className="mb-2">
            <label htmlFor="usernameOrEmail" className="form-label" style={{ color: '#bbbbbb', fontSize: '0.9rem' }}>
              Username or Email
            </label>
            <input
              type="text"
              id="usernameOrEmail"
              className="form-control"
              placeholder="Enter username or email"
              value={formData.usernameOrEmail}
              onChange={handleChange}
              style={{
                borderRadius: '0.6rem',
                padding: '0.5rem',
                backgroundColor: '#262626',
                border: '1px solid #555',
                color: '#ffffff',
                fontSize: '0.9rem',
              }}
            />
            {errors.usernameOrEmail && (
              <small style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>{errors.usernameOrEmail}</small>
            )}
          </div>

          {/* Password */}
          <div className="mb-1 position-relative">
            <label htmlFor="password" className="form-label" style={{ color: '#bbbbbb', fontSize: '0.9rem' }}>
              Password
            </label>
            <div className="position-relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-control"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  borderRadius: '0.6rem',
                  padding: '0.5rem 2.5rem 0.5rem 0.5rem',
                  backgroundColor: '#262626',
                  border: '1px solid #555',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                }}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  top: '50%',
                  right: '10px',
                  transform: 'translateY(-50%)',
                  cursor: 'pointer',
                  color: '#bbbbbb',
                }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            {errors.password && (
              <small style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>{errors.password}</small>
            )}
          </div>

          {/* Forgot Password */}
          <div className="text-end mb-2">
            <a href="/forgot-password" style={{ color: '#4e54c8', fontSize: '0.85rem', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            className="btn w-100"
            style={{
              borderRadius: '0.7rem',
              padding: '0.6rem',
              backgroundColor: '#4e54c8',
              border: 'none',
              fontWeight: 'bold',
              color: '#ffffff',
              fontSize: '1rem',
            }}
          >
            Login
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center mt-3">
          <p className="mb-0" style={{ color: '#bbbbbb', fontSize: '0.85rem' }}>
            Don't have an account?{' '}
            <a href="/signup" className="fw-bold" style={{ color: '#4e54c8', textDecoration: 'none' }}>
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
