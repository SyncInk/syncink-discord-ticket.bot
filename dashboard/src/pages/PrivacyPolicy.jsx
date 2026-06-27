import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="transcript-page" style={{ padding: '40px', color: '#dcddde', background: '#36393f', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div className="transcript-header">
        <button className="back-link" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: '#00aff4', cursor: 'pointer', padding: 0, fontSize: '14px' }}>
          ← Back
        </button>
        <h1 style={{ marginTop: '20px' }}>Privacy Policy</h1>
        <p>Last updated: June 2026</p>
      </div>

      <div style={{ background: '#2f3136', padding: '24px', borderRadius: '8px', lineHeight: '1.6' }}>
        <h2 style={{ color: '#fff', marginTop: 0 }}>1. Information We Collect</h2>
        <p>We collect information you provide directly to us when you use our bot and dashboard. This includes:</p>
        <ul>
          <li><strong>Discord Profile Information:</strong> Your Discord User ID, username, and avatar URL to authenticate your session.</li>
          <li><strong>Server Information:</strong> Your Discord Server ID, roles, and channel layouts to provide ticketing features.</li>
          <li><strong>Ticket Data & Transcripts:</strong> Messages sent within ticket threads, including text and attachment URLs, to generate ticket transcripts for your server logs.</li>
        </ul>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>2. How We Use Your Information</h2>
        <p>We use the information we collect to operate, maintain, and improve our services, including:</p>
        <ul>
          <li>Creating and managing support tickets on your Discord server.</li>
          <li>Generating permanent transcripts of closed tickets for moderation and review.</li>
          <li>Authenticating your access to the web dashboard.</li>
        </ul>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>3. Data Storage & Security</h2>
        <p>Your data is securely stored in our database. We do not sell your personal information. Transcripts are stored securely and are only accessible by authorized server staff through the dashboard or designated Discord log channels.</p>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>4. Data Deletion</h2>
        <p>You can request the deletion of your server's data at any time by removing the bot from your server or contacting our support team. Upon removal, ticket logs and configurations may be permanently deleted.</p>

        <h2 style={{ color: '#fff', marginTop: '24px' }}>5. Contact Us</h2>
        <p>If you have any questions about this Privacy Policy, please contact us via our Support Server.</p>
      </div>
    </div>
  );
}
