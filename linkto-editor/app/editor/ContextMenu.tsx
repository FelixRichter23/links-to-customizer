// app/editor/ContextMenu.tsx
"use client";

import React, { useRef, useEffect } from "react";
import { 
  Link, 
  Copy, 
  Trash2, 
  Edit3,
  X
} from "lucide-react";

interface ContextMenuProps {
  selectedElement: string | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSetLink?: () => void;
  isMobile?: boolean;
}

export default function ContextMenu({
  selectedElement,
  position,
  onClose,
  onEdit,
  onDuplicate,
  onDelete,
  onSetLink,
  isMobile = false
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (!selectedElement || !position) return null;

  const isTextElement = selectedElement.startsWith('profile-') || selectedElement.startsWith('text-');
  const isLink = selectedElement.startsWith('link-');

  // Mobile: Bottom Sheet Style
  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Bottom Sheet */}
        <div 
          ref={menuRef}
          className="absolute bottom-0 left-0 right-0 bg-card border-t border-border rounded-t-xl shadow-2xl animate-in slide-in-from-bottom duration-200"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-3">
            <h3 className="font-semibold text-base">
              {isTextElement ? 'Text Element' : isLink ? 'Link' : 'Element'} Options
            </h3>
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Actions */}
          <div className="px-4 pb-6 space-y-2">
            {isTextElement && (
              <button
                onClick={() => {
                  onEdit();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                <Edit3 size={20} className="text-blue-500" />
                <span className="font-medium">Edit Text</span>
              </button>
            )}
            
            {(isTextElement || isLink) && onSetLink && (
              <button
                onClick={() => {
                  onSetLink();
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
              >
                <Link size={20} className="text-green-500" />
                <span className="font-medium">Set Link</span>
              </button>
            )}
            
            <button
              onClick={() => {
                onDuplicate();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
            >
              <Copy size={20} className="text-yellow-500" />
              <span className="font-medium">Duplicate</span>
            </button>
            
            <button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 text-left bg-destructive/10 hover:bg-destructive/20 rounded-lg transition-colors"
            >
              <Trash2 size={20} className="text-destructive" />
              <span className="font-medium text-destructive">Delete</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Context Menu Style
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        ref={menuRef}
        className="absolute bg-card border border-border rounded-lg shadow-xl pointer-events-auto animate-in fade-in zoom-in-95 duration-150"
        style={{
          left: Math.min(position.x, window.innerWidth - 200),
          top: Math.min(position.y, window.innerHeight - 300),
        }}
      >
        {/* Header */}
        <div className="px-3 py-2 border-b border-border">
          <h3 className="font-medium text-sm text-muted-foreground">
            {isTextElement ? 'Text Element' : isLink ? 'Link' : 'Element'}
          </h3>
        </div>
        
        {/* Actions */}
        <div className="py-1">
          {isTextElement && (
            <button
              onClick={() => {
                onEdit();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Edit3 size={16} className="text-blue-500" />
              Edit Text
            </button>
          )}
          
          {(isTextElement || isLink) && onSetLink && (
            <button
              onClick={() => {
                onSetLink();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
            >
              <Link size={16} className="text-green-500" />
              Set Link
            </button>
          )}
          
          <button
            onClick={() => {
              onDuplicate();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
          >
            <Copy size={16} className="text-yellow-500" />
            Duplicate
          </button>
          
          <div className="my-1 h-px bg-border" />
          
          <button
            onClick={() => {
              onDelete();
              onClose();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-destructive/10 text-destructive transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
