import React from 'react';
import { LogIn, ShieldCheck, Sparkles } from 'lucide-react';

export default function Login() {
  return (
    <div className="auth-shell">
      <div className="auth-backdrop auth-left">
        <div className="auth-brand">SyncInk Ticket Bot</div>
        <h1>Premium control for your Discord support workflow.</h1>
        <p>
          Manage ticket panels, categories, logs, transcripts, analytics, and live activity without
          changing the bot&apos;s proven backend behavior.
        </p>
        <div className="auth-feature-list">
          <div><Sparkles size={16} /> SaaS-grade dark interface inspired by Discord</div>
          <div><ShieldCheck size={16} /> Owner and Administrator access only</div>
          <div><LogIn size={16} /> OAuth2 login with live bot synchronization</div>
        </div>
      </div>

      <div className="auth-card">
        <div className="brand-mark large">S</div>
        <h2>Sign in with Discord</h2>
        <p>
          Only the server owner and members with the Administrator permission can access this dashboard.
        </p>

        <button type="button" className="action-button tone-primary wide" onClick={() => {
          window.location.href = '/api/auth/login';
        }}>
          <LogIn size={18} />
          Continue with Discord
        </button>
      </div>
    </div>
  );
}
