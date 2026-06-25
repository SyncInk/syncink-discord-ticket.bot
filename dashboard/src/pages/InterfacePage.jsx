import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ActionButton,
  Field,
  PageHeader,
  SectionCard,
  SelectInput,
  Toggle
} from '../components/Common';

export default function InterfacePage() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const defaultPrefs = { accentColor: '#9d7cff', density: 'comfortable', motion: 'full', glass: true, theme: 'dark', sidebarBehavior: 'auto', toastDuration: 'medium' };
  const [prefs, setPrefs] = useState(snapshot.settings?.dashboardPreferences || defaultPrefs);

  useEffect(() => {
    setPrefs(snapshot.settings?.dashboardPreferences || defaultPrefs);
  }, [snapshot]);

  const updateField = (key, value) => {
    setPrefs((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Personalized UI"
        title="Dashboard interface preferences"
        description="These are safe dashboard-only presentation settings. They do not change the bot's ticket behavior."
        action={(
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ dashboardPreferences: prefs }, 'Interface preferences saved')}>
            Save interface
          </ActionButton>
        )}
      />

      <div className="split-grid">
        <SectionCard title="Interface" description="Tune the visual experience of the dashboard.">
          <div className="form-grid">
            <Field label="Theme">
              <SelectInput value={prefs.theme || 'dark'} onChange={(event) => updateField('theme', event.target.value)}>
                <option value="dark">Dark Theme (Default)</option>
                <option value="light" disabled>Light Theme (Coming Soon)</option>
              </SelectInput>
            </Field>

            <Field label="Animation">
              <SelectInput value={prefs.motion || 'full'} onChange={(event) => updateField('motion', event.target.value)}>
                <option value="full">Full motion (Smooth transitions)</option>
                <option value="reduced">Reduced motion (Instant)</option>
              </SelectInput>
            </Field>

            <Field label="Density">
              <SelectInput value={prefs.density || 'comfortable'} onChange={(event) => updateField('density', event.target.value)}>
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact (More items on screen)</option>
              </SelectInput>
            </Field>

            <Field label="Sidebar Behavior">
              <SelectInput value={prefs.sidebarBehavior || 'auto'} onChange={(event) => updateField('sidebarBehavior', event.target.value)}>
                <option value="auto">Auto-collapse on narrow screens</option>
                <option value="always">Always keep visible</option>
              </SelectInput>
            </Field>
          </div>
        </SectionCard>

        <div className="page-stack">
          <SectionCard title="Notification Settings" description="Control how dashboard alerts are shown.">
            <div className="form-grid">
              <Field label="Toast Duration">
                <SelectInput value={prefs.toastDuration || 'medium'} onChange={(event) => updateField('toastDuration', event.target.value)}>
                  <option value="short">Short (2.5 seconds)</option>
                  <option value="medium">Medium (4.2 seconds)</option>
                  <option value="long">Long (8 seconds)</option>
                </SelectInput>
              </Field>
              <Toggle
                checked={prefs.glass !== false}
                onChange={(value) => updateField('glass', value)}
                label="Glassmorphism surfaces"
                description="Keep the translucent card styling for toasts and modals."
              />
            </div>
          </SectionCard>

          <SectionCard title="Preview" description="A quick look at your interface settings.">
            <div className="theme-preview">
              <div className="theme-preview-card" style={{ boxShadow: `0 25px 80px ${prefs.accentColor}25`, padding: prefs.density === 'compact' ? '12px' : '20px' }}>
                <div className="theme-preview-bar" style={{ background: prefs.accentColor }} />
                <strong>SyncInk UI Preview</strong>
                <span>Density: {prefs.density}</span>
                <span>Motion: {prefs.motion}</span>
                <span>Sidebar: {prefs.sidebarBehavior}</span>
                <button className="preview-btn" style={{ background: prefs.accentColor }}>Test Button</button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
