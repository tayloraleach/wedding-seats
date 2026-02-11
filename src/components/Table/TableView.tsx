import { useMemo, useRef, useCallback } from 'react';
import type { Table } from '../../types';
import { useWedding } from '../../state/WeddingContext';
import { getRoundSeatPositions, getRectangleSeatPositions } from '../../utils/seatGeometry';
import { TableSurface } from './TableSurface';
import { SeatSlot } from './SeatSlot';
import './TableView.css';

interface TableViewProps {
  table: Table;
}

const SEAT_OFFSET = 40; // how far seats sit from the table edge
const TABLE_ROUND_RADIUS = 70;
const TABLE_RECT_WIDTH = 80;
const TABLE_RECT_HEIGHT = 200;

export function TableView({ table }: TableViewProps) {
  const { dispatch } = useWedding();
  const dragRef = useRef<{ startX: number; startY: number; tableX: number; tableY: number } | null>(null);

  const containerSize = useMemo(() => {
    if (table.shape === 'round') {
      const totalRadius = TABLE_ROUND_RADIUS + SEAT_OFFSET + 32;
      return { width: totalRadius * 2, height: totalRadius * 2 };
    }
    return {
      width: TABLE_RECT_WIDTH + (SEAT_OFFSET + 32) * 2,
      height: TABLE_RECT_HEIGHT + (32) * 2,
    };
  }, [table.shape]);

  const seatPositions = useMemo(() => {
    const cx = containerSize.width / 2;
    const cy = containerSize.height / 2;

    if (table.shape === 'round') {
      const seatRadius = TABLE_ROUND_RADIUS + SEAT_OFFSET;
      return getRoundSeatPositions(table.seatCount, seatRadius, { x: cx, y: cy });
    }

    // Rectangle: seats only on left and right long edges
    const rawPositions = getRectangleSeatPositions(
      table.seatCount,
      TABLE_RECT_WIDTH,
      TABLE_RECT_HEIGHT
    );

    // Offset positions so the table is centered in the container
    const tableLeft = cx - TABLE_RECT_WIDTH / 2;
    const tableTop = cy - TABLE_RECT_HEIGHT / 2;

    return rawPositions.map((p) => {
      // Seats are on left (x=0) or right (x=width) edge, push them outward
      const isLeft = p.x === 0;
      return {
        x: isLeft ? tableLeft - SEAT_OFFSET : tableLeft + TABLE_RECT_WIDTH + SEAT_OFFSET,
        y: tableTop + p.y,
      };
    });
  }, [table.shape, table.seatCount, containerSize]);

  const surfaceWidth = table.shape === 'round' ? TABLE_ROUND_RADIUS * 2 : TABLE_RECT_WIDTH;
  const surfaceHeight = table.shape === 'round' ? TABLE_ROUND_RADIUS * 2 : TABLE_RECT_HEIGHT;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only drag on primary button
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        tableX: table.x,
        tableY: table.y,
      };
    },
    [table.x, table.y]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragRef.current) return;
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      dispatch({
        type: 'MOVE_TABLE',
        tableId: table.id,
        x: Math.max(0, dragRef.current.tableX + dx),
        y: Math.max(0, dragRef.current.tableY + dy),
      });
    },
    [table.id, dispatch]
  );

  const handlePointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  return (
    <div
      className="table-view"
      style={{
        width: containerSize.width,
        height: containerSize.height,
        position: 'absolute',
        left: table.x,
        top: table.y,
      }}
    >
      <TableSurface
        shape={table.shape}
        width={surfaceWidth}
        height={surfaceHeight}
        label={table.label}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
      {seatPositions.map((pos, i) => (
        <SeatSlot
          key={i}
          tableId={table.id}
          seatIndex={i}
          x={pos.x}
          y={pos.y}
        />
      ))}
    </div>
  );
}
