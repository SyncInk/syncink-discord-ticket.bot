import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Command, LayoutDashboard, MessageSquareText, Shield, Sparkles, Ticket, WandSparkles } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const INVITE_URL =
  'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';
const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const spotlightCards = [
  {
    icon: Ticket,
    title: 'Ticket Management',
    copy: 'Create organized support flows with flexible ticket panels, categories, staff roles, and smooth Discord actions.'
  },
  {
    icon: LayoutDashboard,
    title: 'Web Dashboard',
    copy: 'Manage embeds, channels, transcripts, logs, access, and interface preferences from one premium control center.'
  },
  {
    icon: Shield,
    title: 'Full Control',
    copy: 'Give your team claims, transfers, activity visibility, and safe configuration tools without changing the bot workflow.'
  }
];

const resourceLinks = [
  { to: '/features', icon: Sparkles, label: 'Features' },
  { to: '/commands', icon: Command, label: 'Commands' },
  { to: '/guide', icon: BookOpen, label: 'Guide' },
  { to: '/faq', icon: MessageSquareText, label: 'FAQ' },
  { to: '/reviews', icon: LayoutDashboard, label: 'Reviews' }
];

export default function Invite({ user }) {
  const dashboardPath = user ? '/' : '/login';

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
      'Saved ticket transcripts',
      'Dashboard insights',
      'Audit logs and activity feed',
      'Instant dashboard updates'
    ]
  };

  return (
    <>
      <Seo
        title="SyncInk Ticket Bot - Discord Ticket Dashboard, Transcripts & Panels"
        description="SyncInk Ticket is a Discord ticket bot with customizable ticket panels, saved transcripts, ticket transfers, staff tools, and a premium dashboard."
        path="/"
        canonicalPath="/"
        keywords="SyncInk Ticket Bot, Discord ticket bot, Discord ticket dashboard, ticket transcripts, support ticket system, Discord support bot"
        schema={seoSchema}
      />

      <MarketingFrame
        active="home"
        user={user}
        eyebrow="Premium Discord Ticket System"
        title="Support that feels polished from the first click to the final transcript"
        description="SyncInk Ticket is built for communities that want clean ticket panels, reliable staff handling, polished account access, and a dashboard that feels like a premium product."
        actions={[
          { label: 'Invite to Discord', href: INVITE_URL, external: true, tone: 'primary' },
          { label: user ? 'Open Dashboard' : 'Dashboard Login', to: dashboardPath, tone: 'secondary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-panel mk-home-hero-panel">
          <div className="mk-home-brand-row">
            <div className="mk-home-logo-pair" aria-hidden="true">
              <img src="/syncink-main-logo.png" alt="" className="mk-home-logo mk-home-logo-main" />
              <span className="mk-home-logo-separator">×</span>
              <img src="/ticket-logo.png" alt="" className="mk-home-logo mk-home-logo-ticket" />
            </div>
            <div className="mk-home-intro">
              <span className="mk-panel-label">Built for modern support teams</span>
              <h2>A refined ticket experience for servers that care about presentation</h2>
              <p>
                Keep ticket setup clean, guide members into the right category, help staff respond faster,
                and keep a dependable record of every important conversation.
              </p>
            </div>
          </div>
        </section>

        <section className="mk-grid mk-grid-3">
          {spotlightCards.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="mk-card">
                <div className="mk-card-icon"><Icon size={22} /></div>
                <h3>{card.title}</h3>
                <p>{card.copy}</p>
              </article>
            );
          })}
        </section>

        <section className="mk-grid mk-grid-2">
          <article className="mk-panel">
            <div className="mk-panel-header">
              <div>
                <span className="mk-panel-label">Why communities choose it</span>
                <h2>Premium visuals with practical tools</h2>
                <p>Everything is designed to help your support flow look more organized and feel easier to manage.</p>
              </div>
              <div className="mk-card-icon"><WandSparkles size={22} /></div>
            </div>
            <div className="mk-pill-grid">
              <span className="mk-pill">Custom panel text</span>
              <span className="mk-pill">Category descriptions</span>
              <span className="mk-pill">Emoji styling</span>
              <span className="mk-pill">Staff routing</span>
              <span className="mk-pill">Transcript delivery</span>
              <span className="mk-pill">Activity visibility</span>
            </div>
          </article>

          <article className="mk-panel">
            <div className="mk-panel-header">
              <div>
                <span className="mk-panel-label">Safe management</span>
                <h2>Configuration control without touching the bot workflow</h2>
                <p>
                  Owners and administrators can shape the presentation and settings while keeping ticket behavior,
                  staff actions, and support flow exactly as intended.
                </p>
              </div>
            </div>
          </article>
        </section>

        <nav className="mk-link-grid" aria-label="Primary website links">
          {resourceLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.to} className="mk-link-card">
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="mk-link-card">
            <Shield size={18} />
            <span>Support Server</span>
          </a>
        </nav>
      </MarketingFrame>
    </>
  );
}
