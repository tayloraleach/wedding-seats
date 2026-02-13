import type { WeddingState, Action } from '../types';
import { generateId, seatKey } from '../utils/ids';

export const DEFAULT_STATE: WeddingState = {
  guests: [],
  tables: [],
  seatAssignments: {},
};

export function weddingReducer(state: WeddingState, action: Action): WeddingState {
  switch (action.type) {
    case 'ADD_GUEST': {
      const newGuest = { id: generateId(), name: action.name };
      return { ...state, guests: [newGuest, ...state.guests] };
    }

    case 'REMOVE_GUEST': {
      // Remove guest and clean up any seat assignment
      const newAssignments = { ...state.seatAssignments };
      for (const [key, guestId] of Object.entries(newAssignments)) {
        if (guestId === action.guestId) {
          delete newAssignments[key];
        }
      }
      return {
        ...state,
        guests: state.guests.filter((g) => g.id !== action.guestId),
        seatAssignments: newAssignments,
      };
    }

    case 'IMPORT_GUESTS': {
      const newGuests = action.names
        .map((n) => n.trim())
        .filter((n) => n.length > 0)
        .map((name) => ({ id: generateId(), name }));
      return { ...state, guests: [...state.guests, ...newGuests] };
    }

    case 'ADD_TABLE': {
      const tableNumber = state.tables.length + 1;
      // Stagger initial positions so tables don't stack on top of each other
      const col = (state.tables.length % 3);
      const row = Math.floor(state.tables.length / 3);
      const newTable = {
        id: generateId(),
        label: `Table ${tableNumber}`,
        shape: 'round' as const,
        seatCount: 8,
        x: 40 + col * 320,
        y: 40 + row * 320,
      };
      return { ...state, tables: [newTable, ...state.tables] };
    }

    case 'REMOVE_TABLE': {
      // Remove table and clean up all seat assignments for that table
      const newAssignments = { ...state.seatAssignments };
      for (const key of Object.keys(newAssignments)) {
        if (key.startsWith(`${action.tableId}:`)) {
          delete newAssignments[key];
        }
      }
      return {
        ...state,
        tables: state.tables.filter((t) => t.id !== action.tableId),
        seatAssignments: newAssignments,
      };
    }

    case 'UPDATE_TABLE': {
      const newAssignments = { ...state.seatAssignments };
      const table = state.tables.find((t) => t.id === action.tableId);

      // If seat count is being reduced, remove assignments for overflow seats
      if (action.changes.seatCount !== undefined && table) {
        const newCount = action.changes.seatCount;
        for (let i = newCount; i < table.seatCount; i++) {
          delete newAssignments[seatKey(action.tableId, i)];
        }
      }

      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId ? { ...t, ...action.changes } : t
        ),
        seatAssignments: newAssignments,
      };
    }

    case 'ASSIGN_SEAT': {
      const key = seatKey(action.tableId, action.seatIndex);
      // Remove guest from any current seat first
      const newAssignments = { ...state.seatAssignments };
      for (const [k, guestId] of Object.entries(newAssignments)) {
        if (guestId === action.guestId) {
          delete newAssignments[k];
        }
      }
      newAssignments[key] = action.guestId;
      return { ...state, seatAssignments: newAssignments };
    }

    case 'UNASSIGN_GUEST': {
      const newAssignments = { ...state.seatAssignments };
      for (const [key, guestId] of Object.entries(newAssignments)) {
        if (guestId === action.guestId) {
          delete newAssignments[key];
        }
      }
      return { ...state, seatAssignments: newAssignments };
    }

    case 'MOVE_GUEST': {
      const targetKey = seatKey(action.toTableId, action.toSeatIndex);
      const newAssignments = { ...state.seatAssignments };
      // Remove guest from current seat
      for (const [k, guestId] of Object.entries(newAssignments)) {
        if (guestId === action.guestId) {
          delete newAssignments[k];
        }
      }
      // Assign to new seat
      newAssignments[targetKey] = action.guestId;
      return { ...state, seatAssignments: newAssignments };
    }

    case 'SWAP_GUESTS': {
      const newAssignments = { ...state.seatAssignments };
      const guestA = newAssignments[action.seatKeyA];
      const guestB = newAssignments[action.seatKeyB];
      if (guestA) newAssignments[action.seatKeyB] = guestA;
      else delete newAssignments[action.seatKeyB];
      if (guestB) newAssignments[action.seatKeyA] = guestB;
      else delete newAssignments[action.seatKeyA];
      return { ...state, seatAssignments: newAssignments };
    }

    case 'MOVE_TABLE': {
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId ? { ...t, x: action.x, y: action.y } : t
        ),
      };
    }

    case 'RESET':
      return DEFAULT_STATE;

    default:
      return state;
  }
}
