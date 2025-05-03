import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api'; // ✅ using centralized axios instance

function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    const strengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (password.length === 0) return '';
    if (password.length < 8) return 'Too short';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (strengthRegex.test(password)) return 'Strong';
    return 'Weak';
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setPasswordStrength('');
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
  
    if (!password || !confirmPassword) {
      setError('Both fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number.');
      return;
    }

    setLoading(true);
    try {
      // Assuming we have an endpoint for resetting the password
      const response = await api.post('/reset-password', { password });
      setLoading(false);
      setSuccessMsg('Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 2000); // Redirect to login page after successful reset
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'An error occurred while resetting your password.');
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      backgroundColor: '#0d0d0d',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        backgroundColor: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '1.2rem',
        padding: '2.5rem',
        color: '#fff',
        boxShadow: '0 0 15px rgba(0, 0, 0, 0.4)',
        transition: 'transform 0.3s ease',
      }}>
        <h3 style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          fontWeight: 'bold',
          fontSize: '1.6rem',
          color: '#4e54c8',
        }}>
          Reset Password
        </h3>

        {successMsg && (
          <div className="alert alert-success text-center" style={{
            backgroundColor: '#4CAF50',
            color: '#fff',
            fontSize: '1rem',
            marginBottom: '1rem',
            borderRadius: '0.8rem',
            padding: '1rem',
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleResetPassword}>
          <div className="mb-3 position-relative">
            <label htmlFor="password" style={{
              color: '#fff',  // Set label color to white
              marginBottom: '0.5rem',
              display: 'block',
              fontSize: '1rem',
            }}>
              New Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-control"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordStrength(checkPasswordStrength(e.target.value));
              }}
              style={{
                backgroundColor: '#333',
                borderColor: '#555',
                color: '#fff',
                borderRadius: '0.7rem',
                paddingRight: '3rem', // Ensures space for the icon
                paddingLeft: '1rem',  // Added some padding on the left
                transition: 'all 0.3s ease',
                fontSize: '1rem',
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '15px', // Increased the space to avoid overlapping
                top: '50%',
                transform: 'translateY(-50%)',
                cursor: 'pointer',
                color: '#ccc',
              }}
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </span>
            {passwordStrength && (
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.9rem',
                color: passwordStrength === 'Strong' ? 'green' : 'red',
                fontWeight: 'bold',
                transition: 'opacity 0.3s ease',
              }}>
                {passwordStrength === 'Strong' ? 'Password strength: Strong' : `Password strength: ${passwordStrength}`}
              </div>
            )}
          </div>

          <div className="mb-3 position-relative">
            <label htmlFor="confirmPassword" style={{
              color: '#fff',  // Set label color to white
              marginBottom: '0.5rem',
              display: 'block',
              fontSize: '1rem',
            }}>
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="confirmPassword"
              className="form-control"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                backgroundColor: '#333',
                borderColor: '#555',
                color: '#fff',
                borderRadius: '0.7rem',
                paddingRight: '3rem', // Ensures space for the icon
                paddingLeft: '1rem',  // Added some padding on the left
                transition: 'all 0.3s ease',
                fontSize: '1rem',
              }}
            />
          </div>

          {error && (
            <div className="alert alert-danger" role="alert" style={{
              fontSize: '1rem',
              backgroundColor: '#f44336',
              color: '#fff',
              borderRadius: '0.8rem',
              padding: '1rem',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              borderRadius: '0.8rem',
              padding: '0.8rem',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              backgroundColor: '#4e54c8',
              border: 'none',
              color: '#fff',
              transition: 'background-color 0.3s ease',
            }}
            disabled={loading}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#3e47a2'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#4e54c8'}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : 'Reset Password'}
          </button>
        </form>

        <div className="text-center mt-3">
          <a href="/login" style={{
            color: '#4e54c8',
            textDecoration: 'none',
            fontSize: '0.9rem',
            transition: 'color 0.3s ease',
          }}>
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
