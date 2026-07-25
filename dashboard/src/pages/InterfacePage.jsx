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
import usePermissions from '../hooks/usePermissions';
import LockedOverlay from '../components/LockedOverlay';

export default function InterfacePage() {
  const { busy, saveSettings, snapshot, setUnsavedChanges, setSaveAction } = useOutletContext();
  const { canEditSettings, getLockTooltip } = usePermissions();
  const defaultPrefs = { accentColor: '#9d7cff', density: 'comfortable', motion: 'full', glass: true, clarity: 'balanced', theme: 'dark', sidebarBehavior: 'auto', toastDuration: 'medium' };
  const [prefs, setPrefs] = useState(snapshot.settings?.dashboardPreferences || defaultPrefs);

  useEffect(() => {
    setPrefs(snapshot.settings?.dashboardPreferences || defaultPrefs);
  }, [snapshot]);

  useEffect(() => {
    const isDirty = JSON.stringify(prefs) !== JSON.stringify(snapshot.settings?.dashboardPreferences || defaultPrefs);
    setUnsavedChanges(isDirty);
    
    if (isDirty) {
      setSaveAction(() => async () => {
        await saveSettings({ dashboardPreferences: prefs }, 'Interface preferences saved');
      });
    } else {
      setSaveAction(null);
    }
    
    return () => {
      setUnsavedChanges(false);
      setSaveAction(null);
    };
  }, [prefs, snapshot.settings?.dashboardPreferences, setUnsavedChanges, setSaveAction]);

  const updateField = (key, value) => {
    setPrefs((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Personalized UI"
        title="Dashboard interface preferences"
        description="These are safe dashboard-only presentation settings. They do not change the bot's ticket behavior."
        action={canEditSettings && (
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ dashboardPreferences: prefs }, 'Interface preferences saved')}>
            Save interface
          </ActionButton>
        )}
      />

      <div className="split-grid" style={{ position: 'relative' }}>
        {!canEditSettings && <LockedOverlay tooltip={getLockTooltip('admin')} />}
        <SectionCard title="Interface" description="Tune the visual experience of the dashboard.">
          <div className="form-grid">
            <Field label="Theme">
              <SelectInput value={prefs.theme || 'dark'} onChange={(event) => updateField('theme', event.target.value)} disabled={!canEditSettings}>
                <option value="dark">Dark Theme (Default)</option>
                <option value="light" disabled>Light Theme (Coming Soon)</option>
              </SelectInput>
            </Field>

            <Field label="Animation">
              <SelectInput value={prefs.motion || 'full'} onChange={(event) => updateField('motion', event.target.value)} disabled={!canEditSettings}>
                <option value="full">Full motion (Smooth transitions)</option>
                <option value="reduced">Reduced motion (Instant)</option>
              </SelectInput>
            </Field>

            <Field label="Glass Clarity">
              <SelectInput value={prefs.clarity || 'balanced'} onChange={(event) => updateField('clarity', event.target.value)} disabled={!canEditSettings}>
                <option value="soft">Soft clarity (Denser glass)</option>
                <option value="balanced">Balanced clarity</option>
                <option value="crystal">Crystal clarity (Sharper refraction)</option>
              </SelectInput>
            </Field>

            <Field label="Density">
              <SelectInput value={prefs.density || 'comfortable'} onChange={(event) => updateField('density', event.target.value)} disabled={!canEditSettings}>
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact (More items on screen)</option>
              </SelectInput>
            </Field>

            <Field label="Sidebar Behavior">
              <SelectInput value={prefs.sidebarBehavior || 'auto'} onChange={(event) => updateField('sidebarBehavior', event.target.value)} disabled={!canEditSettings}>
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
                <SelectInput value={prefs.toastDuration || 'medium'} onChange={(event) => updateField('toastDuration', event.target.value)} disabled={!canEditSettings}>
                  <option value="short">Short (2.5 seconds)</option>
                  <option value="medium">Medium (4.2 seconds)</option>
                  <option value="long">Long (8 seconds)</option>
                </SelectInput>
              </Field>
              <Toggle
                checked={prefs.glass !== false}
                onChange={(value) => updateField('glass', value)}
                label="Liquid glass surfaces"
                description="Keep the translucent dashboard shell, cards, toasts, and modal styling enabled."
                disabled={!canEditSettings}
              />
            </div>
          </SectionCard>

          <SectionCard title="Preview" description="A quick look at your interface settings.">
            <div className="theme-preview">
              <div
                className="theme-preview-card"
                style={{
                  boxShadow: `0 25px 80px ${prefs.accentColor}25`,
                  padding: prefs.density === 'compact' ? '12px' : '20px',
                  backdropFilter: prefs.glass === false ? 'none' : prefs.clarity === 'crystal' ? 'blur(26px)' : prefs.clarity === 'soft' ? 'blur(14px)' : 'blur(20px)'
                }}
              >
                <div className="theme-preview-bar" style={{ background: prefs.accentColor }} />
                <strong>SyncInk UI Preview</strong>
                <span>Density: {prefs.density}</span>
                <span>Motion: {prefs.motion}</span>
                <span>Clarity: {prefs.clarity || 'balanced'}</span>
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
