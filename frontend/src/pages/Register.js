import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchAreas();
  }, []);

  useEffect(() => {
    filterAreas();
  }, [areaType, areas]);

  const fetchAreas = async () => {
    try {
      const response = await api.areas.getAll();
      setAreas(response.areas || []);
      setFilteredAreas(response.areas || []);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };

  const filterAreas = () => {
    if (areaType === 'all') {
      setFilteredAreas(areas);
    } else {
      setFilteredAreas(areas.filter(area => area.type === areaType));
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
    setUserData({ ...userData, area_id: '' }); // Clear selected area when changing type
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
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

    // Email validation (if provided)
    if (userData.email && !userData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    // Require either email or contact number
    if (!userData.email && !userData.contact_number) {
      setError('Please provide either an email address or contact number');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registrationData } = userData;
      console.log('Sending registration data:', registrationData);
      
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
    <div className="bg-blue-900 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white text-center">Sign Up</h2>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="username">Username *</label>
            <input
              type="text"
              id="username"
              name="username"
              value={userData.username}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
              required
              disabled={loading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
              disabled={loading}
            />
            <p className="text-blue-200 text-xs mt-1">Either email or contact number is required</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="contact_number">Contact Number</label>
            <input
              type="tel"
              id="contact_number"
              name="contact_number"
              value={userData.contact_number}
              onChange={handleChange}
              placeholder="+1234567890"
              className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
              disabled={loading}
            />
            <p className="text-blue-200 text-xs mt-1">Either email or contact number is required</p>
          </div>

          {/* Area Selection */}
          <div className="mb-4">
            <label className="block text-white mb-2">Select Your Area (Optional)</label>
            
            {/* Area Type Tabs */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleAreaTypeChange('all')}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  areaType === 'all' 
                    ? 'bg-blue-600 text-white' 
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
                    ? 'bg-green-600 text-white' 
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
                    ? 'bg-purple-600 text-white' 
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
                    ? 'bg-orange-600 text-white' 
                    : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                }`}
              >
                Complexes
              </button>
            </div>

            {/* Area Dropdown */}
            <select
              id="area_id"
              name="area_id"
              value={userData.area_id}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
              disabled={loading}
            >
              <option value="">-- Select your area (optional) --</option>
              {filteredAreas.map(area => (
                <option key={area.id} value={area.id}>
                  {area.name} ({formatAreaType(area.type)})
                </option>
              ))}
            </select>
            <p className="text-blue-200 text-xs mt-1">
              Selecting your area helps show relevant local issues
            </p>
          </div>
          
          <div className="mb-4">
            <label className="block text-white mb-2" htmlFor="password">Password *</label>
            <input
              type="password"
              id="password"
              name="password"
              value={userData.password}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
              required
              disabled={loading}
              minLength={6}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-white mb-2" htmlFor="confirmPassword">Confirm Password *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={userData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {/* Admin Token Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-white" htmlFor="adminToken">
                Admin Registration Token (Optional)
              </label>
              <button
                type="button"
                onClick={() => setShowAdminToken(!showAdminToken)}
                className="text-blue-200 hover:text-white text-sm"
              >
                {showAdminToken ? 'Hide' : 'Admin?'}
              </button>
            </div>
            {showAdminToken && (
              <input
                type="password"
                id="adminToken"
                name="adminToken"
                value={userData.adminToken}
                onChange={handleChange}
                placeholder="Enter admin token"
                className="w-full p-3 rounded bg-white bg-opacity-90 focus:bg-white border border-gray-300 focus:border-blue-500 outline-none transition"
                disabled={loading}
              />
            )}
            {showAdminToken && (
              <p className="text-blue-200 text-xs mt-1">
                Only use if you have been provided with an admin token
              </p>
            )}
          </div>
          
          <button 
            type="submit"   
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>
        
        <p className="text-white text-center mt-4">
          Already have an account? <Link to="/login" className="text-blue-300 hover:underline font-semibold">Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;