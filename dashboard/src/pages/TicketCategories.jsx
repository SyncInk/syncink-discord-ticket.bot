import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ActionButton,
  Field,
  PageHeader,
  RolePicker,
  SectionCard,
  TextArea,
  TextInput
} from '../components/Common';
import usePermissions from '../hooks/usePermissions';
import LockedOverlay from '../components/LockedOverlay';

export default function TicketCategories() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const { canEditSettings, getLockTooltip } = usePermissions();
  const [categories, setCategories] = useState(snapshot.settings.categoryOverrides);

  useEffect(() => {
    setCategories(snapshot.settings.categoryOverrides);
  }, [snapshot]);

  const updateCategory = (value, key, nextValue) => {
    setCategories((current) => current.map((category) => (
      category.value === value ? { ...category, [key]: nextValue } : category
    )));
  };

  const toggleRole = (value, roleId) => {
    if (!canEditSettings) return;
    setCategories((current) => current.map((category) => {
      if (category.value !== value) return category;
      const hasRole = category.roleIds.includes(roleId);
      return {
        ...category,
        roleIds: hasRole
          ? category.roleIds.filter((currentRoleId) => currentRoleId !== roleId)
          : [...category.roleIds, roleId]
      };
    }));
  };

  const renderEmoji = (emoji) => {
    if (!emoji) return null;
    if (/^\d+$/.test(emoji)) {
      return <img src={`https://cdn.discordapp.com/emojis/${emoji}.png`} alt="emoji" style={{ width: 24, height: 24, verticalAlign: 'middle', marginRight: 8 }} />;
    }
    return <span style={{ marginRight: 8 }}>{emoji}</span>;
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Safe Category Editing"
        title="Customize ticket categories"
        description="Rename labels, rewrite descriptions, swap emojis, and assign destination staff roles while keeping the existing bot logic intact."
        action={canEditSettings && (
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ categoryOverrides: categories }, 'Categories saved')}>
            Save category settings
          </ActionButton>
        )}
      />

      <div className="card-grid">
        {categories.map((category) => (
          <div key={category.value} style={{ position: 'relative' }}>
            {!canEditSettings && <LockedOverlay tooltip={getLockTooltip('admin')} />}
            <SectionCard
              title={<>{renderEmoji(category.emoji)} {category.label}</>}
              description={`Internal value: ${category.value}`}
            >
              <div className="form-grid">
                <Field label="Emoji">
                  <TextInput value={category.emoji} onChange={(event) => updateCategory(category.value, 'emoji', event.target.value)} disabled={!canEditSettings} />
                </Field>

                <Field label="Label">
                  <TextInput value={category.label} onChange={(event) => updateCategory(category.value, 'label', event.target.value)} disabled={!canEditSettings} />
                </Field>

                <Field label="Description">
                  <TextArea rows={4} value={category.description} onChange={(event) => updateCategory(category.value, 'description', event.target.value)} disabled={!canEditSettings} />
                </Field>

                <Field label="Staff roles for this category" hint="(If left empty, the bot falls back to the original role routing.)">
                  <RolePicker
                    roles={snapshot.resources.roles}
                    selectedIds={category.roleIds}
                    onToggle={(roleId) => toggleRole(category.value, roleId)}
                    disabled={!canEditSettings}
                  />
                </Field>
              </div>
            </SectionCard>
          </div>
        ))}
      </div>
    </div>
  );
}
