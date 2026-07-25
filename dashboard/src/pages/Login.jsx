import React from 'react';
import { ShieldCheck, Ticket, Settings } from 'lucide-react';
import Seo from '../components/Seo';

export default function Login() {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="login-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Seo
        title="Login | SyncInk Ticket Dashboard"
        description="Log in with Discord to access the private SyncInk Ticket dashboard."
        path="/login"
        robots="noindex,nofollow"
      />
      <div className="login-ambient-glow" />

      <div 
        className="login-card" 
        style={{ 
          width: 'min(480px, 100%)', 
          display: 'flex', 
          flexDirection: 'column', 
          background: 'rgba(11, 15, 27, 0.96)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.4)'
        }}
      >
        <div className="auth-column panel" style={{ padding: '48px 40px', background: 'transparent' }}>
          <div className="login-header" style={{ alignItems: 'center', marginBottom: '32px', textAlign: 'center' }}>
            <img 
              src="/ticket-logo.png" 
              alt="SyncInk Ticket Logo" 
              className="login-logo" 
              style={{ width: 84, height: 84, marginBottom: '20px', borderRadius: '50%', boxShadow: '0 0 40px rgba(165, 136, 255, 0.3)' }} 
            />
            <h1 style={{ 
              fontSize: '28px', 
              marginBottom: '12px', 
              fontWeight: '700',
              background: 'linear-gradient(90deg, #d8b4ff, #8ab4f8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent'
            }}>SyncInk Ticket</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, padding: '0 10px' }}>
              The ticket management system. Manage your support channels, customize your panels, and take full control.
            </p>
          </div>

          <div className="login-features" style={{ marginBottom: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="login-feature" style={{ border: 'none', padding: 0, gap: '16px' }}>
              <div className="feature-icon" style={{ width: 42, height: 42, borderRadius: '14px', background: 'rgba(165, 136, 255, 0.08)', color: 'var(--accent)' }}><Ticket size={18} /></div>
              <div className="feature-text" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <strong style={{ fontSize: '14px' }}>Ticket Panels</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Auto-create and manage dynamic support categories</span>
              </div>
            </div>

            <div className="login-feature" style={{ border: 'none', padding: 0, gap: '16px' }}>
              <div className="feature-icon" style={{ width: 42, height: 42, borderRadius: '14px', background: 'rgba(165, 136, 255, 0.08)', color: 'var(--accent)' }}><Settings size={18} /></div>
              <div className="feature-text" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <strong style={{ fontSize: '14px' }}>Staff Controls</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Easy role and server settings control</span>
              </div>
            </div>

            <div className="login-feature" style={{ border: 'none', padding: 0, gap: '16px' }}>
              <div className="feature-icon" style={{ width: 42, height: 42, borderRadius: '14px', background: 'rgba(165, 136, 255, 0.08)', color: 'var(--accent)' }}><ShieldCheck size={18} /></div>
              <div className="feature-text" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <strong style={{ fontSize: '14px' }}>Secure & Private</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Secure Discord dashboard access</span>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            className="login-button" 
            onClick={handleLogin} 
            style={{ 
              width: '100%', 
              padding: '16px', 
              borderRadius: '14px', 
              background: '#5865F2', 
              color: 'white', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '12px', 
              fontSize: '15px', 
              fontWeight: '600', 
              border: 'none', 
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(88, 101, 242, 0.25)',
              transition: 'background 0.2s, transform 0.1s'
            }}
          >
            <img
              src="https://cdn.prod.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png"
              alt="Discord"
              style={{ width: 22, filter: 'brightness(0) invert(1)' }}
            />
            Login with Discord
          </button>

          <div 
            className="login-footer" 
            style={{ 
              marginTop: '28px', 
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              fontSize: '12px', 
              color: 'var(--text-muted)', 
              textAlign: 'center',
              opacity: 0.8
            }}
          >
            <div>SyncInk Ticket Dashboard &bull; Free for everyone &bull; Built with â™¥</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
              <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</a>
              <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</a>
              <a href="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

