import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Eye, Send } from 'lucide-react';
import {
  ActionButton,
  Field,
  PageHeader,
  SectionCard,
  SelectInput,
  TextArea,
  TextInput
} from '../components/Common';

export default function TicketPanels() {
  const { busy, deployPanel, openConfirm, saveSettings, snapshot } = useOutletContext();
  const [form, setForm] = useState(snapshot.settings.panelConfig);
  const [panelChannelId, setPanelChannelId] = useState(snapshot.settings.panelChannelId || '');

  useEffect(() => {
    setForm(snapshot.settings.panelConfig);
    setPanelChannelId(snapshot.settings.panelChannelId || '');
  }, [snapshot]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Panel Configuration"
        title="Design the ticket entry panel"
        description="Adjust the panel copy and appearance without touching the underlying ticket workflow."
        action={(
          <div className="action-row">
            <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ panelConfig: form }, 'Panel styling saved')}>
              Save panel style
            </ActionButton>
            <ActionButton
              busy={busy}
              onClick={() => openConfirm(
                {
                  title: 'Deploy ticket panel',
                  description: 'This will post the current panel into the selected text channel immediately.',
                  confirmLabel: 'Deploy now'
                },
                () => deployPanel(panelChannelId)
              )}
            >
              <Send size={15} />
              Deploy panel
            </ActionButton>
          </div>
        )}
      />

      <div className="split-grid">
        <SectionCard title="Panel settings" description="These values shape the embed that members see before creating a ticket.">
          <div className="form-grid">
            <Field label="Ticket panel channel">
              <SelectInput value={panelChannelId} onChange={(event) => setPanelChannelId(event.target.value)}>
                <option value="">Select a text channel</option>
                {snapshot.resources.panelChannels.map((channel) => (
                  <option key={channel.id} value={channel.id}>{channel.name}</option>
                ))}
              </SelectInput>
            </Field>

            <Field label="Panel title">
              <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} />
            </Field>

            <Field label="Panel placeholder">
              <TextInput value={form.placeholder} onChange={(event) => updateField('placeholder', event.target.value)} />
            </Field>

            <Field label="Embed color">
              <TextInput value={form.color} onChange={(event) => updateField('color', event.target.value)} />
            </Field>

            <Field label="Thumbnail URL">
              <TextInput value={form.thumbnailUrl} onChange={(event) => updateField('thumbnailUrl', event.target.value)} />
            </Field>

            <Field label="Panel description" hint="Use one line per bullet shown in the embed.">
              <TextArea
                rows={7}
                value={(form.description || []).join('\n')}
                onChange={(event) => updateField('description', event.target.value.split('\n'))}
              />
            </Field>
          </div>
        </SectionCard>

        <SectionCard title="Live preview" description="A dashboard-side preview of the embed layout and panel choices.">
          <div className="panel-preview">
            <div className="panel-preview-header">
              <Eye size={16} />
              Discord panel preview
            </div>
            <div className="discord-preview-card">
              <div className="discord-preview-accent" style={{ background: form.color }} />
              <div className="discord-preview-body">
                <strong>{form.title}</strong>
                <div className="discord-preview-copy">
                  {(form.description || []).filter(Boolean).map((line, index) => (
                    <p key={index}>• {line}</p>
                  ))}
                </div>
                <div className="discord-preview-select">{form.placeholder}</div>
                <div className="discord-preview-tags">
                  {snapshot.settings.ticketOptions.map((option) => (
                    <span key={option.value}>{option.emoji} {option.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
