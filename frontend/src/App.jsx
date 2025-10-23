import React, { useMemo } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Import all components and pages
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import AboutPage from './pages/AboutPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import EventDetailPage from './pages/EventDetailPage';
import ProtectedRoute from './components/auth/ProtectedRoute'; // This is your actual ProtectedRoute import
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import AdminPage from './pages/AdminPage';
import OrganizerProfilePage from './pages/OrganizerProfilePage';
import NotificationsPage from './pages/NotificationsPage'; // Notifications page


// The background animation component is defined here for simplicity
const AnimatedBackground = () => {
  const shapes = useMemo(() => {
    const newShapes = [];
    const colors = ['#6a5acd', '#f08080', '#20b2aa', '#ffa500'];
    const numShapes = 15;

    for (let i = 0; i < numShapes; i++) {
      newShapes.push({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        size: `${Math.random() * 120 + 20}px`,
        color: colors[Math.floor(Math.random() * colors.length)],
        duration: `${Math.random() * 15 + 20}s`,
        delay: `${Math.random() * 10}s`,
      });
    }
    return newShapes;
  }, []);

  return (
    <div className="animation-wrapper">
      {shapes.map((shape) => (
        <div
          key={shape.id}
          className="shape"
          style={{
            top: shape.top,
            left: shape.left,
            width: shape.size,
            height: shape.size,
            backgroundColor: shape.color,
            boxShadow: `0 0 20px ${shape.color}`,
            animationDuration: shape.duration,
            animationDelay: shape.delay,
          }}
        />
      ))}
    </div>
  );
};

// The main App component that defines the entire site structure
function App() {
  return (
    <Router>
      <div className="app-container">
        <AnimatedBackground />
        <Navbar />
        <main className="container">
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route path="/organizer/:id" element={<OrganizerProfilePage />} />
            <Route path="/event/:id" element={<EventDetailPage />} />

            {/* --- Protected Routes (User must be logged in) --- */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/create-event" element={<ProtectedRoute><CreateEventPage /></ProtectedRoute>} />
            <Route path="/event/edit/:id" element={<ProtectedRoute><EditEventPage /></ProtectedRoute>} />

            {/* Notifications Page - now correctly using ProtectedRoute */}
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Admin Route - **Changed to wildcard to allow nested routes for AdminPage** */}
            <Route path="/admin/*" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;