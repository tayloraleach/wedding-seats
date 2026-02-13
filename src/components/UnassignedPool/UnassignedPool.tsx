import { useDroppable } from '@dnd-kit/core';
import { useWedding } from '../../state/WeddingContext';
import { GuestChip } from '../Guest/GuestChip';
import { cn } from '@/lib/utils';

export function UnassignedPool() {
  const { state } = useWedding();
  const { setNodeRef, isOver } = useDroppable({
    id: 'unassigned-pool',
    data: { type: 'unassigned-pool' },
  });

  const assignedGuestIds = new Set(Object.values(state.seatAssignments));
  const unassignedGuests = state.guests
    .filter((g) => !assignedGuestIds.has(g.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'px-5 py-4 bg-background border-t min-h-[80px] transition-colors',
        isOver && 'bg-accent'
      )}
    >
      <h3 className="text-sm font-semibold mb-3">
        Unassigned ({unassignedGuests.length})
      </h3>
      {unassignedGuests.length === 0 ? (
        <p className="text-sm text-muted-foreground italic m-0">
          {state.guests.length === 0
            ? 'Add guests using the panel on the left'
            : 'All guests have been assigned!'}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {unassignedGuests.map((guest) => (
            <GuestChip key={guest.id} guest={guest} />
          ))}
        </div>
      )}
    </div>
  );
}
