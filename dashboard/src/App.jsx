import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Login from './pages/Login';
import ServerSelect from './pages/ServerSelect';
import Overview from './pages/Overview';
import TicketPanels from './pages/TicketPanels';
import TicketCategories from './pages/TicketCategories';
import TicketLogs from './pages/TicketLogs';
import Transcripts from './pages/Transcripts';
import Analytics from './pages/Analytics';
import ActivityFeed from './pages/ActivityFeed';
import AuditLogs from './pages/AuditLogs';
import InterfacePage from './pages/InterfacePage';
import BotProfile from './pages/BotProfile';
import DashboardAccess from './pages/DashboardAccess';
import Miscellaneous from './pages/Miscellaneous';
import Invite from './pages/Invite';
import Guide from './pages/Guide';
import Reviews from './pages/Reviews';

export default function App() {
  const [user, setUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState(localStorage.getItem('selectedGuildId') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/auth/me')
      .then((response) => {
        setUser(response.data.user);
        setGuilds(response.data.guilds);

        const storedGuildStillExists = response.data.guilds.some((guild) => guild.id === selectedGuildId);
        if (!storedGuildStillExists) {
          const firstGuildId = response.data.guilds[0]?.id || null;
          setSelectedGuildId(firstGuildId);
          if (firstGuildId) {
            localStorage.setItem('selectedGuildId', firstGuildId);
          } else {
            localStorage.removeItem('selectedGuildId');
          }
        }
      })
      .catch(() => {
        setUser(null);
        setGuilds([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSelectGuild = (guildId) => {
    setSelectedGuildId(guildId);
    if (guildId) {
      localStorage.setItem('selectedGuildId', guildId);
    } else {
      localStorage.removeItem('selectedGuildId');
    }
  };

  if (loading) {
    return <div className="app-loading">Authenticating your dashboard session...</div>;
  }

  const selectedGuild = guilds.find((guild) => guild.id === selectedGuildId) || null;

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/invite" element={<Invite />} />
      <Route path="/guide" element={user ? <Guide /> : <Navigate to="/login" />} />
      <Route path="/reviews" element={<Reviews user={user} />} />
      <Route
        path="/servers"
        element={user ? (
          <ServerSelect
            guilds={guilds}
            onSelect={handleSelectGuild}
            selectedGuildId={selectedGuildId}
          />
        ) : <Navigate to="/login" />}
      />
      <Route
        path="/"
        element={user ? (
          selectedGuild ? (
            <Layout
              guilds={guilds}
              onSelectGuild={handleSelectGuild}
              selectedGuild={selectedGuild}
              user={user}
            />
          ) : (
            <Navigate to="/servers" />
          )
        ) : (
          <Navigate to="/login" />
        )}
      >
        <Route index element={<Overview />} />
        <Route path="panels" element={<TicketPanels />} />
        <Route path="categories" element={<TicketCategories />} />
        <Route path="ticket-logs" element={<TicketLogs />} />
        <Route path="transcripts" element={<Transcripts />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="activity" element={<ActivityFeed />} />
        <Route path="audit-logs" element={<AuditLogs />} />
        <Route path="interface" element={<InterfacePage />} />
        <Route path="bot-profile" element={<BotProfile />} />
        <Route path="dashboard-access" element={<DashboardAccess />} />
        <Route path="miscellaneous" element={<Miscellaneous />} />
      </Route>
    </Routes>
  );
}
