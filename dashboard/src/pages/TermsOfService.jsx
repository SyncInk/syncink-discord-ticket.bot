import React from 'react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const termsSections = [
  {
    title: 'Acceptance of Terms',
    body: 'By inviting SyncInk Ticket to your server or using the dashboard, you agree to follow these terms while using the service.'
  },
  {
    title: 'Using the Service',
    body: 'You agree to use the bot and dashboard responsibly, avoid misuse, and respect Discord rules as well as the people using your server.'
  },
  {
    title: 'Availability',
    body: 'We aim to keep the service available and dependable, but uptime cannot be guaranteed at every moment.'
  },
  {
    title: 'Termination',
    body: 'Access may be limited or removed if the service is abused, used to harm others, or used in a way that breaks these terms.'
  },
  {
    title: 'Changes to These Terms',
    body: 'We may update these terms over time. Important changes can be shared through the dashboard, support server, or other official notices.'
  },
  {
    title: 'Support and Contact',
    body: 'If you have questions about these terms or need clarification, the support server is the best place to reach us.'
  }
];

export default function TermsOfService({ user }) {
  const dashboardPath = user ? '/' : '/login';

  return (
    <>
      <Seo
        title="Terms of Service | SyncInk Ticket"
        description="Review the SyncInk Ticket terms of service for using the Discord ticket bot and dashboard."
        path="/terms"
      />

      <MarketingFrame
        active="terms"
        user={user}
        eyebrow="Terms"
        title="Terms for using SyncInk Ticket"
        description="These terms explain the basic expectations for using the ticket bot, the dashboard, and the public website responsibly."
        actions={[
          { label: 'Open Dashboard', to: dashboardPath, tone: 'primary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-panel">
          <div className="mk-legal-copy">
            <p className="mk-legal-updated">Last updated: July 25, 2026</p>
            {termsSections.map((section, index) => (
              <div key={section.title} className="mk-legal-section">
                <h2>{index + 1}. {section.title}</h2>
                <p>{section.body}</p>
              </div>
            ))}

            <div className="mk-support-cta">
              <h3>Questions about these terms?</h3>
              <p>Reach out through the support server if you want help understanding how these terms apply to your server.</p>
              <a href={SUPPORT_URL} target="_blank" rel="noopener noreferrer" className="mk-action mk-action-primary">
                Join Support Server
              </a>
            </div>
          </div>
        </section>
      </MarketingFrame>
    </>
  );
}
