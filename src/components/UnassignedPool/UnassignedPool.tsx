import { useDroppable } from '@dnd-kit/core';
import { useWedding } from '../../state/WeddingContext';
import { GuestChip } from '../Guest/GuestChip';
import './UnassignedPool.css';

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
      className={`unassigned-pool ${isOver ? 'unassigned-pool--over' : ''}`}
    >
      <h3 className="unassigned-pool__title">
        Unassigned ({unassignedGuests.length})
      </h3>
      {unassignedGuests.length === 0 ? (
        <p className="unassigned-pool__empty">
          {state.guests.length === 0
            ? 'Add guests using the panel on the left'
            : 'All guests have been assigned!'}
        </p>
      ) : (
        <div className="unassigned-pool__list">
          {unassignedGuests.map((guest) => (
            <GuestChip key={guest.id} guest={guest} />
          ))}
        </div>
      )}
    </div>
  );
}
