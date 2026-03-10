import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/auth';

const Navbar = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary border-b-2 border-accent2 px-8 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <Link to="/" className="no-underline text-dark">CommUnityVoice</Link>
      </div>
      
      <div className="flex items-center gap-4">
        {currentUser ? (
          <>
            <Link to="/" className="text-dark hover:text-accent1 transition-colors">Dashboard</Link>
            <Link to="/issues" className="text-dark hover:text-accent1 transition-colors">Issues Board</Link>
            <Link to="/profile" className="text-dark hover:text-accent1 transition-colors">Profile</Link>
            {isAdmin && (
              <Link to="/admin" className="text-dark hover:text-accent1 transition-colors">Admin</Link>
            )}
            <span className="text-dark">
              Welcome, {currentUser.username} ({currentUser.role})
            </span>
            <button 
              onClick={handleLogout} 
              className="bg-secondary hover:bg-accent1 text-dark px-4 py-2 rounded transition-colors"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-dark hover:text-accent1 transition-colors">Login</Link>
            <Link to="/register" className="text-dark hover:text-accent1 transition-colors">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;