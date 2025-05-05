/**
 * ResetPassword Component
 * Handles password reset using email and token from URL query params.
 * Validates password strength and submits to /auth/reset-password endpoint.
 * TODO: Add separate confirm password toggle, move styles to CSS module, enhance password strength meter.
 */
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api';

function ResetPassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [passwordStrength, setPasswordStrength] = useState('');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const checkPasswordStrength = (password) => {
        const strengthRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;
        if (password.length === 0) return '';
        if (password.length < 8) return 'Too short';
        if (!/[A-Za-z]/.test(password)) return 'Must contain at least one letter';
        if (!/\d/.test(password)) return 'Must contain at least one number';
        if (strengthRegex.test(password)) return 'Strong';
        return 'Weak';
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setPasswordStrength(''); // Reset password strength feedback

        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)\S{8,}$/;

        if (!password || !confirmPassword) {
            setError('Both fields are required.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and contain at least one letter and one number.');
            return;
        }

        if (!email || !token) {
            setError('Invalid reset link. Please try the forgot password process again.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, token, newPassword: password });
            setLoading(false);
            setSuccessMsg('Password has been reset successfully!');
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.error || 'Failed to connect to the server. Please try again.');
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h3 style={styles.title}>
                    Reset Password
                </h3>

                {successMsg && (
                    <div style={styles.successMessage}>
                        {successMsg}
                    </div>
                )}

                {error && (
                    <div style={styles.errorMessage}>
                        {error}
                    </div>
                )}

                {!email || !token ? (
                    <p className="text-center">Invalid reset link. Please go through the forgot password process again.</p>
                ) : (
                    <form onSubmit={handleResetPassword}>
                        <div style={styles.inputGroup}>
                            <label htmlFor="password" style={styles.label}>
                                New Password
                            </label>
                            <div style={styles.passwordInputContainer}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className="form-control"
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setPasswordStrength(checkPasswordStrength(e.target.value));
                                    }}
                                    style={styles.passwordInput}
                                    required
                                />
                                <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    {showPassword ? <Eye size={22} /> : <EyeOff size={22} />}
                                </span>
                            </div>
                            {passwordStrength && (
                                <div style={{ ...styles.passwordStrength, color: passwordStrength === 'Strong' ? 'green' : 'red' }}>
                                    {passwordStrength === 'Strong' ? 'Password strength: Strong' : `Password strength: ${passwordStrength}`}
                                </div>
                            )}
                        </div>

                        <div style={styles.inputGroup}>
                            <label htmlFor="confirmPassword" style={styles.label}>
                                Confirm Password
                            </label>
                            {/* TODO: Consider separate showConfirmPassword state for independent toggle */}
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                className="form-control"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : 'Reset Password'}
                        </button>
                    </form>
                )}

                <div style={styles.backToLogin}>
                    <a href="/login" style={styles.loginLink}>
                        Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: '#0d0d0d',
    },
    card: {
        width: '22rem',
        padding: '20px',
        borderRadius: '1.25rem',
        background: '#1a1a1a',
        border: '1px solid #333',
        color: '#ffffff',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.5)',
        animation: 'fadeIn 0.5s ease-out',
    },
    title: {
        textAlign: 'center',
        marginBottom: '20px',
        fontWeight: 'bold',
        fontSize: '1.4rem',
    },
    successMessage: {
        backgroundColor: '#28a745',
        color: '#fff',
        padding: '10px',
        borderRadius: '0.6rem',
        marginBottom: '15px',
        fontSize: '0.9rem',
        textAlign: 'center',
    },
    errorMessage: {
        backgroundColor: '#e53e3e',
        color: '#fff',
        padding: '10px',
        borderRadius: '0.6rem',
        marginBottom: '15px',
        fontSize: '0.9rem',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: '15px',
    },
    label: {
        display: 'block',
        color: '#bbbbbb',
        marginBottom: '5px',
        fontSize: '0.9rem',
    },
    input: {
        borderRadius: '0.6rem',
        backgroundColor: '#262626',
        border: '1px solid #555',
        color: '#ffffff',
        padding: '0.7rem',
        width: '100%',
        fontSize: '0.9rem',
    },
    passwordInputContainer: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    passwordInput: {
        borderRadius: '0.6rem',
        backgroundColor: '#262626',
        border: '1px solid #555',
        color: '#ffffff',
        padding: '0.7rem',
        width: '100%',
        fontSize: '0.9rem',
    },
    eyeIcon: {
        position: 'absolute',
        right: '10px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        color: '#777',
    },
    passwordStrength: {
        marginTop: '5px',
        fontSize: '0.8rem',
    },
    button: {
        borderRadius: '0.7rem',
        padding: '0.7rem',
        fontWeight: 'bold',
        backgroundColor: '#4e54c8',
        border: 'none',
        fontSize: '1rem',
    },
    backToLogin: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '0.85rem',
    },
    loginLink: {
        color: '#4e54c8',
        textDecoration: 'none',
    },
};

export default ResetPassword;