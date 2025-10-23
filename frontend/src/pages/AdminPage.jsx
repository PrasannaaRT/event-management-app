import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { NavLink, Routes, Route, useNavigate } from 'react-router-dom';

// Import the new sub-components
import AdminOverview from '../components/Admin/AdminOverview';
import AdminEventsAttendees from '../components/Admin/AdminEventsAttendees';
import AdminOrganizerApprovals from '../components/Admin/AdminOrganizerApprovals';

const AdminPage = () => {
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token, user, logout } = useContext(AuthContext); // Added user and logout
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (user && user.role !== 'admin') {
      alert('Access Denied: You are not an admin.');
      logout(); // Log out non-admin trying to access
      navigate('/login');
    }
  }, [token, user, navigate, logout]);


  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      
      const [organizersRes, statsRes, eventsRes, regRes, catRes, revRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/pending-organizers', config),
        axios.get('http://localhost:5000/api/admin/stats', config),
        axios.get('http://localhost:5000/api/admin/events-with-attendees', config),
        axios.get('http://localhost:5000/api/admin/analytics/registrations', config),
        axios.get('http://localhost:5000/api/admin/analytics/categories', config),
        axios.get('http://localhost:5000/api/admin/analytics/revenue', config),
      ]);
      
      setPendingOrganizers(organizersRes.data);
      setStats(statsRes.data);
      setEvents(eventsRes.data);
      
      setChartData({
        registrations: {
          labels: regRes.data.map(d => d._id),
          datasets: [{ 
            label: 'Registrations per Day', 
            data: regRes.data.map(d => d.count), 
            borderColor: 'rgb(75, 192, 192)', 
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            fill: true,
            tension: 0.1 
          }],
        },
        categories: {
          labels: catRes.data.map(c => c._id),
          datasets: [{ 
            label: 'Event Categories', 
            data: catRes.data.map(c => c.count), 
            backgroundColor: ['#6a5acd', '#f08080', '#20b2aa', '#ffa500', '#dc3545', '#ffc107'],
            borderColor: '#fff',
            borderWidth: 2,
          }],
        },
        revenue: {
          labels: ['Total Revenue'],
          datasets: [{ 
            label: 'Total Revenue (INR)', 
            data: [revRes.data.totalRevenue], 
            backgroundColor: 'rgba(153, 102, 255, 0.6)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }],
        }
      });

    } catch (err) {
      setError('Failed to load data. You might not have admin privileges or there was a server error.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === 'admin') { // Only fetch if token exists AND user role is admin
      fetchData();
    }
  }, [token, user]); // Depend on user as well

  const handleApprove = async (id) => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.patch(`http://localhost:5000/api/admin/organizers/${id}/approve`, {}, config);
      fetchData(); // Refresh all data on the page
    } catch (err) {
      alert('Could not approve organizer.');
    }
  };

  const handleReject = async (id) => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.patch(`http://localhost:5000/api/admin/organizers/${id}/reject`, {}, config);
      fetchData(); // Refresh all data on the page
    } catch (err) {
      alert('Could not reject organizer.');
    }
  };

  if (!token || (user && user.role !== 'admin')) {
    // This check handles initial render before useEffect redirection
    return <p>Redirecting to login or access denied page...</p>;
  }

  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-dashboard-container fade-in">
      <nav className="admin-sidebar">
        <h2 className="sidebar-title">Admin Panel</h2>
        <ul>
          <li>
            <NavLink to="/admin" end className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/events" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Events & Attendees
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/approvals" className={({ isActive }) => (isActive ? 'active-link' : '')}>
              Organizer Approvals
            </NavLink>
          </li>
        </ul>
      </nav>
      <main className="admin-content">
        <header className="page-header">
          <h1>Admin Dashboard</h1>
        </header>
        <Routes>
          <Route path="/" element={
            <AdminOverview stats={stats} chartData={chartData} loading={loading} error={error} />
          } />
          <Route path="events" element={
            <AdminEventsAttendees events={events} loading={loading} error={error} />
          } />
          <Route path="approvals" element={
            <AdminOrganizerApprovals 
              pendingOrganizers={pendingOrganizers} 
              handleApprove={handleApprove} 
              handleReject={handleReject} 
              loading={loading} 
              error={error} 
            />
          } />
        </Routes>
      </main>
    </div>
  );
};

export default AdminPage;