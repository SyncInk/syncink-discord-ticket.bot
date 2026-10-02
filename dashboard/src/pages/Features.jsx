import React, { useState } from 'react';
import { Activity, ArrowRightLeft, FileText, PanelsTopLeft, ScrollText, ShieldCheck, Ticket, Sparkles, Zap, Lock, BarChart3, Sliders, CheckCircle2 } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';
const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const featureCards = [
  {
    icon: PanelsTopLeft,
    badge: 'Customizable',
    tag: 'panels',
    title: 'Custom Ticket Panels',
    copy: 'Create polished ticket entry panels with your custom titles, rich descriptions, brand hex colors, and custom emojis so members always feel at home.'
  },
  {
    icon: Ticket,
    badge: 'Smart Routing',
    tag: 'routing',
    title: 'Category-Based Support Routing',
    copy: 'Direct members into specialized private channels by category, automatically pinging the right staff roles while keeping the channel list uncluttered.'
  },
  {
    icon: ArrowRightLeft,
    badge: 'Productivity',
    tag: 'staff',
    title: 'Staff-Friendly Ticket Actions',
    copy: 'Empower support agents with instant ticket claiming, seamless category transfers, user addition/removal, and one-click closure with inactivity alerts.'
  },
  {
    icon: FileText,
    badge: 'Archival',
    tag: 'security',
    title: 'Saved HTML & Cloud Transcripts',
    copy: 'Automatically generate and archive complete, verifiable transcripts with images and timestamps. View transcripts directly inside the secure web dashboard.'
  },
  {
    icon: Activity,
    badge: 'Live Sync',
    tag: 'analytics',
    title: 'Live Activity & Analytics',
    copy: 'Stay informed with real-time response time metrics, ticket creation volume trends, staff action leaderboards, and live WebSocket dashboard updates.'
  },
  {
    icon: ScrollText,
    badge: 'Audit & Safety',
    tag: 'security',
    title: 'Comprehensive Audit Logs',
    copy: 'Track every configuration change, role assignment update, and moderation action in one tamper-evident log stream with full actor attribution.'
  },
  {
    icon: Zap,
    badge: 'Automation',
    tag: 'routing',
    title: 'Inactivity Reminders & Auto-Close',
    copy: 'Keep ticket channels clean with configurable inactivity warning pings and automatic archival when members stop responding.'
  },
  {
    icon: Lock,
    badge: 'Security',
    tag: 'security',
    title: 'Tier-Based Dashboard Access',
    copy: 'Granular permissions ensure server owners, developers, administrators, and staff only see the controls and ticket data matching their responsibilities.'
  },
  {
    icon: Sliders,
    badge: 'Personalized',
    tag: 'panels',
    title: 'Modern Pure-Black Interface',
    copy: 'A high-performance responsive web dashboard featuring pure-black glass aesthetics, responsive mobile layout, custom theme accents, and zero lag.'
  }
];

const highlights = [
  { label: 'Platform Uptime', value: '99.9%' },
  { label: 'Dispatch Speed', value: '< 250ms' },
  { label: 'Transcripts Saved', value: 'Unlimited' },
  { label: 'Setup Time', value: 'Under 2 Min' }
];

