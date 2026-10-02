import React from 'react';
import { BookOpenCheck, ShieldCheck, CheckCircle2, Lightbulb, Terminal, ArrowRight, ExternalLink } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';
const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';

const guideSteps = [
  {
    step: '01',
    badge: 'Step 1: Onboarding',
    title: 'Invite the Bot & Authenticate',
    description: 'Connect the bot to your Discord server and access the web dashboard with administrator permissions.',
    commandSnippet: '/ticket-panel',
    items: [
      'Invite SyncInk Ticket with the Administrator permission flag to ensure it can create private channels and manage role overwrites.',
      'Navigate to the SyncInk web dashboard and click "Login with Discord" to sign in with your Discord account.',
      'Select your target server from the workspace dropdown. The bot automatically recognizes servers where you have Manage Server or Administrator rights.'
    ],
    proTip: 'Ensure the "SyncInk Ticket" bot role is placed higher than your community member roles in Server Settings -> Roles.'
  },
  {
    step: '02',
    badge: 'Step 2: Customization',
    title: 'Configure Categories & Panels',
    description: 'Shape what your members see when seeking assistance and organize where channels open.',
    commandSnippet: '/ticket-config category',
    items: [
      'Open the "Ticket Categories" tab on the dashboard to define support types (e.g. General Support, Billing, Technical Issues, Staff Abuse).',
      'Assign dedicated staff roles for each category so only relevant team members receive pings when a ticket in that category is created.',
      'Head to "Ticket Panels", customize the embed title, instructions, color gradient, and thumbnail, then click "Deploy Ticket Panel" to post it into your support channel.'
    ],
    proTip: 'Use Discord emojis in your category labels (e.g. 💳 Billing, ⚙️ Technical) for higher engagement and clarity.'
  },
  {
    step: '03',
    badge: 'Step 3: Governance',
    title: 'Assign Staff Roles & Permissions',
    description: 'Ensure your support agents have the right permissions to handle tickets without exposing server admin settings.',
    commandSnippet: '/ticket-config role',
    items: [
      'Navigate to "Dashboard Access" to review your server role mappings across Owner, Developer, Admin, Moderator, and Staff tiers.',
      'Staff tier members can claim tickets, transfer conversations, and view activity feeds without accessing sensitive guild settings.',
      'Admins have complete control over panel deployment, bot nickname synchronization, and logging configurations.'
    ],
    proTip: 'Never give full Administrator permission to junior moderators; assign them to the "Staff" or "Moderator" tier instead.'
  },
  {
    step: '04',
    badge: 'Step 4: Monitoring',
    title: 'Transcripts, Logs & Real-Time Analytics',
    description: 'Set up automatic conversation logging and monitor team performance indicators.',
    commandSnippet: '/ticket-logs',
    items: [
      'Select a private text channel for "Ticket Logs" and "Transcripts" under the "Miscellaneous" or "Ticket Logs" tab.',
      'When tickets are closed, SyncInk automatically compiles an encrypted, searchable HTML transcript and uploads it securely to cloud storage.',
      'Monitor the "Analytics" tab to inspect average response times, busiest support days, and staff activity volume rankings.'
    ],
    proTip: 'You can view online transcripts anytime directly from your dashboard under the "Transcripts" tab with instant search.'
  }
];

export default function Guide({ user }) {
  const dashboardPath = user ? '/' : '/login';

  return (
    <>
      <Seo
        title="Guide | SyncInk Ticket Bot Setup & Dashboard Documentation"
        description="Learn how to configure SyncInk Ticket panels, categories, logs, transcripts, and dashboard access without changing the bot's existing flow."
        path="/guide"
        keywords="SyncInk Ticket guide, Discord ticket bot setup, ticket dashboard documentation, ticket panels, transcripts"
      />

      <MarketingFrame
        active="guide"
        user={user}
        eyebrow="Setup Guide"
        title="Configure SyncInk Ticket in minutes"
        description="A clear walkthrough to help you connect the bot, customize ticket entry panels, configure staff workflows, and monitor server support."
        actions={[
          { label: 'Open Dashboard', to: dashboardPath, tone: 'primary' },
          { label: 'Invite Bot', href: INVITE_URL, external: true, tone: 'secondary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-grid mk-grid-2">
          {guideSteps.map((step) => (
            <article key={step.title} className="mk-panel" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="mk-panel-header" style={{ marginBottom: 14 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span className="mk-step-badge">{step.step}</span>
                    <span className="mk-command-badge">{step.badge}</span>
                  </div>
                  <h2 style={{ fontSize: 18, color: '#fff', margin: '4px 0 6px' }}>{step.title}</h2>
                  <p style={{ fontSize: 13, color: 'var(--text-soft)' }}>{step.description}</p>
                </div>
              </div>

              <div className="mk-step-list" style={{ flexGrow: 1, gap: 10 }}>
                {step.items.map((item, idx) => (
                  <div key={idx} className="mk-step-item" style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '12px 14px', fontSize: 12.5, lineHeight: 1.6 }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Pro Tip Callout */}
              <div style={{
                marginTop: 14,
                padding: '12px 14px',
                borderRadius: 14,
                background: 'rgba(139, 76, 255, 0.08)',
                border: '1px solid rgba(139, 76, 255, 0.2)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10
              }}>
                <Lightbulb size={16} style={{ color: '#ffd166', flexShrink: 0, marginTop: 1 }} />
                <div style={{ fontSize: 12, color: 'rgba(255, 255, 255, 0.85)' }}>
                  <strong style={{ color: '#ffd166' }}>Pro Tip: </strong>
                  {step.proTip}
                </div>
              </div>
            </article>
          ))}
        </section>

        {/* Assistance Card */}
        <section className="mk-panel" style={{ marginTop: 24 }}>
          <div className="mk-panel-header">
            <div>
              <span className="mk-panel-label">Dedicated Support</span>
              <h2>Need Help With Complex Permissions or Customization?</h2>
              <p>Our support team and developer community are ready to assist you in getting your server configured smoothly.</p>
            </div>
            <div className="mk-card-icon"><ShieldCheck size={22} /></div>
          </div>
          <div className="mk-actions-row mk-actions-row-left" style={{ marginTop: 16 }}>
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="mk-action mk-action-primary">
              Join Discord Support Server
            </a>
            <a href={INVITE_URL} target="_blank" rel="noopener noreferrer" className="mk-action mk-action-secondary">
              Invite Bot to Server
            </a>
          </div>
        </section>
      </MarketingFrame>
    </>
  );
}
