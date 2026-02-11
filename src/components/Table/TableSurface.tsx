import type { TableShape } from '../../types';

interface TableSurfaceProps {
  shape: TableShape;
  width: number;
  height: number;
  label: string;
  onPointerDown?: (e: React.PointerEvent) => void;
  onPointerMove?: (e: React.PointerEvent) => void;
  onPointerUp?: (e: React.PointerEvent) => void;
}

export function TableSurface({ shape, width, height, label, onPointerDown, onPointerMove, onPointerUp }: TableSurfaceProps) {
  return (
    <div
      className="table-surface"
      style={{
        width,
        height,
        borderRadius: shape === 'round' ? '50%' : 8,
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'var(--table-bg)',
        border: '2px solid var(--table-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
        touchAction: 'none',
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--table-text)',
          textAlign: 'center',
          padding: 8,
          lineHeight: 1.2,
          pointerEvents: 'none',
        }}
      >
        {label}
      </span>
    </div>
  );
}
