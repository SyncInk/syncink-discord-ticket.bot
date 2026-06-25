import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { ActionButton, MetricCard, PageHeader, SectionCard, Field, TextInput } from '../components/Common';
import { formatDuration } from '../format';
import usePermissions from '../hooks/usePermissions';
import LockedOverlay from '../components/LockedOverlay';

export default function BotProfile() {
  const { snapshot, selectedGuild, refreshSnapshot } = useOutletContext();
  const { isDeveloper, getLockTooltip } = usePermissions();
  const [nickname, setNickname] = useState(snapshot.bot?.nickname || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setNickname(snapshot.bot?.nickname || '');
  }, [snapshot]);

  const handleSaveNickname = async () => {
    if (!isDeveloper) return;
    setBusy(true);
    try {
      await axios.post(`/api/guilds/${selectedGuild.id}/nickname`, { nickname });
      await refreshSnapshot(true);
    } catch (error) {
      console.error('Failed to change nickname:', error);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Bot Information"
        title="Connected bot profile"
        description="Reference information for the live bot instance serving this dashboard."
      />

      <div className="metric-grid">
        <MetricCard label="Bot Username" value={snapshot.bot.username} hint="Current Discord identity" />
        <MetricCard label="Connected Servers" value={snapshot.bot.guildCount} hint="Guilds currently served" />
        <MetricCard label="Uptime" value={formatDuration(snapshot.bot.uptimeMs)} hint="Since the current process started" />
        <MetricCard label="Guild Members" value={snapshot.guild.memberCount} hint="Current selected server" />
      </div>

      <div className="split-grid">
        <SectionCard title="Profile details" description="Useful metadata for support or verification.">
          <div className="profile-panel">
            <img src={snapshot.bot.avatarUrl} alt={snapshot.bot.username} className="profile-panel-avatar" />
            <div className="profile-panel-copy">
              <strong>{snapshot.bot.nickname || snapshot.bot.username}</strong>
              <span style={{ color: 'var(--text)', fontWeight: 500 }}>@{snapshot.bot.username}</span>
              <span>Bot ID: {snapshot.bot.id}</span>
              <span>Guild: {snapshot.guild.name}</span>
            </div>
          </div>
        </SectionCard>

        <div style={{ position: 'relative' }}>
          {!isDeveloper && <LockedOverlay tooltip={getLockTooltip('developer')} />}
          <SectionCard 
            title="Server Nickname" 
            description="Change the bot's display name specifically for this server."
            action={isDeveloper && (
              <ActionButton tone="primary" busy={busy} onClick={handleSaveNickname}>
                Update Nickname
              </ActionButton>
            )}
          >
            <Field label="Nickname" hint="Leave blank to reset to the default bot username.">
              <TextInput 
                value={nickname} 
                onChange={(e) => setNickname(e.target.value)} 
                placeholder={snapshot.bot.username}
                maxLength={32}
                disabled={!isDeveloper}
              />
            </Field>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
