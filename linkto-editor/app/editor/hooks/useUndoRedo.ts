// app/editor/hooks/useUndoRedo.ts
import { useState, useCallback, useRef } from 'react';

interface UndoRedoState<T> {
  history: T[];
  currentIndex: number;
}

interface UndoRedoActions<T> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushState: (state: T, actionType?: string) => void;
  reset: (initialState: T) => void;
  getCurrentState: () => T;
  commitPendingText: () => void;
}

export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 10
): [T, UndoRedoActions<T>] {
  const [state, setState] = useState<UndoRedoState<T>>({
    history: [initialState],
    currentIndex: 0,
  });

  // This is the current state that the UI renders
  const [present, setPresent] = useState<T>(initialState);

  const textDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  // Adds a state to the history, truncating any future history (if we undid before)
  const addToHistory = useCallback((newState: T) => {
    setState(prevState => {
      const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);
      newHistory.push(newState);
      
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return {
          history: newHistory,
          currentIndex: newHistory.length - 1,
        };
      }
      
      return {
        history: newHistory,
        currentIndex: newHistory.length - 1,
      };
    });
  }, [maxHistorySize]);

  const commitPendingText = useCallback(() => {
    if (textDebounceTimeoutRef.current) {
      clearTimeout(textDebounceTimeoutRef.current);
      textDebounceTimeoutRef.current = null;
      // We assume present state has the latest text
      setPresent(current => {
        addToHistory(current);
        return current;
      });
    }
  }, [addToHistory]);

  const pushState = useCallback((newState: T, actionType?: string) => {
    // Always update what the UI sees immediately
    setPresent(newState);

    if (actionType === 'drag') {
      // Do not add to history yet. The UI will just use the new `present` state.
      // A subsequent action like 'drag-end' will commit it.
      return;
    }

    if (actionType === 'text-change' || actionType === 'style-change') {
      if (textDebounceTimeoutRef.current) {
        clearTimeout(textDebounceTimeoutRef.current);
      }
      textDebounceTimeoutRef.current = setTimeout(() => {
        addToHistory(newState);
        textDebounceTimeoutRef.current = null;
      }, 800);
      return;
    }

    // Commit any pending text changes first before an explicit push
    if (textDebounceTimeoutRef.current) {
      clearTimeout(textDebounceTimeoutRef.current);
      textDebounceTimeoutRef.current = null;
    }
    
    // Default: immediately add to history (e.g. 'drag-end', structural changes)
    addToHistory(newState);
  }, [addToHistory]);

  const undo = useCallback(() => {
    commitPendingText();
    
    if (canUndo) {
      setState(prevState => {
        const newIndex = prevState.currentIndex - 1;
        setPresent(prevState.history[newIndex]);
        return {
          ...prevState,
          currentIndex: newIndex,
        };
      });
    }
  }, [canUndo, commitPendingText]);

  const redo = useCallback(() => {
    commitPendingText();
    
    if (canRedo) {
      setState(prevState => {
        const newIndex = prevState.currentIndex + 1;
        setPresent(prevState.history[newIndex]);
        return {
          ...prevState,
          currentIndex: newIndex,
        };
      });
    }
  }, [canRedo, commitPendingText]);

  const reset = useCallback((newInitialState: T) => {
    if (textDebounceTimeoutRef.current) {
      clearTimeout(textDebounceTimeoutRef.current);
      textDebounceTimeoutRef.current = null;
    }
    setPresent(newInitialState);
    setState({
      history: [newInitialState],
      currentIndex: 0,
    });
  }, []);

  const getCurrentState = useCallback(() => {
    return present;
  }, [present]);

  return [
    present,
    {
      canUndo,
      canRedo,
      undo,
      redo,
      pushState,
      reset,
      getCurrentState,
      commitPendingText,
    },
  ];
}
