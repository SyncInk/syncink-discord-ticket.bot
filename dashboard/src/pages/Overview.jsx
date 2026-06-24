import React from 'react';

const Overview = () => {
  return (
    <div className="animate-slide-up">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
        {[
          { label: 'Total Tickets', value: '142' },
          { label: 'Open Tickets', value: '12' },
          { label: 'Avg Response Time', value: '5m 12s' },
          { label: 'Active Staff', value: '8' }
        ].map((stat, i) => (
          <div key={i} className="card">
            <h3 style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</h3>
            <div style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-header)' }}>{stat.value}</div>
          </div>
        ))}
      </div>
      
      <div className="card" style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Ticket Volume Chart placeholder</p>
      </div>
    </div>
  );
};

export default Overview;
