import React from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../images/Homepage.jpg';

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <div 
      className="min-h-screen bg-blue-900"
      style={{
        backgroundImage: `url(${logo})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      
      <div className="min-h-screen bg-black bg-opacity-50">
        <div className="container mx-auto px-4 py-8">
          {/* Hero Section */}
          <div className="text-center mb-16 pt-8">
            <h1 className="text-5xl font-bold text-white mb-6">
              Elevate The Community's Future Development
            </h1>
            <h4 className="text-2xl text-white italic max-w-4xl mx-auto leading-relaxed">
              CommUnityVoice gives power back to the people by turning community voices into action. 
              We connect residents, municipalities, and service providers to ensure that every concern 
              is heard, every issue is addressed, and every community thrives.
            </h4>
          </div>

          {/* Feature Cards */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <div className="p-8 border border-gray-300 rounded-lg bg-white bg-opacity-90 text-center shadow-lg backdrop-blur-sm max-w-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">View Issues</h3>
              <p className="text-gray-600 mb-4">Browse all submitted issues and vote on them.</p>
              <a 
                href="/issues" 
                className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white no-underline rounded-lg mt-4 transition-colors duration-200 font-medium"
              >
                Go to Issues
              </a>
            </div>

            {isAdmin && (
              <div className="p-8 border border-gray-300 rounded-lg bg-white bg-opacity-90 text-center shadow-lg backdrop-blur-sm max-w-sm">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Admin Panel</h3>
                <p className="text-gray-600 mb-4">Manage issues and monitor system activity.</p>
                <a 
                  href="/admin" 
                  className="inline-block px-6 py-3 bg-green-500 hover:bg-green-600 text-white no-underline rounded-lg mt-4 transition-colors duration-200 font-medium"
                >
                  Go to Admin Panel
                </a>
              </div>
            )}

            <div className="p-8 border border-gray-300 rounded-lg bg-white bg-opacity-90 text-center shadow-lg backdrop-blur-sm max-w-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Submit an Issue</h3>
              <p className="text-gray-600 mb-4">Create a new issue for community voting.</p>
              <a 
                href="/issues" 
                className="inline-block px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white no-underline rounded-lg mt-4 transition-colors duration-200 font-medium"
              >
                Submit Issue
              </a>
            </div>
          </div>

          {/* Mission Statement Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-white mb-8">
              United voices. Stronger service. Better community
            </h1>
            <div className="bg-black bg-opacity-40 rounded-2xl p-8 max-w-6xl mx-auto">
              <h4 className="text-xl text-white italic leading-relaxed">
                CommUnityVoice is a citizen-driven initiative dedicated to strengthening service delivery 
                through collective action and transparent communication. We believe that every voice matters — 
                and when united, communities can drive meaningful change.
                <br /><br />
                Our platform bridges the gap between residents, local authorities, and service providers, 
                making it easier to report issues, share feedback, and track progress in real time. Through 
                this open exchange, we promote accountability, improve response times, and ensure that 
                essential services reach the people who need them most.
                <br /><br />
                At CommUnityVoice, we're more than a platform — we're a movement built on collaboration, 
                empowerment, and community growth. Together, we're shaping responsive, reliable, and 
                people-centered service delivery across communities.
              </h4>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;