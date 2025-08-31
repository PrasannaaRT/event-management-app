import React, { useState } from 'react';

const CANCELLATION_REASONS = [
  'Low Attendance or Registration',
  'Venue or Logistical Issues',
  'Unforeseen Circumstances (e.g., Weather)',
  'Scheduling Conflict',
];

const CancelEventModal = ({ onConfirm, onCancel }) => {
  const [reason, setReason] = useState(CANCELLATION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const isOtherSelected = reason === 'Other';

  const handleConfirm = () => {
    const finalReason = isOtherSelected ? customReason : reason;
    if (!finalReason) {
      alert('Please provide a reason for cancellation.');
      return;
    }
    onConfirm(finalReason);
  };

  return (
    <div>
      <h2>Reason for Cancellation</h2>
      <p>Please select a reason. This will be shown to attendees.</p>
      <div className="cancellation-options">
        {CANCELLATION_REASONS.map((option) => (
          <label key={option}>
            <input
              type="radio"
              name="cancellation-reason"
              value={option}
              checked={reason === option}
              onChange={(e) => setReason(e.target.value)}
            />
            {option}
          </label>
        ))}
        <label>
          <input
            type="radio"
            name="cancellation-reason"
            value="Other"
            checked={isOtherSelected}
            onChange={(e) => setReason(e.target.value)}
          />
          Other (Please specify)
        </label>
      </div>

      {isOtherSelected && (
        <textarea
          className="reason-textarea"
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          placeholder="Please provide a brief reason for the cancellation"
          rows="3"
        />
      )}

      <div className="modal-actions">
        <button onClick={onCancel} className="button-secondary">Nevermind</button>
        <button onClick={handleConfirm} className="button-danger">Confirm Cancellation</button>
      </div>
    </div>
  );
};

export default CancelEventModal;