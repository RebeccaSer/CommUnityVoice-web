import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Issue = ({ issue, onUpdate, formatIssueType }) => {
  const [isVoting, setIsVoting] = useState(false);
  const { currentUser } = useAuth();

  const formatIssueTypeLocal = (type) => {
    if (!type) return 'Other';
    if (typeof type !== 'string') return 'Other';
    try {
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } catch (error) {
      return 'Other';
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

  const displayIssueType = formatIssueType || formatIssueTypeLocal;

  if (!issue) return <p className="text-white">Loading issue...</p>;

  const handleVote = async (voteType) => {
    if (!currentUser) {
      alert('Please login to vote');
      return;
    }

    setIsVoting(true);
    try {
      await api.votes.create({
        issue_id: issue.id,
        user_id: currentUser.id,
        vote_type: voteType,
      });
      if (onUpdate) onUpdate(); 
    } catch (error) {
      console.error('Voting failed:', error);
      alert('Voting failed: ' + (error.message || error));
    } finally {
      setIsVoting(false);
    }
  };

  const approveCount = issue?.approve_count ?? 0;
  const rejectCount = issue?.reject_count ?? 0;
  const userVote = issue?.userVote ?? null;

  const issueType = issue?.issue_type || 'other';

  return (
    <div className="border border-accent2 rounded-lg p-4 my-4 bg-white shadow-md">
      <h3 className="text-2xl font-bold text-dark">{issue.title ?? 'Untitled'}</h3>
      <p className="text-lg text-gray-700 mb-2">{issue.description ?? 'No description'}</p>

      <div className="text-sm text-gray-600 mb-2">
        <div className="flex flex-wrap gap-4">
          <span className="bg-primary text-white px-2 py-1 rounded">
            {issue.area_name || 'Unknown Area'} ({formatAreaType(issue.area_type)})
          </span>
          <span>Type: {displayIssueType(issueType)}</span>
          <span>Location: {issue.street_address}</span>
          <span>Date: {new Date(issue.issue_date).toLocaleDateString()}</span>
          <span>Status: 
            <span className={`ml-1 px-2 py-0.5 rounded text-xs font-semibold ${
              issue.status === 'completed' ? 'bg-green-200 text-green-800' :
              issue.status === 'in-progress' ? 'bg-yellow-200 text-yellow-800' :
              'bg-gray-200 text-gray-800'
            }`}>
              {issue.status || 'pending'}
            </span>
          </span>
          {issue.completed_at && (
            <span>Completed: {new Date(issue.completed_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
      
      {issue.image_url && (
        <img
          src={`http://localhost:5000/${issue.image_url}`}
          alt={issue.title}
          className="max-w-full h-auto rounded-lg mt-2"
          onError={(e) => (e.target.style.display = 'none')}
        />
      )}

      <div className="flex gap-4 mb-4 mt-4">
        <button
          onClick={() => handleVote('approve')}
          disabled={isVoting || userVote === 'approve' || currentUser?.id === issue.user_id}
          className={`px-4 py-2 rounded border transition-colors ${
            userVote === 'approve' 
              ? 'bg-primary text-white border-primary' 
              : 'bg-white text-primary border-primary hover:bg-primary hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          👍 ({approveCount})
        </button>

        <button
          onClick={() => handleVote('reject')}
          disabled={isVoting || userVote === 'reject' || currentUser?.id === issue.user_id}
          className={`px-4 py-2 rounded border transition-colors ${
            userVote === 'reject' 
              ? 'bg-red-600 text-white border-red-600' 
              : 'bg-white text-red-600 border-red-600 hover:bg-red-600 hover:text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          👎 ({rejectCount})
        </button>
      </div>

      {issue.status === 'completed' && (
        <div className="inline-block px-2 py-1 bg-green-500 text-white rounded text-sm">
          Completed
        </div>
      )}
    </div>
  );
};

export default Issue;