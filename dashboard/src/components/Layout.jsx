import React, { startTransition, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Activity,
  ArrowRightLeft,
  BookOpen,
  Bot,
  BrushCleaning,
  ChartColumnBig,
  ChevronDown,
  ClipboardList,
  Crown,
  ExternalLink,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  MessageSquareMore,
  PanelsTopLeft,
  Plus,
  RefreshCw,
  ScrollText,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  User,
  X,
  AlertTriangle,
  Save,
  Trash2
} from 'lucide-react';
import {
  ActionButton,
  ConfirmDialog,
  LoadingPanel,
  ToastViewport
} from './Common';
import { titleFromEvent } from '../format';

const SUPPORT_URL = 'https://syncink.github.io/syncink-portfolio/#contact';

const TIER_LEVELS = {
  owner: 5,
  developer: 4,
  admin: 3,
  moderator: 2,
  staff: 1,
  member: 0
};

const ALL_NAV_ITEMS = [
  { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard, minTier: 'member' },
  { path: '/panels', label: 'Ticket Panels', icon: PanelsTopLeft, minTier: 'moderator' },
  { path: '/categories', label: 'Ticket Categories', icon: MessageSquareMore, minTier: 'moderator' },
  { path: '/transfer-options', label: 'Transfer Options', icon: ArrowRightLeft, minTier: 'moderator' },
  { path: '/ticket-logs', label: 'Ticket Logs', icon: ClipboardList, minTier: 'staff' },
  { path: '/transcripts', label: 'Transcripts', icon: FileText, minTier: 'moderator' },
  { path: '/analytics', label: 'Analytics', icon: ChartColumnBig, minTier: 'moderator' },
  { path: '/activity', label: 'Activity Feed', icon: Activity, minTier: 'staff' },
  { path: '/audit-logs', label: 'Audit Logs', icon: ScrollText, minTier: 'moderator' },
  { path: '/dashboard-access', label: 'Dashboard Access', icon: Shield, minTier: 'admin' },
  { path: '/miscellaneous', label: 'Miscellaneous', icon: SlidersHorizontal, minTier: 'admin' },
  { path: '/bot-profile', label: 'Bot Profile', icon: Bot, minTier: 'admin' },
  { path: '/interface', label: 'Interface', icon: BrushCleaning, minTier: 'admin' }
];

const helpItems = [
  { path: '/invite', label: 'Invite Bot', icon: Plus, external: false },
  { path: '/guide', label: 'Dashboard Guide', icon: BookOpen, external: false }
];

function toastFromEvent(event) {
  const info = {
    title: titleFromEvent(event.type),
    description: 'The dashboard synced a live update.',
    tone: 'info'
  };

  if (event.type.includes('closed')) info.tone = 'warning';
  if (event.type.includes('created') || event.type.includes('deployed')) info.tone = 'success';
  if (event.type.includes('audit')) info.tone = 'info';

  if (event.activity?.description) {
    info.description = event.activity.description;
  } else if (event.audit?.action) {
    info.description = event.audit.action;
  } else if (event.section) {
    info.description = `${event.section} was updated and synced live.`;
  }

  return info;
}

