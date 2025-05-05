import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function SignUp() {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSignedUp, setIsSignedUp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendError, setResendError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [updateEmailAttempts, setUpdateEmailAttempts] = useState(0);
  const MAX_UPDATE_ATTEMPTS = 3;
  const RESEND_COOLDOWN_TIME = 60;
  const MAX_RESEND_ATTEMPTS = 3;
  const OTP_LENGTH = 6;
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= OTP_LENGTH) {
      setOtp(value);
    }
  };

  const handleNewEmailChange = (e) => {
    setNewEmail(e.target.value);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateSignup = () => {
    const tempErrors = {};
    if (!formData.first_name.trim()) tempErrors.first_name = 'First name is required';
    if (!formData.last_name.trim()) tempErrors.last_name = 'Last name is required';
    if (!formData.username.trim()) tempErrors.username = 'Username is required';
    if (!formData.email.trim()) {
      tempErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) tempErrors.phone = 'Phone number is required';

    const password = formData.password;
    if (!password) {
      tempErrors.password = 'Password is required';
    } else {
      if (password.length < 8) tempErrors.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(password)) tempErrors.password = 'Must include an uppercase letter';
      else if (!/[a-z]/.test(password)) tempErrors.password = 'Must include a lowercase letter';
      else if (!/[0-9]/.test(password)) tempErrors.password = 'Must include a number';
      else if (!/[!@#$%^&*]/.test(password)) tempErrors.password = 'Must include a special character (!@#$%^&*)';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateSignup()) {
      setLoading(true);
      try {
        await api.post('/auth/signup', formData);
        setIsSignedUp(true);
      } catch (error) {
        const errorMessage =
          error.response?.data?.error || 'Something went wrong during signup. Please try again.';
        setErrors({ ...errors, apiError: errorMessage });
        alert('Error: Unable to create account');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== OTP_LENGTH) {
      setVerificationError('Please enter a valid 6-digit OTP');
      return;
    }
    setIsVerifyingOtp(true);
    setVerificationError('');
    try {
      await api.post('/auth/verify-otp', { email: formData.email, otp, purpose: 'signup' });
      alert('Email verified successfully! You can now log in.');
      navigate('/login');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to verify OTP. Please try again.';
      setVerificationError(errorMessage);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendCount >= MAX_RESEND_ATTEMPTS) return;
    setResendLoading(true);
    setResendCount((prev) => prev + 1);
    setResendError('');
    try {
      await api.post('/auth/resend-otp', { email: formData.email });
      setResendCooldown(RESEND_COOLDOWN_TIME);
    } catch (error) {
      const errorMessage =
        error.response?.data?.error === 'Invalid email'
          ? 'The email address is invalid. Please update it and try again.'
          : error.response?.data?.error || 'Failed to resend OTP. Please check your network or email address.';
      setResendError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!validateEmail(newEmail)) {
      setResendError('Please enter a valid email address');
      return;
    }
    if (newEmail === formData.email) {
      setResendError('The new email is the same as the current email. Please enter a different email.');
      return;
    }
    setResendLoading(true);
    setResendError('');
    setUpdateEmailAttempts((prev) => prev + 1);
    try {
      const response = await api.post('/auth/update-email', { oldEmail: formData.email, newEmail });
      setFormData({ ...formData, email: newEmail });
      setResendCount(0);
      setResendCooldown(RESEND_COOLDOWN_TIME);
      setIsEditingEmail(false);
      setNewEmail('');
      setUpdateEmailAttempts(0);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Update email error:', error, error.response);
      }
      let errorMessage = 'Failed to update email. Please try again.';
      if (error.response?.data?.error) {
        switch (error.response.data.error) {
          case 'Email already in use':
            errorMessage = 'This email is already registered. Please use a different email.';
            break;
          case 'User not found':
            errorMessage = 'No account found with the current email. Please start over.';
            break;
          case 'Invalid email format':
            errorMessage = 'The new email address is invalid. Please check and try again.';
            break;
          case 'Old and new email are required':
            errorMessage = 'Both old and new email addresses are required.';
            break;
          case 'New email must be different from the old email':
            errorMessage = 'The new email must be different from the current email.';
            break;
          default:
            errorMessage = error.response.data.error;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.response?.status === 404 && error.response?.config?.url?.includes('/update-email')) {
        errorMessage = 'Email update service is currently unavailable. Please start over with the new email.';
      }
      setResendError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleStartOver = () => {
    setIsSignedUp(false);
    setOtp('');
    setErrors({});
    setResendCount(0);
    setResendCooldown(0);
    setIsEditingEmail(false);
    setNewEmail('');
    setUpdateEmailAttempts(0);
    setFormData({ ...formData, email: newEmail || formData.email });
  };

  if (isSignedUp) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
        <div className="card shadow-lg animate__animated animate__fadeIn" style={{ width: '22rem', borderRadius: '1.25rem', background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)', color: '#ffffff', textAlign: 'center' }}>
          <div className="card-body p-4">
            <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#4299e1', marginBottom: '1rem' }}>Account Created!</h3>
            <p style={{ fontSize: '0.95rem', color: '#cccccc', marginBottom: '1.5rem' }}>
              Please enter the OTP sent to your email ({formData.email}) to verify your account.
            </p>

            {resendError && (
              <div className="alert alert-danger" role="alert" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
                {resendError}
              </div>
            )}

            {isEditingEmail ? (
              <div className="mb-3">
                <label htmlFor="newEmail" className="form-label" style={{ color: '#eeeeee', fontSize: '0.9rem' }}>
                  Update Email Address
                </label>
                <input
                  type="email"
                  id="newEmail"
                  className="form-control"
                  placeholder="Enter correct email"
                  value={newEmail}
                  onChange={handleNewEmailChange}
                  style={{
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    fontSize: '1rem',
                    padding: '0.7rem',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
                  }}
                />
                <div className="mt-2">
                  <button
                    className="btn btn-primary me-2"
                    onClick={handleUpdateEmail}
                    disabled={resendLoading || !newEmail}
                    style={{ borderRadius: '0.5rem', padding: '0.5rem 1rem' }}
                  >
                    {resendLoading ? <FaSpinner className="fa-spin" /> : 'Update & Resend'}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditingEmail(false)}
                    style={{ borderRadius: '0.5rem', padding: '0.5rem 1rem' }}
                  >
                    Cancel
                  </button>
                </div>
                {updateEmailAttempts >= MAX_UPDATE_ATTEMPTS && (
                  <p style={{ color: 'orange', fontSize: '0.8em', marginTop: '10px' }}>
                    Too many failed attempts.{' '}
                    <button
                      type="button"
                      className="btn btn-link p-0"
                      style={{ color: '#4299e1', textDecoration: 'none', fontSize: '0.8em' }}
                      onClick={handleStartOver}
                    >
                      Start over
                    </button>
                    {' '}with a new signup or{' '}
                    <a
                      href="mailto:support@example.com"
                      style={{ color: '#4299e1', textDecoration: 'none', fontSize: '0.8em' }}
                    >
                      contact support
                    </a>
                    .
                  </p>
                )}
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <label htmlFor="otp" className="form-label" style={{ color: '#eeeeee', fontSize: '0.9rem' }}>
                    OTP
                  </label>
                  <input
                    type="text"
                    id="otp"
                    className="form-control"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={handleOtpChange}
                    maxLength={OTP_LENGTH}
                    aria-describedby="otp-error"
                    style={{
                      borderRadius: '0.5rem',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      fontSize: '1rem',
                      padding: '0.7rem',
                      boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
                    }}
                  />
                  {verificationError && (
                    <small id="otp-error" className="text-danger">
                      {verificationError}
                    </small>
                  )}
                </div>
                <button
                  className="btn btn-primary w-100"
                  style={{ borderRadius: '0.5rem', padding: '0.8rem', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#4299e1', border: 'none', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', cursor: 'pointer', transition: 'background-color 0.2s ease-in-out' }}
                  onClick={handleVerifyOtp}
                  disabled={isVerifyingOtp || otp.length !== OTP_LENGTH}
                >
                  {isVerifyingOtp ? <FaSpinner className="fa-spin" /> : 'Verify OTP'}
                </button>

                <div className="mt-3">
                  {resendCooldown > 0 ? (
                    <p style={{ color: '#cccccc', fontSize: '0.9rem' }}>
                      Resend OTP available in {resendCooldown} seconds.
                    </p>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-link"
                      style={{ color: '#4299e1', textDecoration: 'none', fontSize: '0.9rem' }}
                      onClick={handleResendOtp}
                      disabled={resendLoading || resendCount >= MAX_RESEND_ATTEMPTS}
                    >
                      {resendLoading ? <FaSpinner className="fa-spin" /> : 'Resend OTP'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-link"
                    style={{ color: '#4299e1', textDecoration: 'none', fontSize: '0.9rem' }}
                    onClick={() => setIsEditingEmail(true)}
                  >
                    Wrong email? Update it
                  </button>
                  {resendCount >= MAX_RESEND_ATTEMPTS && (
                    <p style={{ color: 'orange', fontSize: '0.8em', marginTop: '5px' }}>
                      Too many resend attempts. Please check your email for typos, update it, or{' '}
                      <button
                        type="button"
                        className="btn btn-link p-0"
                        style={{ color: '#4299e1', textDecoration: 'none', fontSize: '0.8em' }}
                        onClick={handleStartOver}
                      >
                        start over
                      </button>
                      .
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
      <div className="card shadow-lg animate__animated animate__fadeIn" style={{ width: '24rem', borderRadius: '1.5rem', background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)', color: '#ffffff' }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: '50%', padding: '0.7rem', border: '1px solid rgba(255, 250, 250, 0.2)', width: '48px', height: '48px', marginBottom: '1rem' }}>
              <span style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.08em', textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' }}>
                TEST
              </span>
            </div>
            <h3 className="card-title mt-3" style={{ fontWeight: 'bold', fontSize: '1.6rem', color: '#ffffff', marginBottom: '0.5rem' }}>
              Create Account
            </h3>
            <p className="text-muted" style={{ fontSize: '0.9rem', color: '#cccccc' }}>Sign up for a new account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <FormInput id="first_name" label="First Name" placeholder="Enter first name" value={formData.first_name} onChange={handleChange} error={errors.first_name} />
            <FormInput id="middle_name" label="Middle Name (optional)" placeholder="Enter middle name" value={formData.middle_name} onChange={handleChange} />
            <FormInput id="last_name" label="Last Name" placeholder="Enter last name" value={formData.last_name} onChange={handleChange} error={errors.last_name} />
            <FormInput id="username" label="Username" placeholder="Enter username" value={formData.username} onChange={handleChange} error={errors.username} />
            <FormInput id="email" type="email" label="Email Address" placeholder="Enter email" value={formData.email} onChange={handleChange} error={errors.email} />

            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label" style={{ color: '#eeeeee', fontSize: '0.95rem' }}>Password</label>
              <div className="input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-describedby="password-error"
                  style={{
                    borderRadius: '0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${errors.password ? '#e53e3e' : 'rgba(255, 255, 255, 0.15)'}`,
                    color: '#ffffff',
                    fontSize: '1rem',
                    padding: '0.7rem',
                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
                  }}
                />
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    borderTopLeftRadius: '0',
                    borderBottomLeftRadius: '0',
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: '#cccccc',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEye size={18} /> : <FaEyeSlash size={18} />}
                </button>
              </div>
              {errors.password && (
                <small id="password-error" className="text-danger">
                  {errors.password}
                </small>
              )}
            </div>

            <FormInput id="phone" label="Phone" placeholder="Enter phone number" value={formData.phone} onChange={handleChange} error={errors.phone} />

            <button
              type="submit"
              className="btn btn-primary w-100"
              style={{ borderRadius: '0.5rem', padding: '0.8rem', fontWeight: 'bold', fontSize: '1.1rem', backgroundColor: '#4299e1', border: 'none', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', cursor: 'pointer', transition: 'background-color 0.2s ease-in-out' }}
              disabled={loading}
            >
              {loading ? <FaSpinner className="fa-spin" /> : 'Sign Up'}
            </button>
          </form>

          {errors.apiError && (
            <small className="text-danger text-center d-block mt-3">{errors.apiError}</small>
          )}

          <div className="text-center mt-3" style={{ color: '#cccccc', fontSize: '0.9rem' }}>
            Already have an account?{' '}
            <a href="/login" className="font-weight-semibold text-primary" style={{ textDecoration: 'none', color: '#4299e1' }}>
              Login
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

const FormInput = ({ id, label, placeholder, value, onChange, error, type = 'text' }) => (
  <div className="mb-3">
    <label htmlFor={id} className="form-label" style={{ color: '#eeeeee', fontSize: '0.9rem' }}>
      {label}
    </label>
    <input
      type={type}
      id={id}
      className={`form-control ${error ? 'is-invalid' : ''}`}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      aria-describedby={error ? `${id}-error` : undefined}
      style={{
        borderRadius: '0.5rem',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        border: `1px solid ${error ? '#e53e3e' : 'rgba(255, 255, 255, 0.15)'}`,
        color: '#ffffff',
        fontSize: '1rem',
        padding: '0.7rem',
        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
      }}
    />
    {error && (
      <small id={`${id}-error`} className="text-danger">
        {error}
      </small>
    )}
  </div>
);

export default SignUp;