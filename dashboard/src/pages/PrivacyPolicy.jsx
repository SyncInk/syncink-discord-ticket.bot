import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '../components/Common';
import { Shield } from 'lucide-react';
import Seo from '../components/Seo';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-shell" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <Seo
        title="Privacy Policy | SyncInk Ticket"
        description="Read the SyncInk Ticket privacy policy covering Discord profile data, transcripts, ticket logs, and dashboard authentication."
        path="/privacy"
      />
      <main className="main-shell" style={{ margin: '0 auto', maxWidth: '900px', padding: '40px 20px' }}>
        <div className="content-shell page-stack">
          <button type="button" className="action-button tone-secondary" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
            Go Back
          </button>

          <PageHeader
            title="Privacy Policy"
            description="Last updated: June 2026"
            icon={Shield}
          />

          <SectionCard>
            <div className="legal-document">
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us when you use our bot and dashboard. This includes:</p>
              <ul>
                <li><strong>Discord Profile Information:</strong> Your Discord user ID and username to authenticate your session.</li>
                <li><strong>Server Information:</strong> Your Discord server ID, roles, and channel layouts to provide ticketing features.</li>
                <li><strong>Ticket Data and Transcripts:</strong> Messages sent within ticket threads, including text and attachment URLs, to generate ticket transcripts for your server logs.</li>
              </ul>

              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to operate, maintain, and improve our services, including:</p>
              <ul>
                <li>Creating and managing support tickets on your Discord server.</li>
                <li>Generating permanent transcripts of closed tickets for moderation and review.</li>
                <li>Authenticating your access to the web dashboard.</li>
              </ul>

              <h2>3. Data Storage and Security</h2>
              <p>Your data is securely stored in our database. We do not sell your personal information. Transcripts are stored securely and are only accessible by authorized server staff through the dashboard or designated Discord log channels.</p>

              <h2>4. Data Deletion</h2>
              <p>You can request the deletion of your server&apos;s data at any time by removing the bot from your server or contacting our support team. Upon removal, ticket logs and configurations may be permanently deleted.</p>

              <h2>5. Contact Us</h2>
              <p>If you have any questions about this privacy policy, please contact us via our support server.</p>

              <div className="support-embed">
                <h3>SyncInk Support Hub</h3>
                <p>Join our official Discord server for fast support, updates, and community.</p>
                <a href="https://discord.gg/rB6gNZaK9u" target="_blank" rel="noopener noreferrer" className="action-button tone-primary">
                  Join Support Server
                </a>
              </div>

              <h2>6. Intellectual Property and Copyright</h2>
              <p>The design, name, branding, and source code of SyncInk are strictly protected by international copyright law. Any unauthorized copying, cloning, reproduction, or distribution of our layout, assets, or identity is strictly prohibited and will be met with immediate legal action.</p>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
