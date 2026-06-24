import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { DataTable, PageHeader, SectionCard } from '../components/Common';
import { formatDateTime } from '../format';

export default function AuditLogs() {
  const { snapshot } = useOutletContext();

  const rows = (snapshot.audits || []).map((audit) => ({
    key: audit.id,
    ...audit
  }));

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Change History"
        title="Audit every dashboard change"
        description="Every configuration update records who changed it and what moved, without changing the bot&apos;s core systems."
      />

      <SectionCard title="Audit entries" description="Dashboard and supported Discord-based config changes are tracked here.">
        <DataTable
          columns={[
            { key: 'action', label: 'Action', render: (row) => row.action },
            { key: 'actor', label: 'Actor', render: (row) => row.actor?.displayName || 'Unknown' },
            { key: 'source', label: 'Source', render: (row) => row.source },
            {
              key: 'changes',
              label: 'Changes',
              render: (row) => row.changes.length > 0
                ? row.changes.map((change) => change.field).join(', ')
                : 'No field details'
            },
            { key: 'time', label: 'Time', render: (row) => formatDateTime(row.createdAt) }
          ]}
          rows={rows}
          emptyTitle="No audit entries yet"
          emptyDescription="Audit entries appear after the first configuration change."
        />
      </SectionCard>
    </div>
  );
}
