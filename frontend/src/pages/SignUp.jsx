import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const validate = () => {
    let tempErrors = {};
    if (!formData.firstName.trim()) tempErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) tempErrors.lastName = 'Last name is required';
    if (!formData.username.trim()) tempErrors.username = 'Username is required';
    if (!formData.email.trim()) tempErrors.email = 'Email is required';
    if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required';

    const password = formData.password;
    if (!password) {
      tempErrors.password = 'Password is required';
    } else {
      if (password.length < 8) tempErrors.password = 'Password must be at least 8 characters';
      if (!/[A-Z]/.test(password)) tempErrors.password = 'Must include an uppercase letter';
      if (!/[a-z]/.test(password)) tempErrors.password = 'Must include a lowercase letter';
      if (!/[0-9]/.test(password)) tempErrors.password = 'Must include a number';
      if (!/[!@#$%^&*]/.test(password)) tempErrors.password = 'Must include a special character (!@#$%^&*)';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('Form submitted successfully', formData);
      setIsSubmitted(true);
    }
  };

  if (isSubmitted) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          minHeight: '100vh',
          background: '#0d0d0d',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          className="card p-4 shadow-lg animate__animated animate__fadeIn"
          style={{
            width: '22rem',
            borderRadius: '1.25rem',
            background: '#1a1a1a',
            border: '1px solid #333',
            color: '#ffffff',
            textAlign: 'center',
          }}
        >
          <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#28a745' }}>Account Created Successfully!</h3>
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
            You can now <a href="/login" style={{ color: '#4e54c8', textDecoration: 'none' }}>Login</a>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: '100vh',
        background: '#0d0d0d',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        className="card p-3 shadow-lg animate__animated animate__fadeIn"
        style={{
          width: '22rem',
          borderRadius: '1.25rem',
          background: '#1a1a1a',
          border: '1px solid #333',
          color: '#ffffff',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-2">
          <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
        </div>

        <form onSubmit={handleSubmit}>
          <h3 className="text-center mb-3" style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#ffffff' }}>
            Create Account
          </h3>

          {/* Input Fields */}
          <InputField id="firstName" label="First Name" value={formData.firstName} onChange={handleChange} error={errors.firstName} />
          <InputField id="middleName" label="Middle Name (optional)" value={formData.middleName} onChange={handleChange} />
          <InputField id="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} error={errors.lastName} />
          <InputField id="username" label="Username" value={formData.username} onChange={handleChange} error={errors.username} />
          <InputField id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} error={errors.email} />

          {/* Password Field with Toggle */}
          <div className="mb-2 position-relative">
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
            {errors.password && <small style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>{errors.password}</small>}
          </div>

          <InputField id="phone" label="Phone" value={formData.phone} onChange={handleChange} error={errors.phone} />

          {/* Submit Button */}
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
            Sign Up
          </button>
        </form>

        {/* Login Redirect */}
        <div className="text-center mt-2">
          <p className="mb-0" style={{ color: '#bbbbbb', fontSize: '0.85rem' }}>
            Already have an account?{' '}
            <a href="/login" className="fw-bold" style={{ color: '#4e54c8', textDecoration: 'none' }}>
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// Reusable InputField Component
const InputField = ({ id, label, type = 'text', value, onChange, error }) => (
  <div className="mb-2">
    <label htmlFor={id} className="form-label" style={{ color: '#bbbbbb', fontSize: '0.9rem' }}>
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="form-control"
      placeholder={label}
      value={value}
      onChange={onChange}
      style={{
        borderRadius: '0.6rem',
        padding: '0.5rem',
        backgroundColor: '#262626',
        border: '1px solid #555',
        color: '#ffffff',
        fontSize: '0.9rem',
      }}
    />
    {error && <small style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>{error}</small>}
  </div>
);

export default SignUp;
