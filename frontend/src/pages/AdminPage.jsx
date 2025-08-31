import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdminPage = () => {
  const [pendingOrganizers, setPendingOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useContext(AuthContext);

  const fetchPendingOrganizers = async () => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/admin/pending-organizers', config);
      setPendingOrganizers(res.data);
    } catch (err) {
      setError('Failed to load data. You might not have admin privileges.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrganizers();
  }, [token]);

  const handleApprove = async (id) => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.patch(`http://localhost:5000/api/admin/organizers/${id}/approve`, {}, config);
      fetchPendingOrganizers(); // Refresh list
    } catch (err) {
      alert('Could not approve organizer.');
    }
  };

  const handleReject = async (id) => {
    try {
      const config = { headers: { 'Authorization': `Bearer ${token}` } };
      await axios.patch(`http://localhost:5000/api/admin/organizers/${id}/reject`, {}, config);
      fetchPendingOrganizers(); // Refresh list
    } catch (err) {
      alert('Could not reject organizer.');
    }
  };

  if (loading) return <p>Loading admin dashboard...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="fade-in">
      <header className="page-header">
        <h1>Admin Dashboard</h1>
      </header>
      <h2>Pending Organizer Approvals</h2>
      {pendingOrganizers.length === 0 ? (
        <p>There are no organizers pending approval.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Organization</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingOrganizers.map((organizer) => (
              <tr key={organizer._id}>
                <td>{organizer.name}</td>
                <td>{organizer.organizationName}</td>
                <td>{organizer.email}</td>
                <td>
                  <div className="card-actions">
                    <button onClick={() => handleApprove(organizer._id)} className="button-primary">Approve</button>
                    <button onClick={() => handleReject(organizer._id)} className="button-danger">Reject</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminPage;