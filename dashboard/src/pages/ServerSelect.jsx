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
      case 'owner': return <span className="role-badge owner" style={{marginTop: 0}}><img src="https://cdn.discordapp.com/emojis/1513803214674464788.png" style={{ width: 12, height: 12 }} alt="Owner" /> Owner</span>;
      case 'developer': return <span className="role-badge developer" style={{marginTop: 0}}><img src="https://cdn.discordapp.com/emojis/1519379532409344142.png" style={{ width: 12, height: 12 }} alt="Developer" /> Developer</span>;
      case 'admin': return <span className="role-badge admin" style={{marginTop: 0}}><img src="https://cdn.discordapp.com/emojis/1518924309668823160.png" style={{ width: 12, height: 12 }} alt="Admin" /> Administrator</span>;
      case 'moderator': return <span className="role-badge moderator" style={{marginTop: 0}}><img src="https://cdn.discordapp.com/emojis/1518924931482779809.png" style={{ width: 12, height: 12 }} alt="Mod" /> Moderator</span>;
      case 'staff': return <span className="role-badge staff" style={{marginTop: 0}}><img src="https://cdn.discordapp.com/emojis/1513328514529624185.png" style={{ width: 12, height: 12 }} alt="Staff" /> Staff</span>;
      default: return <span className="role-badge admin" style={{marginTop: 0}}><ShieldCheck size={10} /> Administrator</span>;
    }
  };

  return (
    <div className="server-shell">
      <div className="server-header">
        <img src="/ticket-logo.png" alt="SyncInk Ticket" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 16 }} />
        <h1>Select a server</h1>
        <p>Choose a guild where you own the server or currently have Dashboard access.</p>
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
          <p style={{ marginBottom: '16px' }}>SyncInk Ticket Bot is not in any guilds where this account has the required permissions.</p>
          <a href="/api/auth/logout" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Log Out to Refresh Session</a>
        </div>
      ) : null}
    </div>
  );
}
