// app/editor/components/UndoRedoToolbar.tsx
"use client";

import React from 'react';
import { Undo2, Redo2 } from 'lucide-react';

interface UndoRedoToolbarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

export default function UndoRedoToolbar({ canUndo, canRedo, onUndo, onRedo }: UndoRedoToolbarProps) {
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  
  const undoShortcut = isMac ? '⌘Z' : 'Ctrl+Z';
  const redoShortcut = isMac ? '⌘Y' : 'Ctrl+Y';

  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${
          canUndo
            ? 'bg-background hover:bg-accent text-foreground hover:text-accent-foreground'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
        title={`Undo (${undoShortcut})`}
      >
        <Undo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Undo</span>
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-all ${
          canRedo
            ? 'bg-background hover:bg-accent text-foreground hover:text-accent-foreground'
            : 'bg-muted text-muted-foreground cursor-not-allowed'
        }`}
        title={`Redo (${redoShortcut})`}
      >
        <Redo2 className="w-4 h-4" />
        <span className="hidden sm:inline">Redo</span>
      </button>
      
      {/* Keyboard Shortcut Hinweis */}
      <div className="hidden lg:block text-xs text-muted-foreground border-l border-border pl-3 ml-1">
        {undoShortcut} / {redoShortcut}
      </div>
    </div>
  );
}