export default function Features({ user }) {
  const [selectedTag, setSelectedTag] = useState('all');
  const dashboardPath = user ? '/' : '/login';

  const filteredFeatures = selectedTag === 'all'
    ? featureCards
    : featureCards.filter((card) => card.tag === selectedTag);

  return (
    <>
      <Seo
        title="Features | SyncInk Ticket Bot"
        description="Explore the main SyncInk Ticket features including ticket panels, saved transcripts, staff actions, and the dashboard experience."
        path="/features"
        keywords="SyncInk Ticket features, Discord ticket bot features, ticket dashboard, ticket transcripts"
      />
      <MarketingFrame
        active="features"
        user={user}
        eyebrow="Product Features"
        title="Engineered for high-volume Discord support"
        description="SyncInk Ticket combines sleek design with practical support architecture so your server community can handle tickets smoothly from first click to final transcript."
        actions={[
          { label: 'Invite Bot', href: INVITE_URL, external: true, tone: 'primary' },
          { label: 'Open Dashboard', to: dashboardPath, tone: 'secondary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        {/* Performance Highlights Bar */}
        <div className="mk-highlights-bar">
          {highlights.map((item) => (
            <div key={item.label} className="mk-highlight-item">
              <strong>{item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="mk-filter-pills">
          <button
            type="button"
            className={`mk-filter-pill ${selectedTag === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTag('all')}
          >
            All Features ({featureCards.length})
          </button>
          <button
            type="button"
            className={`mk-filter-pill ${selectedTag === 'panels' ? 'active' : ''}`}
            onClick={() => setSelectedTag('panels')}
          >
            Panels & Appearance
          </button>
          <button
            type="button"
            className={`mk-filter-pill ${selectedTag === 'routing' ? 'active' : ''}`}
            onClick={() => setSelectedTag('routing')}
          >
            Routing & Automation
          </button>
          <button
            type="button"
            className={`mk-filter-pill ${selectedTag === 'staff' ? 'active' : ''}`}
            onClick={() => setSelectedTag('staff')}
          >
            Staff Workflows
          </button>
          <button
            type="button"
            className={`mk-filter-pill ${selectedTag === 'security' ? 'active' : ''}`}
            onClick={() => setSelectedTag('security')}
          >
            Security & Logs
          </button>
          <button
            type="button"
            className={`mk-filter-pill ${selectedTag === 'analytics' ? 'active' : ''}`}
            onClick={() => setSelectedTag('analytics')}
          >
            Analytics & Reports
          </button>
        </div>

        {/* Feature Cards Grid */}
        <section className="mk-grid mk-grid-3">
          {filteredFeatures.map((card) => {
            const Icon = card.icon;
            return (
              <article key={card.title} className="mk-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div className="mk-card-icon" style={{ marginBottom: 0 }}><Icon size={22} /></div>
                  <span className="mk-command-badge">{card.badge}</span>
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 8, color: '#fff' }}>{card.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-soft)', flexGrow: 1, lineHeight: 1.65 }}>{card.copy}</p>
              </article>
            );
          })}
        </section>

        {/* Interactive Customization Overview */}
        <section className="mk-panel" style={{ marginTop: 24 }}>
          <div className="mk-panel-header">
            <div>
              <span className="mk-panel-label">Everything Configurable</span>
              <h2>Complete Control Over Your Ticket System</h2>
              <p>Everything important is easy to manage from the dashboard without touching code or running complex bot commands.</p>
            </div>
            <div className="mk-card-icon"><ShieldCheck size={22} /></div>
          </div>
          <div className="mk-pill-grid">
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Embed Title, Description & Color</span>
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Dynamic Category Emojis</span>
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Target Category Channels</span>
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Role-Based Staff Assignees</span>
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Transcript Destination Channel</span>
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Ticket Event Log Stream</span>
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Inactivity Timer Warnings</span>
            <span className="mk-pill"><CheckCircle2 size={14} style={{ marginRight: 6, color: '#10b981' }} /> Bot Display Nickname</span>
          </div>
        </section>

        {/* Stakeholder Value Grid */}
        <section className="mk-meta-grid" style={{ marginTop: 24 }}>
          <div className="mk-meta-item">
            <strong style={{ fontSize: 15 }}>For Community Members</strong>
            <span style={{ fontSize: 13 }}>An intuitive, friction-free ticket opening flow with clear category selection and instant Discord staff notifications.</span>
          </div>
          <div className="mk-meta-item">
            <strong style={{ fontSize: 15 }}>For Support Staff</strong>
            <span style={{ fontSize: 13 }}>Claim, transfer, rename, add members, and generate transcripts right from Discord buttons or the web interface.</span>
          </div>
          <div className="mk-meta-item">
            <strong style={{ fontSize: 15 }}>For Server Admins</strong>
            <span style={{ fontSize: 13 }}>Full oversight over ticket volume, agent response speeds, permission governance, and comprehensive audit history.</span>
          </div>
        </section>
      </MarketingFrame>
    </>
  );
}
