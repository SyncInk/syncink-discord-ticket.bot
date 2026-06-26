import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ActionButton,
  DataTable,
  Field,
  PageHeader,
  SectionCard,
  SelectInput
} from '../components/Common';
import { formatDateTime } from '../format';

export default function Transcripts() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const [transcriptChannelId, setTranscriptChannelId] = useState(snapshot.settings.transcriptChannelId || '');

  useEffect(() => {
    setTranscriptChannelId(snapshot.settings.transcriptChannelId || '');
  }, [snapshot]);

  const transcriptRows = snapshot.tickets
    .filter((ticket) => ticket.status === 'closed')
    .map((ticket) => ({ key: ticket.ticketId, ...ticket }));

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Archive Management"
        title="Transcript storage and availability"
        description="Route transcript files to a separate channel if needed while keeping ticket closure behavior unchanged."
      />

      <SectionCard
        title="Transcript destination"
        description="If empty, transcripts fall back to the ticket log channel."
        action={(
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ transcriptChannelId }, 'Transcript destination saved')}>
            Save transcript channel
          </ActionButton>
        )}
      >
        <Field label="Transcript channel">
          <SelectInput value={transcriptChannelId} onChange={(event) => setTranscriptChannelId(event.target.value)}>
            <option value="">Use the ticket log channel</option>
            {snapshot.resources.textChannels.map((channel) => (
              <option key={channel.id} value={channel.id}>{channel.name}</option>
            ))}
          </SelectInput>
        </Field>
      </SectionCard>

      <SectionCard title="Closed ticket transcripts" description="Transcript links appear here as the bot archives closed tickets.">
        <DataTable
          columns={[
            { key: 'ticket', label: 'Ticket', render: (row) => row.ticketId },
            { key: 'creator', label: 'Creator', render: (row) => row.creator?.displayName || row.creator?.id || 'Unknown' },
            { key: 'closed', label: 'Closed', render: (row) => formatDateTime(row.closedAt) },
            {
              key: 'link',
              label: 'Transcript',
              render: (row) => row.messages && row.messages.length > 0
                ? <Link to={`/dashboard/${snapshot.settings.guildId}/transcripts/${row.ticketId}`} className="text-blue-500 hover:underline">View Online Transcript</Link>
                : row.transcriptMessageUrl
                  ? <a href={row.transcriptMessageUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">Download Legacy (.txt)</a>
                  : 'Not available'
            }
          ]}
          rows={transcriptRows}
          emptyTitle="No transcript archives yet"
          emptyDescription="Closed tickets with transcript uploads will show up here."
        />
      </SectionCard>
    </div>
  );
}
