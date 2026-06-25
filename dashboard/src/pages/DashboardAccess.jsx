import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Crown, ShieldCheck, X } from 'lucide-react';
import { ActionButton, PageHeader } from '../components/Common';
import usePermissions from '../hooks/usePermissions';
import LockedOverlay from '../components/LockedOverlay';

const TIERS = [
  { id: 'owner', label: 'Owner', accessLabel: 'Owner (Full Access)', emojiId: '1513803214674464788', color: 'linear-gradient(135deg, #FF6B9A 0%, #9D7CFF 100%)', borderColor: '#FF6B9A', desc: 'Manage server settings, toggles, and most dashboard sections.' },
  { id: 'developer', label: 'Developer', accessLabel: 'Developer (Full Access)', emojiId: '1519379532409344142', color: '#9d7cff', borderColor: '#9d7cff', desc: 'Manage server settings, toggles, and most dashboard sections.' },
  { id: 'admin', label: 'Administrator', accessLabel: 'Administrator (Manage Server)', emojiId: '1518924309668823160', color: '#ff4d4d', borderColor: '#ff4d4d', desc: 'Manage server settings, toggles, and most dashboard sections.' },
  { id: 'moderator', label: 'Moderator', accessLabel: 'Moderator (Managed Access)', emojiId: '1518924931482779809', color: '#00e5ff', borderColor: '#00e5ff', desc: 'Manage voice room tools and approved moderation pages.' },
  { id: 'staff', label: 'Staff', accessLabel: 'Staff (Limited Access)', emojiId: '1513328514529624185', color: '#7b61ff', borderColor: '#7b61ff', desc: 'Access low-level dashboard settings such as Interface.' }
];

