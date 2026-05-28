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
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl p-1.5 backdrop-blur-xl shadow-xl">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
          canUndo
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-white/5 text-white/30 cursor-not-allowed opacity-50'
        }`}
        title={`Undo (${undoShortcut})`}
      >
        <Undo2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Undo</span>
      </button>
      
      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all ${
          canRedo
            ? 'bg-white/10 hover:bg-white/20 text-white'
            : 'bg-white/5 text-white/30 cursor-not-allowed opacity-50'
        }`}
        title={`Redo (${redoShortcut})`}
      >
        <Redo2 className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Redo</span>
      </button>
      
      {/* Keyboard Shortcut Hinweis */}
      <div className="hidden lg:block text-[10px] uppercase tracking-wider text-white/40 border-l border-white/10 pl-3 ml-1">
        {undoShortcut} / {redoShortcut}
      </div>
    </div>
  );
}
