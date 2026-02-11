import { createContext, useContext } from 'react';
import type { WeddingState, Action } from '../types';
import { DEFAULT_STATE } from './reducer';

interface WeddingContextValue {
  state: WeddingState;
  dispatch: React.Dispatch<Action>;
}

export const WeddingContext = createContext<WeddingContextValue>({
  state: DEFAULT_STATE,
  dispatch: () => {},
});

export function useWedding() {
  return useContext(WeddingContext);
}
