import { useDraggable } from '@dnd-kit/core';
import type { Guest } from '../../types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    <Badge
      ref={setNodeRef}
      variant="outline"
      className={cn(
        'cursor-grab select-none touch-none whitespace-nowrap hover:bg-sidebar-accent transition-colors border-border text-foreground shadow-sm',
        isDragging && 'opacity-30',
        isOverlay && 'opacity-100 shadow-lg scale-105 cursor-grabbing'
      )}
      {...listeners}
      {...attributes}
    >
      {guest.name}
    </Badge>
  );
}
