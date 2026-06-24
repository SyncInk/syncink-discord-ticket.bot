import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Settings, Activity, Server, Users, LogOut } from 'lucide-react';

const Layout = ({ user }) => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Overview', icon: <LayoutDashboard size={20} /> },
    { path: '/live', label: 'Live Viewer', icon: <Activity size={20} /> },
    { path: '/panels', label: 'Ticket Panels', icon: <MessageSquare size={20} /> },
    { path: '/categories', label: 'Categories', icon: <Server size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> }
  ];

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--bg-secondary)', 
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 10px' }}>
          <div style={{ 
            width: '40px', height: '40px', 
            borderRadius: '8px', 
            background: 'linear-gradient(135deg, var(--color-primary), #3498db)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 'bold', fontSize: '20px'
          }}>
            S
          </div>
          <div>
            <h2 style={{ fontSize: '18px', color: 'var(--text-header)', margin: 0 }}>SyncInk</h2>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>Dashboard Admin</p>
          </div>
        </div>

        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  color: isActive ? 'white' : 'var(--text-muted)',
                  backgroundColor: isActive ? 'var(--color-primary)' : 'transparent',
                  fontWeight: isActive ? '600' : '500',
                  transition: 'all var(--transition-fast)',
                  textDecoration: 'none'
                }}
              >
                <div style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</div>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Profile Footer */}
        <div style={{ 
          marginTop: 'auto', 
          padding: '16px', 
          backgroundColor: 'var(--bg-elevated)', 
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`} 
              alt="Avatar" 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
            <div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-header)', margin: 0 }}>{user.username}</p>
            </div>
          </div>
          <button onClick={handleLogout} style={{ color: 'var(--color-danger)', padding: '4px' }}>
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ 
          height: '70px', 
          borderBottom: '1px solid var(--border-subtle)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 32px',
          backgroundColor: 'rgba(30, 31, 34, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 10
        }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>
            {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
          </h1>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }} className="animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
