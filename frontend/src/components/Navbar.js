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
    <nav style={styles.navbar}>
      <div style={styles.navBrand}>
        <Link to="/" style={styles.brandLink}>CommUnityVoice</Link>
      </div>
      
      <div style={styles.navLinks}>
        {currentUser ? (
          <>
            <Link to="/" style={styles.navLink}>Dashboard</Link>
            <Link to="/issues" style={styles.navLink}>Issues Board</Link>
            <Link to="/profile" style={styles.navLink}>Profile</Link>
            {isAdmin && (
              <Link to="/admin" style={styles.navLink}>Admin</Link>
            )}
            <span style={styles.userInfo}>
              Welcome, {currentUser.username} ({currentUser.role})
            </span>
            <button onClick={handleLogout} style={styles.logoutBtn}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.navLink}>Login</Link>
            <Link to="/register" style={styles.navLink}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #dee2e6',
  },
  navBrand: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  brandLink: {
    textDecoration: 'none',
    color: '#007bff',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  navLink: {
    textDecoration: 'none',
    color: '#495057',
    padding: '0.5rem 1rem',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s',
  },
  userInfo: {
    margin: '0 1rem',
    color: '#6c757d',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '0.25rem',
    cursor: 'pointer',
  },
};

export default Navbar;