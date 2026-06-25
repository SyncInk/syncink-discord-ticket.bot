import React from 'react';
import { Settings, ShieldCheck, Ticket } from 'lucide-react';

export default function Login() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="login-wrapper">
      <div className="login-ambient-glow" />
      
      <div className="login-card">
        <div className="login-header">
          <img src="/ticket-logo.png" alt="SyncInk Ticket Logo" className="login-logo" />
          <h1>SyncInk Ticket</h1>
          <p>
            The premium ticket management bot. Manage your servers, customize your ticket panels, and take full control.
          </p>
        </div>

        <div className="login-features">
          <div className="login-feature">
            <div className="feature-icon"><Ticket size={16} /></div>
            <div className="feature-text">
              <strong>Premium Ticket Panels</strong>
              <span>Create and manage dynamic support systems</span>
            </div>
          </div>
          
          <div className="login-feature">
            <div className="feature-icon"><Settings size={16} /></div>
            <div className="feature-text">
              <strong>Granular Permissions</strong>
              <span>Full role and server-level toggle control</span>
            </div>
          </div>
          
          <div className="login-feature">
            <div className="feature-icon"><ShieldCheck size={16} /></div>
            <div className="feature-text">
              <strong>Secure & Private</strong>
              <span>Discord OAuth2 protected dashboard</span>
            </div>
          </div>
        </div>

        <button type="button" className="login-button" onClick={handleLogin}>
          <img src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png" alt="Discord" style={{ width: 18, filter: 'brightness(0) invert(1)' }} />
          Login with Discord
        </button>
      </div>

      <div className="login-footer">
        SyncInk Ticket Dashboard • Free for everyone • Built with ♥
      </div>
    </div>
  );
}
