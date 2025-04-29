import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('sendOtp');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep('verifyOtp');
      setSuccessMsg(`OTP sent to ${email}`);
    }, 2000);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError('');
    if (!otp) {
      setError('Please enter the OTP you received.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('OTP Verified! You can now reset your password.');
      setStep('resetPassword'); // Step after OTP verification
    }, 2000);
  };

  const handleResetPassword = () => {
    navigate('/reset-password');  // Navigates to the reset password page
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: '#0d0d0d' }}>
      <div className="card p-4 shadow-lg animate__animated animate__fadeIn" style={{
        width: '22rem',
        borderRadius: '1.25rem',
        background: '#1a1a1a',
        border: '1px solid #333',
        color: '#ffffff'
      }}>
        <h3 className="text-center mb-3" style={{ fontWeight: 'bold', fontSize: '1.4rem' }}>
          Forgot Password
        </h3>

        {successMsg && (
          <div className="alert alert-success text-center" role="alert" style={{
            backgroundColor: '#28a745',
            color: '#fff',
            fontSize: '0.9rem',
            marginBottom: '1rem',
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={step === 'sendOtp' ? handleSendOtp : handleVerifyOtp}>
          {step === 'sendOtp' && (
            <div className="mb-3">
              <label htmlFor="email" className="form-label" style={{ color: '#bbbbbb' }}>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  borderRadius: '0.6rem',
                  backgroundColor: '#262626',
                  border: '1px solid #555',
                  color: '#ffffff',
                }}
              />
            </div>
          )}

          {step === 'verifyOtp' && (
            <div className="mb-3">
              <label htmlFor="otp" className="form-label" style={{ color: '#bbbbbb' }}>
                Enter OTP
              </label>
              <input
                type="text"
                id="otp"
                className="form-control"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{
                  borderRadius: '0.6rem',
                  backgroundColor: '#262626',
                  border: '1px solid #555',
                  color: '#ffffff',
                }}
              />
            </div>
          )}

          {error && (
            <div className="alert alert-danger p-2" role="alert" style={{
              fontSize: '0.85rem',
              marginBottom: '1rem',
              backgroundColor: '#e53e3e',
              color: '#fff',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100"
            style={{
              borderRadius: '0.7rem',
              padding: '0.6rem',
              fontWeight: 'bold',
              backgroundColor: '#4e54c8',
              border: 'none',
            }}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : step === 'sendOtp' ? 'Send OTP' : 'Verify OTP'}
          </button>
        </form>

        {/* Show Reset Password Link only after OTP is verified */}
        {step === 'resetPassword' && !loading && successMsg && (
          <div className="text-center mt-3">
            <button
              onClick={handleResetPassword}
              className="btn btn-success w-100"
              style={{
                borderRadius: '0.7rem',
                padding: '0.6rem',
                fontWeight: 'bold',
                backgroundColor: '#28a745',
                border: 'none',
                textDecoration: 'none',
                color: '#ffffff',
              }}
            >
              Go to Reset Password
            </button>
          </div>
        )}

        <div className="text-center mt-3">
          <a href="/login" style={{ color: '#4e54c8', textDecoration: 'none', fontSize: '0.85rem' }}>
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
