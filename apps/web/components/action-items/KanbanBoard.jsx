import React, { useEffect, useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import KanbanColumn from './KanbanColumn';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

const COLUMNS = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function KanbanBoard({ items, workspaceId, onItemsChange, onCardClick }) {
  // Required for @hello-pangea/dnd in Next.js Strict Mode
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Find the item
    const draggedItem = items.find((i) => i.id === draggableId);
    if (!draggedItem) return;

    const sourceCol = source.droppableId;
    const destCol = destination.droppableId;

    // Optimistically update
    const newItems = Array.from(items);
    
    // Remove from old position (conceptually, though our items is a flat array)
    // Actually, we just need to update the status and re-sort.
    // The backend uses `status` and `position` for sorting, but in this flat array we rely on the server 
    // to give us the final order or we emulate it.
    // For Kanban, we filter the flat array per column.
    
    const destItems = newItems.filter(i => i.status === destCol).sort((a,b) => a.position - b.position);
    
    // We update the dragged item's status
    const itemIndex = newItems.findIndex(i => i.id === draggableId);
    newItems[itemIndex] = { ...newItems[itemIndex], status: destCol };

    // Pass the optimistic array up so UI feels instant
    onItemsChange(newItems);

    try {
      await api.post(`/workspaces/${workspaceId}/action-items/${draggableId}/move`, {
        status: destCol,
        position: destination.index, // The exact position in the new column
      });
      // The socket will broadcast the final state, which our page.jsx listens to
    } catch (err) {
      toast.error('Failed to move item');
      // Rollback would happen via refetch or parent passing back old items
      // To be completely safe, we could tell parent to refetch
    }
  };

  if (!mounted) return <div style={{ padding: '20px', color: 'var(--text-tertiary)' }}>Loading board...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: '20px', height: '100%', overflowX: 'auto', paddingBottom: '10px' }}>
        {COLUMNS.map((colId) => {
          // Get items for this column and sort by position
          const columnItems = items
            .filter((i) => i.status === colId)
            .sort((a, b) => a.position - b.position);

          return (
            <KanbanColumn 
              key={colId} 
              columnId={colId} 
              items={columnItems} 
              onCardClick={onCardClick} 
            />
          );
        })}
      </div>
    </DragDropContext>
  );
}
