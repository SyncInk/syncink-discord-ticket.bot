import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, SectionCard } from '../components/Common';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-shell" style={{ display: 'block', height: '100vh', overflowY: 'auto' }}>
      <main className="main-shell" style={{ margin: '0 auto', maxWidth: '900px', padding: '40px 20px' }}>
        <div className="content-shell page-stack">
          <button type="button" className="action-button tone-secondary" onClick={() => navigate(-1)} style={{ width: 'fit-content' }}>
            ← Go Back
          </button>
          
          <PageHeader 
            title="Terms of Service" 
            description="Last updated: June 2026" 
          />

          <SectionCard>
            <div className="legal-document">
              <h2>1. Acceptance of Terms</h2>
              <p>By inviting our bot to your Discord server and using the dashboard, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our service.</p>

              <h2>2. Use of Service</h2>
              <p>You agree to use the bot and dashboard only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the service.</p>
              <ul>
                <li>You must not use the service to harass, abuse, or harm another person.</li>
                <li>You must not attempt to gain unauthorized access to our dashboard or database.</li>
                <li>You must comply with Discord's Terms of Service and Community Guidelines.</li>
              </ul>

              <h2>3. Service Availability</h2>
              <p>We strive to ensure 99.9% uptime, but we do not guarantee that the service will always be available or be uninterrupted. We reserve the right to suspend or withdraw the service at any time without notice.</p>

              <h2>4. Termination</h2>
              <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

              <h2>5. Changes to Terms</h2>
              <p>We reserve the right to modify or replace these Terms at any time. We will notify users of any significant changes via our Support Server or Dashboard announcements.</p>
            </div>
          </SectionCard>
        </div>
      </main>
    </div>
  );
}
