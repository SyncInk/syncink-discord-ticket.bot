import React from 'react';
import { BookOpenCheck, ShieldCheck } from 'lucide-react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';
const INVITE_URL = 'https://discord.com/oauth2/authorize?client_id=1513075101992747158&permissions=361046068240&integration_type=0&scope=bot+applications.commands';

const guideSteps = [
  {
    title: 'Getting Started',
    description: 'Connect the bot, sign in securely, and open the dashboard with the right permissions.',
    items: [
      'Invite SyncInk Ticket to your server and give it the access it needs to create and manage tickets properly.',
      'Sign in with Discord securely. Only the server owner and administrators can manage the dashboard.'
    ]
  },
  {
    title: 'Configure Ticket Entry',
    description: 'Shape the first thing members see when they need help.',
    items: [
      'Use Ticket Categories to rename options, update descriptions, set emojis, and map staff-facing roles.',
      'Use Ticket Panels to style the embed, pick the destination channel, and deploy the live panel instantly.'
    ]
  },
  {
    title: 'Manage Access and Safety',
    description: 'Keep dashboard control in the right hands.',
    items: [
      'Review dashboard access regularly and keep sensitive actions limited to trusted roles.',
      'Use the dashboard as a visual configuration layer while keeping the existing ticket workflow unchanged.'
    ]
  },
  {
    title: 'Logs, Transcripts, and Monitoring',
    description: 'Stay informed as tickets move through your server.',
    items: [
      'Choose the right channels for logs and transcripts so your staff always know where records will appear.',
      'Use Analytics, Activity Feed, and Audit Logs to keep visibility high without digging through Discord manually.'
    ]
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
        eyebrow="Guide"
        title="Set up SyncInk Ticket with clarity and confidence"
        description="This guide walks through the main setup areas so your ticket experience looks polished, stays organized, and remains easy for staff to manage."
        actions={[
          { label: 'Open Dashboard', to: dashboardPath, tone: 'primary' },
          { label: 'Invite Bot', href: INVITE_URL, external: true, tone: 'secondary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-grid mk-grid-2">
          {guideSteps.map((step, index) => (
            <article key={step.title} className="mk-panel">
              <div className="mk-panel-header">
                <div>
                  <span className="mk-panel-label">Step {index + 1}</span>
                  <h2>{step.title}</h2>
                  <p>{step.description}</p>
                </div>
                <div className="mk-card-icon"><BookOpenCheck size={22} /></div>
              </div>
              <div className="mk-step-list">
                {step.items.map((item) => (
                  <div key={item} className="mk-step-item">{item}</div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mk-panel">
          <div className="mk-panel-header">
            <div>
              <span className="mk-panel-label">Need a hand?</span>
              <h2>Reach out if you want help refining your setup</h2>
              <p>Whether you need a cleaner ticket flow or just want a second opinion, the support server is the fastest place to ask.</p>
            </div>
            <div className="mk-card-icon"><ShieldCheck size={22} /></div>
          </div>
          <div className="mk-actions-row mk-actions-row-left">
            <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="mk-action mk-action-primary">
              Contact Support
            </a>
          </div>
        </section>
      </MarketingFrame>
    </>
  );
}
