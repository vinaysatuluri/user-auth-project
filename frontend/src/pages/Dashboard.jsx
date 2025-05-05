import React, { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa'; // Import for the loading spinner

// Define a simple Button component within this file
const Button = ({ onClick, variant, className, children, disabled, style }) => {
    let baseStyle = {
        borderRadius: '0.75rem',
        fontWeight: 'bold',
        color: '#ffffff',
        padding: '0.7rem 1.4rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        border: 'none', // Remove default border
        display: 'inline-flex', // Use inline-flex for better alignment
        alignItems: 'center',
        justifyContent: 'center',
    };

    let variantStyle = {};

    if (variant === 'outline') {
        variantStyle = {
            borderColor: 'rgba(255, 255, 255, 0.15)',
            backgroundColor: 'transparent', // Make the background transparent for outline
        };
    } else { // Default variant (you can add 'default' to the if condition if you want)
        variantStyle = {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        };
    }

    const combinedStyle = { ...baseStyle, ...variantStyle, ...style };

    // Basic hover effect (you can expand this)
    const hoverClass = className?.includes('hover:bg-white/10') ? 'hover:bg-white/10 hover:border-white/20' : '';

    return (
        <button
            onClick={onClick}
            className={`
                ${className}
                ${hoverClass}
            `.trim()}
            style={combinedStyle}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

function Dashboard() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);

        const fetchUserData = async () => {
            if (token) {
                try {
                    const res = await api.get('/auth/profile', {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    setUserData(res.data);
                } catch (err) {
                    console.error('Error fetching user data', err);
                    setIsLoggedIn(false);
                    localStorage.removeItem('token');
                    navigate('/login');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [navigate]);

    const handleLogin = () => {
        navigate('/login');
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            setIsLoggedIn(false);
            setUserData(null);
            navigate('/');
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', color: '#ffffff' }}>
                <h2 style={{ fontWeight: 'bold' }}>
                    <FaSpinner className="mr-2 fa-spin" />
                    Loading Dashboard...
                </h2>
            </div>
        );
    }

    return (
        <div className="d-flex flex-column" style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', color: '#ffffff', padding: '2rem' }}>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 style={{ fontWeight: 'bold', fontSize: '1.8rem' }}>
                    {isLoggedIn ? `Welcome, ${userData?.username || 'User'}!` : 'Welcome to YourApp'}
                </h2>
                {isLoggedIn ? (
                    <Button
                        onClick={handleLogout}
                        variant="outline"
                        style={buttonStyle} // Use the extracted style
                        className="hover:bg-white/10 hover:border-white/20"
                    >
                        Logout
                    </Button>
                ) : (
                    <Button
                        onClick={handleLogin}
                        variant="outline"
                        style={buttonStyle}  // Use the extracted style
                        className="hover:bg-white/10 hover:border-white/20"
                    >
                        Login
                    </Button>
                )}
            </div>

            {/* Welcome Section */}
            <div className="mt-5 p-4 rounded-lg shadow-md" style={sectionStyle}>
                <h4 className="mb-3" style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#4299e1' }}>
                    Discover What’s Possible with YourApp
                </h4>
                <p style={{ color: '#cccccc', fontSize: '1rem' }}>
                    YourApp is a modern platform that empowers you with tools and insights.
                    Whether you're here to explore, track progress, or manage your account — everything starts here.
                </p>
            </div>

            {/* Call to Action Section */}
            {!isLoggedIn && (
                <div className="mt-5 p-4 rounded-lg shadow-md" style={ctaSectionStyle}>
                    <h4 className="mb-3" style={{ fontWeight: 'bold', fontSize: '1.5rem', color: '#ffffff' }}>
                        Get Started Today
                    </h4>
                    <p style={{ color: '#ffffff', fontSize: '1rem' }}>
                        Join our community and unlock access to powerful features. Login to your account or create a new one.
                    </p>
                    <Button
                        onClick={handleLogin}
                        variant="outline"
                        style={buttonStyle} // Use the extracted style
                        className="hover:bg-white/10 hover:border-white/20"
                    >
                        Login
                    </Button>
                </div>
            )}

            {/* Footer */}
            <footer className="text-center mt-auto py-3" style={footerStyle}>
                <p style={{ color: '#cccccc', fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} YourApp. All rights reserved.</p>
            </footer>
        </div>
    );
}

// Extracted Styles for consistency and reusability
const buttonStyle = {
    borderRadius: '0.75rem',
    fontWeight: 'bold',
    color: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '0.7rem 1.4rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.2s ease',
};

const sectionStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
    borderRadius: '1rem',
};

const ctaSectionStyle = {
    backgroundColor: 'rgba(66, 153, 225, 0.9)',
    backdropFilter: 'blur(7px)',
    borderRadius: '1rem',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
};

const footerStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    backdropFilter: 'blur(5px)',
    borderRadius: '0.75rem',
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    marginTop: '2rem',
    padding: '1rem',
    textAlign: 'center',
};

export default Dashboard;
