import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-logo">EventHub</Link>
      <ul className="nav-links">
        <li><Link to="/events">Events</Link></li>
        <li><Link to="/about">About</Link></li>
        
        {/* Show Admin link if user is an admin */}
        {user && user.role === 'admin' && (
          <li><Link to="/admin">Admin</Link></li>
        )}

        {token ? (
          <>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><button onClick={onLogout} className="logout-button">Logout</button></li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;