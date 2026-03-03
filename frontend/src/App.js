import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AreaProvider } from './context/AreaContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Dashboard from './pages/Dashboard';
import IssuesList from './pages/IssuesList';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AreaProvider>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/issues" element={<PrivateRoute><IssuesList /></PrivateRoute> }/>
              <Route path="/admin" element={<PrivateRoute admin={true}> <AdminPanel /></PrivateRoute> } />
             <Route path="/profile" element={<PrivateRoute><Profile /> </PrivateRoute>}/> 
            </Routes>
          </div>
        </AreaProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;