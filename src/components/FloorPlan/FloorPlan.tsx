import { useState, useCallback, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useWedding } from '../../state/WeddingContext';
import { TableView } from '../Table/TableView';
import './FloorPlan.css';

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 1.5;
const ZOOM_SENSITIVITY = 0.002;
const BUTTON_ZOOM_STEP = 0.05;

function clampZoom(z: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(z * 100) / 100));
}

export function FloorPlan() {
  const { state } = useWedding();
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Keep a ref in sync so the wheel handler always reads latest values
  const viewRef = useRef({ zoom: 1, panX: 0, panY: 0 });
  viewRef.current = { zoom, panX: pan.x, panY: pan.y };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const prev = viewRef.current;
      const newZoom = clampZoom(prev.zoom * (1 - e.deltaY * ZOOM_SENSITIVITY));
      const ratio = newZoom / prev.zoom;

      const newPanX = mx - (mx - prev.panX) * ratio;
      const newPanY = my - (my - prev.panY) * ratio;

      viewRef.current = { zoom: newZoom, panX: newPanX, panY: newPanY };
      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Space key tracking for pan mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        setSpaceHeld(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpaceHeld(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if ((spaceHeld && e.button === 0) || e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      }
    },
    [spaceHeld, pan]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - panStart.current.x;
      const dy = e.clientY - panStart.current.y;
      const newPan = { x: panStart.current.panX + dx, y: panStart.current.panY + dy };
      viewRef.current = { ...viewRef.current, panX: newPan.x, panY: newPan.y };
      setPan(newPan);
    },
    [isPanning]
  );

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const zoomIn = () => {
    const newZoom = clampZoom(zoom + BUTTON_ZOOM_STEP);
    viewRef.current = { ...viewRef.current, zoom: newZoom };
    setZoom(newZoom);
  };
  const zoomOut = () => {
    const newZoom = clampZoom(zoom - BUTTON_ZOOM_STEP);
    viewRef.current = { ...viewRef.current, zoom: newZoom };
    setZoom(newZoom);
  };
  const zoomReset = () => {
    viewRef.current = { zoom: 1, panX: 0, panY: 0 };
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const zoomPercent = Math.round(zoom * 100);
  const cursorClass = spaceHeld ? (isPanning ? 'floor-plan--grabbing' : 'floor-plan--grab') : '';

  return (
    <div
      className={`floor-plan ${cursorClass}`}
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {state.tables.length === 0 ? (
        <div className="floor-plan__empty">
          <p>No tables yet. Add tables using the panel on the left.</p>
        </div>
      ) : (
        <div
          className="floor-plan__canvas"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'top left',
          }}
        >
          {state.tables.map((table) => (
            <TableView key={table.id} table={table} />
          ))}
        </div>
      )}
      <div className="floor-plan__zoom-controls">
        <button onClick={zoomOut} disabled={zoom <= MIN_ZOOM} title="Zoom out"><ZoomOut size={14} /></button>
        <button onClick={zoomReset} className="floor-plan__zoom-label" title="Reset zoom">{zoomPercent}%</button>
        <button onClick={zoomIn} disabled={zoom >= MAX_ZOOM} title="Zoom in"><ZoomIn size={14} /></button>
      </div>
    </div>
  );
}