export default function Layout({ user, guilds, selectedGuild, onSelectGuild }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [serverDropdownOpen, setServerDropdownOpen] = useState(false);
  const [serverSearch, setServerSearch] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saveAction, setSaveAction] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const refreshTimer = useRef(null);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);

  // Warn on browser close/refresh
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (unsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  const handleNavigate = (path) => {
    if (unsavedChanges) {
      setPendingAction(() => () => navigate(path));
    } else {
      navigate(path);
    }
  };

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = React.useCallback((toast) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, ...toast }].slice(-5));
    window.setTimeout(() => dismissToast(id), 4200);
  }, []);

  const refreshSnapshot = React.useCallback(async (showLoader = false) => {
    if (!selectedGuild?.id) return;
    if (showLoader) setLoading(true);

    try {
      const response = await axios.get(`/api/guilds/${selectedGuild.id}/bootstrap?_t=${Date.now()}`);
      startTransition(() => {
        setSnapshot(response.data);
      });
    } catch (error) {
      pushToast({
        title: 'Sync failed',
        description: error.response?.data?.error || 'The dashboard could not refresh this server.',
        tone: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [selectedGuild?.id, pushToast]);

  useEffect(() => {
    setSnapshot(null);
    setLoading(true);
    refreshSnapshot(true);
  }, [selectedGuild?.id, refreshSnapshot]);

  useEffect(() => {
    if (!selectedGuild?.id) return;

    socketRef.current?.disconnect();
    const socket = io('/', { withCredentials: true });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('guild:subscribe', selectedGuild.id);
    });

    socket.on('dashboard:event', (event) => {
      if (event.guildId !== selectedGuild.id) return;
      pushToast(toastFromEvent(event));

      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = window.setTimeout(() => {
        refreshSnapshot(false);
      }, 250);
    });

    return () => {
      window.clearTimeout(refreshTimer.current);
      socket.disconnect();
    };
  }, [selectedGuild?.id]);

  // Close server dropdown on outside click
  useEffect(() => {
    const handler = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setServerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const saveSettings = async (payload, successTitle = 'Settings saved') => {
    setBusy(true);
    try {
      const response = await axios.patch(`/api/guilds/${selectedGuild.id}/settings`, payload);
      setSnapshot(response.data);
      pushToast({
        title: successTitle,
        description: 'The bot will use these settings immediately.',
        tone: 'success'
      });
      return response.data;
    } catch (error) {
      pushToast({
        title: 'Save failed',
        description: error.response?.data?.error || 'The dashboard could not save those changes.',
        tone: 'error'
      });
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const deployPanel = async (channelId) => {
    setBusy(true);
    try {
      const response = await axios.post(`/api/guilds/${selectedGuild.id}/panel/deploy`, { channelId });
      setSnapshot(response.data);
      pushToast({
        title: 'Panel deployed',
        description: 'The ticket panel was sent to the selected channel.',
        tone: 'success'
      });
    } catch (error) {
      pushToast({
        title: 'Deploy failed',
        description: error.response?.data?.error || 'The ticket panel could not be deployed.',
        tone: 'error'
      });
      throw error;
    } finally {
      setBusy(false);
    }
  };

  const openConfirm = (options, onConfirm) => {
    setConfirmState({ ...options, onConfirm });
  };

  const handleConfirm = async () => {
    if (!confirmState?.onConfirm) return;
    setConfirmBusy(true);
    try {
      await confirmState.onConfirm();
      setConfirmState(null);
    } finally {
      setConfirmBusy(false);
    }
  };

  const handleServerSwitch = (guild) => {
    if (unsavedChanges) {
      setPendingAction(() => () => {
        onSelectGuild(guild.id);
        setServerDropdownOpen(false);
        setServerSearch('');
      });
    } else {
      onSelectGuild(guild.id);
      setServerDropdownOpen(false);
      setServerSearch('');
    }
  };

  const filteredGuilds = guilds.filter((guild) =>
    guild.name.toLowerCase().includes(serverSearch.toLowerCase())
  );

  const userTier = snapshot?.userTier || selectedGuild?.dashboardTier || (selectedGuild?.owner ? 'owner' : 'staff');
  const userLevel = TIER_LEVELS[userTier] || 0;

  const allowedNavItems = ALL_NAV_ITEMS.filter((item) => {
    const requiredLevel = TIER_LEVELS[item.minTier] || 0;
    return userLevel >= requiredLevel;
  });

  const navGroups = [
    {
      label: 'Server Settings',
      items: allowedNavItems
    }
  ];

  const currentLabel = allowedNavItems.find((item) => item.path === location.pathname)?.label || 'Dashboard';

  const renderTierBadge = (tier) => {
    switch (tier) {
      case 'owner': return <span className="role-badge owner"><img src="https://cdn.discordapp.com/emojis/1513803214674464788.png" style={{ width: 12, height: 12 }} alt="Owner" /> Owner</span>;
      case 'developer': return <span className="role-badge developer"><img src="https://cdn.discordapp.com/emojis/1519379532409344142.png" style={{ width: 12, height: 12 }} alt="Developer" /> Developer</span>;
      case 'admin': return <span className="role-badge admin"><img src="https://cdn.discordapp.com/emojis/1518924309668823160.png" style={{ width: 12, height: 12 }} alt="Admin" /> Administrator</span>;
      case 'moderator': return <span className="role-badge moderator"><img src="https://cdn.discordapp.com/emojis/1518924931482779809.png" style={{ width: 12, height: 12 }} alt="Mod" /> Moderator</span>;
      case 'staff': return <span className="role-badge staff"><img src="https://cdn.discordapp.com/emojis/1513328514529624185.png" style={{ width: 12, height: 12 }} alt="Staff" /> Staff</span>;
      case 'member': 
      default: return <span className="role-badge member" style={{ color: 'var(--text-muted)' }}><User size={10} /> Member</span>;
    }
  };

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <img src="/ticket-logo.png" alt="SyncInk Ticket" style={{ width: 32, height: 32, borderRadius: 8 }} />
          <div>
            <strong>SyncInk Ticket</strong>
            <span>Premium Ticket System</span>
          </div>
        </div>

        {/* Server Selector with Dropdown */}
        <div className="guild-switcher-wrap" ref={dropdownRef}>
          <button type="button" className="guild-switcher" onClick={() => setServerDropdownOpen(!serverDropdownOpen)}>
            <div className="guild-switcher-left">
              {selectedGuild?.icon ? (
                <div className="guild-icon-wrap">
                  <img
                    src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                    alt={selectedGuild.name}
                  />
                  {snapshot?.stats?.openTickets > 0 ? (
                    <span className="pulsing-dot green" />
                  ) : (
                    <span className="pulsing-dot red" />
                  )}
                </div>
              ) : (
                <div className="guild-avatar-fallback guild-icon-wrap">
                  {selectedGuild?.name?.charAt(0) || 'S'}
                  {snapshot?.stats?.openTickets > 0 ? (
                    <span className="pulsing-dot green" />
                  ) : (
                    <span className="pulsing-dot red" />
                  )}
                </div>
              )}
              <div>
                <strong>{selectedGuild?.name || 'Select a server'}</strong>
                <span className="guild-role-badge">
                  {renderTierBadge(selectedGuild?.dashboardTier || (selectedGuild?.owner ? 'owner' : 'admin'))}
                </span>
              </div>
            </div>
            <ChevronDown size={18} className={serverDropdownOpen ? 'chevron-open' : ''} />
          </button>

          {serverDropdownOpen && (
            <div className="server-dropdown">
              <div className="server-dropdown-search">
                <Search size={14} />
                <input
                  type="text"
                  placeholder="Search servers..."
                  value={serverSearch}
                  onChange={(e) => setServerSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="server-dropdown-list">
                {filteredGuilds.map((guild) => (
                  <button
                    key={guild.id}
                    type="button"
                    className={`server-dropdown-item ${guild.id === selectedGuild?.id ? 'active' : ''}`}
                    onClick={() => handleServerSwitch(guild)}
                  >
                    {guild.icon ? (
                      <img
                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                        alt={guild.name}
                      />
                    ) : (
                      <div className="guild-avatar-fallback small">{guild.name.charAt(0)}</div>
                    )}
                    <div className="server-dropdown-info">
                      <strong>{guild.name}</strong>
                      {renderTierBadge(guild.dashboardTier || (guild.owner ? 'owner' : 'admin'))}
                    </div>
                  </button>
                ))}
                {filteredGuilds.length === 0 && (
                  <div className="server-dropdown-empty">No servers found</div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="sidebar-groups">
          {navGroups.map((group) => (
            <div key={group.label} className="sidebar-group">
              <div className="sidebar-label">{group.label}</div>
              {group.items.map((item) => {
                const active = item.path === location.pathname;
                const Icon = item.icon;

                return (
                  <button
                    key={item.path}
                    type="button"
                    className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => handleNavigate(item.path)}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}

          <div className="sidebar-group">
            <div className="sidebar-label">Help</div>
            {helpItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  type="button"
                  className="nav-item"
                  onClick={() => handleNavigate(item.path)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button type="button" className="nav-item" onClick={() => window.location.reload()}>
              <RefreshCw size={18} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-nav">
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">Support</a>
            <button type="button" onClick={() => handleNavigate('/reviews')}>Reviews</button>
            <button type="button" onClick={() => handleNavigate('/invite')}>Invite Bot</button>
            <button type="button" onClick={() => handleNavigate('/guide')}>Guide</button>
            <button type="button" onClick={() => handleNavigate('/faq')}>FAQ</button>
            <div className="topbar-dropdown">
              <button type="button" className="topbar-dropdown-btn">Legal <ChevronDown size={14} style={{marginLeft: 4}} /></button>
              <div className="topbar-dropdown-menu">
                <button type="button" onClick={() => handleNavigate('/privacy')}><Shield size={16} /> Privacy Policy</button>
                <button type="button" onClick={() => handleNavigate('/terms')}><FileText size={16} /> Terms of Service</button>
              </div>
            </div>
            <strong className="topbar-active">Dashboard</strong>
          </div>

          <div className="topbar-actions">
            <button type="button" className="profile-chip">
              {user?.avatar ? (
                <img
                  src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                  alt={user.username}
                />
              ) : (
                <div className="profile-fallback">{user?.username?.charAt(0) || 'U'}</div>
              )}
              <div>
                <strong>{user?.global_name || user?.username}</strong>
                <span>@{user?.username}</span>
              </div>
            </button>
            <a href="/api/auth/logout" className="logout-btn" title="Logout">
              <LogOut size={16} />
            </a>
          </div>
        </header>

        <div className="content-shell">
          {showAnnouncement && (
            <div className="announcement-bar">
              <span className="announcement-icon">ℹ</span>
              If you encounter any issues, please <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">Contact Support</a> or send us a message with your issue.
              <button className="announcement-close" onClick={() => setShowAnnouncement(false)}><X size={14} /></button>
            </div>
          )}

          {loading && !snapshot ? (
            <LoadingPanel label="Loading your Ticket Bot workspace..." />
          ) : !snapshot ? (
            <div className="layout-error" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px', color: 'var(--text)' }}>
              <h2>Failed to load server data</h2>
              <p style={{ color: 'var(--text-muted)' }}>We could not retrieve the configuration for this server. You may not have the required access, or the bot might be offline.</p>
              <button className="action-button tone-primary" onClick={() => handleNavigate('/servers')}>Return to Server List</button>
            </div>
          ) : (
            <Outlet
              context={{
                busy,
                currentLabel,
                deployPanel,
                guilds,
                openConfirm,
                onSelectGuild,
                refreshSnapshot,
                saveSettings,
                selectedGuild,
                snapshot,
                user,
                setUnsavedChanges,
                setSaveAction
              }}
            />
          )}
        </div>
      </main>

      <ToastViewport items={toasts} onDismiss={dismissToast} />
      <ConfirmDialog
        state={confirmState}
        busy={confirmBusy}
        onCancel={() => !confirmBusy && setConfirmState(null)}
        onConfirm={handleConfirm}
      />

      {/* Unsaved Changes Premium Modal */}
      {pendingAction && (
        <div className="unsaved-modal-overlay">
          <div className="unsaved-modal-content glass-effect slide-up">
            <div className="unsaved-modal-header">
              <div className="unsaved-modal-icon-bg">
                <AlertTriangle size={28} className="unsaved-modal-icon" />
              </div>
              <div className="unsaved-modal-title">
                <h2>Unsaved Changes</h2>
                <p>You have modified settings on this page. Would you like to save your changes before leaving?</p>
              </div>
            </div>
            <div className="unsaved-modal-actions">
              <button 
                className="unsaved-btn cancel-btn" 
                onClick={() => setPendingAction(null)}
                disabled={busy}
              >
                Cancel
              </button>
              <div className="unsaved-btn-group">
                <button 
                  className="unsaved-btn discard-btn" 
                  onClick={() => {
                    setUnsavedChanges(false);
                    setSaveAction(null);
                    pendingAction();
                    setPendingAction(null);
                  }}
                  disabled={busy}
                >
                  <Trash2 size={16} /> Discard Changes
                </button>
                <ActionButton 
                  tone="primary" 
                  busy={busy}
                  className="unsaved-btn save-btn"
                  onClick={async () => {
                    if (saveAction) {
                      try {
                        await saveAction();
                      } catch (e) {
                        return; // Save failed, stay on page
                      }
                    }
                    setUnsavedChanges(false);
                    setSaveAction(null);
                    pendingAction();
                    setPendingAction(null);
                  }}
                >
                  <Save size={16} /> Save & Continue
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
