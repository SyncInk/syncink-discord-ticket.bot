import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const LiveViewer = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const socket = io('/', { path: '/socket.io' });
    
    socket.on('ticketUpdate', (data) => {
      setEvents(prev => [data, ...prev].slice(0, 50));
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="animate-slide-up">
      <h2>Live Ticket Viewer</h2>
      <p style={{ color: 'var(--text-muted)', marginTop: '8px', marginBottom: '24px' }}>Real-time feed of ticket activity.</p>
      
      <div className="card" style={{ minHeight: '400px' }}>
        {events.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
            Listening for ticket events...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {events.map((ev, i) => (
              <div key={i} style={{ padding: '12px', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>{ev.type}</span> - {ev.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveViewer;
