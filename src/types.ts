export type TableShape = 'round' | 'rectangle';

export interface Guest {
  id: string;
  name: string;
}

export type TableOrientation = 'vertical' | 'horizontal';

export interface Table {
  id: string;
  label: string;
  shape: TableShape;
  orientation?: TableOrientation;
  seatCount: number;
  x: number;
  y: number;
}

// Maps "tableId:seatIndex" => guestId
export type SeatAssignments = Record<string, string>;

export interface WeddingState {
  guests: Guest[];
  tables: Table[];
  seatAssignments: SeatAssignments;
}

export type Action =
  | { type: 'ADD_GUEST'; name: string }
  | { type: 'REMOVE_GUEST'; guestId: string }
  | { type: 'IMPORT_GUESTS'; names: string[] }
  | { type: 'ADD_TABLE' }
  | { type: 'REMOVE_TABLE'; tableId: string }
  | { type: 'UPDATE_TABLE'; tableId: string; changes: Partial<Pick<Table, 'label' | 'shape' | 'seatCount' | 'orientation'>> }
  | { type: 'ASSIGN_SEAT'; guestId: string; tableId: string; seatIndex: number }
  | { type: 'UNASSIGN_GUEST'; guestId: string }
  | { type: 'MOVE_GUEST'; guestId: string; toTableId: string; toSeatIndex: number }
  | { type: 'SWAP_GUESTS'; seatKeyA: string; seatKeyB: string }
  | { type: 'MOVE_TABLE'; tableId: string; x: number; y: number };
