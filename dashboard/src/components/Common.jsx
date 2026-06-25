import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  TriangleAlert,
  X
} from 'lucide-react';

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow ? <div className="page-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
      </div>
      {action ? <div className="page-header-action">{action}</div> : null}
    </div>
  );
}

export function SectionCard({ title, description, action, children, className = '' }) {
  return (
    <section className={`section-card ${className}`.trim()}>
      {(title || description || action) ? (
        <div className="section-head">
          <div>
            {title ? <h2>{title}</h2> : null}
            {description ? <p>{description}</p> : null}
          </div>
          {action ? <div className="section-head-action">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function MetricCard({ label, value, hint, tone = 'default' }) {
  return (
    <div className={`metric-card tone-${tone}`}>
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
      {hint ? <div className="metric-hint">{hint}</div> : null}
    </div>
  );
}

export function EmptyState({ icon = 'info', title, description }) {
  const Icon = icon === 'alert' ? TriangleAlert : icon === 'shield' ? ShieldCheck : AlertCircle;

  return (
    <div className="empty-state">
      <div className="empty-icon">
        <Icon size={22} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export function LoadingPanel({ label = 'Loading dashboard data...' }) {
  return (
    <div className="loading-panel">
      <LoaderCircle className="spin" size={22} />
      <span>{label}</span>
    </div>
  );
}

export function Pill({ children, tone = 'default' }) {
  return <span className={`pill tone-${tone}`}>{children}</span>;
}

export function ActionButton({
  children,
  onClick,
  tone = 'secondary',
  disabled = false,
  busy = false,
  type = 'button'
}) {
  return (
    <button
      type={type}
      className={`action-button tone-${tone}`}
      onClick={onClick}
      disabled={disabled || busy}
    >
      {busy ? <LoaderCircle className="spin" size={16} /> : null}
      {children}
    </button>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <div className="field-label-row">
        <span className="field-label">{label}</span>
        {hint ? <span className="field-hint">{hint}</span> : null}
      </div>
      {children}
    </label>
  );
}

export function TextInput(props) {
  return <input {...props} className="text-input" />;
}

export function TextArea(props) {
  return <textarea {...props} className="text-area" />;
}

export function SelectInput({ children, ...props }) {
  return (
    <select {...props} className="select-input">
      {children}
    </select>
  );
}

export function Toggle({ checked, onChange, label, description }) {
  return (
    <button
      type="button"
      className={`toggle ${checked ? 'checked' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <div>
        <div className="toggle-label">{label}</div>
        {description ? <div className="toggle-description">{description}</div> : null}
      </div>
      <span className="toggle-knob" />
    </button>
  );
}

export function RolePicker({ roles, selectedIds, onToggle }) {
  const activeRoles = selectedIds.map(id => roles.find(r => r.id === id) || { id, name: 'Unknown Role', color: '#666' });
  const availableRoles = roles.filter(r => !selectedIds.includes(r.id));

  return (
    <div className="role-picker-container">
      <div className="role-picker-active">
        {activeRoles.length === 0 && <span className="muted-note" style={{ padding: '8px' }}>No staff roles assigned.</span>}
        {activeRoles.map(role => (
          <div key={role.id} className="role-picker-chip">
            <span className="token-dot" style={{ backgroundColor: role.color && role.color !== '#000000' ? role.color : '#9d7cff' }} />
            <span>{role.name}</span>
            <button type="button" onClick={() => onToggle(role.id)}><X size={14} /></button>
          </div>
        ))}
      </div>
      <div className="role-picker-add">
        <select 
          className="select-input" 
          onChange={(e) => {
            if (e.target.value) {
              onToggle(e.target.value);
              e.target.value = '';
            }
          }}
          defaultValue=""
        >
          <option value="" disabled>+ Add Staff Role...</option>
          {availableRoles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, emptyTitle, emptyDescription }) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              {columns.map((column) => (
                <td key={column.key}>{column.render(row)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Timeline({ items, emptyTitle, emptyDescription }) {
  if (!items.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="timeline">
      {items.map((item) => (
        <article key={item.id} className="timeline-item">
          <div className="timeline-dot" />
          <div className="timeline-card">
            <div className="timeline-top">
              <div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
              <span>{item.meta}</span>
            </div>
            {item.extra ? <div className="timeline-extra">{item.extra}</div> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ToastViewport({ items, onDismiss }) {
  return (
    <div className="toast-viewport">
      {items.map((toast) => {
        const Icon = toast.tone === 'success'
          ? CheckCircle2
          : toast.tone === 'error'
            ? TriangleAlert
            : toast.tone === 'warning'
              ? Clock3
              : AlertCircle;

        return (
          <div key={toast.id} className={`toast tone-${toast.tone || 'info'}`}>
            <div className="toast-icon">
              <Icon size={18} />
            </div>
            <div className="toast-copy">
              <strong>{toast.title}</strong>
              <span>{toast.description}</span>
            </div>
            <button type="button" className="toast-dismiss" onClick={() => onDismiss(toast.id)}>
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export function ConfirmDialog({ state, onCancel, onConfirm, busy }) {
  if (!state) return null;

  return (
    <div className="dialog-backdrop">
      <div className="dialog-card">
        <h3>{state.title}</h3>
        <p>{state.description}</p>
        <div className="dialog-actions">
          <ActionButton onClick={onCancel}>Cancel</ActionButton>
          <ActionButton tone="primary" onClick={onConfirm} busy={busy}>
            {state.confirmLabel || 'Continue'}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
