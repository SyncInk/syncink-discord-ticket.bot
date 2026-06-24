import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ActionButton,
  Field,
  PageHeader,
  SectionCard,
  SelectInput,
  TextInput,
  Toggle
} from '../components/Common';

export default function InterfacePage() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const [prefs, setPrefs] = useState(snapshot.settings.dashboardPreferences);

  useEffect(() => {
    setPrefs(snapshot.settings.dashboardPreferences);
  }, [snapshot]);

  const updateField = (key, value) => {
    setPrefs((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Personalized UI"
        title="Dashboard interface preferences"
        description="These are safe dashboard-only presentation settings. They do not change the bot&apos;s ticket behavior."
        action={(
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ dashboardPreferences: prefs }, 'Interface preferences saved')}>
            Save interface
          </ActionButton>
        )}
      />

      <div className="split-grid">
        <SectionCard title="Preferences" description="Tune the dashboard experience for your staff team.">
          <div className="form-grid">
            <Field label="Accent color">
              <TextInput value={prefs.accentColor} onChange={(event) => updateField('accentColor', event.target.value)} />
            </Field>

            <Field label="Density">
              <SelectInput value={prefs.density} onChange={(event) => updateField('density', event.target.value)}>
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </SelectInput>
            </Field>

            <Field label="Motion">
              <SelectInput value={prefs.motion} onChange={(event) => updateField('motion', event.target.value)}>
                <option value="full">Full motion</option>
                <option value="reduced">Reduced motion</option>
              </SelectInput>
            </Field>

            <Toggle
              checked={prefs.glass}
              onChange={(value) => updateField('glass', value)}
              label="Glassmorphism surfaces"
              description="Keep the translucent card styling across the dashboard."
            />
          </div>
        </SectionCard>

        <SectionCard title="Preview" description="A quick look at how your saved interface settings feel.">
          <div className="theme-preview">
            <div className="theme-preview-card" style={{ boxShadow: `0 25px 80px ${prefs.accentColor}25` }}>
              <div className="theme-preview-bar" style={{ background: prefs.accentColor }} />
              <strong>SyncInk dashboard card</strong>
              <span>Density: {prefs.density}</span>
              <span>Motion: {prefs.motion}</span>
              <span>Glass: {prefs.glass ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
