import React, { useEffect, useState } from 'react';
import api from '../api'; // Your API setup for making requests
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      // Fetch user data if token exists
      const fetchUserData = async () => {
        try {
          const res = await api.get('/auth/profile', {  // Update this line to match backend route
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserData(res.data);
        } catch (err) {
          console.error('Error fetching user data', err);
          setIsLoggedIn(false); // Log out user if token is invalid or expired
          localStorage.removeItem('token');
          navigate('/login'); // Redirect to login
        }
      };

      fetchUserData();
    }
  }, [navigate]);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('token');
      setIsLoggedIn(false);
      setUserData(null); // Clear user data on logout
      navigate('/'); // Redirect to home or login page
    }
  };

  return (
    <div style={mainContainerStyle}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 style={{ fontWeight: 'bold' }}>
          {isLoggedIn ? `Welcome, ${userData?.username || 'User'}!` : 'Welcome to YourApp'}
        </h2>
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="btn btn-outline-light"
            style={{ borderRadius: '0.5rem', fontWeight: 'bold' }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="btn btn-outline-light"
            style={{ borderRadius: '0.5rem', fontWeight: 'bold' }}
          >
            Login
          </button>
        )}
      </div>

      {/* Welcome Section */}
      <div className="mt-5 p-4" style={sectionStyle}>
        <h4 className="mb-3" style={{ fontWeight: 'bold', color: '#4e54c8' }}>
          Discover What’s Possible with YourApp
        </h4>
        <p style={{ color: '#bbbbbb' }}>
          YourApp is a modern platform that empowers you with tools and insights.
          Whether you're here to explore, track progress, or manage your account — everything starts here.
        </p>
      </div>

      {/* Call to Action Section */}
      {!isLoggedIn && (
        <div className="mt-5 p-4" style={ctaSectionStyle}>
          <h4 className="mb-3" style={{ fontWeight: 'bold' }}>
            Get Started Today
          </h4>
          <p style={{ color: '#ffffff' }}>
            Join our community and unlock access to powerful features. Login to your account or create a new one.
          </p>
          <button
            onClick={handleLogin}
            className="btn btn-outline-light"
            style={{ borderRadius: '0.5rem', fontWeight: 'bold' }}
          >
            Login
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={footerStyle}>
        <p style={{ color: '#bbbbbb' }}>&copy; 2025 YourApp. All rights reserved.</p>
      </div>
    </div>
  );
}

// Styling
const mainContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#0d0d0d',
  color: '#f0f0f0',
  padding: '2rem',
};

const sectionStyle = {
  backgroundColor: '#1a1a1a',
  borderRadius: '1rem',
  boxShadow: '0 0 15px rgba(0,0,0,0.4)',
  color: '#ffffff',
  marginBottom: '2rem',
};

const ctaSectionStyle = {
  backgroundColor: '#4e54c8',
  borderRadius: '1rem',
  boxShadow: '0 0 15px rgba(0,0,0,0.5)',
  color: '#ffffff',
  padding: '2rem',
};

const footerStyle = {
  backgroundColor: '#333333',
  padding: '1rem',
  textAlign: 'center',
  marginTop: 'auto',
};

export default Dashboard;
