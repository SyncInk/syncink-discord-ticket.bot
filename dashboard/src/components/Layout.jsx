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
  FileText,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  MessageSquareMore,
  PanelsTopLeft,
  RefreshCw,
  ScrollText,
  Shield,
  SlidersHorizontal
} from 'lucide-react';
import {
  ActionButton,
  ConfirmDialog,
  LoadingPanel,
  ToastViewport
} from './Common';
import { titleFromEvent } from '../format';

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
      { path: '/interface', label: 'Interface', icon: BrushCleaning },
      { path: '/bot-profile', label: 'Bot Profile', icon: Bot },
      { path: '/dashboard-access', label: 'Dashboard Access', icon: Shield },
      { path: '/miscellaneous', label: 'Miscellaneous', icon: SlidersHorizontal }
    ]
  }
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
  const refreshTimer = useRef(null);
  const socketRef = useRef(null);

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

  const currentLabel = navGroups
    .flatMap((group) => group.items)
    .find((item) => item.path === location.pathname)?.label || 'Dashboard';

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">S</div>
          <div>
            <strong>SyncInk Tickets</strong>
            <span>Premium Discord management</span>
          </div>
        </div>

        <button type="button" className="guild-switcher" onClick={() => navigate('/servers')}>
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
              <span>Owner or Administrator</span>
            </div>
          </div>
          <ChevronDown size={18} />
        </button>

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
        </div>

        <div className="sidebar-footer">
          <button type="button" className="mini-link">
            <LifeBuoy size={16} />
            Support
          </button>
          <button type="button" className="mini-link">
            <BookOpen size={16} />
            Guide
          </button>
          <button type="button" className="mini-link">
            <LockKeyhole size={16} />
            Protected Access
          </button>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-nav">
            <span>Support</span>
            <span>Invite Bot</span>
            <span>Guide</span>
            <strong>Dashboard</strong>
          </div>

          <div className="topbar-actions">
            <ActionButton onClick={() => refreshSnapshot(true)}>
              <RefreshCw size={15} />
              Refresh
            </ActionButton>
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
          </div>
        </header>

        <div className="content-shell">
          <div className="announcement-bar">
            <span className="announcement-icon">i</span>
            The dashboard is synced live with the bot and MongoDB. Safe configuration changes apply immediately.
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
