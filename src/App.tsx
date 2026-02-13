import { useState, useCallback, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import { usePersistedState } from './hooks/usePersistedState';
import { WeddingContext } from './state/WeddingContext';
import { ControlPanel } from './components/ControlPanel/ControlPanel';
import { FloorPlan } from './components/FloorPlan/FloorPlan';
import { UnassignedPool } from './components/UnassignedPool/UnassignedPool';
import { GuestChip } from './components/Guest/GuestChip';
import { seatKey } from './utils/ids';
import type { Guest } from './types';
import './App.css';

function App() {
  const [state, dispatch] = usePersistedState();
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const infoTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleReset = () => {
    if (window.confirm('This will remove all guests, tables, and seating assignments. Continue?')) {
      dispatch({ type: 'RESET' });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current;
      if (data?.type === 'guest') {
        setActiveGuest(data.guest as Guest);
      }
    },
    []
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveGuest(null);
      const { active, over } = event;

      if (!over) return;

      const dragData = active.data.current;
      if (!dragData || dragData.type !== 'guest') return;

      const guest = dragData.guest as Guest;
      const fromSeatKey = dragData.fromSeatKey as string | null;
      const dropId = over.id as string;

      if (dropId === 'unassigned-pool') {
        dispatch({ type: 'UNASSIGN_GUEST', guestId: guest.id });
        return;
      }

      if (dropId.startsWith('seat:')) {
        const parts = dropId.split(':');
        const tableId = parts[1];
        const seatIndex = parseInt(parts[2], 10);
        const targetKey = seatKey(tableId, seatIndex);

        const existingGuestId = state.seatAssignments[targetKey];

        if (existingGuestId && existingGuestId !== guest.id) {
          if (fromSeatKey) {
            dispatch({ type: 'SWAP_GUESTS', seatKeyA: fromSeatKey, seatKeyB: targetKey });
          } else {
            dispatch({ type: 'UNASSIGN_GUEST', guestId: existingGuestId });
            dispatch({ type: 'ASSIGN_SEAT', guestId: guest.id, tableId, seatIndex });
          }
        } else {
          dispatch({ type: 'MOVE_GUEST', guestId: guest.id, toTableId: tableId, toSeatIndex: seatIndex });
        }
      }
    },
    [state.seatAssignments, dispatch]
  );

  const handleDragCancel = useCallback(() => {
    setActiveGuest(null);
  }, []);

  return (
    <WeddingContext.Provider value={{ state, dispatch }}>
      <div className="app">
        <header className="app__header">
          <h1>Wedding Seating Chart</h1>
          <div className="app__header-actions">
            <div
              className="app__info-wrapper"
              onMouseEnter={() => {
                clearTimeout(infoTimeout.current);
                setShowInfo(true);
              }}
              onMouseLeave={() => {
                infoTimeout.current = setTimeout(() => setShowInfo(false), 150);
              }}
            >
              <button className="app__info-btn" aria-label="Storage info">?</button>
              {showInfo && (
                <div className="app__info-tooltip">
                  Your data is saved automatically to this browser's local storage. Nothing is sent to a server.
                </div>
              )}
            </div>
            <button className="app__reset-btn" onClick={handleReset}>
              Reset
            </button>
          </div>
        </header>
        <div className="app__body">
          <ControlPanel />
          <div className="app__main">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <FloorPlan />
              <UnassignedPool />
              <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                {activeGuest ? <GuestChip guest={activeGuest} isOverlay /> : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>
      </div>
    </WeddingContext.Provider>
  );
}

export default App;
