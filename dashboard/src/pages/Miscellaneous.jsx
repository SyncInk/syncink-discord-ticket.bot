import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ActionButton,
  Field,
  PageHeader,
  SectionCard,
  TextArea,
  TextInput
} from '../components/Common';

export default function Miscellaneous() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const [minutes, setMinutes] = useState(snapshot.settings.inactivityReminderMinutes);
  const [messages, setMessages] = useState(snapshot.settings.defaultTicketMessages);

  useEffect(() => {
    setMinutes(snapshot.settings.inactivityReminderMinutes);
    setMessages(snapshot.settings.defaultTicketMessages);
  }, [snapshot]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Safe Bot Preferences"
        title="Miscellaneous settings"
        description="Small operational settings that are safe to change from the dashboard and take effect immediately."
        action={(
          <ActionButton
            tone="primary"
            busy={busy}
            onClick={() => saveSettings({
              inactivityReminderMinutes: Number(minutes),
              defaultTicketMessages: messages
            }, 'Miscellaneous settings saved')}
          >
            Save preferences
          </ActionButton>
        )}
      />

      <div className="split-grid">
        <SectionCard title="Inactivity reminders" description="Controls how quickly the bot nudges idle ticket threads.">
          <Field label="Reminder interval (minutes)">
            <TextInput value={minutes} onChange={(event) => setMinutes(event.target.value)} />
          </Field>

          <Field label="Reminder embed text">
            <TextInput
              value={messages.inactivityReminderText}
              onChange={(event) => setMessages((current) => ({ ...current, inactivityReminderText: event.target.value }))}
            />
          </Field>
        </SectionCard>

        <SectionCard title="Default ticket message" description="Template used when the bot opens a new ticket thread.">
          <Field label="Opening message" hint="Supported placeholders: {user}, {staffPing}, {server}">
            <TextArea
              rows={6}
              value={messages.openingLine}
              onChange={(event) => setMessages((current) => ({ ...current, openingLine: event.target.value }))}
            />
          </Field>
        </SectionCard>
      </div>
    </div>
  );
}
