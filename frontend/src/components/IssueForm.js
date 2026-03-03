import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const IssueForm = ({ onIssueCreated, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    street_address: '',
    issue_date: '',
    issue_type: 'other',
    area_id: ''
  });
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [areas, setAreas] = useState([]);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchAreas();
    
    // Set default area from user's profile if available
    if (currentUser?.area_id) {
      setFormData(prev => ({ ...prev, area_id: currentUser.area_id }));
    }
  }, [currentUser]);

  const fetchAreas = async () => {
    try {
      const response = await api.areas.getAll();
      setAreas(response.areas || []);
    } catch (error) {
      console.error('Failed to fetch areas:', error);
    }
  };


  // Common issue types
  const issueTypes = [
    { value: 'sanitation', label: 'Sanitation & Cleanliness' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'public_safety', label: 'Public Safety' },
    { value: 'environmental', label: 'Environmental' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'education', label: 'Education' },
    { value: 'transportation', label: 'Transportation' },
    { value: 'housing', label: 'Housing' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  // Validation
  if (!formData.title.trim()) {
    setError('Issue title is required');
    setLoading(false);
    return;
  }

  if (!formData.street_address.trim()) {
    setError('Street address is required');
    setLoading(false);
    return;
  }

  if (!formData.issue_date) {
    setError('Issue date is required');
    setLoading(false);
    return;
  }

  if (!formData.description.trim()) {
    setError('Description is required');
    setLoading(false);
    return;
  }

  // Validate date is not in the future
  const selectedDate = new Date(formData.issue_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate > today) {
    setError('Issue date cannot be in the future');
    setLoading(false);
    return;
  }

  // Ensure we have area_id from user
  if (!currentUser?.area_id) {
    setError('You must select an area in your profile before reporting issues');
    setLoading(false);
    return;
  }

  try {
    const formDataToSend = new FormData();
    
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('street_address', formData.street_address);
    formDataToSend.append('issue_date', formData.issue_date);
    formDataToSend.append('issue_type', formData.issue_type);
    formDataToSend.append('area_id', currentUser.area_id); // Use user's area
    
    if (image) {
      formDataToSend.append('image', image);
    }

    const response = await api.issues.create(formDataToSend);
    console.log('API Response:', response);
    
    onIssueCreated();
  } catch (error) {
    console.error('Submission error:', error);
    setError('Failed to create issue: ' + (error.message || 'Unknown error'));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8 border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Report New Community Issue</h2>
      <p className="text-gray-600 mb-6">Help improve your community by reporting issues that need attention</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Area Selection - NEW */}
        <div className="border-l-4 border-green-500 pl-4 bg-green-50 py-2">
          <label htmlFor="area_id" className="block text-sm font-medium text-gray-700 mb-2">
            Select Area *
          </label>
          <select
            id="area_id"
            name="area_id"
            value={formData.area_id}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            required
          >
            <option value="">-- Select an area --</option>
            
            {groupedAreas.estate.length > 0 && (
              <optgroup label="Estates">
                {groupedAreas.estate.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </optgroup>
            )}
            
            {groupedAreas.municipality.length > 0 && (
              <optgroup label="Municipalities">
                {groupedAreas.municipality.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </optgroup>
            )}
            
            {groupedAreas.complex.length > 0 && (
              <optgroup label="Complexes">
                {groupedAreas.complex.map(area => (
                  <option key={area.id} value={area.id}>{area.name}</option>
                ))}
              </optgroup>
            )}
          </select>
          <p className="text-sm text-green-600 mt-1">
            Select the estate, municipality, or complex where this issue is located
          </p>
        </div>

        {/* Issue Type */}
        <div>
          <label htmlFor="issue_type" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Type *
          </label>
          <select
            id="issue_type"
            name="issue_type"
            value={formData.issue_type}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            {issueTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Street Address */}
        <div>
          <label htmlFor="street_address" className="block text-sm font-medium text-gray-700 mb-2">
            Street Address *
          </label>
          <input
            type="text"
            id="street_address"
            name="street_address"
            value={formData.street_address}
            onChange={handleChange}
            placeholder="e.g., house no J4, Bohloko str"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Issue Date */}
        <div>
          <label htmlFor="issue_date" className="block text-sm font-medium text-gray-700 mb-2">
            When did you notice this issue? *
          </label>
          <input
            type="date"
            id="issue_date"
            name="issue_date"
            value={formData.issue_date}
            onChange={handleChange}
            max={today}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Issue Title */}
        <div className="border-l-4 border-blue-500 pl-4 bg-blue-50 py-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Issue Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief description of the issue (e.g., 'Broken street light on Main St')"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Detailed Description *
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide more details about the issue..."
            rows="5"
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
            required
          />
        </div>

        {/* Image Upload */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
            Upload Photo (Optional)
          </label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            {loading ? 'Submitting...' : 'Submit Issue'}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueForm;