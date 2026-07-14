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
import usePermissions from '../hooks/usePermissions';
import LockedOverlay from '../components/LockedOverlay';

function tokenizeDiscordText(text) {
  const source = String(text || '');
  const tokens = [];
  const pattern = /<a?:([a-zA-Z0-9_]+):(\d+)>|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', value: source.slice(lastIndex, match.index) });
    }

    if (match[1] && match[2]) {
      tokens.push({ type: 'emoji', name: match[1], id: match[2] });
    } else if (match[3]) {
      tokens.push({ type: 'code', value: match[3] });
    } else if (match[4]) {
      tokens.push({ type: 'bold', value: match[4] });
    } else if (match[5]) {
      tokens.push({ type: 'underline', value: match[5] });
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < source.length) {
    tokens.push({ type: 'text', value: source.slice(lastIndex) });
  }

  return tokens;
}

function renderDiscordTokens(text, keyPrefix) {
  return tokenizeDiscordText(text).map((token, index) => {
    const key = `${keyPrefix}-${index}`;

    if (token.type === 'emoji') {
      return (
        <img
          key={key}
          className="discord-custom-emoji"
          src={`https://cdn.discordapp.com/emojis/${token.id}.png`}
          alt={`:${token.name}:`}
        />
      );
    }

    if (token.type === 'code') {
      return <span key={key} className="discord-inline-code">{token.value}</span>;
    }

    if (token.type === 'bold') {
      return <strong key={key}>{token.value}</strong>;
    }

    if (token.type === 'underline') {
      return <u key={key}>{token.value}</u>;
    }

    return <React.Fragment key={key}>{token.value}</React.Fragment>;
  });
}

export default function TicketPanels() {
  const { busy, deployPanel, openConfirm, saveSettings, snapshot, setUnsavedChanges, setSaveAction } = useOutletContext();
  const { canEditSettings, getLockTooltip } = usePermissions();
  const [form, setForm] = useState(snapshot.settings.panelConfig);
  const [panelChannelId, setPanelChannelId] = useState(snapshot.settings.panelChannelId || '');

  useEffect(() => {
    setForm(snapshot.settings.panelConfig);
    setPanelChannelId(snapshot.settings.panelChannelId || '');
  }, [snapshot]);

  useEffect(() => {
    const isDirty = JSON.stringify(form) !== JSON.stringify(snapshot.settings.panelConfig) || 
                    panelChannelId !== (snapshot.settings.panelChannelId || '');
    setUnsavedChanges(isDirty);
    
    if (isDirty) {
      setSaveAction(() => async () => {
        // Save both settings that could be dirty
        const payload = {};
        if (JSON.stringify(form) !== JSON.stringify(snapshot.settings.panelConfig)) {
            payload.panelConfig = form;
        }
        if (panelChannelId !== (snapshot.settings.panelChannelId || '')) {
            payload.panelChannelId = panelChannelId;
        }
        await saveSettings(payload, 'Settings saved');
      });
    } else {
      setSaveAction(null);
    }
    
    return () => {
      setUnsavedChanges(false);
      setSaveAction(null);
    };
  }, [form, panelChannelId, snapshot.settings.panelConfig, snapshot.settings.panelChannelId, setUnsavedChanges, setSaveAction]);

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const previewLines = (form.description || []).filter((line) => line !== undefined && line !== null && line !== '');
  const previewTimestamp = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(',', '');

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Panel Configuration"
        title="Design the ticket entry panel"
        description="Adjust the panel copy and appearance without changing the underlying ticket workflow or bot logic."
        action={canEditSettings && (
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
        <div style={{ position: 'relative' }}>
          {!canEditSettings && <LockedOverlay tooltip={getLockTooltip('admin')} />}
          <SectionCard title="Panel settings" description="These values shape the embed members see before opening a ticket.">
            <div className="form-grid">
              <Field label="Ticket panel channel">
                <SelectInput value={panelChannelId} onChange={(event) => setPanelChannelId(event.target.value)} disabled={!canEditSettings}>
                  <option value="">Select a text channel</option>
                  {snapshot.resources.panelChannels.map((channel) => (
                    <option key={channel.id} value={channel.id}>{channel.name}</option>
                  ))}
                </SelectInput>
              </Field>

              <Field label="Panel title">
                <TextInput value={form.title} onChange={(event) => updateField('title', event.target.value)} disabled={!canEditSettings} />
              </Field>

              <Field label="Panel placeholder">
                <TextInput value={form.placeholder} onChange={(event) => updateField('placeholder', event.target.value)} disabled={!canEditSettings} />
              </Field>

              <Field label="Embed color">
                <TextInput value={form.color} onChange={(event) => updateField('color', event.target.value)} disabled={!canEditSettings} />
              </Field>

              <Field label="Thumbnail URL">
                <TextInput value={form.thumbnailUrl} onChange={(event) => updateField('thumbnailUrl', event.target.value)} disabled={!canEditSettings} />
              </Field>

              <Field label="Panel description" hint="Use one line per bullet shown in the embed.">
                <TextArea
                  rows={7}
                  value={(form.description || []).join('\n')}
                  onChange={(event) => updateField('description', event.target.value.split('\n'))}
                  disabled={!canEditSettings}
                />
              </Field>
            </div>
          </SectionCard>
        </div>

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
                  <span className="discord-message-timestamp">{previewTimestamp}</span>
                </div>

                <div className="discord-message-embed">
                  <div className="discord-message-embed-color" style={{ background: form.color || '#5865f2' }} />

                  <div className="discord-message-embed-body">
                    {form.title ? (
                      <div className="discord-message-embed-title">
                        {renderDiscordTokens(form.title, 'title')}
                      </div>
                    ) : null}

                    <div className="discord-message-embed-desc">
                      {previewLines.map((line, index) => {
                        let textToRender = line;
                        const isTitleLine = index === 0 && !form.title;
                        
                        if (isTitleLine) {
                           textToRender = textToRender.replace(/\*\*/g, '').replace(/__/g, '');
                        }

                        return (
                          <div key={index} className="discord-message-embed-line">
                            {!isTitleLine && <span className="discord-message-bullet">•</span>}
                            <p style={isTitleLine ? { fontSize: '1.25em', fontWeight: 'bold', textDecoration: 'underline', display: 'flex', alignItems: 'center', gap: '8px' } : {}}>
                              {renderDiscordTokens(textToRender, `line-${index}`)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {form.thumbnailUrl ? (
                    <img src={form.thumbnailUrl} alt="Thumbnail" className="discord-message-embed-thumb" />
                  ) : null}
                </div>

                <div className="discord-message-components">
                  <div className="discord-message-select">
                    <span>{form.placeholder}</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M8.59003 16.59L13.17 12L8.59003 7.41L10 6L16 12L10 18L8.59003 16.59Z" fill="#DBDEE1" />
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
