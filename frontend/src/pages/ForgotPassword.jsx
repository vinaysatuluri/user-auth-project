import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Adjust the path to your API functions

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState('sendOtp');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const navigate = useNavigate();

    const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer in seconds
    const [resendCount, setResendCount] = useState(0);
    const [resendError, setResendError] = useState('');
    const [resendLoading, setResendLoading] = useState(false);
    const RESEND_COOLDOWN_TIME = 60; // 60 seconds cooldown
    const MAX_RESEND_ATTEMPTS = 5;

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) {
            setError('Please enter your email address.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/auth/forgot-password', { email }); //  Corrected endpoint
            setLoading(false);
            setStep('verifyOtp');
            setSuccessMsg(`OTP sent to ${email}. Please check your inbox (and spam folder).`);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.error || 'An error occurred while sending OTP.'); //  Improved error message
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        if (!otp) {
            setError('Please enter the OTP you received.');
            return;
        }

        setLoading(true);
        console.log("Verifying OTP:", { email, otp }); //  ADDED LOG

        try {
            const response = await api.post('/auth/verify-otp', {
                email: email,
                otp: otp,
                purpose: 'reset-password' //  ADDED PURPOSE FOR PASSWORD RESET
            });
            setLoading(false);
            setSuccessMsg('OTP Verified! You can now reset your password.');
            const { token } = response.data; // Extract the token from the response
            navigate(`/reset-password?token=${token}&email=${email}`); // Navigate with token and email as URL parameters
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.error || 'Invalid or expired OTP.'); //  Improved error message
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resendCount >= MAX_RESEND_ATTEMPTS) {
            return; // Do nothing if on cooldown or max attempts reached
        }

        setResendLoading(true);
        setResendCount(prevCount => prevCount + 1);
        setResendError('');
        console.log('Resending OTP for email:', email);
        try {
            const response = await api.post('/auth/resend-otp', { email: email });
            //  Check the response status and data for success.
            if (response.status === 200) {
                setResendCooldown(RESEND_COOLDOWN_TIME);
                setSuccessMsg('OTP resent successfully.'); // set success message
            }
            else {
                setResendError(response.data?.error || 'Failed to resend OTP.');
            }

        } catch (error) {
            console.error('Error resending OTP:', error);
            setResendError(error.response?.data?.error || 'Failed to resend OTP. Please check your network connection.');
        } finally {
            setResendLoading(false);
        }
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
                            {resendError && (
                                <small style={{ color: '#ff6b6b', fontSize: '0.8rem', display: 'block', marginTop: '10px' }}>{resendError}</small>
                            )}
                            {resendCooldown > 0 ? (
                                <p style={{ color: 'gray', fontSize: '0.9rem', marginTop: '10px' }}>
                                    Resend OTP available in {resendCooldown} seconds.
                                </p>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-link p-0 mt-2"
                                    style={{ color: '#4e54c8', textDecoration: 'none', fontSize: '0.9rem' }}
                                    onClick={handleResendOtp}
                                    disabled={resendLoading || resendCount >= MAX_RESEND_ATTEMPTS}

                                >
                                    {resendLoading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : 'Resend OTP'}
                                </button>
                            )}
                            {resendCount >= MAX_RESEND_ATTEMPTS && (
                                <p style={{ color: 'orange', fontSize: '0.8em', marginTop: '5px' }}>
                                    Too many resend attempts. Please check your email or try again later.
                                </p>
                            )}
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
