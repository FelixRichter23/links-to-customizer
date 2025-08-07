// app/editor/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Controls from "./Controls";
import Preview from "./Preview";
import ElementProperties from "./ElementProperties";
import { type PageConfig } from "./types";
import { Download } from "lucide-react";

// Startkonfiguration für den Editor
const initialConfig: PageConfig = {
  design: {
    backgroundColor: "#070c0e",
    backgroundType: "solid" as const,
    backgroundGradient: {
      from: "#070c0e",
      to: "#1a1a2e",
      direction: "to bottom right",
    },
    backgroundImage: "",
    buttonColor: "#9fd2d1",
    buttonTextColor: "#070c0e",
    textColor: "#f2f7f7",
    buttonBorderRadius: 8,
  },
  mobile: {
    profile: {
      name: "Your Name",
      bio: "Your short and catchy bio goes here!",
      avatarUrl: "https://avatar.vercel.sh/your-name",
      position: { x: 92, y: 50, width: 96, height: 96 }, // Centered in 280px: (280-96)/2 = 92
      bioPosition: { x: 10, y: 160, width: 260, height: 45 }, // Centered: (280-260)/2 = 10
    },
    links: [
      { 
        id: 1, 
        title: "My Website", 
        url: "https://example.com", 
        order: 1,
        position: { x: 10, y: 220, width: 260, height: 40 } // Centered: (280-260)/2 = 10
      },
      { 
        id: 2, 
        title: "Twitter / X", 
        url: "https://twitter.com", 
        order: 2,
        position: { x: 10, y: 275, width: 260, height: 40 } // Centered: (280-260)/2 = 10
      },
    ],
  },
  desktop: {
    profile: {
      name: "Your Name",
      bio: "Your short and catchy bio goes here!",
      avatarUrl: "https://avatar.vercel.sh/your-name",
      position: { x: 360, y: 100, width: 128, height: 128 },
      bioPosition: { x: 240, y: 248, width: 368, height: 50 },
    },
    links: [
      { 
        id: 1, 
        title: "My Website", 
        url: "https://example.com", 
        order: 1,
        position: { x: 360, y: 320, width: 200, height: 50 }
      },
      { 
        id: 2, 
        title: "Twitter / X", 
        url: "https://twitter.com", 
        order: 2,
        position: { x: 360, y: 390, width: 200, height: 50 }
      },
    ],
  }
};

