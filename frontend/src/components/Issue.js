import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Issue = ({ issue, onUpdate, formatIssueType }) => {
  const [isVoting, setIsVoting] = useState(false);
  const { currentUser } = useAuth();

  // Improved formatIssueType function
  const formatIssueTypeLocal = (type) => {
    if (!type) return 'Other';
    if (typeof type !== 'string') {
      return 'Other';
    }
    
    try {
      return type.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    } catch (error) {
      console.error('Error formatting issue type:', error);
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

  if (!issue) return <p>Loading issue...</p>;

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
    <div className="border border-blue-500 rounded-lg p-4 my-4 bg-blue-800">
      <h3 className="text-2xl text-white font-bold">{issue.title ?? 'Untitled'}</h3>
      <p className="text-xl text-white">{issue.description ?? 'No description'}</p>

      <div className="text-sm text-gray-300 mb-2">
        <div className="flex flex-wrap gap-4">
          {/* Area Information - NEW */}
          <span className="bg-green-600 text-white px-2 py-1 rounded">
            {issue.area_name || 'Unknown Area'} ({formatAreaType(issue.area_type)})
          </span>
          <span>Type: {displayIssueType(issueType)}</span>
          <span>Location: {issue.street_address}</span>
          <span>Date: {new Date(issue.issue_date).toLocaleDateString()}</span>
          <span>Status: {issue.status || 'pending'}</span>
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
              ? 'bg-green-600 text-white border-green-600' 
              : 'bg-white text-green-600 border-green-600 hover:bg-green-600 hover:text-white'
          } ${(isVoting || userVote === 'approve' || currentUser?.id === issue.user_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          } ${(isVoting || userVote === 'reject' || currentUser?.id === issue.user_id) ? 'opacity-50 cursor-not-allowed' : ''}`}
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