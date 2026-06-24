import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Activity, ArrowRightLeft, BadgeCheck, FolderClosed, Ticket } from 'lucide-react';
import { MetricCard, PageHeader, Pill, SectionCard, Timeline } from '../components/Common';
import { formatDuration, formatRelativeTime } from '../format';

export default function Overview() {
  const { snapshot } = useOutletContext();
  const stats = snapshot.stats;

  const timelineItems = snapshot.activities.slice(0, 6).map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    meta: formatRelativeTime(activity.createdAt),
    extra: activity.actor ? `By ${activity.actor.displayName}` : null
  }));

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={snapshot.guild.name}
        title="Ticket operations at a glance"
        description="Live counters, staff performance, and recent bot activity from the same MongoDB data the bot is already using."
      />

      <div className="metric-grid">
        <MetricCard label="Total Tickets" value={stats.totalTickets} hint="All-time across this server" />
        <MetricCard label="Open Tickets" value={stats.openTickets} hint="Currently active threads" tone="success" />
        <MetricCard label="Closed Tickets" value={stats.closedTickets} hint="Archived through the bot" />
        <MetricCard label="Transferred" value={stats.transferredTickets} hint="Moved between staff groups" />
        <MetricCard label="Claimed" value={stats.claimedTickets} hint="Tickets with assigned staff" />
        <MetricCard label="Avg First Response" value={formatDuration(stats.response.averageFirstClaimMs)} hint="Creation to first claim" />
        <MetricCard label="Avg Resolution" value={formatDuration(stats.response.averageCloseMs)} hint="Creation to close" />
        <MetricCard label="Live Events" value={stats.activityCount} hint="Recent activity entries retained" />
      </div>

      <div className="split-grid">
        <SectionCard
          title="Recent activity"
          description="The feed below updates when tickets are created, claimed, transferred, closed, or marked inactive."
        >
          <Timeline
            items={timelineItems}
            emptyTitle="No activity yet"
            emptyDescription="Once the bot starts handling tickets, live activity will appear here."
          />
        </SectionCard>

        <SectionCard title="Staff activity" description="Top operators based on recent ticket actions.">
          <div className="stack-list">
            {stats.staffActivity.length === 0 ? (
              <div className="muted-note">No staff activity has been recorded yet.</div>
            ) : stats.staffActivity.map((item) => (
              <div key={item.actorId} className="staff-row">
                <div>
                  <strong>{snapshot.activities.find((activity) => activity.actor?.id === item.actorId)?.actor?.displayName || item.actorId}</strong>
                  <span>{item.total} actions recorded</span>
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
            {snapshot.analytics.typeBreakdown.map((entry) => (
              <div key={entry.value} className="summary-row">
                <div className="summary-label">
                  <span>{entry.label}</span>
                </div>
                <Pill>{entry.count}</Pill>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="System state" description="Quick health indicators for the management layer.">
          <div className="info-grid">
            <div className="info-chip"><Ticket size={16} /> Threads stay bot-managed</div>
            <div className="info-chip"><BadgeCheck size={16} /> Config applies instantly</div>
            <div className="info-chip"><ArrowRightLeft size={16} /> Transfers are tracked</div>
            <div className="info-chip"><FolderClosed size={16} /> Transcripts remain linked</div>
            <div className="info-chip"><Activity size={16} /> Live sync is enabled</div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
