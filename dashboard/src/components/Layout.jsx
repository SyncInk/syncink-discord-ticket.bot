import React, { startTransition, useEffect, useEffectEvent, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import {
  Activity,
  BookOpen,
  Bot,
  BrushCleaning,
  ChartColumnBig,
  ChevronDown,
  ClipboardList,
  Crown,
  ExternalLink,
  FileText,
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
  SlidersHorizontal
} from 'lucide-react';
import {
  ActionButton,
  ConfirmDialog,
  LoadingPanel,
  ToastViewport
} from './Common';
import { titleFromEvent } from '../format';

const SUPPORT_URL = 'https://syncink.github.io/syncink-portfolio/#contact';

const navGroups = [
  {
    label: 'Server Settings',
    items: [
      { path: '/', label: 'Dashboard Overview', icon: LayoutDashboard },
      { path: '/panels', label: 'Ticket Panels', icon: PanelsTopLeft },
      { path: '/categories', label: 'Ticket Categories', icon: MessageSquareMore },
      { path: '/ticket-logs', label: 'Ticket Logs', icon: ClipboardList },
      { path: '/transcripts', label: 'Transcripts', icon: FileText },
      { path: '/analytics', label: 'Analytics', icon: ChartColumnBig },
      { path: '/activity', label: 'Activity Feed', icon: Activity },
      { path: '/audit-logs', label: 'Audit Logs', icon: ScrollText },
      { path: '/dashboard-access', label: 'Dashboard Access', icon: Shield },
      { path: '/miscellaneous', label: 'Miscellaneous', icon: SlidersHorizontal },
      { path: '/bot-profile', label: 'Bot Profile', icon: Bot },
      { path: '/interface', label: 'Interface', icon: BrushCleaning }
    ]
  }
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
  const refreshTimer = useRef(null);
  const socketRef = useRef(null);
  const dropdownRef = useRef(null);

  const dismissToast = (id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  };

  const pushToast = useEffectEvent((toast) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, ...toast }].slice(-5));
    window.setTimeout(() => dismissToast(id), 4200);
  });

  const refreshSnapshot = useEffectEvent(async (showLoader = false) => {
    if (!selectedGuild?.id) return;
    if (showLoader) setLoading(true);

    try {
      const response = await axios.get(`/api/guilds/${selectedGuild.id}/bootstrap`);
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
  });

  useEffect(() => {
    setSnapshot(null);
    setLoading(true);
    refreshSnapshot(true);
  }, [selectedGuild?.id]);

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
    onSelectGuild(guild.id);
    setServerDropdownOpen(false);
    setServerSearch('');
  };

  const filteredGuilds = guilds.filter((guild) =>
    guild.name.toLowerCase().includes(serverSearch.toLowerCase())
  );

  const currentLabel = navGroups
    .flatMap((group) => group.items)
    .find((item) => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">S</div>
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
                <img
                  src={`https://cdn.discordapp.com/icons/${selectedGuild.id}/${selectedGuild.icon}.png`}
                  alt={selectedGuild.name}
                />
              ) : (
                <div className="guild-avatar-fallback">{selectedGuild?.name?.charAt(0) || 'S'}</div>
              )}
              <div>
                <strong>{selectedGuild?.name || 'Select a server'}</strong>
                <span className="guild-role-badge">
                  {selectedGuild?.owner ? (
                    <><Crown size={12} /> Owner</>
                  ) : (
                    <><ShieldCheck size={12} /> Administrator</>
                  )}
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
                      <span className={`role-badge ${guild.owner ? 'owner' : 'admin'}`}>
                        {guild.owner ? <><Crown size={10} /> Owner</> : <><ShieldCheck size={10} /> Administrator</>}
                      </span>
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
                    onClick={() => navigate(item.path)}
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
                  onClick={() => navigate(item.path)}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
            <button type="button" className="nav-item" onClick={() => refreshSnapshot(true)}>
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
            <button type="button" onClick={() => navigate('/invite')}>Invite Bot</button>
            <button type="button" onClick={() => navigate('/guide')}>Guide</button>
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
                <strong>{user?.username}</strong>
                <span>@{user?.username}</span>
              </div>
            </button>
            <a href="/api/auth/logout" className="logout-btn" title="Logout">
              <LogOut size={16} />
            </a>
          </div>
        </header>

        <div className="content-shell">
          <div className="announcement-bar">
            <span className="announcement-icon">ℹ</span>
            If you encounter any issues, please <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer">Contact Support</a> or send us a message with your issue.
          </div>

          {loading && !snapshot ? (
            <LoadingPanel label="Loading your Ticket Bot workspace..." />
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
                user
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
    </div>
  );
}
