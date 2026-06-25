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
        description="Adjust the panel copy and appearance without changing the underlying ticket workflow or bot logic."
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
        <SectionCard title="Panel settings" description="These values shape the embed members see before opening a ticket.">
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

        <SectionCard title="Live preview" description="A dashboard-side preview of the Discord-facing ticket panel.">
          <div className="panel-preview">
            <div className="panel-preview-header">
              <Eye size={16} />
              Discord panel preview
            </div>
            <div className="discord-message-preview">
              <img src={snapshot.bot.avatarUrl} alt={snapshot.bot.username} className="discord-message-avatar" />
              <div className="discord-message-content">
                <div className="discord-message-header">
                  <span className="discord-message-author">{snapshot.bot.nickname || snapshot.bot.username}</span>
                  <span className="discord-message-bot-tag">APP</span>
                  <span className="discord-message-timestamp">{new Date().toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</span>
                </div>
                
                <div className="discord-message-embed">
                  <div className="discord-message-embed-color" style={{ background: form.color || '#2B2D31' }} />
                  <div className="discord-message-embed-body">
                    <div className="discord-message-embed-title">
                      {form.title}
                      <img src="https://cdn.discordapp.com/emojis/1513337285024677899.png" alt="Shield" style={{ width: 20, height: 20 }} />
                    </div>
                    <div className="discord-message-embed-desc">
                      {(form.description || []).filter(Boolean).map((line, index) => (
                        <p key={index}>{line.startsWith('•') ? line : `• ${line}`}</p>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="discord-message-components">
                  <div className="discord-message-select">
                    <span>{form.placeholder}</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.59003 16.59L13.17 12L8.59003 7.41L10 6L16 12L10 18L8.59003 16.59Z" fill="#B5BAC1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
