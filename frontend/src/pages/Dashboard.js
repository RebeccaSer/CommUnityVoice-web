import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { currentUser, isAdmin } = useAuth();

  return (
    <div className="bg-page min-h-screen">
      <div className="page-content container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            United Communities Overcome Struggles & <br />
            Elevate Our Future
          </h1>
          <p className="text-xl md:text-2xl text-white max-w-4xl mx-auto leading-relaxed">
            From potholes to public safety, from sanitation to infrastructure – 
            CommUnityVoice empowers you to report, vote, and track every issue that matters. 
            Together, we turn local challenges into lasting solutions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link 
              to="/issues" 
              className="bg-primary hover:bg-accent1 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              See Issues in Your Area
            </Link>
            {!currentUser && (
              <Link 
                to="/register" 
                className="bg-secondary hover:bg-accent1 text-dark font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
              >
                Join the Movement
              </Link>
            )}
          </div>
        </div>

        {/* Feature Cards */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
          <div className="p-8 border border-accent2 rounded-lg bg-white bg-opacity-90 text-center shadow-lg backdrop-blur-sm max-w-sm">
            <h3 className="text-xl font-semibold text-dark mb-3">View Issues</h3>
            <p className="text-gray-600 mb-4">Browse all submitted issues and vote on them.</p>
            <Link 
              to="/issues" 
              className="inline-block px-6 py-3 bg-primary hover:bg-accent1 text-white no-underline rounded-lg mt-4 transition-colors duration-200 font-medium"
            >
              Go to Issues
            </Link>
          </div>

          {isAdmin && (
            <div className="p-8 border border-accent2 rounded-lg bg-white bg-opacity-90 text-center shadow-lg backdrop-blur-sm max-w-sm">
              <h3 className="text-xl font-semibold text-dark mb-3">Admin Panel</h3>
              <p className="text-gray-600 mb-4">Manage issues and monitor system activity.</p>
              <Link 
                to="/admin" 
                className="inline-block px-6 py-3 bg-secondary hover:bg-accent1 text-dark no-underline rounded-lg mt-4 transition-colors duration-200 font-medium"
              >
                Go to Admin Panel
              </Link>
            </div>
          )}

          <div className="p-8 border border-accent2 rounded-lg bg-white bg-opacity-90 text-center shadow-lg backdrop-blur-sm max-w-sm">
            <h3 className="text-xl font-semibold text-dark mb-3">Submit an Issue</h3>
            <p className="text-gray-600 mb-4">Create a new issue for community voting.</p>
            <Link 
              to="/issues" 
              className="inline-block px-6 py-3 bg-accent2 hover:bg-accent1 text-white no-underline rounded-lg mt-4 transition-colors duration-200 font-medium"
            >
              Submit Issue
            </Link>
          </div>
        </div>

        {/* Mission Statement Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-8">
            United voices. Stronger service. Better community.
          </h2>
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

        {/* Copyright Footer */}
        <footer className="text-center text-white mt-16 pt-8 border-t border-white/20">
          <p>© {new Date().getFullYear()} CommUnityVoice. All rights reserved.</p>
          <p className="mt-2 text-sm">Designed and developed by Serepa Selaelo Rebecca</p>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;