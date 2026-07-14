import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ActionButton,
  Field,
  PageHeader,
  SectionCard,
  TextArea,
  TextInput,
  SelectInput
} from '../components/Common';
import usePermissions from '../hooks/usePermissions';
import LockedOverlay from '../components/LockedOverlay';

export default function Miscellaneous() {
  const { busy, saveSettings, snapshot, setUnsavedChanges, setSaveAction } = useOutletContext();
  const { canEditSettings, getLockTooltip } = usePermissions();
  const [minutes, setMinutes] = useState(snapshot.settings.inactivityReminderMinutes || 1440);
  const [messages, setMessages] = useState(snapshot.settings.defaultTicketMessages || { openingLine: '', inactivityReminderText: '' });
  const [logChannelId, setLogChannelId] = useState(snapshot.settings.logChannelId || '');

  useEffect(() => {
    setMinutes(snapshot.settings.inactivityReminderMinutes || 1440);
    setMessages(snapshot.settings.defaultTicketMessages || { openingLine: '', inactivityReminderText: '' });
    setLogChannelId(snapshot.settings.logChannelId || '');
  }, [snapshot]);

  useEffect(() => {
    const isDirty = 
      Number(minutes) !== (snapshot.settings.inactivityReminderMinutes || 1440) ||
      JSON.stringify(messages) !== JSON.stringify(snapshot.settings.defaultTicketMessages || { openingLine: '', inactivityReminderText: '' }) ||
      logChannelId !== (snapshot.settings.logChannelId || '');
      
    setUnsavedChanges(isDirty);
    
    if (isDirty) {
      setSaveAction(() => async () => {
        await saveSettings({
          inactivityReminderMinutes: Number(minutes),
          defaultTicketMessages: messages,
          logChannelId: logChannelId || null
        }, 'Miscellaneous settings saved');
      });
    } else {
      setSaveAction(null);
    }
    
    return () => {
      setUnsavedChanges(false);
      setSaveAction(null);
    };
  }, [minutes, messages, logChannelId, snapshot.settings, setUnsavedChanges, setSaveAction]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Safe Bot Preferences"
        title="Miscellaneous settings"
        description="Small operational settings that are safe to change from the dashboard and take effect immediately."
        action={canEditSettings && (
          <ActionButton
            tone="primary"
            busy={busy}
            onClick={() => saveSettings({
              inactivityReminderMinutes: Number(minutes),
              defaultTicketMessages: messages,
              logChannelId: logChannelId || null
            }, 'Miscellaneous settings saved')}
          >
            Save preferences
          </ActionButton>
        )}
      />

      <div className="split-grid" style={{ position: 'relative' }}>
        {!canEditSettings && <LockedOverlay tooltip={getLockTooltip('admin')} />}
        <SectionCard title="Log Channel" description="Select which text channel receives ticket log messages.">
          <Field label="Target Channel" hint="Where the bot should log new tickets and closures.">
            <SelectInput value={logChannelId} onChange={(event) => setLogChannelId(event.target.value)} disabled={!canEditSettings}>
              <option value="">No log channel selected</option>
              {snapshot.resources?.textChannels?.map((ch) => (
                <option key={ch.id} value={ch.id}>#{ch.name}</option>
              ))}
            </SelectInput>
          </Field>
        </SectionCard>

        <SectionCard title="Inactivity reminders" description="Controls how quickly the bot nudges idle ticket threads.">
          <Field label="Reminder interval (minutes)">
            <TextInput value={minutes} onChange={(event) => setMinutes(event.target.value)} disabled={!canEditSettings} />
          </Field>

          <Field label="Reminder embed text">
            <TextInput
              value={messages.inactivityReminderText || ''}
              onChange={(event) => setMessages((current) => ({ ...current, inactivityReminderText: event.target.value }))}
              disabled={!canEditSettings}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Default ticket message" description="Template used when the bot opens a new ticket thread." className="full-width">
          <Field label="Opening message" hint="Supported placeholders: {user}, {staffPing}, {server}">
            <TextArea
              rows={6}
              value={messages.openingLine || ''}
              onChange={(event) => setMessages((current) => ({ ...current, openingLine: event.target.value }))}
              disabled={!canEditSettings}
            />
          </Field>
        </SectionCard>
      </div>
    </div>
  );
}
