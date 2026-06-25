import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '../components/Common';

export default function Guide() {
  const navigate = useNavigate();

  return (
    <div className="page-stack guide-page">
      <div className="guide-header-nav">
        <button type="button" onClick={() => navigate('/')}>← Back to Dashboard</button>
      </div>

      <PageHeader
        eyebrow="Documentation"
        title="Dashboard Guide"
        description="Learn how to configure and use the SyncInk Ticket bot to manage your server's support system."
      />

      <div className="split-grid">
        <SectionCard title="1. Initial Setup" description="Getting started with the bot.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Invite the bot</strong>
              <p>Add SyncInk Ticket to your server using the Invite Bot link in the top navigation. Ensure it has the Administrator permission.</p>
            </div>
            <div className="guide-step">
              <strong>Access the Dashboard</strong>
              <p>Log in to this dashboard with your Discord account. You must be the Server Owner or have the Administrator permission to view your server.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="2. Configuring Tickets" description="Customizing your ticket system.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Create Categories</strong>
              <p>Navigate to "Ticket Categories" to define what types of tickets users can open (e.g., General Support, Billing, Bug Reports).</p>
            </div>
            <div className="guide-step">
              <strong>Set up Panels</strong>
              <p>Go to "Ticket Panels", select a channel, and click Deploy. A beautiful embed with buttons for each category will be sent to that channel.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="3. Access & Permissions" description="Securing your system.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Dashboard Access</strong>
              <p>Use the Dashboard Access page to assign access tiers (Developer, Admin, Moderator, Staff) to your Discord roles. This controls who can see which dashboard pages.</p>
            </div>
            <div className="guide-step">
              <strong>Ticket Permissions</strong>
              <p>Staff members will automatically be given access to ticket channels so they can assist users. You can transfer tickets between staff or escalate them.</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="4. Logging & Archives" description="Keeping records.">
          <div className="guide-steps">
            <div className="guide-step">
              <strong>Ticket Logs</strong>
              <p>Configure a log channel in "Miscellaneous" to receive notifications whenever a ticket is opened or closed.</p>
            </div>
            <div className="guide-step">
              <strong>Transcripts</strong>
              <p>When a ticket is closed, an HTML transcript is generated. Set a specific Transcript Channel to store these securely for future reference.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Need Help?" description="Can't find what you're looking for?">
        <p style={{ marginTop: '10px' }}>
          If you encounter bugs, need help with configuration, or want to suggest new features, our support team is ready to help.
        </p>
        <a 
          href="https://syncink.github.io/syncink-portfolio/#contact" 
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
