// app/editor/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import Controls from "./Controls";
import Preview from "./Preview";
import ElementProperties from "./ElementProperties";
import UndoRedoToolbar from "./components/UndoRedoToolbar";
import CustomizerToolbar from "./CustomizerToolbar";
import { useUndoRedo } from "./hooks/useUndoRedo";
import { type PageConfig, type ViewportConfig } from "./types";
import { Download, Settings } from "lucide-react";

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
      avatarUrl: "https://avatar.vercel.sh/your-name",
      position: { x: 92, y: 50, width: 96, height: 96 }, // Centered in 280px: (280-96)/2 = 92
    },
    textElements: [
      {
        id: "profile-name",
        type: "text" as const,
        content: "Your Name",
        position: { x: 10, y: 150, width: 260, height: 30 },
        style: {
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center" as const,
          color: "#f2f7f7",
        },
        order: 1,
      },
      {
        id: "profile-bio", 
        type: "text" as const,
        content: "Your short and catchy bio goes here!",
        position: { x: 10, y: 185, width: 260, height: 30 },
        style: {
          fontSize: 14,
          fontWeight: "normal",
          textAlign: "center" as const,
          color: "#f2f7f7",
        },
        order: 2,
      }
    ],
    links: [
      { 
        id: 1, 
        title: "My Website", 
        url: "https://example.com", 
        order: 1,
        position: { x: 10, y: 240, width: 260, height: 40 } // Adjusted for new text element positions
      },
      { 
        id: 2, 
        title: "Twitter / X", 
        url: "https://twitter.com", 
        order: 2,
        position: { x: 10, y: 295, width: 260, height: 40 } // Adjusted for new text element positions
      },
    ],
  },
  desktop: {
    profile: {
      avatarUrl: "https://avatar.vercel.sh/your-name",
      position: { x: 360, y: 100, width: 128, height: 128 },
    },
    textElements: [
      {
        id: "profile-name",
        type: "text" as const,
        content: "Your Name",
        position: { x: 240, y: 240, width: 368, height: 40 },
        style: {
          fontSize: 28,
          fontWeight: "bold",
          textAlign: "center" as const,
          color: "#f2f7f7",
        },
        order: 1,
      },
      {
        id: "profile-bio",
        type: "text" as const, 
        content: "Your short and catchy bio goes here!",
        position: { x: 240, y: 285, width: 368, height: 30 },
        style: {
          fontSize: 16,
          fontWeight: "normal",
          textAlign: "center" as const,
          color: "#f2f7f7",
        },
        order: 2,
      }
    ],
    links: [
      { 
        id: 1, 
        title: "My Website", 
        url: "https://example.com", 
        order: 1,
        position: { x: 360, y: 340, width: 200, height: 50 }
      },
      { 
        id: 2, 
        title: "Twitter / X", 
        url: "https://twitter.com", 
        order: 2,
        position: { x: 360, y: 410, width: 200, height: 50 }
      },
    ],
  }
};

