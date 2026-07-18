import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Shield, Ticket, X } from 'lucide-react';
import './InviteRedesign.css';

export default function Invite() {
  const navigate = useNavigate();
  const rootRef  = useRef(null);

  const INVITE_URL =
    'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=8&integration_type=0&scope=bot+applications.commands';

  // ── Subtle mouse parallax ───────────────────────────────────────────────
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth  - 0.5) * 2; // -1 → 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty('--mx',     `${x * 3}px`);
      el.style.setProperty('--my',     `${y * 2}px`);
      el.style.setProperty('--orb-mx', `${x * 10}px`);
      el.style.setProperty('--orb-my', `${y * 8}px`);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="inv" ref={rootRef}>

      {/* ── Floating background orbs ──────────────────────────────────────── */}
      <div className="inv-orbs">
        <div className="inv-orb inv-orb-1" />
        <div className="inv-orb inv-orb-2" />
        <div className="inv-orb inv-orb-3" />
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="inv-content">

        {/* Logos */}
        <div className="inv-logos inv-entrance" style={{ '--d': '0ms' }}>
          <img src="/syncink-main-logo.png" alt="SyncInk" className="inv-logo-img inv-logo-main" loading="lazy" />
          <div className="inv-logo-x"><X size={18} /></div>
          <img src="/ticket-logo.png" alt="SyncInk Ticket" className="inv-logo-img inv-logo-ticket" loading="lazy" />
        </div>

        {/* Hero title */}
        <div className="inv-entrance" style={{ '--d': '120ms' }}>
          <h1 className="inv-title">
            <span className="inv-title-inner">
              Add <span className="inv-hl">SyncInk Ticket</span>
              <br />
              to your server
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p className="inv-sub inv-entrance" style={{ '--d': '220ms' }}>
          The ultimate ticket management system.<br />
          Beautiful dashboard, complete control, zero clutter.
        </p>

        {/* CTA */}
        <div className="inv-entrance" style={{ '--d': '320ms' }}>
          <a
            href={INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inv-cta"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.02.02.05.03.08.02c1.71-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z" />
            </svg>
            Invite to Discord
          </a>
        </div>

        {/* Feature cards */}
        <div className="inv-cards">
          <div className="inv-card inv-entrance" style={{ '--d': '400ms' }}>
            <div className="inv-card-content">
              <div className="inv-card-icon"><Ticket size={20} /></div>
              <h3>Ticket Management</h3>
              <p>Automatic temporary ticket channels with customizable categories.</p>
            </div>
          </div>
          <div className="inv-card inv-entrance" style={{ '--d': '490ms' }}>
            <div className="inv-card-content">
              <div className="inv-card-icon"><LayoutDashboard size={20} /></div>
              <h3>Web Dashboard</h3>
              <p>Manage settings, permissions, and features from a sleek web UI.</p>
            </div>
          </div>
          <div className="inv-card inv-entrance" style={{ '--d': '580ms' }}>
            <div className="inv-card-content">
              <div className="inv-card-icon"><Shield size={20} /></div>
              <h3>Full Control</h3>
              <p>Give staff control over their tickets: claim, transfer, close, and more.</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <button className="inv-back inv-entrance" style={{ '--d': '650ms' }} onClick={() => navigate('/')}>
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}
