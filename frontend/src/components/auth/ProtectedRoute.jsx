import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  // While the context is checking for a token, show a loading message
  if (loading) {
    return <div>Loading...</div>;
  }

  // After loading, if there is no token, redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // If loading is finished and a token exists, show the protected page
  return children;
};

export default ProtectedRoute;