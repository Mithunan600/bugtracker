import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import BugList from './components/BugList';
import BugForm from './components/BugForm';
import BugDetail from './components/BugDetail';
import Analytics from './components/Analytics';
import Login from './components/Login';
import Register from './components/Register';
import Landing from './components/Landing';
import ProtectedRoute from './components/ProtectedRoute';
import MyBugs from './components/MyBugs';
import UserProfile from './components/UserProfile';
import { bugAPI } from './services/api';
import './App.css';

// Wrapper component to conditionally render container
const PageWrapper = ({ children, isAuthenticated }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  
  if (isLandingPage) {
    return children;
  }
  
  return (
    <div className="container">
      {children}
    </div>
  );
};

function App() {
  const [bugs, setBugs] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for existing token and user data on app load
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedToken && savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setToken(savedToken);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        // Clear invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const fetchBugs = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const bugsData = await bugAPI.getAllBugs(token);
      setBugs(bugsData);
    } catch (error) {
      console.error('Error fetching bugs:', error);
      // If token is invalid, logout user
      if (error.message.includes('401') || error.message.includes('403')) {
        handleLogout();
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        // Backend is not running or network issue
        console.warn('Backend server appears to be offline. Please start the backend server.');
        setBugs([]); // Set empty array to prevent errors
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch bugs when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchBugs();
    }
  }, [isAuthenticated, token, fetchBugs]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [darkMode]);

  const handleRegister = (userData) => {
    console.log('User registered:', userData);
    // Registration is handled by the Register component
    // This function is kept for potential future use
  };

  const handleLogin = (user, authToken) => {
    setCurrentUser(user);
    setToken(authToken);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setIsAuthenticated(false);
    setBugs([]);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  const addBug = async (newBug) => {
    if (!token) return;
    
    try {
      const createdBug = await bugAPI.createBug(newBug, token);
      await fetchBugs(); // Refresh the bug list after creation
      return createdBug;
    } catch (error) {
      console.error('Error creating bug:', error);
      throw error;
    }
  };

  const updateBug = async (id, updates) => {
    if (!token) return;
    try {
      const updatedBug = await bugAPI.updateBug(id, updates, token);
      await fetchBugs(); // Refresh the bug list after update
      return updatedBug;
    } catch (error) {
      console.error('Error updating bug:', error);
      throw error;
    }
  };

  const deleteBug = async (id) => {
    if (!token) return;
    
    try {
      await bugAPI.deleteBug(id, token);
      setBugs(prevBugs => prevBugs.filter(bug => bug.id !== id));
    } catch (error) {
      console.error('Error deleting bug:', error);
      throw error;
    }
  };

  return (
    <Router>
      <div className="App">
        {isAuthenticated && <Navbar currentUser={currentUser} onLogout={handleLogout} />}
        <main className={`main-content ${!isAuthenticated ? 'auth-main' : ''}`}>
          <PageWrapper isAuthenticated={isAuthenticated}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />
              } />
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : 
                <Login onLogin={handleLogin} />
              } />
              <Route path="/register" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : 
                <Register onRegister={handleRegister} />
              } />
              
              {/* Protected routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Dashboard bugs={bugs} loading={loading} currentUser={currentUser} />
                </ProtectedRoute>
              } />
              <Route path="/bugs" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <BugList bugs={bugs} setBugs={setBugs} onUpdateBug={updateBug} onDeleteBug={deleteBug} currentUser={currentUser} loading={loading} />
                </ProtectedRoute>
              } />
              <Route path="/bugs/new" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <BugForm onSubmit={addBug} currentUser={currentUser} />
                </ProtectedRoute>
              } />
              <Route path="/bugs/:id" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <BugDetail bugs={bugs} onUpdateBug={updateBug} onDeleteBug={deleteBug} currentUser={currentUser} />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <Analytics bugs={bugs} />
                </ProtectedRoute>
              } />
              <Route path="/my-bugs" element={
                <ProtectedRoute isAuthenticated={isAuthenticated}>
                  <MyBugs bugs={bugs} currentUser={currentUser} onUpdateBug={updateBug} />
                </ProtectedRoute>
              } />
              <Route path="/users/:email" element={<UserProfile currentUser={currentUser} />} />
            </Routes>
          </PageWrapper>
        </main>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          style={{
            position: 'fixed',
            top: 16,
            right: 16,
            zIndex: 9999,
            background: darkMode ? '#23272f' : '#f3f4f6',
            color: darkMode ? '#fafafa' : '#23272f',
            border: 'none',
            borderRadius: '50%',
            width: 40,
            height: 40,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            cursor: 'pointer',
            transition: 'background 0.3s, color 0.3s',
          }}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {darkMode ? '🌙' : '☀️'}
        </button>
      </div>
    </Router>
  );
}

export default App; 