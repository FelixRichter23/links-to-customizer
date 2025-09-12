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

  // Debouncing für Text-Änderungen
  const textDebounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTextStateRef = useRef<T | null>(null);

  const currentState = pendingTextStateRef.current || state.history[state.currentIndex];

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  // Hilfsfunktion zum tatsächlichen Hinzufügen zum History
  const addToHistory = useCallback((newState: T) => {
    setState(prevState => {
      const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);
      newHistory.push(newState);
      
      // Limit history size
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

  // Commit pending text changes
  const commitPendingText = useCallback(() => {
    if (pendingTextStateRef.current) {
      addToHistory(pendingTextStateRef.current);
      pendingTextStateRef.current = null;
    }
    if (textDebounceTimeoutRef.current) {
      clearTimeout(textDebounceTimeoutRef.current);
      textDebounceTimeoutRef.current = null;
    }
  }, [addToHistory]);

  const pushState = useCallback((newState: T, actionType?: string) => {
    // Text-Änderungen debouncing (1000ms Verzögerung)
    if (actionType === 'text-change') {
      // Speichere den pending State für sofortige UI Updates
      pendingTextStateRef.current = newState;
      
      // Lösche vorherigen Timeout
      if (textDebounceTimeoutRef.current) {
        clearTimeout(textDebounceTimeoutRef.current);
      }
      
      // Setze neuen Timeout
      textDebounceTimeoutRef.current = setTimeout(() => {
        if (pendingTextStateRef.current) {
          addToHistory(pendingTextStateRef.current);
          pendingTextStateRef.current = null;
        }
      }, 1000);
      
      return; // Nicht sofort zur History hinzufügen
    }

    // Commit any pending text changes first
    commitPendingText();
    
    // Für alle anderen Änderungen: sofort zur History hinzufügen
    addToHistory(newState);
  }, [addToHistory, commitPendingText]);

  const undo = useCallback(() => {
    // Commit any pending text changes first
    commitPendingText();
    
    if (canUndo) {
      setState(prevState => ({
        ...prevState,
        currentIndex: prevState.currentIndex - 1,
      }));
    }
  }, [canUndo, commitPendingText]);

  const redo = useCallback(() => {
    // Commit any pending text changes first
    commitPendingText();
    
    if (canRedo) {
      setState(prevState => ({
        ...prevState,
        currentIndex: prevState.currentIndex + 1,
      }));
    }
  }, [canRedo, commitPendingText]);

  const reset = useCallback((newInitialState: T) => {
    // Clear any pending changes
    if (textDebounceTimeoutRef.current) {
      clearTimeout(textDebounceTimeoutRef.current);
      textDebounceTimeoutRef.current = null;
    }
    pendingTextStateRef.current = null;
    
    setState({
      history: [newInitialState],
      currentIndex: 0,
    });
  }, []);

  const getCurrentState = useCallback(() => {
    return currentState;
  }, [currentState]);

  return [
    currentState,
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
