import React from 'react';
import { Lock } from 'lucide-react';

export default function LockedOverlay({ requiredTier, tooltip }) {
  return (
    <div 
      className="locked-overlay" 
      title={tooltip}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(10, 14, 28, 0.5)',
        backdropFilter: 'grayscale(0.5) blur(1px)',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'not-allowed',
        borderRadius: 'inherit'
      }}
    >
      <div style={{
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '8px 12px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        color: '#ff8da7',
        fontSize: '0.85rem',
        fontWeight: '600',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
      }}>
        <Lock size={16} />
        <span>{tooltip}</span>
      </div>
    </div>
  );
}
