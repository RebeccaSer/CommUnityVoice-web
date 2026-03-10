import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth';
import api from '../services/api';

const Register = () => {
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    contact_number: '',
    area_id: '',
    password: '',
    confirmPassword: '',
    adminToken: '' 
  });
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [areaType, setAreaType] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminToken, setShowAdminToken] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const filterAreas = useCallback(() => {
    if (areaType === 'all') {
      setFilteredAreas(areas);
    } else {
      setFilteredAreas(areas.filter(area => area.type === areaType));
    }
  }, [areaType, areas]);

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    filterAreas();
  }, [filterAreas]);

  const fetchAreas = async () => {
    try {
      const response = await api.areas.getAll();
      setAreas(response.areas || []);
      setFilteredAreas(response.areas || []);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAreaTypeChange = (type) => {
    setAreaType(type);
    setUserData({ ...userData, area_id: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (userData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (userData.email && !userData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!userData.email && !userData.contact_number) {
      setError('Please provide either an email address or contact number');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = userData;
      const response = await authService.register(registrationData);
      login(response.user, response.token);
      navigate('/');
    } catch (error) {
      setError(error.message || 'Registration failed');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAreaType = (type) => {
    const types = {
      estate: 'Estate',
      municipality: 'Municipality',
      complex: 'Complex'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-page min-h-screen flex items-center justify-center p-4">
      <div className="page-content w-full max-w-md">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg rounded-lg shadow-lg p-8 border border-accent2">
          <h2 className="text-2xl font-bold mb-6 text-dark text-center">Sign Up</h2>
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-dark mb-2" htmlFor="username">Username *</label>
              <input
                type="text"
                id="username"
                name="username"
                value={userData.username}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                required
                disabled={loading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-dark mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                disabled={loading}
              />
              <p className="text-gray-500 text-xs mt-1">Either email or contact number is required</p>
            </div>
            
            <div className="mb-4">
              <label className="block text-dark mb-2" htmlFor="contact_number">Contact Number</label>
              <input
                type="tel"
                id="contact_number"
                name="contact_number"
                value={userData.contact_number}
                onChange={handleChange}
                placeholder="+1234567890"
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                disabled={loading}
              />
              <p className="text-gray-500 text-xs mt-1">Either email or contact number is required</p>
            </div>

            {/* Area Selection */}
            <div className="mb-4">
              <label className="block text-dark mb-2">Select Your Area (Optional)</label>
              
              {/* Area Type Tabs */}
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => handleAreaTypeChange('all')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    areaType === 'all' 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => handleAreaTypeChange('estate')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    areaType === 'estate' 
                      ? 'bg-primary text-white' 
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  Estates
                </button>
                <button
                  type="button"
                  onClick={() => handleAreaTypeChange('municipality')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    areaType === 'municipality' 
                      ? 'bg-primary text-white' 
                      : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  }`}
                >
                  Municipalities
                </button>
                <button
                  type="button"
                  onClick={() => handleAreaTypeChange('complex')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    areaType === 'complex' 
                      ? 'bg-primary text-white' 
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  Complexes
                </button>
              </div>

              <select
                id="area_id"
                name="area_id"
                value={userData.area_id}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                disabled={loading}
              >
                <option value="">-- Select your area (optional) --</option>
                {filteredAreas.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.name} ({formatAreaType(area.type)})
                  </option>
                ))}
              </select>
              <p className="text-gray-500 text-xs mt-1">
                Selecting your area helps show relevant local issues
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-dark mb-2" htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                required
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-dark mb-2" htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={userData.confirmPassword}
                onChange={handleChange}
                className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                required
                disabled={loading}
                minLength={6}
              />
            </div>

            {/* Admin Token Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-dark" htmlFor="adminToken">
                  Admin Registration Token (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdminToken(!showAdminToken)}
                  className="text-primary hover:text-accent1 text-sm"
                >
                  {showAdminToken ? 'Hide' : 'Admin?'}
                </button>
              </div>
              {showAdminToken && (
                <div>
                  <input
                    type="password"
                    id="adminToken"
                    name="adminToken"
                    value={userData.adminToken}
                    onChange={handleChange}
                    placeholder="Enter area admin token"
                    className="w-full p-3 rounded bg-white border border-accent2 focus:border-primary focus:ring-2 focus:ring-primary outline-none transition"
                    disabled={loading}
                  />
                  <p className="text-gray-500 text-xs mt-2">
                    Using an area-specific token will make you an admin for that area only.
                    <br />
                    <strong>Note:</strong> Your area will be automatically set to the area matching your token.
                  </p>
                </div>
              )}
            </div>
            
            <button 
              type="submit"   
              className="w-full bg-primary hover:bg-accent1 text-white font-bold py-3 rounded transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
          
          <p className="text-dark text-center mt-4">
            Already have an account? <Link to="/login" className="text-primary font-bold hover:text-accent1">Sign in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;