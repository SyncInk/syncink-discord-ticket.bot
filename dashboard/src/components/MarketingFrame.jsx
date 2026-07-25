import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import '../pages/MarketingPages.css';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const NAV_ITEMS = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'features', label: 'Features', to: '/features' },
  { key: 'commands', label: 'Commands', to: '/commands' },
  { key: 'guide', label: 'Guide', to: '/guide' },
  { key: 'reviews', label: 'Reviews', to: '/reviews' }
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

export default function MarketingFrame({ active, eyebrow, title, description, actions = [], children }) {
  return (
    <div className="mk-shell">
      <div className="mk-orbs" aria-hidden="true">
        <div className="mk-orb mk-orb-a" />
        <div className="mk-orb mk-orb-b" />
        <div className="mk-orb mk-orb-c" />
      </div>

      <div className="mk-content">
        <header className="mk-topbar">
          <Link to="/" className="mk-brand">
            <img src="/ticket-logo.png" alt="SyncInk Ticket" />
            <div>
              <strong>SyncInk Ticket</strong>
              <span>Premium Discord ticket system</span>
            </div>
          </Link>

          <nav className="mk-nav">
            {NAV_ITEMS.map((item) => (
              <Link key={item.key} to={item.to} className={`mk-nav-link ${active === item.key ? 'active' : ''}`}>
                {item.label}
              </Link>
            ))}
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

          <Link to="/login" className="mk-dashboard-link">Dashboard</Link>
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
          {children}
        </div>
      </div>
    </div>
  );
}
