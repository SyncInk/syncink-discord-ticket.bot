import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { MetricCard, PageHeader, SectionCard } from '../components/Common';
import { formatDuration } from '../format';

export default function BotProfile() {
  const { snapshot } = useOutletContext();

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

      <SectionCard title="Profile details" description="Useful metadata for support or verification.">
        <div className="profile-panel">
          <img src={snapshot.bot.avatarUrl} alt={snapshot.bot.username} className="profile-panel-avatar" />
          <div className="profile-panel-copy">
            <strong>{snapshot.bot.username}</strong>
            <span>Bot ID: {snapshot.bot.id}</span>
            <span>Guild: {snapshot.guild.name}</span>
            <span>Owner: {snapshot.guild.owner?.displayName || 'Unknown'}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