export default function EditorPage() {
  const [viewMode, setViewMode] = useState<'mobile' | 'desktop'>('mobile');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [showGlobalSettings, setShowGlobalSettings] = useState(false);

  // Separate mobile and desktop state stacks
  const [mobileState, mobileActions] = useUndoRedo<{ design: PageConfig['design']; viewport: ViewportConfig }>({
    design: initialConfig.design,
    viewport: initialConfig.mobile
  }, 10);

  const [desktopState, desktopActions] = useUndoRedo<{ design: PageConfig['design']; viewport: ViewportConfig }>({
    design: initialConfig.design,
    viewport: initialConfig.desktop
  }, 10);

  const activeActions = viewMode === 'mobile' ? mobileActions : desktopActions;
  const activeState = viewMode === 'mobile' ? mobileState : desktopState;

  // Construct current unified PageConfig
  const config: PageConfig = {
    design: activeState.design,
    mobile: mobileState.viewport,
    desktop: desktopState.viewport
  };

  // Sync design between layouts when active design changes (e.g. on undo/redo)
  useEffect(() => {
    const inactiveActions = viewMode === 'mobile' ? desktopActions : mobileActions;
    const inactiveState = viewMode === 'mobile' ? desktopState : mobileState;

    if (JSON.stringify(activeState.design) !== JSON.stringify(inactiveState.design)) {
      // Sync present state design to inactive stack without recording history (style-change is debounced)
      inactiveActions.pushState({
        design: activeState.design,
        viewport: inactiveState.viewport
      }, 'style-change');
    }
  }, [activeState.design, viewMode]);

  // Wrapper for setConfig, which targets the correct stack
  const setConfig = (
    newConfig: PageConfig | ((prevConfig: PageConfig) => PageConfig), 
    actionType?: string
  ) => {
    const resolvedConfig = typeof newConfig === 'function' ? newConfig(config) : newConfig;
    
    // Update active stack
    activeActions.pushState({
      design: resolvedConfig.design,
      viewport: resolvedConfig[viewMode]
    }, actionType);

    // If design changed, also update design in inactive stack immediately
    const inactiveActions = viewMode === 'mobile' ? desktopActions : mobileActions;
    const inactiveState = viewMode === 'mobile' ? desktopState : mobileState;
    const designChanged = JSON.stringify(resolvedConfig.design) !== JSON.stringify(inactiveState.design);
    
    if (designChanged) {
      inactiveActions.pushState({
        design: resolvedConfig.design,
        viewport: inactiveState.viewport
      }, actionType);
    }
  };
  
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
    <div className="min-h-screen bg-[#0A0A0A] text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Header mit View Toggle - Glassmorphic */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-background/70 border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-lg leading-none">L</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight">LinkTo</h1>
            </div>
            
            <div className="h-6 w-px bg-border/50 hidden sm:block"></div>
            
            {/* Undo/Redo Toolbar */}
            <div className="hidden sm:block">
              <UndoRedoToolbar
                canUndo={activeActions.canUndo}
                canRedo={activeActions.canRedo}
                onUndo={activeActions.undo}
                onRedo={activeActions.redo}
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Settings Cog Button */}
            <button
              onClick={() => setShowGlobalSettings(!showGlobalSettings)}
              className={`p-2 rounded-full border border-border/50 transition-all ${
                showGlobalSettings 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                  : 'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
              title="Toggle Global Design Panel"
            >
              <Settings size={16} />
            </button>

            {/* Debug Button */}
            <button
              onClick={() => setShowDebugPanel(!showDebugPanel)}
              className="px-3 py-1.5 text-xs font-medium bg-muted/50 hover:bg-muted border border-border/50 rounded-full text-muted-foreground hover:text-foreground transition-all"
              title="Toggle Debug Panel"
            >
              Debug
            </button>

            {/* Modern Toggle Switch */}
            <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-full border border-border/50">
              <button
                onClick={() => setViewMode('mobile')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  viewMode === 'mobile' 
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Mobile
              </button>
              <button
                onClick={() => setViewMode('desktop')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                  viewMode === 'desktop' 
                    ? 'bg-background shadow-sm text-foreground ring-1 ring-border/50' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Desktop
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Haupt-Layout - responsiv basierend auf View Mode */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto p-4 sm:p-6 md:p-8">
        <div className={`gap-8 transition-all duration-500 ease-in-out ${
          viewMode === 'desktop' 
            ? 'grid grid-cols-1 xl:grid-cols-4' 
            : 'grid grid-cols-1 lg:grid-cols-12'
        }`}>
          {/* Linke Spalte: Steuerung + Properties */}
          <div className={`flex flex-col gap-6 transition-all duration-500 ${
            viewMode === 'desktop' ? 'xl:col-span-1' : 'lg:col-span-4 xl:col-span-3'
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
            
            {showGlobalSettings && (
              <Controls config={config} setConfig={setConfig} compact={viewMode === 'desktop'} viewMode={viewMode} />
            )}
          </div>
        </div>

        {/* Rechte Spalte: Vorschau */}
        <div className={`flex flex-col justify-start items-center transition-all duration-500 ease-in-out relative ${
          viewMode === 'desktop' ? 'xl:col-span-3' : 'lg:col-span-8 xl:col-span-9'
        }`}>
          {/* Subtle dot background pattern */}
          <div className="absolute inset-0 z-0 bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent)]"></div>

          {/* Preview Container mit integrierter CustomizerToolbar */}
          <div className="w-full flex justify-center relative z-10">
            {/* CustomizerToolbar - schwebt über dem Preview */}
            {selectedElement && (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-') || selectedElement.startsWith('link-')) && (
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-50">
                <CustomizerToolbar
                selectedElement={selectedElement}
                currentColor={
                  selectedElement.startsWith('link-')
                    ? (config[viewMode].links.find(l => `link-${l.id}` === selectedElement)?.customTextColor || config.design.buttonTextColor)
                    : (config[viewMode].textElements.find(t => t.id === selectedElement)?.style.color || config.design.textColor)
                }
                currentFont={
                  selectedElement.startsWith('link-')
                    ? (config[viewMode].links.find(l => `link-${l.id}` === selectedElement)?.fontStyle?.fontFamily || 'Arial')
                    : (config[viewMode].textElements.find(t => t.id === selectedElement)?.style.fontFamily || 'Arial')
                }
                currentFontWeight={
                  selectedElement.startsWith('link-')
                    ? (config[viewMode].links.find(l => `link-${l.id}` === selectedElement)?.fontStyle?.fontWeight || 'normal')
                    : (config[viewMode].textElements.find(t => t.id === selectedElement)?.style.fontWeight || 'normal')
                }
                currentTextDecoration={
                  selectedElement.startsWith('link-')
                    ? (config[viewMode].links.find(l => `link-${l.id}` === selectedElement)?.fontStyle?.textDecoration || 'none')
                    : (config[viewMode].textElements.find(t => t.id === selectedElement)?.style.textDecoration || 'none')
                }
                currentTextAlign={
                  selectedElement.startsWith('link-')
                    ? (config[viewMode].links.find(l => `link-${l.id}` === selectedElement)?.fontStyle?.textAlign || 'center')
                    : (config[viewMode].textElements.find(t => t.id === selectedElement)?.style.textAlign || 'center')
                }
                onColorChange={(color) => {
                  if (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-')) {
                    // Handle TextElements
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        textElements: prev[viewMode].textElements.map(element =>
                          element.id === selectedElement
                            ? {
                                ...element,
                                style: {
                                  ...element.style,
                                  color: color
                                }
                              }
                            : element
                        )
                      }
                    }), 'style-change');
                  } else if (selectedElement.startsWith('link-')) {
                    // Handle Links
                    const linkId = parseInt(selectedElement.replace('link-', ''));
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        links: prev[viewMode].links.map(link =>
                          link.id === linkId
                            ? { 
                                ...link, 
                                customTextColor: color
                              }
                            : link
                        )
                      }
                    }), 'style-change');
                  }
                }}
                onFontChange={(font) => {
                  if (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-')) {
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        textElements: prev[viewMode].textElements.map(element =>
                          element.id === selectedElement
                            ? {
                                ...element,
                                style: {
                                  ...element.style,
                                  fontFamily: font
                                }
                              }
                            : element
                        )
                      }
                    }));
                  } else if (selectedElement.startsWith('link-')) {
                    const linkId = parseInt(selectedElement.replace('link-', ''));
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        links: prev[viewMode].links.map(link =>
                          link.id === linkId
                            ? { 
                                ...link, 
                                fontStyle: {
                                  ...link.fontStyle,
                                  fontFamily: font
                                }
                              }
                            : link
                        )
                      }
                    }));
                  }
                }}
                onFontWeightChange={(weight) => {
                  if (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-')) {
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        textElements: prev[viewMode].textElements.map(element =>
                          element.id === selectedElement
                            ? {
                                ...element,
                                style: {
                                  ...element.style,
                                  fontWeight: weight
                                }
                              }
                            : element
                        )
                      }
                    }));
                  } else if (selectedElement.startsWith('link-')) {
                    const linkId = parseInt(selectedElement.replace('link-', ''));
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        links: prev[viewMode].links.map(link =>
                          link.id === linkId
                            ? { 
                                ...link, 
                                fontStyle: {
                                  ...link.fontStyle,
                                  fontWeight: weight
                                }
                              }
                            : link
                        )
                      }
                    }));
                  }
                }}
                onTextAlignChange={(align) => {
                  if (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-')) {
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        textElements: prev[viewMode].textElements.map(element =>
                          element.id === selectedElement
                            ? {
                                ...element,
                                style: {
                                  ...element.style,
                                  textAlign: align as 'left' | 'center' | 'right'
                                }
                              }
                            : element
                        )
                      }
                    }));
                  } else if (selectedElement.startsWith('link-')) {
                    const linkId = parseInt(selectedElement.replace('link-', ''));
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        links: prev[viewMode].links.map(link =>
                          link.id === linkId
                            ? { 
                                ...link, 
                                fontStyle: {
                                  ...link.fontStyle,
                                  textAlign: align as 'left' | 'center' | 'right'
                                }
                              }
                            : link
                        )
                      }
                    }));
                  }
                }}
                onTextTransformChange={(transform) => {
                  if (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-')) {
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        textElements: prev[viewMode].textElements.map(element =>
                          element.id === selectedElement
                            ? {
                                ...element,
                                style: {
                                  ...element.style,
                                  textTransform: transform as 'none' | 'uppercase' | 'lowercase' | 'capitalize'
                                }
                              }
                            : element
                        )
                      }
                    }));
                  } else if (selectedElement.startsWith('link-')) {
                    const linkId = parseInt(selectedElement.replace('link-', ''));
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        links: prev[viewMode].links.map(link =>
                          link.id === linkId
                            ? { 
                                ...link, 
                                fontStyle: {
                                  ...link.fontStyle,
                                  textTransform: transform as 'none' | 'uppercase' | 'lowercase' | 'capitalize'
                                }
                              }
                            : link
                        )
                      }
                    }));
                  }
                }}
                onTextDecorationChange={(decoration) => {
                  if (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-')) {
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        textElements: prev[viewMode].textElements.map(element =>
                          element.id === selectedElement
                            ? {
                                ...element,
                                style: {
                                  ...element.style,
                                  textDecoration: decoration as 'none' | 'underline' | 'overline' | 'line-through'
                                }
                              }
                            : element
                        )
                      }
                    }));
                  } else if (selectedElement.startsWith('link-')) {
                    const linkId = parseInt(selectedElement.replace('link-', ''));
                    setConfig(prev => ({
                      ...prev,
                      [viewMode]: {
                        ...prev[viewMode],
                        links: prev[viewMode].links.map(link =>
                          link.id === linkId
                            ? { 
                                ...link, 
                                fontStyle: {
                                  ...link.fontStyle,
                                  textDecoration: decoration as 'none' | 'underline' | 'overline' | 'line-through'
                                }
                              }
                            : link
                        )
                      }
                    }));
                  }
                }}
              />
              </div>
            )}
            
            {/* Preview Element */}
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