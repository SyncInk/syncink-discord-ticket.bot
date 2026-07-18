import React, { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
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
  const { busy, saveSettings, snapshot, setUnsavedChanges, setSaveAction } = useOutletContext();
  const [logChannelId, setLogChannelId] = useState(snapshot.settings.logChannelId || '');

  useEffect(() => {
    setLogChannelId(snapshot.settings.logChannelId || '');
  }, [snapshot]);

  useEffect(() => {
    const isDirty = logChannelId !== (snapshot.settings.logChannelId || '');
    setUnsavedChanges(isDirty);
    
    if (isDirty) {
      setSaveAction(() => async () => {
        await saveSettings({ logChannelId }, 'Ticket log destination saved');
      });
    } else {
      setSaveAction(null);
    }
    
    return () => {
      setUnsavedChanges(false);
      setSaveAction(null);
    };
  }, [logChannelId, snapshot.settings.logChannelId, setUnsavedChanges, setSaveAction]);

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
              label: 'Transcript / Actions',
              render: (row) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {row.transcriptAvailable
                    ? <Link to={`/dashboard/${snapshot.settings.guildId}/transcripts/${row.ticketId}`} className="text-blue-500 hover:underline">Online Transcript</Link>
                    : <span style={{ color: 'var(--text-muted)' }}>{row.status === 'closed' ? 'Unavailable' : 'Pending'}</span>
                  }
                  {row.status === 'open' && (
                    <button 
                      onClick={async () => {
                        if (confirm('Are you sure you want to force close this ticket and delete its channel?')) {
                          try {
                            const res = await fetch(`/api/guilds/${snapshot.settings.guildId}/tickets/${row.ticketId}/close`, { method: 'POST' });
                            if (res.ok) window.location.reload();
                            else alert('Failed to force close ticket.');
                          } catch (e) {
                            alert('Error closing ticket.');
                          }
                        }
                      }}
                      style={{ padding: '6px 12px', borderRadius: '6px', background: 'var(--danger)', color: 'white', border: 'none', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                      Force Close
                    </button>
                  )}
                </div>
              )
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
