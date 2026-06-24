import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ShieldCheck } from 'lucide-react';

export default function ServerSelect({ guilds, onSelect, selectedGuildId }) {
  const navigate = useNavigate();

  const handleSelect = (guildId) => {
    onSelect(guildId);
    navigate('/');
  };

  return (
    <div className="server-shell">
      <div className="server-header">
        <div className="brand-mark large">S</div>
        <h1>Select a server</h1>
        <p>Choose a guild where you own the server or currently have Administrator access.</p>
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
                <span>{guild.owner ? 'Server Owner' : 'Administrator'}</span>
              </div>

              <div className="server-card-badge">
                {guild.owner ? <Crown size={16} /> : <ShieldCheck size={16} />}
              </div>
            </button>
          );
        })}
      </div>

      {guilds.length === 0 ? (
        <div className="server-empty">
          SyncInk Ticket Bot is not in any guilds where this account has the required permissions.
        </div>
      ) : null}
    </div>
  );
}
