import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import ActionItemCard from './ActionItemCard';

const STATUS_CONFIG = {
  TODO: { label: 'To Do', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' },
  IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
  IN_REVIEW: { label: 'In Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
  DONE: { label: 'Done', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
};

export default function KanbanColumn({ columnId, items, onCardClick }) {
  const config = STATUS_CONFIG[columnId] || STATUS_CONFIG.TODO;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      width: '300px', minWidth: '300px',
      background: 'var(--bg-secondary)',
      borderRadius: '12px',
      height: '100%',
      maxHeight: '100%',
      border: '1px solid var(--border-primary)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: config.color }} />
          <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Syne', sans-serif" }}>
            {config.label}
          </h3>
        </div>
        <div style={{
          background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
          borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)'
        }}>
          {items.length}
        </div>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            style={{
              flex: 1,
              padding: '12px',
              overflowY: 'auto',
              transition: 'background-color 0.2s',
              background: snapshot.isDraggingOver ? config.bg : 'transparent',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
            }}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(dragProvided) => (
                  <ActionItemCard
                    item={item}
                    innerRef={dragProvided.innerRef}
                    draggableProps={dragProvided.draggableProps}
                    dragHandleProps={dragProvided.dragHandleProps}
                    onClick={() => onCardClick(item)}
                  />
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
