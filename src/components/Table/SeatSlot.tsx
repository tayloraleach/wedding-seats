import { useDroppable } from '@dnd-kit/core';
import { useWedding } from '../../state/WeddingContext';
import { GuestChip } from '../Guest/GuestChip';
import { seatKey } from '../../utils/ids';
import { cn } from '@/lib/utils';

interface SeatSlotProps {
  tableId: string;
  seatIndex: number;
  x?: number;
  y?: number;
  align?: 'left' | 'right' | 'up' | 'down';
  flow?: boolean;
}

export function SeatSlot({ tableId, seatIndex, x, y, align, flow }: SeatSlotProps) {
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
      className={cn(
        'flex items-center justify-center rounded-2xl border-2 border-dashed transition-all z-[1] whitespace-nowrap',
        flow ? 'relative' : 'absolute',
        guest
          ? 'w-auto border-none bg-transparent'
          : 'w-16 h-8 border-border bg-secondary',
        isOver && 'border-primary bg-accent shadow-[0_0_0_3px_var(--accent)]'
      )}
      style={flow ? undefined : {
        left: x,
        top: y,
        transform:
          align === 'left' ? 'translate(0%, -50%)'
          : align === 'right' ? 'translate(-100%, -50%)'
          : align === 'up' ? 'translate(-50%, -100%)'
          : align === 'down' ? 'translate(-50%, 0%)'
          : 'translate(-50%, -50%)',
      }}
      title={guest ? guest.name : `Seat ${seatIndex + 1}`}
    >
      {guest ? (
        <GuestChip guest={guest} fromSeatKey={key} />
      ) : (
        <span className="text-[11px] text-muted-foreground font-medium">{seatIndex + 1}</span>
      )}
    </div>
  );
}
