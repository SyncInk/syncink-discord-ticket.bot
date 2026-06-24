import React from 'react';
import { LogIn } from 'lucide-react';

const Login = () => {
  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: 'var(--bg-main)',
      backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(155, 89, 182, 0.1) 0%, transparent 50%)'
    }}>
      <div className="card animate-slide-up" style={{ width: '400px', textAlign: 'center', padding: '40px' }}>
        <div style={{ 
          width: '80px', height: '80px', 
          borderRadius: '20px', 
          background: 'linear-gradient(135deg, var(--color-primary), #3498db)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 'bold', fontSize: '32px',
          margin: '0 auto 24px auto',
          boxShadow: 'var(--shadow-glow)'
        }}>
          S
        </div>
        
        <h1 style={{ marginBottom: '8px' }}>SyncInk Dashboard</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Authenticate with Discord to manage your premium ticket system.
        </p>

        <button 
          onClick={handleLogin}
          className="btn-primary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px' }}
        >
          <LogIn size={20} />
          Login with Discord
        </button>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '24px' }}>
          Only server Administrators and Owners are permitted to access this dashboard.
        </p>
      </div>
    </div>
  );
};

export default Login;
