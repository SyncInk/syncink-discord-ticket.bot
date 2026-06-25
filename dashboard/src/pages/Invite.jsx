import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, Ticket, X } from 'lucide-react';
import HeroParticleText from '../components/HeroParticleText';

export default function Invite() {
  const navigate = useNavigate();

  const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=8&integration_type=0&scope=bot+applications.commands';

  return (
    <div className="invite-shell">
      <div className="invite-logos">
        <img src="/syncink-main-logo.png" alt="SyncInk" className="invite-logo-circle" loading="lazy" />
        <div className="invite-logo-divider" style={{ background: 'transparent', width: 'auto', color: 'var(--text-muted)' }}>
          <X size={20} />
        </div>
        <img src="/ticket-logo.png" alt="SyncInk Ticket" className="invite-logo-circle" loading="lazy" />
      </div>

      <div className="invite-hero">
        <HeroParticleText 
          textLines={["Add SyncInk Ticket", "to your server"]} 
          highlightWord="SyncInk Ticket"
        />
        <p>
          The ultimate ticket management system.<br />
          Beautiful dashboard, complete control, zero clutter.
        </p>

        <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="invite-button">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.02.02.05.03.08.02c1.71-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z"/>
          </svg>
          Invite to Discord
        </a>
      </div>

      <div className="invite-features">
        <div className="invite-feature-card">
          <div className="feature-icon"><Ticket size={20} /></div>
          <h3>Ticket Management</h3>
          <p>Automatic temporary ticket channels with customizable categories.</p>
        </div>
        <div className="invite-feature-card">
          <div className="feature-icon"><LayoutDashboard size={20} /></div>
          <h3>Web Dashboard</h3>
          <p>Manage settings, permissions, and features from a sleek web UI.</p>
        </div>
        <div className="invite-feature-card">
          <div className="feature-icon"><Shield size={20} /></div>
          <h3>Full Control</h3>
          <p>Give staff control over their tickets: claim, transfer, close, and more.</p>
        </div>
      </div>

      <button className="invite-back" onClick={() => navigate('/')}>
        Return to Dashboard
      </button>
    </div>
  );
}
