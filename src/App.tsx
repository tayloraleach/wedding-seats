import { useState, useCallback, useRef, useEffect } from 'react';
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
import type { Guest, WeddingState } from './types';
import './App.css';

function App() {
  const [state, dispatch] = usePersistedState();
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [poolCollapsed, setPoolCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const infoTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const importFileRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [menuOpen]);

  const handleExport = () => {
    setMenuOpen(false);
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wedding-seating.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setMenuOpen(false);
    importFileRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && Array.isArray(parsed.guests) && Array.isArray(parsed.tables) && parsed.seatAssignments) {
          if (window.confirm('This will replace all current data. Continue?')) {
            dispatch({ type: 'LOAD_STATE', state: parsed as WeddingState });
          }
        } else if (Array.isArray(parsed)) {
          const names = parsed.filter((item): item is string => typeof item === 'string');
          if (names.length > 0) {
            dispatch({ type: 'IMPORT_GUESTS', names });
          } else {
            alert('JSON array contained no valid name strings.');
          }
        } else {
          alert('Unrecognized format. Expected a full state export or an array of guest names.');
        }
      } catch {
        alert('Invalid JSON file.');
      }
      if (importFileRef.current) importFileRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    setMenuOpen(false);
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
              <button className="app__info-btn" aria-label="Help &amp; info">?</button>
              {showInfo && (
                <div className="app__info-tooltip">
                  <strong>Controls</strong>
                  <ul className="app__info-list">
                    <li>Scroll wheel — zoom in/out</li>
                    <li>Space + drag — pan around</li>
                    <li>Drag guests to seats or back to unassigned</li>
                  </ul>
                  <strong>Storage</strong>
                  <p className="app__info-text">
                    Data is saved automatically to local storage. Nothing is sent to a server.
                  </p>
                </div>
              )}
            </div>
            <input
              ref={importFileRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="app__file-input"
            />
            <div className="app__menu-wrapper" ref={menuRef}>
              <button
                className="app__menu-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Menu"
              >
                Menu
              </button>
              {menuOpen && (
                <div className="app__menu-dropdown">
                  <button className="app__menu-item" onClick={handleImportClick}>
                    Import JSON
                  </button>
                  <button className="app__menu-item" onClick={handleExport}>
                    Export JSON
                  </button>
                  <hr className="app__menu-divider" />
                  <button className="app__menu-item app__menu-item--danger" onClick={handleReset}>
                    Reset all data
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="app__body">
          <div className={`app__sidebar ${sidebarCollapsed ? 'app__sidebar--collapsed' : ''}`}>
            <ControlPanel />
          </div>
          <button
            className="app__sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            aria-label={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
          >
            {sidebarCollapsed ? '›' : '‹'}
          </button>
          <div className="app__main">
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <FloorPlan />
              <div className={`app__pool ${poolCollapsed ? 'app__pool--collapsed' : ''}`}>
                <button
                  className="app__pool-toggle"
                  onClick={() => setPoolCollapsed(!poolCollapsed)}
                  aria-label={poolCollapsed ? 'Show unassigned guests' : 'Hide unassigned guests'}
                  title={poolCollapsed ? 'Show unassigned guests' : 'Hide unassigned guests'}
                >
                  {poolCollapsed ? '▲ Unassigned' : '▼ Hide'}
                </button>
                <UnassignedPool />
              </div>
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
