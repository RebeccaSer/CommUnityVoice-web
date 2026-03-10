import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(credentials);
      login(response.user, response.token);
      navigate('/');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-page min-h-screen flex items-center justify-center p-4">
      <div className="page-content w-full max-w-md">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg p-8 border border-accent2">
          <h2 className="text-2xl font-bold mb-6 text-dark text-center">Sign In</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-dark mb-2" htmlFor="username">Username</label>   
              <input
                type="text"
                id="username"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                required
                disabled={loading}
              />
            </div>
            <div className="mb-6">
              <label className="block text-dark mb-2" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                required
                disabled={loading}
              />    
            </div>
            
            {/* Forgot Password Link */}
            <div className="text-right mb-4">
              <Link to="/forgot-password" className="text-primary hover:text-accent1 text-sm">
                Forgot Password?
              </Link>
            </div>
            
            <button
              type="submit"   
              className="w-full bg-primary hover:bg-accent1 text-white font-bold py-3 rounded transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          <p className="text-dark text-center mt-4">
            Don't have an account? <Link to="/register" className="text-primary font-bold hover:text-accent1">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;