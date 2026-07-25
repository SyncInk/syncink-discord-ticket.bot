import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '../components/Common';
import Seo from '../components/Seo';

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="page-stack guide-page">
      <Seo
        title="Guide | SyncInk Ticket Bot Setup & Dashboard Documentation"
        description="Learn how to configure SyncInk Ticket panels, categories, logs, transcripts, and dashboard access without changing the bot's existing flow."
        path="/guide"
        keywords="SyncInk Ticket guide, Discord ticket bot setup, ticket dashboard documentation, ticket panels, transcripts"
      />

      <div className="guide-header-nav">
        <button type="button" onClick={() => navigate('/')}>Back to Dashboard</button>
      </div>

      <PageHeader
        eyebrow="Documentation"
        title="Dashboard Guide"
        description="Learn how to configure SyncInk Ticket professionally while keeping the existing bot workflow exactly as it is."
      />

      <div className="split-grid">
        <SectionCard title="1. Getting Started" description="Connect the bot and open the dashboard.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Invite the bot</strong>
              <p>Add SyncInk Ticket to your server from the Invite Bot page and make sure it has the access it needs to run correctly.</p>
            </div>
            <div className="guide-step">
              <strong>Sign in securely</strong>
              <p>Log in with Discord securely. Only the server owner and users with administrator access can enter the dashboard.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="2. Configure Ticket Entry" description="Shape the way users open tickets.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Customize categories</strong>
              <p>Use Ticket Categories to rename options, update descriptions, assign emojis, and map staff-facing roles where needed.</p>
            </div>
            <div className="guide-step">
              <strong>Deploy the panel</strong>
              <p>Use Ticket Panels to style the embed, select a destination channel, and deploy the live panel instantly.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="3. Manage Access and Safety" description="Keep control in the right hands.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Dashboard access</strong>
              <p>Review which roles are allowed to manage the dashboard and keep high-trust actions limited to the right people.</p>
            </div>
            <div className="guide-step">
              <strong>Safe configuration only</strong>
              <p>The dashboard is designed as a configuration layer. It should improve management and visibility without replacing core bot systems.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="4. Logs, Transcripts, and Monitoring" description="Stay informed as tickets move.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Ticket logs</strong>
              <p>Choose a log channel to receive ticket events immediately after they happen in Discord.</p>
            </div>
            <div className="guide-step">
              <strong>Transcripts and analytics</strong>
              <p>Use the Transcripts, Analytics, Activity Feed, and Audit Logs pages to monitor the support system with confidence.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Need Help?" description="Our support team is available if you run into issues or need guidance.">
        <p style={{ marginTop: 10 }}>
          If something looks off or you want help refining your setup, reach out and we will help you sort it out quickly.
        </p>
        <a
          href="https://discord.gg/rB6gNZaK9u"
          target="_blank"
          rel="noopener noreferrer"
          className="guide-support-btn"
        >
          Contact Support
        </a>
      </SectionCard>
    </div>
  );
}

