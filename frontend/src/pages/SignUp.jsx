import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api'; // Adjust the path to your API functions

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
    const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer in seconds

    const RESEND_COOLDOWN_TIME = 60; // 60 seconds cooldown
    const MAX_RESEND_ATTEMPTS = 5;
    const navigate = useNavigate();

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown(prev => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleChange = (e) => {
        const name = e.target.id.replace(/([A-Z])/g, '_$1').toLowerCase();
        setFormData({ ...formData, [name]: e.target.value });
    };

    const handleOtpChange = (e) => {
        setOtp(e.target.value);
    };

    const validateSignup = () => {
        let tempErrors = {};
        if (!formData.first_name.trim()) tempErrors.firstName = 'First name is required';
        if (!formData.last_name.trim()) tempErrors.lastName = 'Last name is required';
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateSignup()) {
            setLoading(true);
            console.log('Signup FormData:', formData);
            try {
                const response = await api.post('http://localhost:5000/api/auth/signup', formData); // Updated route - made explicit
                console.log('Signup successful', response);
                setIsSignedUp(true);
            } catch (error) {
                console.error('Error during signup:', error);
                console.error('Error Response:', error.response);
                let errorMessage = 'Something went wrong during signup. Please try again.';
                if (error.response) {
                    errorMessage = error.response.data?.error || errorMessage;
                }
                setErrors({
                    ...errors,
                    apiError: errorMessage,
                });
                alert('Error: Unable to create account');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleVerifyOtp = async () => {
        setIsVerifyingOtp(true);
        setVerificationError('');
        try {
            const response = await api.post('http://localhost:5000/api/auth/verify-otp', { email: formData.email, otp, purpose: 'signup' }); // Updated route - made explicit
            console.log('OTP verification successful', response);
            alert('Email verified successfully! You can now log in.');
            navigate('/login'); // Use navigate for routing
        } catch (error) {
            console.error('Error verifying OTP:', error.response ? error.response.data : error.message || error);
            let errorMessage = 'Failed to verify OTP. Please try again.';
            if (error.response) {
                errorMessage = error.response.data?.error || errorMessage;
            }
            setVerificationError(errorMessage);
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendCooldown > 0 || resendCount >= MAX_RESEND_ATTEMPTS) {
            return; // Do nothing if on cooldown or max attempts reached
        }

        setResendLoading(true);
        setResendCount(prevCount => prevCount + 1);
        setResendError('');
        console.log('Resending OTP for email:', formData.email);
        try {
            const response = await api.post('http://localhost:5000/api/auth/resend-otp', { email: formData.email }); // Updated route - made explicit
            const data = response;
            console.log('Resend OTP successful', data);
            setResendCooldown(RESEND_COOLDOWN_TIME); // Start the cooldown
        } catch (error) {
            console.error('Error resending OTP:', error);
            console.error('Resend OTP Error Response:', error.response);
            let errorMessage = 'Failed to resend OTP. Please check your network connection.';
            if (error.response) {
                errorMessage = error.response.data?.error || errorMessage;
            }
            setResendError(errorMessage);
        } finally {
            setResendLoading(false);
        }
    };

    if (isSignedUp) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#0d0d0d' }}>
                <div className="card p-4 shadow-lg animate__animated animate__fadeIn" style={{ width: '22rem', borderRadius: '1.25rem', background: '#1a1a1a', border: '1px solid #333', color: '#ffffff', textAlign: 'center' }}>
                    <h3 style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#28a745' }}>Account Created!</h3>
                    <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
                        Please enter the OTP sent to your email ({formData.email}) to verify your account.
                    </p>

                    {resendError && (
                        <small style={{ color: '#ff6b6b', fontSize: '0.8rem', display: 'block', marginBottom: '10px' }}>{resendError}</small>
                    )}

                    <div className="mb-3">
                        <label htmlFor="otp" className="form-label" style={{ color: '#bbbbbb', fontSize: '0.9rem' }}>OTP</label>
                        <input
                            type="text"
                            id="otp"
                            className="form-control"
                            placeholder="Enter OTP"
                            value={otp}
                            onChange={handleOtpChange}
                            style={{
                                borderRadius: '0.6rem',
                                padding: '0.5rem',
                                backgroundColor: '#262626',
                                border: '1px solid #555',
                                color: '#ffffff',
                                fontSize: '0.9rem',
                            }}
                        />
                        {verificationError && <small style={{ color: '#ff6b6b', fontSize: '0.8rem' }}>{verificationError}</small>}
                    </div>
                    <button
                        className="btn w-100"
                        style={{ borderRadius: '0.7rem', padding: '0.6rem', backgroundColor: '#4e54c8', border: 'none', fontWeight: 'bold', color: '#ffffff', fontSize: '1rem' }}
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp}
                    >
                        {isVerifyingOtp ? <FaSpinner className="fa-spin" /> : 'Verify OTP'}
                    </button>

                    <div className="mt-2">
                        {resendCooldown > 0 ? (
                            <p style={{ color: 'gray', fontSize: '0.9rem' }}>
                                Resend OTP available in {resendCooldown} seconds.
                            </p>
                        ) : (
                            <button
                                type="button"
                                className="btn btn-link"
                                style={{ color: '#4e54c8', textDecoration: 'none', fontSize: '0.9rem' }}
                                onClick={handleResendOtp}
                                disabled={resendLoading || resendCount >= MAX_RESEND_ATTEMPTS}
                            >
                                {resendLoading ? <FaSpinner className="fa-spin" /> : 'Resend OTP'}
                            </button>
                        )}
                        {resendCount >= MAX_RESEND_ATTEMPTS && (
                            <p style={{ color: 'orange', fontSize: '0.8em', marginTop: '5px' }}>
                                Too many resend attempts. Please check your email or try signing up again later.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', background: '#0d0d0d' }}>
            <div className="card p-3 shadow-lg animate__animated animate__fadeIn" style={{ width: '22rem', borderRadius: '1.25rem', background: '#1a1a1a', border: '1px solid #333', color: '#ffffff' }}>
                <div className="text-center mb-2">
                    <img src="/logo.png" alt="Logo" style={{ width: '45px', height: '45px', objectFit: 'contain' }} />
                </div>

                <form onSubmit={handleSubmit}>
                    <h3 className="text-center mb-3" style={{ fontWeight: 'bold', fontSize: '1.4rem', color: '#ffffff' }}>
                        Create Account
                    </h3>

                    <FormInput id="firstName" label="First Name" value={formData.first_name} onChange={handleChange} error={errors.firstName} />
                    <FormInput id="middleName" label="Middle Name (optional)" value={formData.middle_name} onChange={handleChange} />
                    <FormInput id="lastName" label="Last Name" value={formData.last_name} onChange={handleChange} error={errors.lastName} />
                    <FormInput id="username" label="Username" value={formData.username} onChange={handleChange} error={errors.username} />
                    <FormInput id="email" type="email" label="Email Address" value={formData.email} onChange={handleChange} error={errors.email} />

                    <div className="mb-2 position-relative">
                        <label htmlFor="password" className="form-label" style={{ color: '#bbbbbb', fontSize: '0.9rem' }}>Password</label>
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

                    <FormInput id="phone" label="Phone" value={formData.phone} onChange={handleChange} error={errors.phone} />

                    <button
                        type="submit"
                        className="btn w-100"
                        style={{ borderRadius: '0.7rem', padding: '0.6rem', backgroundColor: '#4e54c8', border: 'none', fontWeight: 'bold', color: '#ffffff', fontSize: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? <FaSpinner className="fa-spin" /> : 'Sign Up'}
                    </button>
                </form>

                {errors.apiError && (
                    <small style={{ color: '#ff6b6b', fontSize: '0.8rem', textAlign: 'center', display: 'block', marginTop: '1rem' }}>
                        {errors.apiError}
                    </small>
                )}

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

const FormInput = ({ id, label, value, onChange, error, type = 'text' }) => (
    <div className="mb-2">
        <label htmlFor={id} className="form-label" style={{ color: '#bbbbbb', fontSize: '0.9rem' }}>{label}</label>
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

