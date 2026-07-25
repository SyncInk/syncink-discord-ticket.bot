import React from 'react';
import { Activity, ArrowRightLeft, FileText, PanelsTopLeft, ScrollText, ShieldCheck, Ticket } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';
const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const featureCards = [
  {
    icon: PanelsTopLeft,
    title: 'Custom ticket panels',
    copy: 'Create polished ticket entry panels with your own colors, text, and category choices so members know exactly where to go.'
  },
  {
    icon: Ticket,
    title: 'Category-based support routing',
    copy: 'Guide members into the right support path with labeled categories, role assignment, and clear ticket organization.'
  },
  {
    icon: ArrowRightLeft,
    title: 'Staff-friendly ticket actions',
    copy: 'Support teams can handle tickets faster with built-in actions for claiming, transferring, and keeping conversations moving.'
  },
  {
    icon: FileText,
    title: 'Saved transcripts',
    copy: 'Keep a reliable record of closed tickets so important conversations are easy to revisit whenever your team needs them.'
  },
  {
    icon: Activity,
    title: 'Live activity visibility',
    copy: 'Stay on top of what is happening with recent ticket movement, response trends, and team activity at a glance.'
  },
  {
    icon: ScrollText,
    title: 'Clear history and logs',
    copy: 'Track setup changes and ticket events in one place so your team always has context for what changed and when.'
  }
];

export default function Features({ user }) {
  const dashboardPath = user ? '/' : '/login';

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
        eyebrow="Product Overview"
        title="Powerful features for clean, fast Discord support"
        description="SyncInk Ticket combines clean design with practical support tools so your community can manage tickets smoothly from the first click to the final transcript."
        actions={[
          { label: 'Invite Bot', href: INVITE_URL, external: true, tone: 'primary' },
          { label: 'Open Dashboard', to: dashboardPath, tone: 'secondary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-grid mk-grid-3">
          {featureCards.map((card) => {
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

        <section className="mk-panel">
          <div className="mk-panel-header">
            <div>
              <span className="mk-panel-label">What you can customize</span>
              <h2>Control the look, flow, and staff experience</h2>
              <p>Everything important is easy to manage from the dashboard without changing the bot&apos;s core workflow.</p>
            </div>
            <div className="mk-card-icon"><ShieldCheck size={22} /></div>
          </div>
          <div className="mk-pill-grid">
            <span className="mk-pill">Panel text and colors</span>
            <span className="mk-pill">Ticket category labels</span>
            <span className="mk-pill">Staff role assignment</span>
            <span className="mk-pill">Ticket log channels</span>
            <span className="mk-pill">Transcript channels</span>
            <span className="mk-pill">Inactivity reminders</span>
            <span className="mk-pill">Interface preferences</span>
            <span className="mk-pill">Bot profile details</span>
          </div>
        </section>

        <section className="mk-meta-grid">
          <div className="mk-meta-item">
            <strong>For communities</strong>
            <span>Give members a clean ticket experience that feels easy, professional, and organized from the start.</span>
          </div>
          <div className="mk-meta-item">
            <strong>For staff teams</strong>
            <span>Keep support moving with better visibility, faster actions, and clear ownership across active tickets.</span>
          </div>
          <div className="mk-meta-item">
            <strong>For server leaders</strong>
            <span>See how your support flow is performing and keep important settings tidy in one powerful dashboard.</span>
          </div>
        </section>
      </MarketingFrame>
    </>
  );
}
