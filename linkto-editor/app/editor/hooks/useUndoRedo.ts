// app/editor/hooks/useUndoRedo.ts
import { useState, useCallback, useEffect } from 'react';

interface UndoRedoState<T> {
  history: T[];
  currentIndex: number;
}

interface UndoRedoActions<T> {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  pushState: (state: T) => void;
  reset: (initialState: T) => void;
  getCurrentState: () => T;
}

export function useUndoRedo<T>(
  initialState: T,
  maxHistorySize: number = 10
): [T, UndoRedoActions<T>] {
  const [state, setState] = useState<UndoRedoState<T>>({
    history: [initialState],
    currentIndex: 0,
  });

  const currentState = state.history[state.currentIndex];

  const canUndo = state.currentIndex > 0;
  const canRedo = state.currentIndex < state.history.length - 1;

  const pushState = useCallback((newState: T) => {
    setState(prevState => {
      // Prüfe ob der neue State identisch mit dem aktuellen ist
      const currentStateJson = JSON.stringify(prevState.history[prevState.currentIndex]);
      const newStateJson = JSON.stringify(newState);
      
      if (currentStateJson === newStateJson) {
        // Keine Änderung, nicht zur History hinzufügen
        return prevState;
      }
      
      // Entferne alle Redo-History nach dem aktuellen Index
      const newHistory = prevState.history.slice(0, prevState.currentIndex + 1);
      
      // Füge den neuen State hinzu
      newHistory.push(newState);
      
      // Limitiere die History-Größe
      if (newHistory.length > maxHistorySize) {
        newHistory.shift(); // Entferne das älteste Element
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

  const undo = useCallback(() => {
    if (canUndo) {
      setState(prevState => ({
        ...prevState,
        currentIndex: prevState.currentIndex - 1,
      }));
    }
  }, [canUndo]);

  const redo = useCallback(() => {
    if (canRedo) {
      setState(prevState => ({
        ...prevState,
        currentIndex: prevState.currentIndex + 1,
      }));
    }
  }, [canRedo]);

  const reset = useCallback((newInitialState: T) => {
    setState({
      history: [newInitialState],
      currentIndex: 0,
    });
  }, []);

  const getCurrentState = useCallback(() => {
    return currentState;
  }, [currentState]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey;

      if (ctrlOrCmd) {
        if (event.key === 'z' && !event.shiftKey) {
          // Undo: Ctrl+Z (Windows) or Cmd+Z (Mac)
          event.preventDefault();
          undo();
        } else if (
          (event.key === 'y') || 
          (event.key === 'z' && event.shiftKey)
        ) {
          // Redo: Ctrl+Y or Ctrl+Shift+Z (Windows) or Cmd+Y or Cmd+Shift+Z (Mac)
          event.preventDefault();
          redo();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const actions: UndoRedoActions<T> = {
    canUndo,
    canRedo,
    undo,
    redo,
    pushState,
    reset,
    getCurrentState,
  };

  return [currentState, actions];
}
