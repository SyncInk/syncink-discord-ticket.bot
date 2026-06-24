import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader, Pill, SectionCard, Timeline } from '../components/Common';
import { formatRelativeTime } from '../format';

export default function ActivityFeed() {
  const { snapshot } = useOutletContext();

  const items = snapshot.activities.map((activity) => ({
    id: activity.id,
    title: activity.title,
    description: activity.description,
    meta: formatRelativeTime(activity.createdAt),
    extra: (
      <div className="activity-extra">
        {activity.actor ? <Pill>{activity.actor.displayName}</Pill> : null}
        {activity.relatedTicketId ? <Pill tone="success">{activity.relatedTicketId}</Pill> : null}
      </div>
    )
  }));

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Live Stream"
        title="Activity feed"
        description="This list updates from WebSocket events when the bot creates, claims, transfers, closes, or reminds on tickets."
      />

      <SectionCard title="Recent events" description="Newest entries appear first.">
        <Timeline
          items={items}
          emptyTitle="No live events yet"
          emptyDescription="Once the bot records activity, it will stream into this feed."
        />
      </SectionCard>
    </div>
  );
}
