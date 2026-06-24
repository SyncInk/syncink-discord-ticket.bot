import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import PanelManager from './pages/PanelManager';
import CategoryManager from './pages/CategoryManager';
import LiveViewer from './pages/LiveViewer';
import Settings from './pages/Settings';
import ServerSelect from './pages/ServerSelect';
import axios from 'axios';

function App() {
  const [user, setUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState(localStorage.getItem('selectedGuildId') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/me')
      .then(res => {
        setUser(res.data.user);
        setGuilds(res.data.guilds);
        setLoading(false);
      })
      .catch(() => {
        setUser(null);
        setGuilds([]);
        setLoading(false);
      });
  }, []);

  const handleSelectGuild = (id) => {
    setSelectedGuildId(id);
    localStorage.setItem('selectedGuildId', id);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2 className="animate-fade-in" style={{ color: 'var(--color-primary)' }}>Authenticating...</h2>
      </div>
    );
  }

  const selectedGuild = guilds.find(g => g.id === selectedGuildId) || null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/servers" element={user ? <ServerSelect guilds={guilds} onSelect={handleSelectGuild} /> : <Navigate to="/login" />} />
      
      {/* Protected Dashboard Routes */}
      <Route path="/" element={user ? (selectedGuild ? <Layout user={user} selectedGuild={selectedGuild} guilds={guilds} onSelect={handleSelectGuild} /> : <Navigate to="/servers" />) : <Navigate to="/login" />}>
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
