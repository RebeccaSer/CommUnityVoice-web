import React from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { currentUser } = useAuth();

  const formatAreaType = (type) => {
    const types = {
      estate: 'Estate',
      municipality: 'Municipality',
      complex: 'Complex'
    };
    return types[type] || type;
  };

  return (
    <div className="bg-page min-h-screen py-12 px-4">
      <div className="page-content max-w-3xl mx-auto">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-xl overflow-hidden border border-accent2">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent1 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">Your Profile</h1>
            <p className="text-white/90 mt-2">View your account information</p>
          </div>

          {/* Profile Info */}
          <div className="px-6 py-6">
            <h2 className="text-xl font-semibold text-dark mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-accent2">
                <label className="block text-sm font-medium text-gray-600">Username</label>
                <p className="mt-1 text-lg text-dark">{currentUser?.username}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-accent2">
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-1 text-lg text-dark">{currentUser?.email || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-accent2">
                <label className="block text-sm font-medium text-gray-600">Contact Number</label>
                <p className="mt-1 text-lg text-dark">{currentUser?.contact_number || 'Not provided'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-accent2">
                <label className="block text-sm font-medium text-gray-600">Role</label>
                <p className="mt-1 text-lg text-dark capitalize">{currentUser?.role}</p>
              </div>
            </div>

            {/* Area Information */}
            <div className="mt-6 bg-primary/10 p-4 rounded-lg border border-primary">
              <h3 className="text-lg font-semibold text-dark mb-2">Your Assigned Area</h3>
              {currentUser?.area_id ? (
                <div>
                  <p className="text-dark">
                    <span className="font-medium">Area:</span> {currentUser.area_name} 
                    {currentUser.area_type && ` (${formatAreaType(currentUser.area_type)})`}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    You can only see and report issues within this area. This cannot be changed.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-dark">No area assigned.</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Please contact an administrator if you believe this is an error.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;