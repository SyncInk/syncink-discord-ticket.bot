import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TermsOfService() {
  const navigate = useNavigate();

  return (
    <div className="transcript-page" style={{ padding: '40px', color: '#dcddde', background: '#36393f', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div className="transcript-header">
        <button className="back-link" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#00aff4', cursor: 'pointer', padding: 0, fontSize: '14px' }}>
          ← Back
        </button>
        <h1 style={{ marginTop: '20px' }}>Terms of Service</h1>
        <p>Last updated: June 2026</p>
      </div>

      <div style={{ background: '#2f3136', padding: '24px', borderRadius: '8px', lineHeight: '1.6' }}>
        <h2 style={{ color: '#fff', marginTop: 0 }}>1. Acceptance of Terms</h2>
        <p>By inviting our bot to your Discord server and using the dashboard, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not use our service.</p>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>2. Use of Service</h2>
        <p>You agree to use the bot and dashboard only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use and enjoyment of the service.</p>
        <ul>
          <li>You must not use the service to harass, abuse, or harm another person.</li>
          <li>You must not attempt to gain unauthorized access to our dashboard or database.</li>
          <li>You must comply with Discord's Terms of Service and Community Guidelines.</li>
        </ul>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>3. Service Availability</h2>
        <p>We strive to ensure 99.9% uptime, but we do not guarantee that the service will always be available or be uninterrupted. We reserve the right to suspend or withdraw the service at any time without notice.</p>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>4. Termination</h2>
        <p>We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>5. Changes to Terms</h2>
        <p>We reserve the right to modify or replace these Terms at any time. We will notify users of any significant changes via our Support Server or Dashboard announcements.</p>
      </div>
    </div>
  );
}
