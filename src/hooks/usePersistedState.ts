import { useReducer, useEffect } from 'react';
import type { WeddingState, Action } from '../types';
import { weddingReducer, DEFAULT_STATE } from '../state/reducer';

const STORAGE_KEY = 'wedding-seats-state';
const DEBOUNCE_MS = 300;

function loadState(): WeddingState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.guests && parsed.tables && parsed.seatAssignments) {
        return parsed as WeddingState;
      }
    }
  } catch {
    // Fall through to default
  }
  return DEFAULT_STATE;
}

export function usePersistedState(): [WeddingState, React.Dispatch<Action>] {
  const [state, dispatch] = useReducer(weddingReducer, undefined, loadState);

  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [state]);

  return [state, dispatch];
}
