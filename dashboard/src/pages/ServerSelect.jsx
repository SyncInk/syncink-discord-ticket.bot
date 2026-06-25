import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ShieldCheck } from 'lucide-react';

export default function ServerSelect({ guilds, onSelect, selectedGuildId }) {
  const navigate = useNavigate();

  const handleSelect = (guildId) => {
    onSelect(guildId);
    navigate('/');
  };

  const renderTierBadge = (tier) => {
    switch (tier) {
      case 'owner':
        return <span className="role-badge owner"><Crown size={11} /> Server Owner</span>;
      case 'developer':
        return <span className="role-badge developer"><ShieldCheck size={11} /> Developer</span>;
      case 'moderator':
        return <span className="role-badge moderator"><ShieldCheck size={11} /> Moderator</span>;
      case 'staff':
        return <span className="role-badge staff"><ShieldCheck size={11} /> Staff</span>;
      default:
        return <span className="role-badge admin"><ShieldCheck size={11} /> Administrator</span>;
    }
  };

  return (
    <div className="server-shell">
      <div className="server-header">
        <img src="/ticket-logo.png" alt="SyncInk Ticket" style={{ width: 56, height: 56, borderRadius: 18, marginBottom: 18 }} />
        <h1>Select your workspace</h1>
        <p>
          Choose the Discord server you want to manage. Only servers where you are the owner or have
          Administrator-level dashboard access are shown here.
        </p>
      </div>

      <div className="server-grid">
        {guilds.map((guild) => {
          const active = guild.id === selectedGuildId;

          return (
            <button
              key={guild.id}
              type="button"
              className={`server-card ${active ? 'active' : ''}`}
              onClick={() => handleSelect(guild.id)}
            >
              {guild.icon ? (
                <img
                  src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                  alt={guild.name}
                />
              ) : (
                <div className="server-fallback">{guild.name.charAt(0)}</div>
              )}

              <div className="server-card-copy">
                <strong>{guild.name}</strong>
                {renderTierBadge(guild.dashboardTier || (guild.owner ? 'owner' : 'admin'))}
              </div>
            </button>
          );
        })}
      </div>

      {guilds.length === 0 ? (
        <div className="server-empty">
          <p style={{ margin: '0 0 14px' }}>
            SyncInk Ticket is not available in any servers where this account currently has the required permissions.
          </p>
          <a href="/api/auth/logout" style={{ color: 'var(--accent)', fontWeight: 700 }}>Log out and refresh session</a>
        </div>
      ) : null}
    </div>
  );
}
