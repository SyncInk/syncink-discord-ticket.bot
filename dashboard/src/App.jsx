import React, { useEffect, useState, lazy, Suspense, Component } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import axios, { getApiUrl } from './api';
import Layout from './components/Layout';
import { Ticket } from 'lucide-react';

// Error Boundary to prevent any blank screen crashes
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[DASHBOARD ERROR BOUNDARY]', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#050508',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'sans-serif'
        }}>
          <img src="/ticket-logo.png" alt="SyncInk Ticket" style={{ width: 64, height: 64, borderRadius: 20, marginBottom: 20 }} />
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>Something went wrong</h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '420px', lineHeight: 1.6, marginBottom: '24px' }}>
            The dashboard encountered an unexpected error. Please refresh or return to the main dashboard.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: '#5865F2',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reload Dashboard
            </button>
            <a
              href="https://www.syncink.site/dashboard/tickets"
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center'
              }}
            >
              Open on syncink.site
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

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

  // User authenticated, but hasn't added SyncInk Ticket to any server yet
  if (!guilds || guilds.length === 0) {
    return (
      <div className="server-shell" style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <div className="server-header" style={{ marginBottom: '32px' }}>
          <img src="/ticket-logo.png" alt="SyncInk Ticket" style={{ width: 64, height: 64, borderRadius: 20, margin: '0 auto 18px' }} />
          <h1 style={{ fontSize: '26px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>Select your workspace</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Choose the Discord server you want to view or manage.</p>
        </div>
        <div className="server-empty" style={{ padding: '48px 32px', background: 'rgba(10, 10, 10, 0.8)', borderRadius: '24px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <div style={{ width: 56, height: 56, borderRadius: '16px', background: 'rgba(139, 76, 255, 0.12)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Ticket size={28} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'white', marginBottom: '10px' }}>
            You haven&apos;t used SyncInk Ticket in any server yet!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, marginBottom: '28px' }}>
            SyncInk Ticket is not active in any server where this account has administrator permissions. Invite the bot to your Discord server or ensure you have Administrator / Manage Server permissions to get started.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
            <a
              href="https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '14px 28px',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '14px',
                textDecoration: 'none',
                color: 'white',
                background: '#5865F2'
              }}
            >
              Invite SyncInk Ticket to Your Server
            </a>
            <a
              href={getApiUrl('/api/auth/logout')}
              style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, padding: '8px' }}
            >
              Log out and switch account
            </a>
          </div>
        </div>
      </div>
    );
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
      // 0. Extract token from URL if redirected from Discord OAuth callback
      let activeToken = localStorage.getItem('syncink_ticket_token');
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get('token') || params.get('session_id');
        if (urlToken) {
          activeToken = urlToken;
          localStorage.setItem('syncink_ticket_token', urlToken);
          params.delete('token');
          params.delete('session_id');
          const remaining = params.toString();
          const cleanUrl = window.location.pathname + (remaining ? `?${remaining}` : '');
          window.history.replaceState({}, document.title, cleanUrl);
        }
      }

      const headers = activeToken ? { Authorization: `Bearer ${activeToken}`, 'x-session-id': activeToken } : {};
      const queryParam = activeToken ? `?token=${encodeURIComponent(activeToken)}` : '';
      const res = await axios.get(`/api/auth/me${queryParam}`, { headers });
      setUser(res.data.user);
      const userGuilds = Array.isArray(res.data.guilds) ? res.data.guilds : [];
      setGuilds(userGuilds);
      
      if (userGuilds.length > 0) {
        const stored = localStorage.getItem('selectedGuildId');
        const match = userGuilds.find((g) => g.id === stored);
        setSelectedGuildId(match ? match.id : userGuilds[0].id);
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

  const safeGuilds = Array.isArray(guilds) ? guilds : [];
  const selectedGuild = safeGuilds.find((guild) => guild.id === selectedGuildId) || (safeGuilds.length > 0 ? safeGuilds[0] : null);

  return (
    <ErrorBoundary>
      <Suspense fallback={<div className="app-loading">Loading dashboard...</div>}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route
            path="/"
            element={
              <RootGate
                user={user}
                guilds={safeGuilds}
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
          <Route path="/dashboard/:guildId/transcripts/:ticketId" element={<TranscriptView user={user} />} />
          <Route
            path="/servers"
            element={user ? (
              <ServerSelect
                guilds={safeGuilds}
                onSelect={handleSelectGuild}
                selectedGuildId={selectedGuildId}
              />
            ) : <Navigate to="/login" />}
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
