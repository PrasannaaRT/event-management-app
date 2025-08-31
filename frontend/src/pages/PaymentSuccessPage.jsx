import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
  useEffect(() => {
    // Here you could potentially verify the session with your backend
    // but for now, we'll just show a success message.
    // The webhook handles the actual registration.
  }, []);

  return (
    <div className="fade-in" style={{ textAlign: 'center', padding: '4rem 0' }}>
      <header className="page-header">
        <h1>✅ Payment Successful!</h1>
      </header>
      <p>Thank you for your purchase. You are now registered for the event.</p>
      <Link to="/dashboard" className="button-primary">
        Go to Your Dashboard
      </Link>
    </div>
  );
};

export default PaymentSuccessPage;