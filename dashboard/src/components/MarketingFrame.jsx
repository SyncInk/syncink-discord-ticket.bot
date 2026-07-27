import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ExternalLink, ChevronDown, Shield, FileText, Menu, X } from 'lucide-react';
import '../pages/MarketingPages.css';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'features', label: 'Features', to: '/features' },
  { key: 'commands', label: 'Commands', to: '/commands' },
  { key: 'guide', label: 'Guide', to: '/guide' },
  { key: 'reviews', label: 'Reviews', to: '/reviews' },
  { key: 'faq', label: 'FAQ', to: '/faq' },
  { key: 'status', label: 'Status', to: '/status' }
];

function ActionButton({ action }) {
  const className = `mk-action mk-action-${action.tone || 'secondary'}`;

  if (action.href) {
    return (
      <a
        href={action.href}
        target={action.external ? '_blank' : undefined}
        rel={action.external ? 'noopener noreferrer' : undefined}
        className={className}
      >
        {action.label}
      </a>
    );
  }

  return (
    <Link to={action.to} className={className}>
      {action.label}
    </Link>
  );
}

function getAvatarUrl(user) {
  if (!user?.id || !user?.avatar) {
    return null;
  }

  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

function AccountChip({ user }) {
  const avatarUrl = getAvatarUrl(user);
  const primaryName = user?.global_name || user?.username || 'Dashboard User';
  const handle = user?.username ? `@${user.username}` : 'Signed in';

  return (
    <Link to="/" className="mk-account-chip" aria-label="Open dashboard">
      {avatarUrl ? (
        <img src={avatarUrl} alt={primaryName} className="mk-account-avatar" />
      ) : (
        <div className="mk-account-avatar mk-account-fallback">
          {(primaryName || 'U').charAt(0).toUpperCase()}
        </div>
      )}
      <div className="mk-account-copy">
        <strong>{primaryName}</strong>
        <span>{handle}</span>
      </div>
    </Link>
  );
}

export default function MarketingFrame({
  active = 'home',
  user = null,
  eyebrow,
  title,
  description,
  actions = [],
  children
}) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardPath = user ? (user.selectedGuildId ? `/dashboard/${user.selectedGuildId}` : '/servers') : '/api/auth/discord';

  return (
    <div className="mk-shell">
      <div className="mk-orbs" aria-hidden="true">
        <div className="mk-orb mk-orb-a" />
        <div className="mk-orb mk-orb-b" />
        <div className="mk-orb mk-orb-c" />
      </div>

      <div className="mk-content">
        <header className={`mk-topbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="mk-topbar-header-mobile">
            <Link to="/" className="mk-brand">
              <img src="/ticket-logo.png" alt="SyncInk Ticket" />
              <div>
                <strong>SyncInk Ticket</strong>
                <span>Discord ticket system</span>
              </div>
            </Link>
            <button className="mk-mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <nav className="mk-nav">
            {NAV_ITEMS.map((item) => (
              <Link key={item.key} to={item.to} className={`mk-nav-link ${active === item.key ? 'active' : ''}`}>
                {item.label}
              </Link>
            ))}
            <div className="topbar-dropdown">
              <button type="button" className="topbar-dropdown-btn mk-nav-link" style={{background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit'}}>
                Legal <ChevronDown size={14} style={{marginLeft: 4}} />
              </button>
              <div className="topbar-dropdown-menu">
                <Link to="/privacy" className="topbar-dropdown-item"><Shield size={16} /> Privacy Policy</Link>
                <Link to="/terms" className="topbar-dropdown-item"><FileText size={16} /> Terms of Service</Link>
              </div>
            </div>
            <a
              href={SUPPORT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`mk-nav-link ${active === 'support' ? 'active' : ''}`}
            >
              Support
              <ExternalLink size={14} />
            </a>
          </nav>
        </header>

        <section className="mk-hero">
          <span className="mk-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          {actions.length > 0 && (
            <div className="mk-actions-row">
              {actions.map((action) => (
                <ActionButton key={action.label} action={action} />
              ))}
            </div>
          )}
        </section>

          <div className="mk-body">
            <div key={location.pathname} className="page-transition">
              {children}
            </div>
          </div>
      </div>
    </div>
  );
}
