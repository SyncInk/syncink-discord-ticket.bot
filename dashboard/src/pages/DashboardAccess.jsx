import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader, Pill, SectionCard } from '../components/Common';

export default function DashboardAccess() {
  const { snapshot, user } = useOutletContext();

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Permission Guardrails"
        title="Dashboard access"
        description="The dashboard re-checks your live guild permissions before exposing data or accepting changes."
      />

      <div className="split-grid">
        <SectionCard title="Current policy" description="Access is restricted to the server owner and members with Administrator.">
          <div className="stack-list">
            <div className="summary-row"><span>Current user</span><Pill tone="success">{user.username}</Pill></div>
            <div className="summary-row"><span>Guild owner</span><Pill>{snapshot.guild.owner?.displayName || 'Unknown'}</Pill></div>
            <div className="summary-row"><span>Enforcement</span><Pill tone="warning">Live permission verification</Pill></div>
          </div>
        </SectionCard>

        <SectionCard title="Administrator roles" description="Roles in this guild that carry the Discord Administrator permission.">
          <div className="token-grid">
            {snapshot.resources.adminRoles.map((role) => (
              <span key={role.id} className="token-chip active">
                <span className="token-dot" style={{ backgroundColor: role.color && role.color !== '#000000' ? role.color : '#9d7cff' }} />
                {role.name}
              </span>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
