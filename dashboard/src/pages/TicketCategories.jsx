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
import { Trash2, Plus, ArrowUp, ArrowDown } from 'lucide-react';

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

  const addCategory = () => {
    if (!canEditSettings) return;
    setCategories((current) => [
      ...current,
      {
        value: `custom_${Date.now()}`,
        label: 'New Custom Category',
        description: 'Provide a description for your new category',
        emoji: '',
        roleIds: []
      }
    ]);
  };

  const removeCategory = (value) => {
    if (!canEditSettings) return;
    setCategories((current) => current.filter((category) => category.value !== value));
  };

  const moveUp = (index) => {
    if (!canEditSettings || index === 0) return;
    setCategories((current) => {
      const newCats = [...current];
      const temp = newCats[index - 1];
      newCats[index - 1] = newCats[index];
      newCats[index] = temp;
      return newCats;
    });
  };

  const moveDown = (index) => {
    if (!canEditSettings || index === categories.length - 1) return;
    setCategories((current) => {
      const newCats = [...current];
      const temp = newCats[index + 1];
      newCats[index + 1] = newCats[index];
      newCats[index] = temp;
      return newCats;
    });
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
        eyebrow="Dynamic Category Editing"
        title="Customize ticket categories"
        description="Add new custom categories, rewrite existing labels, swap emojis, assign staff roles, and remove unused categories."
        action={canEditSettings && (
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ categoryOverrides: categories }, 'Categories saved')}>
            Save category settings
          </ActionButton>
        )}
      />

      <div className="card-grid">
        {categories.map((category, index) => (
          <div key={category.value} style={{ position: 'relative' }}>
            {!canEditSettings && <LockedOverlay tooltip={getLockTooltip('admin')} />}
            <SectionCard
              title={<>{renderEmoji(category.emoji)} {category.label}</>}
              description={`Internal value: ${category.value}`}
              action={
                canEditSettings && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      type="button" 
                      className="action-button" 
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      style={{ padding: '8px', opacity: index === 0 ? 0.5 : 1 }}
                      title="Move Up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="action-button" 
                      onClick={() => moveDown(index)}
                      disabled={index === categories.length - 1}
                      style={{ padding: '8px', opacity: index === categories.length - 1 ? 0.5 : 1 }}
                      title="Move Down"
                    >
                      <ArrowDown size={16} />
                    </button>
                    <button 
                      type="button" 
                      className="action-button" 
                      onClick={() => removeCategory(category.value)}
                      style={{ padding: '8px', color: 'var(--error)', borderColor: 'var(--border)' }}
                      title="Remove Category"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )
              }
            >
              <div className="form-grid">
                <Field label="Emoji">
                  <TextInput value={category.emoji || ''} onChange={(event) => updateCategory(category.value, 'emoji', event.target.value)} disabled={!canEditSettings} />
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
        
        {canEditSettings && (
          <button 
            type="button" 
            className="action-button tone-secondary" 
            onClick={addCategory} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: 8, 
              padding: '24px', 
              borderStyle: 'dashed',
              background: 'transparent'
            }}
          >
            <Plus size={20} /> Add New Category
          </button>
        )}
      </div>
    </div>
  );
}
