import React, { useState, useEffect } from 'react';
import Issue from '../components/Issue.js';
import IssueForm from '../components/IssueForm';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const IssuesList = () => {
  const [issues, setIssues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [userArea, setUserArea] = useState(null);
  
  const { currentUser } = useAuth();

  const issueTypes = [
    'all',
    'sanitation',
    'infrastructure',
    'public_safety',
    'environmental',
    'healthcare',
    'education',
    'transportation',
    'housing',
    'utilities',
    'other'
  ];

  useEffect(() => {
    if (currentUser) {
      console.log('Current user:', currentUser);
      setUserArea(currentUser.area_id);
      fetchIssues();
    }
  }, [currentUser]);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching issues for area:', currentUser?.area_id);
      
      // If user has an area, fetch issues for that area
      if (currentUser?.area_id) {
        const response = await api.areas.getIssues(currentUser.area_id);
        console.log('Area issues response:', response);
        setIssues(response.issues || []);
      } else {
        // If no area selected, show message to select area
        setIssues([]);
      }
    } catch (error) {
      console.error('Fetch issues error:', error);
      setError('Failed to fetch issues: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueCreated = () => {
    setShowForm(false);
    fetchIssues();
  };

  const handleFilterByType = async (type) => {
    setFilterType(type);
    try {
      setLoading(true);
      if (type === 'all') {
        fetchIssues();
      } else {
        // Get issues by type but still filter by user's area
        const response = await api.issues.getByType(type);
        const filteredByArea = response.issues.filter(
          issue => issue.area_id === currentUser?.area_id
        );
        setIssues(filteredByArea);
      }
    } catch (error) {
      console.error('Filter by type error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatIssueType = (type) => {
    if (!type || typeof type !== 'string') {
      return 'Other';
    }
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (!currentUser) {
    return (
      <div className="container bg-blue-900 mx-auto px-4 py-8 max-w-6xl min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p>You need to be logged in to view issues.</p>
        </div>
      </div>
    );
  }

  if (!currentUser.area_id) {
    return (
      <div className="container bg-blue-900 mx-auto px-4 py-8 max-w-6xl min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="text-6xl mb-4">🏘️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Area Selected</h2>
          <p className="text-gray-600 mb-6">
            You haven't selected your area yet. Please update your profile to select an estate, municipality, or complex to see local issues.
          </p>
          <button
            onClick={() => window.location.href = '/profile'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
          >
            Go to Profile
          </button>
        </div>
      </div>
    );
  }

  if (loading && issues.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-900">
        <div className="text-xl text-white">Loading issues...</div>
      </div>
    );
  }

  return (
    <div className="container bg-blue-900 mx-auto px-4 py-8 max-w-6xl min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white mb-2">Community Issues</h1>
          <p className="text-white">
            Showing issues in your area: <span className="font-semibold">{currentUser.area_name || 'Selected Area'}</span>
          </p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
        >
          {showForm ? 'Cancel' : 'Report New Issue'}
        </button>
      </div>

      {/* Area Info Banner */}
      <div className="bg-green-100 border-l-4 border-green-600 text-green-800 p-4 mb-6 rounded-lg">
        <div className="flex items-center">
          <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <strong>Your Area:</strong> {currentUser.area_name} ({currentUser.area_type})
            <p className="text-sm mt-1">You can only see and report issues in your selected area.</p>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Filter Issues</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Issue Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Issue Type
            </label>
            <select
              value={filterType}
              onChange={(e) => handleFilterByType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {issueTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Issues' : formatIssueType(type)}
                </option>
              ))}
            </select>
          </div>

          {/* Location Filter - Search within area */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search within your area
            </label>
            <input
              type="text"
              placeholder="Filter by street address..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              onChange={(e) => {
                const searchTerm = e.target.value.toLowerCase();
                if (searchTerm === '') {
                  fetchIssues();
                } else {
                  const filtered = issues.filter(issue => 
                    issue.street_address?.toLowerCase().includes(searchTerm)
                  );
                  setIssues(filtered);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Issue Form */}
      {showForm && (
        <div className="mb-8">
          <IssueForm 
            onIssueCreated={handleIssueCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Issues List */}
      <div className="space-y-6">
        {issues.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No issues found</h3>
            <p className="text-gray-500 mb-4">
              There are no issues reported in your area yet.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Report the First Issue
            </button>
          </div>
        ) : (
          issues.map(issue => (
            <Issue  
              key={issue.id} 
              issue={issue} 
              onUpdate={fetchIssues}
              formatIssueType={formatIssueType} 
            />
          ))
        )}
      </div>

      {/* Stats Summary */}
      {issues.length > 0 && (
        <div className="mt-8 text-center text-white">
          <p>Showing {issues.length} issue{issues.length !== 1 ? 's' : ''} in your area</p>
        </div>
      )}
    </div>
  );
};

export default IssuesList;