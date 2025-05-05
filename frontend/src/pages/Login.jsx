import React, { useState } from 'react';
import { FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Login() {
    const [formData, setFormData] = useState({
        usernameOrEmail: '',
        password: '',
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setMessage(null);
        try {
            const res = await api.post('/auth/login', {
                usernameOrEmail: formData.usernameOrEmail,
                password: formData.password,
            });

            if (res.data.token) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setMessage({ type: 'success', text: 'Login successful!' });
                setTimeout(() => {
                    setMessage(null);
                    navigate('/dashboard');
                }, 1000);
            } else {
                throw new Error('Login failed. Please check your credentials.');
            }
        } catch (err) {
            let msg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
            if (err.response?.status === 400) {
                msg = 'Invalid credentials. Please check your username/email and password.';
            }
            setMessage({ type: 'error', text: msg });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#0d0d0d' }}>
            <div className="card shadow-lg animate__animated animate__fadeIn" style={{ width: '24rem', borderRadius: '1.5rem', background: 'rgba(255, 255, 255, 0.06)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 12px 24px rgba(0, 0, 0, 0.3)', color: '#ffffff' }}>
                <div className="card-body p-4">
                    <div className="text-center mb-4">
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '50%',
                            padding: '8px',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            width: '50px',
                            height: '50px',
                            marginBottom: '1rem'
                        }}>
                            <span style={{
                                color: '#ffffff',
                                fontWeight: 'bold',
                                fontSize: '1.2rem',
                                letterSpacing: '0.1em',
                                textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)',
                            }}>
                                TEST
                            </span>
                        </div>
                        <h3 className="card-title mt-3" style={{ fontWeight: 'bold', fontSize: '1.6rem', color: '#ffffff' }}>
                            Welcome Back
                        </h3>
                        <p className="text-muted" style={{ fontSize: '0.9rem', color: '#cccccc' }}>Login to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="form-container">
                        {message && (
                            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} fade show`} role="alert" style={{ fontSize: '0.9rem', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-group mb-4">
                            <label htmlFor="usernameOrEmail" className="form-label" style={{ color: '#eeeeee', fontSize: '0.95rem' }}>
                                Username or Email
                            </label>
                            <input
                                type="text"
                                id="usernameOrEmail"
                                className={`form-control ${errors.usernameOrEmail ? 'is-invalid' : ''}`}
                                placeholder="Enter username or email"
                                value={formData.usernameOrEmail}
                                onChange={handleChange}
                                style={{
                                    borderRadius: '0.75rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#ffffff',
                                    fontSize: '1rem',
                                    padding: '0.75rem',
                                    boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
                                }}
                            />
                            {errors.usernameOrEmail && (
                                <div className="invalid-feedback" style={{ fontSize: '0.8rem' }}>
                                    {errors.usernameOrEmail}
                                </div>
                            )}
                        </div>

                        <div className="form-group mb-4">
                            <label htmlFor="password" className="form-label" style={{ color: '#eeeeee', fontSize: '0.95rem' }}>
                                Password
                            </label>
                            <div className="input-group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    style={{
                                        borderRadius: '0.75rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                        border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#ffffff',
                                        fontSize: '1rem',
                                        padding: '0.75rem',
                                        boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.03)',
                                    }}
                                />
                                <button
                                    className="btn btn-outline-secondary"
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        borderTopLeftRadius: '0',
                                        borderBottomLeftRadius: '0',
                                        borderColor: 'rgba(255, 255, 255, 0.15)',
                                        padding: '0.2rem 0.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    }}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <FaEye size={18} color="#eeeeee" /> : <FaEyeSlash size={18} color="#eeeeee" />}
                                </button>
                            </div>
                            {errors.password && (
                                <div className="invalid-feedback" style={{ fontSize: '0.8rem' }}>
                                    {errors.password}
                                </div>
                            )}
                        </div>

                        <div className="form-group mb-4 text-end">
                            <a href="/forgot-password" className="text-info" style={{ fontSize: '0.9rem', textDecoration: 'none', color: '#4299e1' }}>
                                Forgot password?
                            </a>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                            style={{
                                borderRadius: '0.75rem',
                                padding: '0.8rem',
                                fontWeight: 'bold',
                                fontSize: '1.1rem',
                                backgroundColor: '#4299e1',
                                border: 'none',
                                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.25)',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {loading ? (
                                <>
                                    <FaSpinner className="mr-2 fa-spin" size={18} /> Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>
                    </form>

                    <div className="text-center mt-4" style={{ color: '#cccccc', fontSize: '0.9rem' }}>
                        Don't have an account?{' '}
                        <a href="/signup" className="font-weight-semibold text-primary" style={{ textDecoration: 'none', color: '#4299e1' }}>
                            Sign up
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;