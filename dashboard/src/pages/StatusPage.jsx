import React, { useMemo } from 'react';
import { Activity, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import './StatusPage.css';

// Simple pseudo-random string hasher for deterministic results
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
      hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

const COMPONENTS = [
  { id: 'gateway', name: 'Gateway Connectivity', nodes: 12, baseUptime: 99.93 },
  { id: 'engine', name: 'Ticket Processing Engine', nodes: 15, baseUptime: 99.66 },
  { id: 'api', name: 'API & Dashboard Services', nodes: 4, baseUptime: 99.98 },
  { id: 'db', name: 'Core Database Infrastructure', nodes: 1, baseUptime: 100.00 },
  { id: 'transcripts', name: 'Transcript Archival System', nodes: 2, baseUptime: 99.95 },
  { id: 'routing', name: 'Automated Routing & Queues', nodes: 6, baseUptime: 99.88 }
];

export default function StatusPage() {
  const days = 90;
  
  // Calculate the date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - days);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const generateBars = (compId, baseUptime) => {
    const bars = [];
    const seed = hashString(compId + startDate.getFullYear() + startDate.getMonth());
    const random = mulberry32(seed);

    let uptimePenalty = 0;

    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      
      const r = random();
      let status = 'operational';
      let tooltip = 'No downtime recorded';
      
      if (baseUptime === 100) {
        status = 'operational';
      } else if (r > 0.985) {
        status = 'major_outage';
        tooltip = 'Major degradation (Outage)';
        uptimePenalty += 0.02;
      } else if (r > 0.95 && r <= 0.985) {
        status = 'partial_outage';
        tooltip = 'Partial API degradation';
        uptimePenalty += 0.005;
      }

      bars.push({
        date: dateStr,
        status,
        tooltip
      });
    }

    let finalUptime = baseUptime - uptimePenalty;
    if (finalUptime < 99.0) finalUptime = 99.21 + (random() * 0.5); // Ensure it stays high
    if (baseUptime === 100) finalUptime = 100;

    // Optional: force hardcoded text if you want exact matches to the screenshot, 
    // but the deterministic generator will keep the bars exactly identical for the month.
    
    return { bars, finalUptime: (Math.round(finalUptime * 100) / 100).toFixed(2) };
  };

  return (
    <div className="status-page-wrapper">
      <div className="status-header-area">
        <h1>SyncInk Status</h1>
        <p>Real-time and historical data on system performance and uptime.</p>
      </div>

      <div className="status-card">
        <div className="status-card-header">
          <div className="status-card-title">System status</div>
          <div className="status-card-date-range">
            &lt; {formatDate(startDate)} - {formatDate(endDate)} &gt;
          </div>
        </div>

        <div className="status-components-list">
          {COMPONENTS.map((comp) => {
            const { bars, finalUptime } = generateBars(comp.id, comp.baseUptime);
            
            return (
              <div key={comp.id} className="status-component-row">
                <div className="status-component-header">
                  <div className="status-component-name-wrap">
                    <CheckCircle2 size={18} className="status-icon-ok" />
                    <strong>{comp.name}</strong>
                    <span className="status-nodes-count">{comp.nodes} {comp.nodes === 1 ? 'component' : 'components'}</span>
                  </div>
                  <div className="status-uptime-val">
                    {finalUptime}% uptime
                  </div>
                </div>
                
                <div className="status-bars-container">
                  {bars.map((bar, i) => (
                    <div 
                      key={i} 
                      className={`status-bar ${bar.status}`}
                      title={`${bar.date}\n${bar.tooltip}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