export default function DashboardAccess() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const { canEditAccess, getLockTooltip } = usePermissions();
  const [roleMap, setRoleMap] = useState([]);
  const [selectedNewRole, setSelectedNewRole] = useState('');

  useEffect(() => {
    const nextRoleMap = [];
    const settings = snapshot.settings;

    const addRoles = (roleIds, tierId) => {
      if (!roleIds) return;
      roleIds.forEach((id) => {
        if (!nextRoleMap.find((role) => role.id === id)) {
          const roleData = snapshot.resources?.roles?.find((role) => role.id === id);
          if (roleData) {
            nextRoleMap.push({ ...roleData, tier: tierId });
          } else {
            nextRoleMap.push({ id, name: 'Deleted Role', color: '#666', tier: tierId });
          }
        }
      });
    };

    addRoles(settings.ownerRoleIds, 'owner');
    addRoles(settings.developerRoleIds, 'developer');
    addRoles(settings.adminRoleIds, 'admin');
    addRoles(settings.moderatorRoleIds, 'moderator');
    addRoles(settings.staffRoleIds, 'staff');

    setRoleMap(nextRoleMap);
  }, [snapshot]);

  const handleUpdateRole = (roleId, newTier) => {
    if (!canEditAccess) return;
    setRoleMap((current) => current.map((role) => (
      role.id === roleId ? { ...role, tier: newTier } : role
    )));
  };

  const handleRemoveRole = (roleId) => {
    if (!canEditAccess) return;
    setRoleMap((current) => current.filter((role) => role.id !== roleId));
  };

  const handleAddRole = () => {
    if (!canEditAccess || !selectedNewRole) return;
    const roleData = snapshot.resources?.roles?.find((role) => role.id === selectedNewRole);
    if (roleData && !roleMap.find((role) => role.id === selectedNewRole)) {
      setRoleMap([...roleMap, { ...roleData, tier: 'staff' }]);
    }
    setSelectedNewRole('');
  };

  const handleSave = () => {
    if (!canEditAccess) return;
    const payload = {
      ownerRoleIds: roleMap.filter((role) => role.tier === 'owner').map((role) => role.id),
      developerRoleIds: roleMap.filter((role) => role.tier === 'developer').map((role) => role.id),
      adminRoleIds: roleMap.filter((role) => role.tier === 'admin').map((role) => role.id),
      moderatorRoleIds: roleMap.filter((role) => role.tier === 'moderator').map((role) => role.id),
      staffRoleIds: roleMap.filter((role) => role.tier === 'staff').map((role) => role.id)
    };
    saveSettings(payload, 'Access tiers saved');
  };

  const getTierCount = (tierId) => roleMap.filter((role) => role.tier === tierId).length;
  const availableRolesToAdd = snapshot.resources?.roles?.filter((role) => !roleMap.find((mappedRole) => mappedRole.id === role.id)) || [];

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Permission Management"
        title="Dashboard access tiers"
        description="Control which Discord roles are allowed into the dashboard and how much operational access each role should have."
        action={canEditAccess && (
          <ActionButton tone="primary" busy={busy} onClick={handleSave}>
            Save Changes
          </ActionButton>
        )}
      />

      <div className="announcement-bar">
        <span className="announcement-icon">i</span>
        Higher access tiers should stay limited to your most trusted roles. Review these assignments carefully before saving.
      </div>

      <div className="access-tiers-grid">
        {TIERS.map((tier) => (
          <div key={tier.id} className="access-tier-card">
            <div className="tier-eyebrow">ACCESS TIER</div>
            <div className="tier-header">
              <div 
                className="tier-title" 
                style={tier.color.includes('gradient') 
                  ? { backgroundImage: tier.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold' } 
                  : { color: tier.color, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 'bold' }
                }
              >
                <img src={`https://cdn.discordapp.com/emojis/${tier.emojiId}.png`} alt={tier.label} style={{ width: 18, height: 18 }} />
                {tier.label}
              </div>
              <div className="tier-count" style={{ borderColor: tier.borderColor }}>{getTierCount(tier.id)}</div>
            </div>
            <p className="tier-desc">{tier.desc}</p>
          </div>
        ))}
      </div>

      <section className="section-card" style={{ position: 'relative' }}>
        {!canEditAccess && <LockedOverlay tooltip={getLockTooltip('developer')} />}
        <div className="section-head access-roles-head">
          <div className="allowed-roles-title">
            <ShieldCheck size={20} className="accent-icon" />
            <h2 style={{ fontSize: '16px', margin: 0 }}>Allowed Roles</h2>
          </div>
          <div className="add-role-controls">
            <select
              className="role-select-input"
              value={selectedNewRole}
              onChange={(event) => setSelectedNewRole(event.target.value)}
              disabled={!canEditAccess}
            >
              <option value="">Select a role...</option>
              {availableRolesToAdd.map((role) => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
            <button className="add-role-btn" onClick={handleAddRole} disabled={!canEditAccess}>+ Add Role</button>
          </div>
        </div>

        <div className="role-list">
          {roleMap.length === 0 ? (
            <div className="muted-note" style={{ padding: 20 }}>No custom roles are configured. Server Owners remain the default access holders.</div>
          ) : (
            roleMap.map((role) => (
              <div key={role.id} className="role-list-item">
                <div className="role-list-info">
                  <span className="token-dot" style={{ backgroundColor: role.color && role.color !== '#000000' ? role.color : '#9d7cff' }} />
                  <div>
                    <strong>{role.name}</strong>
                    <span>{TIERS.find((tier) => tier.id === role.tier)?.label} tier</span>
                  </div>
                </div>
                <div className="role-list-actions">
                  <select
                    value={role.tier}
                    onChange={(event) => handleUpdateRole(role.id, event.target.value)}
                    className="tier-select"
                    disabled={!canEditAccess}
                  >
                    {TIERS.map((tier) => (
                      <option key={tier.id} value={tier.id}>{tier.accessLabel}</option>
                    ))}
                  </select>
                  <button className="remove-role-btn" onClick={() => handleRemoveRole(role.id)} disabled={!canEditAccess}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
