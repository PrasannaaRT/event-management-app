import React, { useContext, useState, useEffect } from 'react'; // ADDED useState, useEffect
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext"; // One less '..'
import axios from 'axios'; // ADDED axios for API calls
import './Navbar.css'; 


const Navbar = () => {
  const { token, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0); // ADDED: State for unread count

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  // ADDED: Effect to fetch unread notification count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (token && user && user.role === 'user') { // Only fetch for authenticated 'user' role
        try {
          const config = {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          };
          const response = await axios.get('http://localhost:5000/api/notifications/unread-count', config);
          setUnreadCount(response.data.count);
        } catch (err) {
          console.error('Error fetching unread notification count:', err);
          // Optionally, handle error state or show a message
        }
      } else {
        setUnreadCount(0); // Reset count if not logged in or not a 'user'
      }
    };

    fetchUnreadCount(); // Fetch on component mount

    // Poll for new notifications every, e.g., 60 seconds (adjust as needed)
    const intervalId = setInterval(fetchUnreadCount, 60000); // Fetch every 60 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [token, user]); // Re-run if token or user changes

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
            {/* ADDED: Notifications link with unread count badge */}
            {user && user.role === 'user' && ( // Only show notifications for 'user' role
              <li>
                <Link to="/notifications" className="nav-link-notifications">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </Link>
              </li>
            )}

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