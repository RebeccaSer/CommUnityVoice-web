import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [areaInfo, setAreaInfo] = useState(null);
  const { currentUser, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchAreaInfo();
      fetchIssues();
    }
  }, [isAdmin]);

  const fetchAreaInfo = async () => {
    try {
      if (currentUser?.area_id) {
        const response = await api.areas.getAll();
        const area = response.areas?.find(a => a.id === currentUser.area_id);
        setAreaInfo(area);
      }
    } catch (error) {
      console.error('Failed to fetch area info:', error);
    }
  };

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await api.issues.getAll();
      setIssues(response.issues);
    } catch (error) {
      setError('Failed to fetch issues: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateIssueStatus = async (issueId, status) => {
    try {
      await api.issues.updateStatus(issueId, status);
      fetchIssues(); 
    } catch (error) {
      alert('Failed to update issue: ' + (error.response?.data?.error || error.message));
    }
  };

  const deleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    
    try {
      await api.issues.delete(issueId);
      fetchIssues();
    } catch (error) {
      alert('Failed to delete issue: ' + (error.response?.data?.error || error.message));
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 text-6xl mb-4">⛔</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600">Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (!currentUser?.area_id) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md">
          <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Area Assigned</h2>
          <p className="text-gray-600 mb-4">
            You don't have an area assigned to your admin account. 
            Please contact the super administrator.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading issues...</div>
      </div>
    );
  }

  // Filter issues to only show those in admin's area (extra safety)
  const areaIssues = issues.filter(issue => issue.area_id === currentUser.area_id);
  const otherAreaIssues = issues.filter(issue => issue.area_id !== currentUser.area_id);

  return (
    <div className="min-h-screen bg-blue-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with Area Info */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-blue-100">
            Managing issues for: <span className="font-semibold text-white">{areaInfo?.name || 'Your Area'}</span>
          </p>
          <p className="text-blue-100 text-sm mt-2">
            Area Type: {areaInfo?.type || 'Unknown'} | Area ID: {currentUser.area_id}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-1">Your Area Issues</h3>
            <p className="text-3xl font-bold text-blue-600">{areaIssues.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-1">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {areaIssues.filter(t => t.status === 'pending').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-1">In Progress</h3>
            <p className="text-3xl font-bold text-orange-600">
              {areaIssues.filter(t => t.status === 'in-progress').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500 text-sm mb-1">Completed</h3>
            <p className="text-3xl font-bold text-green-600">
              {areaIssues.filter(t => t.status === 'completed').length}
            </p>
          </div>
        </div>

        {/* Security Warning if there are other area issues */}
        {otherAreaIssues.length > 0 && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>Security Notice:</strong> There are {otherAreaIssues.length} issues from other areas that you cannot access due to area restrictions.
              </div>
            </div>
          </div>
        )}

        {/* Issues Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-800">Issues in Your Area</h2>
            <p className="text-sm text-gray-600 mt-1">You can only manage issues from your assigned area</p>
          </div>

          {areaIssues.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Issues Found</h3>
              <p className="text-gray-500">There are no issues reported in your area yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Votes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {areaIssues.map(issue => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{issue.title}</div>
                        <div className="text-xs text-gray-500">ID: {issue.id}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{issue.author}</td>
                      <td className="px-6 py-4">
                        <span className="text-green-600 font-medium">{issue.approve_count || 0} 👍</span>
                        <span className="text-gray-400 mx-1">/</span>
                        <span className="text-red-600 font-medium">{issue.reject_count || 0} 👎</span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={issue.status}
                          onChange={(e) => updateIssueStatus(issue.id, e.target.value)}
                          className={`text-sm rounded-full px-3 py-1 font-medium
                            ${issue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${issue.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : ''}
                            ${issue.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                          `}
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => deleteIssue(issue.id)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
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

        {/* Area Info Footer */}
        <div className="mt-8 bg-blue-800 rounded-lg p-4 text-center text-white text-sm">
          <p>You are logged in as an admin for {areaInfo?.name || 'your area'}. Your permissions are restricted to this area only.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;