import React from 'react';
import { BarChart3, ShieldCheck, Ticket, Zap } from 'lucide-react';

export default function Login() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="login-wrapper">
      <div className="login-ambient-glow" />

      <div className="login-card">
        <div className="auth-column hero">
          <div className="auth-badge">Professional control surface</div>
          <h1 className="auth-title">Manage SyncInk Ticket from a dashboard that finally feels polished.</h1>
          <p className="auth-subtitle">
            A refined dark interface for category management, panel deployment, analytics, activity
            tracking, transcripts, and operational visibility, all synchronized with your existing bot.
          </p>

          <div className="auth-insight-grid">
            <div className="auth-insight">
              <strong>Live Sync</strong>
              <span>Discord actions, MongoDB updates, and dashboard changes stay aligned in real time.</span>
            </div>
            <div className="auth-insight">
              <strong>Protected</strong>
              <span>Only the server owner and Administrators can enter the management experience.</span>
            </div>
            <div className="auth-insight">
              <strong>Premium Feel</strong>
              <span>Purposeful spacing, glass surfaces, richer contrast, and cleaner page composition.</span>
            </div>
          </div>
        </div>

        <div className="auth-column panel">
          <div className="login-header">
            <img src="/ticket-logo.png" alt="SyncInk Ticket Logo" className="login-logo" />
            <h1>SyncInk Ticket</h1>
            <p>
              Sign in with Discord to access the dashboard and manage your support system with a professional workflow-focused interface.
            </p>
          </div>

          <div className="login-features">
            <div className="login-feature">
              <div className="feature-icon"><Ticket size={16} /></div>
              <div className="feature-text">
                <strong>Panel and category control</strong>
                <span>Fine-tune panel visuals, channel destinations, and ticket presentation safely.</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon"><BarChart3 size={16} /></div>
              <div className="feature-text">
                <strong>Operational visibility</strong>
                <span>Track activity, analytics, transcripts, and ticket history from one place.</span>
              </div>
            </div>

            <div className="login-feature">
              <div className="feature-icon"><ShieldCheck size={16} /></div>
              <div className="feature-text">
                <strong>Secure access model</strong>
                <span>OAuth2 authentication with live server permission checks before access is granted.</span>
              </div>
            </div>
          </div>

          <button type="button" className="login-button" onClick={handleLogin}>
            <img
              src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
              alt="Discord"
              style={{ width: 18, filter: 'brightness(0) invert(1)' }}
            />
            Continue with Discord
          </button>

          <div className="login-footer">
            <Zap size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            Premium dashboard experience for SyncInk Ticket
          </div>
        </div>
      </div>
    </div>
  );
}
