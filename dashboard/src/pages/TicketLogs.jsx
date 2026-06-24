import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ActionButton,
  DataTable,
  Field,
  PageHeader,
  Pill,
  SectionCard,
  SelectInput
} from '../components/Common';
import { formatDateTime, statusTone } from '../format';

export default function TicketLogs() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const [logChannelId, setLogChannelId] = useState(snapshot.settings.logChannelId || '');

  useEffect(() => {
    setLogChannelId(snapshot.settings.logChannelId || '');
  }, [snapshot]);

  const rows = snapshot.tickets.map((ticket) => ({
    key: ticket.ticketId,
    ...ticket
  }));

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Operational History"
        title="Inspect every tracked ticket"
        description="This page is driven by the bot&apos;s own ticket records, including claim state, transfer history, and transcript availability."
      />

      <SectionCard
        title="Ticket log channel"
        description="Choose where action logs are posted. The bot will use the new channel immediately."
        action={(
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ logChannelId }, 'Ticket log destination saved')}>
            Save log channel
          </ActionButton>
        )}
      >
        <Field label="Destination channel">
          <SelectInput value={logChannelId} onChange={(event) => setLogChannelId(event.target.value)}>
            <option value="">Select a text channel</option>
            {snapshot.resources.textChannels.map((channel) => (
              <option key={channel.id} value={channel.id}>{channel.name}</option>
            ))}
          </SelectInput>
        </Field>
      </SectionCard>

      <SectionCard title="Ticket records" description="Live records stored for this guild.">
        <DataTable
          columns={[
            {
              key: 'ticket',
              label: 'Ticket',
              render: (row) => (
                <div className="table-primary">
                  <strong>{row.ticketId}</strong>
                  <span>{row.category.emoji} {row.category.label}</span>
                </div>
              )
            },
            {
              key: 'creator',
              label: 'Creator',
              render: (row) => row.creator?.displayName || row.creator?.id || 'Unknown'
            },
            {
              key: 'staff',
              label: 'Assigned Staff',
              render: (row) => row.claimers.length > 0
                ? row.claimers.map((claimer) => claimer.displayName).join(', ')
                : 'Unclaimed'
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => <Pill tone={statusTone(row.status)}>{row.status}</Pill>
            },
            {
              key: 'created',
              label: 'Created',
              render: (row) => formatDateTime(row.createdAt)
            },
            {
              key: 'transfers',
              label: 'Transfers',
              render: (row) => row.transferHistory.length
            },
            {
              key: 'transcript',
              label: 'Transcript',
              render: (row) => row.transcriptAvailable
                ? <a href={row.transcriptMessageUrl} target="_blank" rel="noreferrer">Available</a>
                : 'Pending'
            }
          ]}
          rows={rows}
          emptyTitle="No ticket records yet"
          emptyDescription="As soon as members create tickets, they will appear here automatically."
        />
      </SectionCard>
    </div>
  );
}
