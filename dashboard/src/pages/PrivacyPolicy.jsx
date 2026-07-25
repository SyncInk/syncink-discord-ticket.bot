import React from 'react';
import Seo from '../components/Seo';
import MarketingFrame from '../components/MarketingFrame';

const SUPPORT_URL = 'https://discord.gg/rB6gNZaK9u';

const privacySections = [
  {
    title: 'Information We Collect',
    body: [
      'We collect the details needed to sign you in, recognize your servers, and help your team manage tickets smoothly.',
      'This can include Discord profile details, server information, ticket content, and saved conversation records when tickets are closed.'
    ]
  },
  {
    title: 'How Your Information Is Used',
    body: [
      'Your information is used to run the support experience, keep dashboard access secure, and deliver the records your team expects.',
      'This includes ticket creation, staff actions, saved transcripts, dashboard sign-in, and support-related improvements.'
    ]
  },
  {
    title: 'Storage and Security',
    body: [
      'We take reasonable steps to keep your information secure and available only to the people who should have access to it.',
      'Saved transcripts and ticket records are intended for authorized staff and approved dashboard users only.'
    ]
  },
  {
    title: 'Data Removal',
    body: [
      'If you remove the bot from your server or contact support, your server data can be scheduled for removal.',
      'Depending on the request, ticket records and saved settings may no longer be available after deletion is completed.'
    ]
  }
];

export default function PrivacyPolicy({ user }) {
  const dashboardPath = user ? '/' : '/login';

  return (
    <>
      <Seo
        title="Privacy Policy | SyncInk Ticket"
        description="Read the SyncInk Ticket privacy policy covering account details, transcripts, ticket logs, and dashboard sign-in."
        path="/privacy"
      />

      <MarketingFrame
        active="privacy"
        user={user}
        eyebrow="Privacy"
        title="Privacy information for SyncInk Ticket"
        description="This page explains what information is used to provide the ticket experience, how it supports your server, and how to reach us if you need help."
        actions={[
          { label: 'Open Dashboard', to: dashboardPath, tone: 'primary' },
          { label: 'Support Server', href: SUPPORT_URL, external: true, tone: 'secondary' }
        ]}
      >
        <section className="mk-panel">
          <div className="mk-legal-copy">
            <p className="mk-legal-updated">Last updated: July 25, 2026</p>
            {privacySections.map((section, index) => (
              <div key={section.title} className="mk-legal-section">
                <h2>{index + 1}. {section.title}</h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ))}

            <div className="mk-support-cta">
              <h3>Need help with a privacy question?</h3>
              <p>Join the support server if you want clarification about your account, records, or your server setup.</p>
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
