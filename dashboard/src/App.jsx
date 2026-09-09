import React, { useEffect, useState, lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import axios from 'axios';
import Layout from './components/Layout';

// Lazy-loaded pages for optimal bundle splitting and minimal traffic
const Login = lazy(() => import('./pages/Login'));
const ServerSelect = lazy(() => import('./pages/ServerSelect'));
const Overview = lazy(() => import('./pages/Overview'));
const TicketPanels = lazy(() => import('./pages/TicketPanels'));
const TicketCategories = lazy(() => import('./pages/TicketCategories'));
const TransferOptions = lazy(() => import('./pages/TransferOptions'));
const TicketLogs = lazy(() => import('./pages/TicketLogs'));
const Transcripts = lazy(() => import('./pages/Transcripts'));
const Analytics = lazy(() => import('./pages/Analytics'));
const ActivityFeed = lazy(() => import('./pages/ActivityFeed'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));
const InterfacePage = lazy(() => import('./pages/InterfacePage'));
const BotProfile = lazy(() => import('./pages/BotProfile'));
const DashboardAccess = lazy(() => import('./pages/DashboardAccess'));
const Miscellaneous = lazy(() => import('./pages/Miscellaneous'));
const Invite = lazy(() => import('./pages/Invite'));
const Guide = lazy(() => import('./pages/Guide'));
const Reviews = lazy(() => import('./pages/Reviews'));
const Features = lazy(() => import('./pages/Features'));
const Commands = lazy(() => import('./pages/Commands'));
const SupportPage = lazy(() => import('./pages/SupportPage'));
const TranscriptView = lazy(() => import('./pages/Transcript'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const FAQ = lazy(() => import('./pages/FAQ'));
const StatusPage = lazy(() => import('./pages/StatusPage'));

function RootGate({ user, guilds, selectedGuild, onSelectGuild }) {
  const location = useLocation();

  if (!user) {
    return location.pathname === '/' ? <Invite user={user} /> : <Navigate to="/login" />;
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
    <Suspense fallback={<div className="app-loading">Loading dashboard...</div>}>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route
          path="/"
          element={
            <RootGate
              user={user}
              guilds={guilds}
              selectedGuild={selectedGuild}
              onSelectGuild={handleSelectGuild}
            />
          }
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
        <Route path="/status" element={<StatusPage user={user} />} />
        <Route path="/invite" element={<Invite user={user} />} />
        <Route path="/features" element={<Features user={user} />} />
        <Route path="/commands" element={<Commands user={user} />} />
        <Route path="/support" element={<SupportPage user={user} />} />
        <Route path="/guide" element={<Guide user={user} />} />
        <Route path="/reviews" element={<Reviews user={user} />} />
        <Route path="/privacy" element={<PrivacyPolicy user={user} />} />
        <Route path="/terms" element={<TermsOfService user={user} />} />
        <Route path="/faq" element={<FAQ user={user} />} />
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
      </Routes>
    </Suspense>
  );
}
