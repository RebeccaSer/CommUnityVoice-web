import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [areaInfo, setAreaInfo] = useState(null);
  const { currentUser, isAdmin } = useAuth();

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.issues.getAll();
      
      if (currentUser?.area_id) {
        const filtered = response.issues.filter(
          issue => issue.area_id === currentUser.area_id
        );
        setIssues(filtered);
      } else {
        setIssues(response.issues);
      }
    } catch (error) {
      setError('Failed to fetch issues: ' + error.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.area_id]);

  const fetchAreaInfo = useCallback(async () => {
    if (currentUser?.area_id) {
      try {
        const response = await api.areas.getAll();
        const area = response.areas.find(a => a.id === currentUser.area_id);
        setAreaInfo(area);
      } catch (error) {
        console.error('Failed to fetch area info:', error);
      }
    }
  }, [currentUser?.area_id]);

  useEffect(() => {
    if (isAdmin) {
      fetchIssues();
      fetchAreaInfo();
    }
  }, [isAdmin, fetchIssues, fetchAreaInfo]);

  const updateIssueStatus = async (issueId, status) => {
    try {
      await api.issues.updateStatus(issueId, status);
      fetchIssues(); 
    } catch (error) {
      alert('Failed to update issue: ' + error.message);
    }
  };

  const deleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      await api.issues.delete(issueId);
      fetchIssues();
    } catch (error) {
      alert('Failed to delete issue: ' + error.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="bg-page min-h-screen flex items-center justify-center">
        <div className="page-content text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-page min-h-screen flex items-center justify-center">
        <div className="page-content text-white text-xl">Loading issues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-page min-h-screen flex items-center justify-center">
        <div className="page-content text-center text-white">
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-page min-h-screen">
      <div className="page-content container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-4">Admin Panel</h1>
        
        {/* Area Info Banner */}
        {areaInfo ? (
          <div className="bg-secondary border-l-4 border-accent2 text-dark p-4 mb-6 rounded-lg">
            <h3 className="font-bold">Managing: {areaInfo.name}</h3>
            <p>You are the administrator for this area. You can only manage issues in {areaInfo.name}.</p>
          </div>
        ) : (
          <div className="bg-primary border-l-4 border-accent2 text-dark p-4 mb-6 rounded-lg">
            <h3 className="font-bold">Super Administrator</h3>
            <p>You have access to all areas across the platform.</p>
          </div>
        )}

        <p className="text-white mb-6">
          {areaInfo 
            ? `Managing issues in ${areaInfo.name}` 
            : 'Managing all issues across all areas'}
        </p>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-600">Total Issues</h3>
            <p className="text-3xl font-bold text-primary">{issues.length}</p>
          </div>
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-600">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {issues.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-600">In Progress</h3>
            <p className="text-3xl font-bold text-blue-600">
              {issues.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white bg-opacity-90 p-4 rounded-lg shadow text-center">
            <h3 className="text-gray-600">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {issues.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-dark mb-4">
            Issues {areaInfo ? `in ${areaInfo.name}` : 'Across All Areas'}
          </h2>
          {issues.length === 0 ? (
            <p className="text-gray-600">No issues found in your area.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes (👍/👎)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.map(issue => (
                    <tr key={issue.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{issue.id}</td>
                      <td className="px-6 py-4">{issue.title}</td>
                      <td className="px-6 py-4">{issue.author}</td>
                      <td className="px-6 py-4">{issue.area_name || 'Unknown'}</td>
                      <td className="px-6 py-4">
                        {issue.approve_count || 0} / {issue.reject_count || 0}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={issue.status}
                          onChange={e => updateIssueStatus(issue.id, e.target.value)}
                          className="border border-accent2 rounded px-2 py-1 focus:ring-primary focus:border-primary"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteIssue(issue.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;