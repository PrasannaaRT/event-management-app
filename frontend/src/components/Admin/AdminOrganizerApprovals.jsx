import React from 'react';

const AdminOrganizerApprovals = ({ pendingOrganizers, handleApprove, handleReject, loading, error }) => {
  if (loading) return <p>Loading pending organizers...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-section fade-in">
      <h2>Pending Organizer Approvals</h2>
      {pendingOrganizers.length === 0 ? (
        <p>There are no organizers pending approval.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Organization</th><th>Email</th><th>Actions</th></tr>
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

export default AdminOrganizerApprovals;