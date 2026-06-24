import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServerSelect = ({ guilds, onSelect }) => {
  const navigate = useNavigate();

  const handleSelect = (id) => {
    onSelect(id);
    navigate('/');
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      padding: '60px 20px',
      backgroundColor: 'var(--bg-main)',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(155, 89, 182, 0.05) 0%, transparent 70%)'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }} className="animate-slide-up">
        <div style={{ 
          width: '64px', height: '64px', 
          borderRadius: '16px', 
          background: 'linear-gradient(135deg, var(--color-primary), #3498db)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 'bold', fontSize: '28px',
          margin: '0 auto 16px auto',
          boxShadow: 'var(--shadow-glow)'
        }}>
          S
        </div>
        <h1>Select a Server</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>
          Choose a server to configure the SyncInk Ticket Bot.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
        gap: '20px',
        width: '100%',
        maxWidth: '1000px'
      }}>
        {guilds.map((guild, i) => (
          <div 
            key={guild.id}
            onClick={() => handleSelect(guild.id)}
            className="card animate-slide-up"
            style={{ 
              animationDelay: `${i * 0.05}s`,
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              cursor: 'pointer',
              border: '1px solid var(--border-subtle)'
            }}
            onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--color-primary)'}
            onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          >
            {guild.icon ? (
              <img 
                src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`} 
                alt={guild.name}
                style={{ width: '48px', height: '48px', borderRadius: '50%' }}
              />
            ) : (
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '50%', 
                backgroundColor: 'var(--bg-tertiary)', display: 'flex', 
                alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' 
              }}>
                {guild.name.charAt(0)}
              </div>
            )}
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <h3 style={{ fontSize: '16px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {guild.name}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                Admin Access
              </p>
            </div>
          </div>
        ))}

        {guilds.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            You do not have Administrator permissions in any servers with SyncInk Ticket Bot.
          </div>
        )}
      </div>
    </div>
  );
};

export default ServerSelect;
