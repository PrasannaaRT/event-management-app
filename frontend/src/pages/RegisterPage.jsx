import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    organizationName: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, role, organizationName } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      
      // Provide a more specific success message
      if (formData.role === 'organizer') {
        alert('Organizer account created! Your account is pending admin approval.');
      } else {
        alert('Registration successful! Please log in.');
      }
      
      navigate('/login');

    } catch (err) {
      const errorMessage = err.response ? err.response.data.message : 'Registration failed. Please try again.';
      setError(errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h1>Register</h1>
      <form onSubmit={onSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <input
          type="text"
          name="name"
          value={name}
          onChange={onChange}
          placeholder="Full Name"
          required
        />
        <input
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Email Address"
          required
        />
        <input
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Password"
          required
          minLength="6"
        />
        <div className="role-selector">
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === 'user'}
              onChange={onChange}
            />
            I am a User
          </label>
          <label>
            <input
              type="radio"
              name="role"
              value="organizer"
              checked={role === 'organizer'}
              onChange={onChange}
            />
            I am an Organizer
          </label>
        </div>
        {role === 'organizer' && (
          <input
            type="text"
            name="organizationName"
            value={organizationName}
            onChange={onChange}
            placeholder="Organization Name"
            required
          />
        )}
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;