import React, { useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, LayoutDashboard, MessageSquareText, Shield, Ticket, X } from 'lucide-react';
import Seo from '../components/Seo';
import './InviteRedesign.css';

export default function Invite() {
  const navigate = useNavigate();
  const location = useLocation();
  const rootRef = useRef(null);

  const INVITE_URL =
    'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';
  const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

  const seoSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'SyncInk Ticket',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web, Discord',
    url: `${window.location.origin}/`,
    image: `${window.location.origin}/ticket-logo.png`,
    description: 'SyncInk Ticket is a Discord ticket bot with customizable ticket panels, saved transcripts, staff tools, and a premium web dashboard.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    featureList: [
      'Discord ticket panels',
      'Ticket categories and staff routing',
      'Transcript logging',
      'Dashboard insights',
      'Audit logs and activity feed',
      'Instant dashboard updates'
    ]
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      el.style.setProperty('--mx', `${x * 3}px`);
      el.style.setProperty('--my', `${y * 2}px`);
      el.style.setProperty('--orb-mx', `${x * 10}px`);
      el.style.setProperty('--orb-my', `${y * 8}px`);
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <div className="inv" ref={rootRef}>
      <Seo
        title="SyncInk Ticket Bot - Discord Ticket Dashboard, Transcripts & Panels"
        description="SyncInk Ticket is a Discord ticket bot with customizable ticket panels, saved transcripts, ticket transfers, staff tools, and a premium dashboard."
        path="/"
        canonicalPath="/"
        keywords="SyncInk Ticket Bot, Discord ticket bot, Discord ticket dashboard, ticket transcripts, support ticket system, Discord support bot"
        schema={seoSchema}
      />

      <div className="inv-orbs">
        <div className="inv-orb inv-orb-1" />
        <div className="inv-orb inv-orb-2" />
        <div className="inv-orb inv-orb-3" />
      </div>

      <div className="inv-content">
        <div className="inv-logos inv-entrance" style={{ '--d': '0ms' }}>
          <img src="/syncink-main-logo.png" alt="SyncInk" className="inv-logo-img inv-logo-main" loading="lazy" />
          <div className="inv-logo-x"><X size={18} /></div>
          <img src="/ticket-logo.png" alt="SyncInk Ticket" className="inv-logo-img inv-logo-ticket" loading="lazy" />
        </div>

        <div className="inv-entrance" style={{ '--d': '120ms' }}>
          <h1 className="inv-title">
            <span className="inv-title-inner">
              Add <span className="inv-hl">SyncInk Ticket</span>
              <br />
              to your server
            </span>
          </h1>
        </div>

        <p className="inv-sub inv-entrance" style={{ '--d': '220ms' }}>
          SyncInk Ticket is a Discord ticket bot built for modern communities that need fast support,
          clean ticket panels, reliable transcripts, staff routing, clear activity tracking, and a premium dashboard experience.
        </p>

        <div className="inv-entrance inv-cta-group" style={{ '--d': '320ms' }}>
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
          <button type="button" className="inv-secondary-cta" onClick={() => navigate('/login')}>
            Open Dashboard
          </button>
        </div>

        <div className="inv-cards">
          <div className="inv-card inv-entrance" style={{ '--d': '400ms' }}>
            <div className="inv-card-content">
              <div className="inv-card-icon"><Ticket size={20} /></div>
              <h3>Ticket Management</h3>
              <p>Create organized support flows with flexible ticket panels, categories, staff roles, and smooth Discord actions.</p>
            </div>
          </div>
          <div className="inv-card inv-entrance" style={{ '--d': '490ms' }}>
            <div className="inv-card-content">
              <div className="inv-card-icon"><LayoutDashboard size={20} /></div>
              <h3>Web Dashboard</h3>
              <p>Manage embeds, channels, transcripts, logs, access, and interface preferences from a polished dashboard.</p>
            </div>
          </div>
          <div className="inv-card inv-entrance" style={{ '--d': '580ms' }}>
            <div className="inv-card-content">
              <div className="inv-card-icon"><Shield size={20} /></div>
              <h3>Full Control</h3>
              <p>Give your team the tools they need with claims, transfers, saved conversations, activity history, and safe configuration controls.</p>
            </div>
          </div>
        </div>

        <section className="inv-copy-card inv-entrance" style={{ '--d': '650ms' }}>
          <h2>Advanced Discord ticket bot for support teams</h2>
          <p>
            SyncInk Ticket helps Discord servers manage support tickets professionally with customizable ticket embeds,
            category-based routing, saved transcripts, activity tracking, admin history, and instant updates across the dashboard.
          </p>
          <p>
            Server owners and administrators can control panel appearance, embed text, colors, channel destinations,
            transcript logs, inactivity reminders, and dashboard preferences without changing the bot&apos;s core ticket workflow.
          </p>
        </section>

        <nav className="inv-link-grid inv-entrance" aria-label="Primary website links" style={{ '--d': '740ms' }}>
          <Link to="/guide" className="inv-link-card">
            <BookOpen size={18} />
            <span>Documentation Guide</span>
          </Link>
          <Link to="/faq" className="inv-link-card">
            <MessageSquareText size={18} />
            <span>Frequently Asked Questions</span>
          </Link>
          <Link to="/reviews" className="inv-link-card">
            <LayoutDashboard size={18} />
            <span>User Reviews</span>
          </Link>
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="inv-link-card">
            <Shield size={18} />
            <span>Support Server</span>
          </a>
        </nav>

        <button
          className="inv-back inv-entrance"
          style={{ '--d': '820ms' }}
          onClick={() => navigate(location.pathname === '/' ? '/login' : '/')}
        >
          {location.pathname === '/' ? 'Open dashboard login' : 'Return to home'}
        </button>
      </div>
    </div>
  );
}

