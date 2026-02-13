import { useDroppable } from '@dnd-kit/core';
import { useWedding } from '../../state/WeddingContext';
import { GuestChip } from '../Guest/GuestChip';
import { seatKey } from '../../utils/ids';
import './SeatSlot.css';

interface SeatSlotProps {
  tableId: string;
  seatIndex: number;
  x: number;
  y: number;
  align?: 'left' | 'right';
}

export function SeatSlot({ tableId, seatIndex, x, y, align }: SeatSlotProps) {
  const { state } = useWedding();
  const key = seatKey(tableId, seatIndex);
  const guestId = state.seatAssignments[key];
  const guest = guestId ? state.guests.find((g) => g.id === guestId) : null;

  const { setNodeRef, isOver } = useDroppable({
    id: `seat:${tableId}:${seatIndex}`,
    data: { type: 'seat', tableId, seatIndex },
  });

  return (
    <div
      ref={setNodeRef}
      className={`seat-slot ${isOver ? 'seat-slot--over' : ''} ${guest ? 'seat-slot--occupied' : ''}`}
      style={{
        left: x,
        top: y,
        transform: align === 'left'
          ? 'translate(0%, -50%)'
          : align === 'right'
            ? 'translate(-100%, -50%)'
            : 'translate(-50%, -50%)',
      }}
      title={guest ? guest.name : `Seat ${seatIndex + 1}`}
    >
      {guest ? (
        <GuestChip guest={guest} fromSeatKey={key} />
      ) : (
        <span className="seat-slot__number">{seatIndex + 1}</span>
      )}
    </div>
  );
}
