import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext); // Get the login function from our context
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send login data to the API
      const response = await axios.post('http://localhost:5000/api/auth/login', formData);
      
      // If successful, call the login function from our context with the new token
      login(response.data.token);
      
      // Redirect to the homepage
      navigate('/');

    } catch (err) {
      const errorMessage = err.response ? err.response.data.message : 'Login failed. Please try again.';
      setError(errorMessage);
      console.error(err);
    }
  };

  return (
    <div className="form-container">
      <h1>Login</h1>
      <form onSubmit={onSubmit}>
        {error && <p style={{ color: 'red' }}>{error}</p>}
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
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;