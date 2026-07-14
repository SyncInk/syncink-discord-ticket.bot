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
import { Trash2, Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCategoryItem({ category, canEditSettings, snapshot, updateCategory, toggleRole, removeCategory, getLockTooltip, openConfirm }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.value, disabled: !canEditSettings });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const renderEmoji = (emoji) => {
    if (!emoji) return null;
    if (/^\d+$/.test(emoji)) {
      return <img src={`https://cdn.discordapp.com/emojis/${emoji}.png`} alt="emoji" style={{ width: 24, height: 24, verticalAlign: 'middle', marginRight: 8 }} />;
    }
    return <span style={{ marginRight: 8 }}>{emoji}</span>;
  };

  return (
    <div ref={setNodeRef} style={style}>
      {!canEditSettings && <LockedOverlay tooltip={getLockTooltip('admin')} />}
      <SectionCard
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {canEditSettings && (
              <div {...attributes} {...listeners} style={{ cursor: 'grab', display: 'flex', alignItems: 'center', marginRight: '4px' }} title="Drag to reorder">
                <GripVertical size={20} color="var(--text-muted)" />
              </div>
            )}
            {renderEmoji(category.emoji)} {category.label}
          </div>
        }
        description={`Internal value: ${category.value}`}
        action={
          canEditSettings && (
            <button 
              type="button" 
              className="action-button" 
              onClick={() => {
                openConfirm({
                  title: 'Delete Category',
                  message: `Are you sure you want to delete the "${category.label || 'Unknown'}" category? This cannot be undone.`,
                  confirmText: 'Delete Category',
                  danger: true
                }, () => removeCategory(category.value));
              }}
              style={{ padding: '8px', color: 'var(--error)', borderColor: 'var(--border)', height: 'fit-content', minHeight: 'unset' }}
              title="Remove Category"
            >
              <Trash2 size={16} />
            </button>
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
  );
}

export default function TicketCategories() {
  const { busy, saveSettings, snapshot, setUnsavedChanges, setSaveAction, openConfirm } = useOutletContext();
  const { canEditSettings, getLockTooltip } = usePermissions();
  const [categories, setCategories] = useState(snapshot.settings.categoryOverrides);

  useEffect(() => {
    setCategories(snapshot.settings.categoryOverrides);
  }, [snapshot]);

  useEffect(() => {
    const isDirty = JSON.stringify(categories) !== JSON.stringify(snapshot.settings.categoryOverrides);
    setUnsavedChanges(isDirty);
    
    if (isDirty) {
      setSaveAction(() => async () => {
        await saveSettings({ categoryOverrides: categories }, 'Categories saved');
      });
    } else {
      setSaveAction(null);
    }
    
    return () => {
      setUnsavedChanges(false);
      setSaveAction(null);
    };
  }, [categories, snapshot.settings.categoryOverrides, setUnsavedChanges, setSaveAction]);

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active && over && active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((item) => item.value === active.id);
        const newIndex = items.findIndex((item) => item.value === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Dynamic Category Editing"
        title="Customize ticket categories"
        description="Add new custom categories, rewrite existing labels, swap emojis, assign staff roles, and drag to reorder."
        action={canEditSettings && (
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ categoryOverrides: categories }, 'Categories saved')}>
            Save category settings
          </ActionButton>
        )}
      />

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="card-grid">
          <SortableContext 
            items={categories.map(c => c.value)}
            strategy={rectSortingStrategy}
          >
            {categories.map((category) => (
              <SortableCategoryItem
                key={category.value}
                category={category}
                canEditSettings={canEditSettings}
                snapshot={snapshot}
                updateCategory={updateCategory}
                toggleRole={toggleRole}
                removeCategory={removeCategory}
                getLockTooltip={getLockTooltip}
                openConfirm={openConfirm}
              />
            ))}
          </SortableContext>
          
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
      </DndContext>
    </div>
  );
}