export default function EditorPage() {
  const [config, setConfig] = useState<PageConfig>(initialConfig);
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  
  // Debug Panel Position & Size State
  const [debugPosition, setDebugPosition] = useState({ x: 100, y: 100 });
  const [debugSize, setDebugSize] = useState({ width: 400, height: 500 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const handleDownloadJson = () => {
    // Konvertiere das config-Objekt in einen formatierten JSON-String
    const jsonString = JSON.stringify(config, null, 2);
    // Erstelle ein Blob-Objekt aus dem String
    const blob = new Blob([jsonString], { type: "application/json" });
    // Erstelle eine URL für das Blob-Objekt
    const url = URL.createObjectURL(blob);

    // Erstelle ein temporäres Link-Element
    const a = document.createElement("a");
    a.href = url;
    a.download = "flextree-config.json"; // Der Dateiname für den Download
    document.body.appendChild(a); // Füge den Link zum DOM hinzu
    a.click(); // Simuliere einen Klick auf den Link, um den Download zu starten
    document.body.removeChild(a); // Entferne den Link wieder aus dem DOM
    URL.revokeObjectURL(url); // Gib den Speicher für die Blob-URL frei
  };

  // Debug Panel Drag & Resize Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('drag-handle')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - debugPosition.x,
        y: e.clientY - debugPosition.y
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setDebugPosition({
        x: Math.max(0, Math.min(window.innerWidth - debugSize.width, e.clientX - dragStart.x)),
        y: Math.max(0, Math.min(window.innerHeight - debugSize.height, e.clientY - dragStart.y))
      });
    }
    if (isResizing) {
      setDebugSize({
        width: Math.max(300, Math.min(800, e.clientX - debugPosition.x)),
        height: Math.max(200, Math.min(600, e.clientY - debugPosition.y))
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
  };

  // Event Listeners für Mouse Events
  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, debugPosition, debugSize]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header mit View Toggle */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Link Editor</h1>
            
            {/* Debug Button - nur für Entwickler */}
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-2 py-1 text-xs bg-muted hover:bg-accent rounded text-muted-foreground hover:text-accent-foreground transition-colors"
              title="Toggle Debug Panel"
            >
              Debug
            </button>
          </div>
          
          {/* Modern Toggle Switch */}
          <div className="flex items-center gap-3">
            <span className={`text-sm transition-colors ${viewMode === 'mobile' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Mobile
            </span>
            <button
              onClick={() => setViewMode(viewMode === 'mobile' ? 'desktop' : 'mobile')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                viewMode === 'desktop' ? 'bg-primary' : 'bg-muted'
              }`}
              role="switch"
              aria-checked={viewMode === 'desktop'}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  viewMode === 'desktop' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm transition-colors ${viewMode === 'desktop' ? 'text-foreground' : 'text-muted-foreground'}`}>
              Desktop
            </span>
          </div>
        </div>
      </div>

      {/* Haupt-Layout - responsiv basierend auf View Mode */}
      <div className={`gap-6 p-6 transition-all duration-300 ${
        viewMode === 'desktop' 
          ? 'grid grid-cols-1 xl:grid-cols-3' // Desktop: 2-Spalten Layout (Controls mit Properties - Preview)
          : 'grid grid-cols-1 lg:grid-cols-2'  // Mobile: 2-Spalten Layout
      }`}>
        {/* Linke Spalte: Steuerung + Properties */}
        <div className={`transition-all duration-300 ${
          viewMode === 'desktop' ? 'xl:col-span-1' : 'lg:col-span-1'
        }`}>
          <div className={`space-y-4 transition-all duration-300 ${
            viewMode === 'desktop' 
              ? 'max-w-sm mx-auto xl:max-w-none' // Desktop: Schmaler
              : 'max-w-none' // Mobile: Normale Breite
          }`}>
            {/* Properties Panel über Controls (beide Modi) */}
            <ElementProperties
              selectedElement={selectedElement}
              config={config}
              setConfig={setConfig}
              viewMode={viewMode}
            />
            
            <Controls config={config} setConfig={setConfig} compact={viewMode === 'desktop'} viewMode={viewMode} />
          </div>
        </div>

        {/* Rechte Spalte: Vorschau */}
        <div className={`flex justify-center items-start transition-all duration-300 ${
          viewMode === 'desktop' ? 'xl:col-span-2' : 'lg:col-span-1'
        }`}>
          <div className="w-full flex justify-center">
            <Preview 
              config={config} 
              setConfig={setConfig}
              viewMode={viewMode}
              selectedElement={selectedElement}
              setSelectedElement={setSelectedElement}
              isInteractive={true}
            />
          </div>
        </div>
      </div>

      {/* Debug Panel als verschiebbares Fenster */}
      {showDebugPanel && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div 
            className="absolute bg-card rounded-xl border border-border shadow-2xl pointer-events-auto flex flex-col overflow-hidden"
            style={{
              left: debugPosition.x,
              top: debugPosition.y,
              width: debugSize.width,
              height: debugSize.height,
              cursor: isDragging ? 'grabbing' : 'default'
            }}
            onMouseDown={handleMouseDown}
          >
            {/* Debug Panel Header - Drag Handle */}
            <div className="drag-handle flex items-center justify-between p-3 border-b border-border bg-muted/30 cursor-grab active:cursor-grabbing select-none">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <h2 className="text-sm font-semibold">Debug Panel</h2>
                <span className="px-2 py-0.5 text-xs bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 rounded">
                  Dev
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadJson}
                  className="px-2 py-1 text-xs bg-primary hover:bg-primary/80 text-primary-foreground rounded transition-colors"
                  title="Download JSON Config"
                >
                  <Download size={12} className="inline mr-1" />
                  Export
                </button>
                <button
                  onClick={() => setShowDebugPanel(false)}
                  className="px-2 py-1 text-xs bg-muted hover:bg-accent rounded text-muted-foreground hover:text-accent-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Debug Panel Content */}
            <div className="p-3 overflow-auto flex-1 text-xs">
              <div className="space-y-3">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/50 p-2 rounded text-xs">
                    <div className="font-medium">Links</div>
                    <div className="text-muted-foreground">{config[viewMode].links.length}</div>
                  </div>
                  <div className="bg-muted/50 p-2 rounded text-xs">
                    <div className="font-medium">Background</div>
                    <div className="text-muted-foreground capitalize">{config.design.backgroundType}</div>
                  </div>
                  <div className="bg-muted/50 p-2 rounded text-xs">
                    <div className="font-medium">View</div>
                    <div className="text-muted-foreground capitalize">{viewMode}</div>
                  </div>
                  <div className="bg-muted/50 p-2 rounded text-xs">
                    <div className="font-medium">Selected</div>
                    <div className="text-muted-foreground">{selectedElement || 'None'}</div>
                  </div>
                </div>
                
                {/* Live JSON */}
                <div>
                  <h3 className="text-xs font-medium mb-2 text-muted-foreground">Live Configuration</h3>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-64 text-muted-foreground font-mono leading-relaxed">
                    {JSON.stringify(config, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Resize Handle */}
            <div 
              className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-muted/50 hover:bg-muted transition-colors"
              onMouseDown={handleResizeStart}
              style={{
                clipPath: 'polygon(100% 0%, 0% 100%, 100% 100%)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}