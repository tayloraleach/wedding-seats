import { useDraggable } from '@dnd-kit/core';
import type { Guest } from '../../types';
import './GuestChip.css';

interface GuestChipProps {
  guest: Guest;
  fromSeatKey?: string | null;
  isOverlay?: boolean;
}

export function GuestChip({ guest, fromSeatKey, isOverlay }: GuestChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `guest:${guest.id}`,
    data: {
      type: 'guest',
      guest,
      fromSeatKey: fromSeatKey ?? null,
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`guest-chip ${isDragging ? 'guest-chip--dragging' : ''} ${isOverlay ? 'guest-chip--overlay' : ''}`}
      {...listeners}
      {...attributes}
    >
      {guest.name}
    </div>
  );
}
