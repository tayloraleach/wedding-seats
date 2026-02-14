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
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-grab touch-none bg-card border-2 border-border shadow-sm"
      style={{
        width,
        height,
        borderRadius: shape === 'round' ? '50%' : 8,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <span className="text-[13px] font-semibold text-muted-foreground text-center p-2 leading-tight pointer-events-none" style={{ fontFamily: "'Playfair Display', serif" }}>
        {label}
      </span>
    </div>
  );
}
