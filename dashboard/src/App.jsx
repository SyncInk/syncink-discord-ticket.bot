import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';
import Login from './pages/Login';
import ServerSelect from './pages/ServerSelect';
import Overview from './pages/Overview';
import TicketPanels from './pages/TicketPanels';
import TicketCategories from './pages/TicketCategories';
import TransferOptions from './pages/TransferOptions';
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

import TranscriptView from './pages/Transcript';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import FAQ from './pages/FAQ';

function RootGate({ user, guilds, selectedGuild, onSelectGuild }) {
  const location = useLocation();

  if (!user) {
    return location.pathname === '/' ? <Invite /> : <Navigate to="/login" />;
  }

  if (!selectedGuild) {
    return <Navigate to="/servers" />;
  }

  return (
    <Layout
      guilds={guilds}
      onSelectGuild={onSelectGuild}
      selectedGuild={selectedGuild}
      user={user}
    />
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [guilds, setGuilds] = useState([]);
  const [selectedGuildId, setSelectedGuildId] = useState(localStorage.getItem('selectedGuildId') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      setUser(res.data.user);
      setGuilds(res.data.guilds);
      
      if (res.data.guilds.length > 0 && !selectedGuildId) {
        setSelectedGuildId(res.data.guilds[0].id);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

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
      <Route path="/guide" element={<Guide />} />
      <Route path="/reviews" element={<Reviews user={user} />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/dashboard/:guildId/transcripts/:ticketId" element={user ? <TranscriptView /> : <Navigate to="/login" />} />
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
        element={(
          <RootGate
            user={user}
            guilds={guilds}
            selectedGuild={selectedGuild}
            onSelectGuild={handleSelectGuild}
          />
        )}
      >
        <Route index element={<Overview />} />
        <Route path="panels" element={<TicketPanels />} />
        <Route path="categories" element={<TicketCategories />} />
        <Route path="transfer-options" element={<TransferOptions />} />
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
