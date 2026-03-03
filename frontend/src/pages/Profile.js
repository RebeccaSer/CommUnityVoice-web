import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const { currentUser, login } = useAuth();
  const [areas, setAreas] = useState([]);
  const [filteredAreas, setFilteredAreas] = useState([]);
  const [areaType, setAreaType] = useState('all');
  const [selectedArea, setSelectedArea] = useState(currentUser?.area_id || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

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

  const handleAreaTypeChange = (type) => {
    setAreaType(type);
  };

  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // This endpoint doesn't exist yet - we'll create it next
      const response = await api.users.updateArea({
        area_id: selectedArea
      });

      // Update user in context
      const updatedUser = { ...currentUser, area_id: selectedArea };
      const area = areas.find(a => a.id === parseInt(selectedArea));
      if (area) {
        updatedUser.area_name = area.name;
        updatedUser.area_type = area.type;
      }
      
      login(updatedUser, localStorage.getItem('token'));
      
      setMessage({ 
        type: 'success', 
        text: 'Your area has been updated successfully!' 
      });
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to update area' 
      });
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
    <div className="min-h-screen bg-blue-900 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
            <p className="text-blue-100 mt-2">Manage your account settings and area preferences</p>
          </div>

          {/* Profile Info */}
          <div className="px-6 py-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">Username</label>
                <p className="mt-1 text-lg text-gray-900">{currentUser?.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-lg text-gray-900">{currentUser?.email || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                <p className="mt-1 text-lg text-gray-900">{currentUser?.contact_number || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="mt-1 text-lg text-gray-900 capitalize">{currentUser?.role}</p>
              </div>
            </div>
          </div>

          {/* Area Selection Form */}
          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Area</h2>
            <p className="text-gray-600 mb-6">
              Select your estate, municipality, or complex. You will only see issues from this area.
            </p>

            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-400' 
                  : 'bg-red-100 text-red-700 border border-red-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Area Type Tabs */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => handleAreaTypeChange('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    areaType === 'all' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  All Areas
                </button>
                <button
                  type="button"
                  onClick={() => handleAreaTypeChange('estate')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    areaType === 'complex' 
                      ? 'bg-orange-600 text-white' 
                      : 'bg-orange-100 text-orange-800 hover:bg-orange-200'
                  }`}
                >
                  Complexes
                </button>
              </div>

              {/* Area Dropdown */}
              <div className="mb-6">
                <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Your Area
                </label>
                <select
                  id="area"
                  value={selectedArea}
                  onChange={handleAreaChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">-- Select an area --</option>
                  {filteredAreas.map(area => (
                    <option key={area.id} value={area.id}>
                      {area.name} ({formatAreaType(area.type)})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-2">
                  Current area: {currentUser?.area_name || 'Not set'}
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || selectedArea === currentUser?.area_id}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                  loading || selectedArea === currentUser?.area_id
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Updating...' : 'Update Area'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;