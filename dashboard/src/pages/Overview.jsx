import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { MetricCard, PageHeader, SectionCard, Pill } from '../components/Common';
import { Ticket, Activity, FolderClosed, ArrowRightLeft, BadgeCheck, Shield, FileText, HelpCircle, X } from 'lucide-react';

function ActivityChart({ data }) {
  if (!data || data.length === 0) return <div className="chart-empty">No activity data available.</div>;

  const maxVal = Math.max(1, ...data.map(d => Math.max(d.created || 0, d.closed || 0)));

  return (
    <div className="activity-chart">
      <div className="chart-y-axis">
        <span>{maxVal}</span>
        <span>{Math.round(maxVal / 2)}</span>
        <span>0</span>
      </div>
      <div className="chart-bars-container">
        {data.map((day, i) => (
          <div key={i} className="chart-day-group">
            <div className="chart-bar-wrap">
              <div 
                className="chart-bar created" 
                style={{ height: `${((day.created || 0) / maxVal) * 100}%` }}
                title={`${day.created || 0} Created`}
              />
              <div 
                className="chart-bar closed" 
                style={{ height: `${((day.closed || 0) / maxVal) * 100}%` }}
                title={`${day.closed || 0} Closed`}
              />
            </div>
            <div className="chart-label">{day.label}</div>
          </div>
        ))}
      </div>
      <div className="chart-legend">
        <div className="legend-item"><span className="legend-dot created" /> Created</div>
        <div className="legend-item"><span className="legend-dot closed" /> Closed</div>
      </div>
    </div>
  );
}

export default function Overview() {
  const { snapshot } = useOutletContext();
  const { stats, analytics } = snapshot;
  const [showLegal, setShowLegal] = React.useState(localStorage.getItem('hideLegalBanner') !== 'true');

  const hideLegal = () => {
    localStorage.setItem('hideLegalBanner', 'true');
    setShowLegal(false);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title="Dashboard Overview"
        description="High-level metrics and activity for your ticket system."
      />

      {showLegal && (
        <div className="legal-banner">
          <div className="legal-banner-content">
            <Shield className="legal-icon" size={28} />
            <div className="legal-text">
              <h3>Legal & Support Hub</h3>
              <p>Please review our official policies and frequently asked questions for guidance.</p>
            </div>
          </div>
          <div className="legal-links">
            <a href="/privacy" className="action-button"><Shield size={16} /> Privacy Policy</a>
            <a href="/terms" className="action-button"><FileText size={16} /> Terms of Service</a>
            <a href="/faq" className="action-button"><HelpCircle size={16} /> FAQ</a>
            <button type="button" className="legal-close" onClick={hideLegal} title="Dismiss"><X size={16} /></button>
          </div>
        </div>
      )}

      <div className="metric-grid">
        <MetricCard label="Total Tickets" value={stats.totalTickets} />
        <MetricCard label="Open Tickets" value={stats.openTickets} tone="info" />
        <MetricCard label="Resolved" value={stats.closedTickets} tone="success" />
        <MetricCard label="Actions" value={stats.activityCount} />
      </div>

      <div className="split-grid">
        <SectionCard title="Ticket Activity (7 Days)" description="Created vs. closed tickets over the past week.">
          <ActivityChart data={stats.dailySeries || []} />
        </SectionCard>

        <SectionCard title="Staff Activity" description="Top operators based on recent ticket actions.">
          <div className="stack-list">
            {stats.staffActivity?.length === 0 ? (
              <div className="muted-note">No staff activity has been recorded yet.</div>
            ) : stats.staffActivity?.map((item) => (
              <div key={item.actorId} className="staff-row">
                <div>
                  <strong>{snapshot.activities.find((activity) => activity.actor?.id === item.actorId)?.actor?.displayName || item.actorId}</strong>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    ID: {item.actorId} &bull; {item.total} actions recorded
                  </div>
                </div>
                <div className="staff-pills">
                  <Pill tone="success">{item.claimed} claimed</Pill>
                  <Pill>{item.closed} closed</Pill>
                  <Pill tone="warning">{item.transferred} transferred</Pill>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="mini-grid">
        <SectionCard title="Category traffic" description="Ticket load by panel category.">
          <div className="stack-list">
            {analytics?.typeBreakdown?.map((entry) => (
              <div key={entry.value} className="summary-row">
                <div className="summary-label">
                  <span>{entry.label}</span>
                </div>
                <Pill>{entry.count}</Pill>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Performance" description="Average response times.">
          <div className="stack-list">
            <div className="summary-row">
              <span>First response</span>
              <strong>{stats.response?.averageFirstClaimMs ? `${Math.round(stats.response.averageFirstClaimMs / 60000)}m` : 'N/A'}</strong>
            </div>
            <div className="summary-row">
              <span>Resolution time</span>
              <strong>{stats.response?.averageCloseMs ? `${Math.round(stats.response.averageCloseMs / 3600000)}h` : 'N/A'}</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
