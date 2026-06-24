import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import PanelManager from './pages/PanelManager';
import CategoryManager from './pages/CategoryManager';
import LiveViewer from './pages/LiveViewer';
import Settings from './pages/Settings';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check auth status
    axios.get('/api/auth/me')
      .then(res => {
        setUser(res.data.user);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 className="animate-fade-in" style={{ color: 'var(--color-primary)' }}>Authenticating...</h2>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/" element={user ? <Layout user={user} /> : <Navigate to="/login" />}>
        <Route index element={<Overview />} />
        <Route path="panels" element={<PanelManager />} />
        <Route path="categories" element={<CategoryManager />} />
        <Route path="live" element={<LiveViewer />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

export default App;
