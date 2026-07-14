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

function SortableTransferItem({ option, canEditSettings, snapshot, updateOption, toggleRole, removeOption, getLockTooltip }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: option.value, disabled: !canEditSettings });

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
            {renderEmoji(option.emoji)} {option.label}
          </div>
        }
        description={`Internal value: ${option.value}`}
        action={
          canEditSettings && (
            <button 
              type="button" 
              className="action-button" 
              onClick={() => removeOption(option.value)}
              style={{ padding: '8px', color: 'var(--error)', borderColor: 'var(--border)' }}
              title="Remove Transfer Option"
            >
              <Trash2 size={16} />
            </button>
          )
        }
      >
        <div className="form-grid">
          <Field label="Emoji">
            <TextInput value={option.emoji || ''} onChange={(event) => updateOption(option.value, 'emoji', event.target.value)} disabled={!canEditSettings} />
          </Field>

          <Field label="Label">
            <TextInput value={option.label} onChange={(event) => updateOption(option.value, 'label', event.target.value)} disabled={!canEditSettings} />
          </Field>

          <Field label="Roles to ping on transfer" hint="(If left empty, no one is pinged unless it matches a base ID array like staffRoleIds)">
            <RolePicker
              roles={snapshot.resources.roles}
              selectedIds={option.roleIds}
              onToggle={(roleId) => toggleRole(option.value, roleId)}
              disabled={!canEditSettings}
            />
          </Field>
        </div>
      </SectionCard>
    </div>
  );
}

export default function TransferOptions() {
  const { busy, saveSettings, snapshot } = useOutletContext();
  const { canEditSettings, getLockTooltip } = usePermissions();
  const [options, setOptions] = useState(snapshot.settings.transferOptions || []);

  useEffect(() => {
    setOptions(snapshot.settings.transferOptions || []);
  }, [snapshot]);

  const updateOption = (value, key, nextValue) => {
    setOptions((current) => current.map((opt) => (
      opt.value === value ? { ...opt, [key]: nextValue } : opt
    )));
  };

  const toggleRole = (value, roleId) => {
    if (!canEditSettings) return;
    setOptions((current) => current.map((opt) => {
      if (opt.value !== value) return opt;
      const hasRole = opt.roleIds.includes(roleId);
      return {
        ...opt,
        roleIds: hasRole
          ? opt.roleIds.filter((currentRoleId) => currentRoleId !== roleId)
          : [...opt.roleIds, roleId]
      };
    }));
  };

  const addOption = () => {
    if (!canEditSettings) return;
    setOptions((current) => [
      ...current,
      {
        value: `transfer_${Date.now()}`,
        label: 'New Transfer Option',
        emoji: '',
        roleIds: []
      }
    ]);
  };

  const removeOption = (value) => {
    if (!canEditSettings) return;
    setOptions((current) => current.filter((opt) => opt.value !== value));
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
      setOptions((items) => {
        const oldIndex = items.findIndex((item) => item.value === active.id);
        const newIndex = items.findIndex((item) => item.value === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Dynamic Transfer Roles"
        title="Customize transfer options"
        description="Configure exactly who a ticket can be transferred to, assigning labels, emojis, and roles."
        action={canEditSettings && (
          <ActionButton tone="primary" busy={busy} onClick={() => saveSettings({ transferOptions: options }, 'Transfer options saved')}>
            Save transfer options
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
            items={options.map(o => o.value)}
            strategy={rectSortingStrategy}
          >
            {options.map((option) => (
              <SortableTransferItem
                key={option.value}
                option={option}
                canEditSettings={canEditSettings}
                snapshot={snapshot}
                updateOption={updateOption}
                toggleRole={toggleRole}
                removeOption={removeOption}
                getLockTooltip={getLockTooltip}
              />
            ))}
          </SortableContext>
          
          {canEditSettings && (
            <button 
              type="button" 
              className="action-button tone-secondary" 
              onClick={addOption} 
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
              <Plus size={20} /> Add Transfer Option
            </button>
          )}
        </div>
      </DndContext>
    </div>
  );
}
