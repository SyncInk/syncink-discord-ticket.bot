import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PageHeader, SectionCard, EmptyState } from '../components/Common';
import { formatDateTime } from '../format';
import { Settings, User, Box, Clock } from 'lucide-react';

export default function AuditLogs() {
  const { snapshot } = useOutletContext();
  const audits = snapshot.audits || [];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Change History"
        title="Audit every dashboard change"
        description="Every configuration update records who changed it and what moved, without changing the bot's core systems."
      />

      <SectionCard title="Audit entries" description="Dashboard and supported Discord-based config changes are tracked here.">
        <div className="audit-list">
          {audits.length === 0 ? (
            <EmptyState icon="info" title="No audit entries yet" description="Audit entries appear after the first configuration change." />
          ) : (
            audits.map((audit) => (
              <div key={audit.id} className="audit-box">
                <div className="audit-header">
                  <strong className="audit-action"><Settings size={14} /> {audit.action}</strong>
                  <span className="audit-time"><Clock size={12} /> {formatDateTime(audit.createdAt)}</span>
                </div>
                <div className="audit-details">
                  <div className="audit-detail-item">
                    <span className="detail-label"><User size={12} /> Actor:</span>
                    <span className="detail-value">{audit.actor?.displayName || 'Unknown'}</span>
                  </div>
                  <div className="audit-detail-item">
                    <span className="detail-label"><Box size={12} /> Source:</span>
                    <span className="detail-value">{audit.source}</span>
                  </div>
                  <div className="audit-detail-item full-width">
                    <span className="detail-label">Changes:</span>
                    <div className="audit-changes-list">
                      {audit.changes?.length > 0 ? (
                        audit.changes.map((change, i) => (
                          <span key={i} className="audit-change-chip">{change.field}</span>
                        ))
                      ) : (
                        <span className="audit-change-chip">No specific fields</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </SectionCard>
    </div>
  );
}
