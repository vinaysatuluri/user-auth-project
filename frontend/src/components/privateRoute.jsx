import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token'); // Check if token exists

  // If there's no token, redirect to login page
  return token ? children : <Navigate to="/login" />;
}

export default PrivateRoute;
