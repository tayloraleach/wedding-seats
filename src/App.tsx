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
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  HelpCircle,
  EllipsisVertical,
  Upload,
  Download,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Monitor } from 'lucide-react';
import type { Guest, WeddingState } from './types';

function MobileOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex md:hidden items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center text-center gap-4 max-w-sm">
        <Monitor className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
          Desktop Required
        </h2>
        <p className="text-muted-foreground">
          Planning your wedding seating chart works best on a larger screen. Please switch to a desktop or laptop computer for the full experience.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [state, dispatch] = usePersistedState();
  const [activeGuest, setActiveGuest] = useState<Guest | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [poolOpen, setPoolOpen] = useState(true);
  const [alertAction, setAlertAction] = useState<'reset' | 'import' | null>(null);
  const [pendingImportState, setPendingImportState] = useState<WeddingState | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
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
          setPendingImportState(parsed as WeddingState);
          setAlertAction('import');
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

  const handleConfirmAlert = () => {
    if (alertAction === 'reset') {
      dispatch({ type: 'RESET' });
    } else if (alertAction === 'import' && pendingImportState) {
      dispatch({ type: 'LOAD_STATE', state: pendingImportState });
      setPendingImportState(null);
    }
    setAlertAction(null);
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
    <TooltipProvider>
      <WeddingContext.Provider value={{ state, dispatch }}>
        <MobileOverlay />
        <div className="flex flex-col h-screen overflow-hidden">
          <header className="flex items-center justify-between px-6 py-4 bg-background border-b">
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>👰‍♀️🤵‍♂️ Wedding Seating Chart</h1>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon-sm" aria-label="Help & info">
                    <HelpCircle className="size-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" className="max-w-[240px] text-xs">
                  <p className="font-semibold mb-1">Controls</p>
                  <ul className="list-disc pl-4 mb-2 space-y-0.5">
                    <li>Scroll wheel — zoom in/out</li>
                    <li>Space + drag — pan around</li>
                    <li>Drag guests to seats or back to unassigned</li>
                  </ul>
                  <p className="font-semibold mb-1">Storage</p>
                  <p>Data is saved automatically to local storage. Nothing is sent to a server.</p>
                </TooltipContent>
              </Tooltip>
              <input
                ref={importFileRef}
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon-sm" aria-label="Menu">
                    <EllipsisVertical className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleImportClick}>
                    <Upload className="size-3.5" /> Import JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExport}>
                    <Download className="size-3.5" /> Export JSON
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => setAlertAction('reset')}
                  >
                    <Trash2 className="size-3.5" /> Reset all data
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <div className="flex flex-1 overflow-hidden">
            <Collapsible open={sidebarOpen} onOpenChange={setSidebarOpen} className="flex">
              <CollapsibleContent className="w-[320px] min-w-[320px] overflow-hidden data-[state=closed]:w-0 data-[state=closed]:min-w-0 transition-all duration-250">
                <ControlPanel />
              </CollapsibleContent>
              <CollapsibleTrigger asChild>
                <button
                  className="w-6 min-w-6 border-r bg-background text-muted-foreground hover:bg-secondary hover:text-foreground flex items-center justify-center transition-colors"
                  aria-label={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                  title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                >
                  {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
                </button>
              </CollapsibleTrigger>
            </Collapsible>
            <div className="flex-1 flex flex-col overflow-hidden">
              <DndContext
                sensors={sensors}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}
              >
                <FloorPlan />
                <Collapsible open={poolOpen} onOpenChange={setPoolOpen}>
                  <CollapsibleTrigger asChild>
                    <button
                      className="flex items-center justify-center gap-1.5 w-full py-1 px-3 border-t bg-background text-muted-foreground text-xs hover:bg-secondary hover:text-foreground transition-colors"
                      aria-label={poolOpen ? 'Hide unassigned guests' : 'Show unassigned guests'}
                      title={poolOpen ? 'Hide unassigned guests' : 'Show unassigned guests'}
                    >
                      {poolOpen ? <><ChevronDown size={12} /> Hide</> : <><ChevronUp size={12} /> Unassigned</>}
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <UnassignedPool />
                  </CollapsibleContent>
                </Collapsible>
                <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
                  {activeGuest ? <GuestChip guest={activeGuest} isOverlay /> : null}
                </DragOverlay>
              </DndContext>
            </div>
          </div>
        </div>

        <AlertDialog open={alertAction !== null} onOpenChange={(open) => { if (!open) { setAlertAction(null); setPendingImportState(null); } }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {alertAction === 'reset' ? 'Reset all data?' : 'Import data?'}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {alertAction === 'reset'
                  ? 'This will remove all guests, tables, and seating assignments. This action cannot be undone.'
                  : 'This will replace all current data with the imported file. This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmAlert}>
                {alertAction === 'reset' ? 'Reset' : 'Import'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </WeddingContext.Provider>
    </TooltipProvider>
  );
}

export default App;
