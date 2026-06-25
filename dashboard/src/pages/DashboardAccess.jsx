import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Crown, Settings, ShieldCheck, Star, Wrench, X } from 'lucide-react';
import { ActionButton, PageHeader, SelectInput } from '../components/Common';

const TIERS = [
  { id: 'owner', label: 'Owner', icon: Crown, color: '#ff7d9c', desc: 'Manage server settings, toggles, and most dashboard sections.' },
  { id: 'developer', label: 'Developer', icon: Settings, color: '#9d7cff', desc: 'Manage server settings, toggles, and most dashboard sections.' },
  { id: 'admin', label: 'Administrator', icon: ShieldCheck, color: '#ff7d9c', desc: 'Manage server settings, toggles, and most dashboard sections.' },
  { id: 'moderator', label: 'Moderator', icon: Star, color: '#6dc1ff', desc: 'Manage voice room tools and approved moderation pages.' },
  { id: 'staff', label: 'Staff', icon: Wrench, color: '#6d8bff', desc: 'Access low-level dashboard settings such as Interface.' }
];

export default function DashboardAccess() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const [roleMap, setRoleMap] = useState([]);
  const [selectedNewRole, setSelectedNewRole] = useState('');

  useEffect(() => {
    const newRoleMap = [];
    const settings = snapshot.settings;
    
    // Map roles to their configured tier
    const addRoles = (roleIds, tierId) => {
      if (!roleIds) return;
      roleIds.forEach(id => {
        if (!newRoleMap.find(r => r.id === id)) {
          const roleData = snapshot.resources?.roles?.find(r => r.id === id);
          if (roleData) {
            newRoleMap.push({ ...roleData, tier: tierId });
          } else {
            newRoleMap.push({ id, name: 'Deleted Role', color: '#666', tier: tierId });
          }
        }
      });
    };

    addRoles(settings.ownerRoleIds, 'owner');
    addRoles(settings.developerRoleIds, 'developer');
    addRoles(settings.adminRoleIds, 'admin');
    addRoles(settings.moderatorRoleIds, 'moderator');
    addRoles(settings.staffRoleIds, 'staff');

    setRoleMap(newRoleMap);
  }, [snapshot]);

  const handleUpdateRole = (roleId, newTier) => {
    setRoleMap(current => current.map(r => r.id === roleId ? { ...r, tier: newTier } : r));
  };

  const handleRemoveRole = (roleId) => {
    setRoleMap(current => current.filter(r => r.id !== roleId));
  };

  const handleAddRole = () => {
    if (!selectedNewRole) return;
    const roleData = snapshot.resources?.roles?.find(r => r.id === selectedNewRole);
    if (roleData && !roleMap.find(r => r.id === selectedNewRole)) {
      setRoleMap([...roleMap, { ...roleData, tier: 'staff' }]);
    }
    setSelectedNewRole('');
  };

  const handleSave = () => {
    const payload = {
      ownerRoleIds: roleMap.filter(r => r.tier === 'owner').map(r => r.id),
      developerRoleIds: roleMap.filter(r => r.tier === 'developer').map(r => r.id),
      adminRoleIds: roleMap.filter(r => r.tier === 'admin').map(r => r.id),
      moderatorRoleIds: roleMap.filter(r => r.tier === 'moderator').map(r => r.id),
      staffRoleIds: roleMap.filter(r => r.tier === 'staff').map(r => r.id)
    };
    saveSettings(payload, 'Access tiers saved');
  };

  const getTierCount = (tierId) => roleMap.filter(r => r.tier === tierId).length;

  const availableRolesToAdd = snapshot.resources?.roles?.filter(r => !roleMap.find(rm => rm.id === r.id)) || [];

  return (
    <div className="page-stack">
      <div className="announcement-bar">
        <span className="announcement-icon">i</span>
        Owner, Administrator, and Moderator access is tiered automatically. Higher tiers always outrank lower tiers.
      </div>

      <PageHeader
        title="Dashboard Access Manager"
        description="Select which Discord roles can open the dashboard and assign them the right access tier."
        action={
          <ActionButton tone="primary" busy={busy} onClick={handleSave}>
            Save Changes
          </ActionButton>
        }
      />

      <div className="access-tiers-grid">
        {TIERS.map(tier => {
          const Icon = tier.icon;
          return (
            <div key={tier.id} className="access-tier-card">
              <div className="tier-eyebrow">ACCESS TIER</div>
              <div className="tier-header">
                <div className="tier-title" style={{ color: tier.color }}>
                  <Icon size={18} />
                  {tier.label}
                </div>
                <div className="tier-count">{getTierCount(tier.id)}</div>
              </div>
              <p className="tier-desc">{tier.desc}</p>
            </div>
          );
        })}
      </div>

      <section className="section-card">
        <div className="section-head access-roles-head">
          <div className="allowed-roles-title">
            <ShieldCheck size={20} className="accent-icon" />
            <h2>Allowed Roles</h2>
          </div>
          <div className="add-role-controls">
            <select 
              className="role-select-input"
              value={selectedNewRole}
              onChange={(e) => setSelectedNewRole(e.target.value)}
            >
              <option value="">Select a role...</option>
              {availableRolesToAdd.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            <button className="add-role-btn" onClick={handleAddRole}>+ Add Role</button>
          </div>
        </div>

        <div className="role-list">
          {roleMap.length === 0 ? (
            <div className="muted-note" style={{ padding: '20px' }}>No roles configured. Only Server Owners have access.</div>
          ) : (
            roleMap.map(role => (
              <div key={role.id} className="role-list-item">
                <div className="role-list-info">
                  <span className="token-dot" style={{ backgroundColor: role.color && role.color !== '#000000' ? role.color : '#9d7cff' }} />
                  <div>
                    <strong>{role.name}</strong>
                    <span>{TIERS.find(t => t.id === role.tier)?.label} tier</span>
                  </div>
                </div>
                <div className="role-list-actions">
                  <select 
                    value={role.tier} 
                    onChange={(e) => handleUpdateRole(role.id, e.target.value)}
                    className="tier-select"
                  >
                    {TIERS.map(t => (
                      <option key={t.id} value={t.id}>{t.label} (Full Access)</option>
                    ))}
                  </select>
                  <button className="remove-role-btn" onClick={() => handleRemoveRole(role.id)}>
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
