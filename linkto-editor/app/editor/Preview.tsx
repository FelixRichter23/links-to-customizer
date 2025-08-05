// app/editor/Preview.tsx
import React, { useState, useCallback, useRef, useEffect } from "react";
import { type PageConfig, type ElementPosition, type AlignmentGuide } from "./types";

interface PreviewProps {
  config: PageConfig;
  setConfig?: (config: PageConfig) => void;
  viewMode: 'mobile' | 'desktop';
  selectedElement?: string | null;
  setSelectedElement?: (elementId: string | null) => void;
  isInteractive?: boolean;
}

const RESIZE_HANDLE_SIZE = 8;
const SNAP_THRESHOLD = 15; // Pixel-Abstand für Snapping - etwas größer für bessere UX

// Hilfsfunktionen für Alignment
const getElementBounds = (element: { position: ElementPosition }) => ({
  left: element.position.x,
  right: element.position.x + element.position.width,
  top: element.position.y,
  bottom: element.position.y + element.position.height,
  centerX: element.position.x + element.position.width / 2,
  centerY: element.position.y + element.position.height / 2,
});

const findAlignmentGuides = (
  targetElement: { position: ElementPosition },
  allElements: Array<{ id: string; position: ElementPosition }>,
  threshold: number = SNAP_THRESHOLD
): AlignmentGuide[] => {
  const guides: AlignmentGuide[] = [];
  const targetBounds = getElementBounds({ position: targetElement.position });

  allElements.forEach(element => {
    const bounds = getElementBounds(element);
    
    // Vertikale Alignment-Guides
    // Linke Kanten
    if (Math.abs(targetBounds.left - bounds.left) <= threshold) {
      guides.push({ type: 'vertical', position: bounds.left, elementId: element.id, snapType: 'edge' });
    }
    // Rechte Kanten
    if (Math.abs(targetBounds.right - bounds.right) <= threshold) {
      guides.push({ type: 'vertical', position: bounds.right, elementId: element.id, snapType: 'edge' });
    }
    // Zentriert horizontal
    if (Math.abs(targetBounds.centerX - bounds.centerX) <= threshold) {
      guides.push({ type: 'vertical', position: bounds.centerX, elementId: element.id, snapType: 'center' });
    }
    
    // Horizontale Alignment-Guides
    // Obere Kanten
    if (Math.abs(targetBounds.top - bounds.top) <= threshold) {
      guides.push({ type: 'horizontal', position: bounds.top, elementId: element.id, snapType: 'edge' });
    }
    // Untere Kanten
    if (Math.abs(targetBounds.bottom - bounds.bottom) <= threshold) {
      guides.push({ type: 'horizontal', position: bounds.bottom, elementId: element.id, snapType: 'edge' });
    }
    // Zentriert vertikal
    if (Math.abs(targetBounds.centerY - bounds.centerY) <= threshold) {
      guides.push({ type: 'horizontal', position: bounds.centerY, elementId: element.id, snapType: 'center' });
    }
  });

  return guides;
};

const snapPositionToGuides = (
  position: ElementPosition,
  guides: AlignmentGuide[]
): ElementPosition => {
  let snappedPosition = { ...position };
  const bounds = getElementBounds({ position });

  guides.forEach(guide => {
    if (guide.type === 'vertical') {
      if (guide.snapType === 'edge') {
        // Snap linke Kante oder rechte Kante
        const leftSnap = Math.abs(bounds.left - guide.position);
        const rightSnap = Math.abs(bounds.right - guide.position);
        
        if (leftSnap <= SNAP_THRESHOLD) {
          snappedPosition.x = guide.position;
        } else if (rightSnap <= SNAP_THRESHOLD) {
          snappedPosition.x = guide.position - position.width;
        }
      } else if (guide.snapType === 'center') {
        // Snap Zentrum
        if (Math.abs(bounds.centerX - guide.position) <= SNAP_THRESHOLD) {
          snappedPosition.x = guide.position - position.width / 2;
        }
      }
    } else if (guide.type === 'horizontal') {
      if (guide.snapType === 'edge') {
        // Snap obere Kante oder untere Kante
        const topSnap = Math.abs(bounds.top - guide.position);
        const bottomSnap = Math.abs(bounds.bottom - guide.position);
        
        if (topSnap <= SNAP_THRESHOLD) {
          snappedPosition.y = guide.position;
        } else if (bottomSnap <= SNAP_THRESHOLD) {
          snappedPosition.y = guide.position - position.height;
        }
      } else if (guide.snapType === 'center') {
        // Snap Zentrum
        if (Math.abs(bounds.centerY - guide.position) <= SNAP_THRESHOLD) {
          snappedPosition.y = guide.position - position.height / 2;
        }
      }
    }
  });

  return snappedPosition;
};

export default function Preview({ 
  config, 
  setConfig, 
  viewMode, 
  selectedElement, 
  setSelectedElement, 
  isInteractive = false 
}: PreviewProps) {
  const { design } = config;
  const currentViewport = config[viewMode];
  const { profile, links } = currentViewport;

  // Interactive state
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
  const [resizeStart, setResizeStart] = useState({ 
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0, 
    elementX: 0, 
    elementY: 0, 
    direction: '',
    aspectRatio: 1 // Speichere das ursprüngliche Seitenverhältnis
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hilfsfunktionen für Element-Management
  const getCurrentElementPosition = (elementId: string) => {
    if (elementId === 'avatar') {
      return { id: 'avatar', position: currentViewport.profile.position };
    } else if (elementId === 'bio') {
      return { id: 'bio', position: currentViewport.profile.bioPosition || currentViewport.profile.position };
    } else {
      const link = links.find(l => l.id.toString() === elementId);
      return link ? { id: elementId, position: link.position } : null;
    }
  };

  const getAllOtherElements = (excludeId: string) => {
    const elements: Array<{ id: string; position: ElementPosition }> = [];
    
    // Avatar hinzufügen (außer wenn es das ausgewählte Element ist)
    if (excludeId !== 'avatar') {
      elements.push({ id: 'avatar', position: currentViewport.profile.position });
    }
    
    // Bio hinzufügen (außer wenn es das ausgewählte Element ist)
    if (excludeId !== 'bio' && currentViewport.profile.bioPosition) {
      elements.push({ id: 'bio', position: currentViewport.profile.bioPosition });
    }
    
    // Links hinzufügen (außer dem ausgewählten)
    links.forEach(link => {
      if (link.id.toString() !== excludeId) {
        elements.push({ id: link.id.toString(), position: link.position });
      }
    });
    
    return elements;
  };

  // Generiere den Hintergrund-Style basierend auf dem Typ
  const getBackgroundStyle = () => {
    switch (design.backgroundType) {
      case 'gradient':
        return {
          backgroundImage: `linear-gradient(${design.backgroundGradient.direction}, ${design.backgroundGradient.from}, ${design.backgroundGradient.to})`,
          backgroundColor: 'transparent',
          backgroundSize: 'auto',
          backgroundPosition: 'initial',
          backgroundRepeat: 'no-repeat',
          color: design.textColor,
        };
      case 'image':
        return {
          backgroundImage: design.backgroundImage ? `url(${design.backgroundImage})` : undefined,
          backgroundColor: design.backgroundColor, // Fallback
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: design.textColor,
        };
      case 'solid':
      default:
        return {
          backgroundImage: 'none',
          backgroundColor: design.backgroundColor,
          backgroundSize: 'auto',
          backgroundPosition: 'initial',
          backgroundRepeat: 'no-repeat',
          color: design.textColor,
        };
    }
  };

  // Berechne Kontrastfarbe für Selection-Box
  const getContrastColor = (bgColor: string): string => {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  // Interactive Handlers - nur wenn isInteractive=true
  const handleElementClick = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!isInteractive || !setSelectedElement) return;
    e.stopPropagation();
    setSelectedElement(elementId);
  }, [isInteractive, setSelectedElement]);

  const handleMouseDown = useCallback((elementId: string, e: React.MouseEvent) => {
    if (!isInteractive || !setConfig) return;
    e.preventDefault();
    e.stopPropagation();

    const element = document.getElementById(elementId);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setDragStart({
      x: e.clientX,
      y: e.clientY,
      elementX: rect.left - containerRect.left,
      elementY: rect.top - containerRect.top
    });

    setIsDragging(true);
    if (setSelectedElement) setSelectedElement(elementId);
  }, [isInteractive, setConfig, setSelectedElement]);

  const handleResizeMouseDown = useCallback((elementId: string, direction: string, e: React.MouseEvent) => {
    if (!isInteractive || !setConfig) return;
    e.preventDefault();
    e.stopPropagation();

    const element = document.getElementById(elementId);
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: rect.width,
      height: rect.height,
      elementX: rect.left - containerRect.left,
      elementY: rect.top - containerRect.top,
      direction: direction,
      aspectRatio: rect.width / rect.height // Berechne das ursprüngliche Seitenverhältnis
    });

    setIsResizing(true);
    if (setSelectedElement) setSelectedElement(elementId);
  }, [isInteractive, setConfig, setSelectedElement]);

  // Mouse Move & Up Effects
  useEffect(() => {
    if (!isInteractive || !setConfig) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && selectedElement) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        let newX = Math.max(0, dragStart.elementX + deltaX);
        let newY = Math.max(0, dragStart.elementY + deltaY);

        // Hole die aktuellen Element-Positionen für Alignment
        const currentElement = getCurrentElementPosition(selectedElement);
        if (currentElement) {
          const otherElements = getAllOtherElements(selectedElement);
          const tempPosition = { ...currentElement.position, x: newX, y: newY };
          
          // Finde Alignment-Guides
          const guides = findAlignmentGuides({ position: tempPosition }, otherElements);
          setAlignmentGuides(guides);
          
          // Snapping anwenden
          const snappedPosition = snapPositionToGuides(tempPosition, guides);
          newX = snappedPosition.x;
          newY = snappedPosition.y;
        }

        updateElementPosition(selectedElement, { x: newX, y: newY });
      }

      if (isResizing && selectedElement) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const isShiftPressed = e.shiftKey;
        
        let newX = resizeStart.elementX;
        let newY = resizeStart.elementY;
        let newWidth = resizeStart.width;
        let newHeight = resizeStart.height;

        if (isShiftPressed) {
          // Einfaches proportionales Resizing
          // Verwende deltaX als führende Dimension und berechne deltaY basierend darauf
          const proportionalDeltaY = deltaX / resizeStart.aspectRatio;
          
          switch (resizeStart.direction) {
            case 'nw': // Top-Left
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newY = Math.max(0, resizeStart.elementY + proportionalDeltaY);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(30, resizeStart.height - proportionalDeltaY);
              break;
            case 'ne': // Top-Right
              newY = Math.max(0, resizeStart.elementY - proportionalDeltaY);
              newWidth = Math.max(50, resizeStart.width + deltaX);
              newHeight = Math.max(30, resizeStart.height + proportionalDeltaY);
              break;
            case 'sw': // Bottom-Left
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(30, resizeStart.height - proportionalDeltaY);
              break;
            case 'se': // Bottom-Right
              newWidth = Math.max(50, resizeStart.width + deltaX);
              newHeight = Math.max(30, resizeStart.height + proportionalDeltaY);
              break;
          }
        } else {
          // Normales Resizing
          switch (resizeStart.direction) {
            case 'nw': // Top-Left
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newY = Math.max(0, resizeStart.elementY + deltaY);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(30, resizeStart.height - deltaY);
              break;
            case 'ne': // Top-Right
              newY = Math.max(0, resizeStart.elementY + deltaY);
              newWidth = Math.max(50, resizeStart.width + deltaX);
              newHeight = Math.max(30, resizeStart.height - deltaY);
              break;
            case 'sw': // Bottom-Left
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(30, resizeStart.height + deltaY);
              break;
            case 'se': // Bottom-Right
              newWidth = Math.max(50, resizeStart.width + deltaX);
              newHeight = Math.max(30, resizeStart.height + deltaY);
              break;
          }
        }

        // Alignment auch beim Resizing anwenden
        const currentElement = getCurrentElementPosition(selectedElement);
        if (currentElement) {
          const otherElements = getAllOtherElements(selectedElement);
          const tempPosition = { x: newX, y: newY, width: newWidth, height: newHeight };
          
          // Finde Alignment-Guides
          const guides = findAlignmentGuides({ position: tempPosition }, otherElements);
          setAlignmentGuides(guides);
          
          // Snapping anwenden
          const snappedPosition = snapPositionToGuides(tempPosition, guides);
          newX = snappedPosition.x;
          newY = snappedPosition.y;
          // Bei Resizing nur Position snappen, nicht die Größe verändern
        }

        updateElementPosition(selectedElement, { 
          x: newX, 
          y: newY, 
          width: newWidth, 
          height: newHeight 
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      setAlignmentGuides([]); // Guides verstecken wenn Aktion beendet
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, selectedElement, dragStart, resizeStart, isInteractive, setConfig]);

  // Update Element Position
  const updateElementPosition = (elementId: string, updates: Partial<ElementPosition>) => {
    if (!setConfig) return;

    const newConfig = { ...config };
    
    // Runde alle Pixel-Werte auf ganze Zahlen
    const roundedUpdates = {
      ...updates,
      ...(updates.x !== undefined && { x: Math.round(updates.x) }),
      ...(updates.y !== undefined && { y: Math.round(updates.y) }),
      ...(updates.width !== undefined && { width: Math.round(updates.width) }),
      ...(updates.height !== undefined && { height: Math.round(updates.height) }),
    };
    
    if (elementId === 'avatar') {
      newConfig[viewMode].profile.position = {
        ...newConfig[viewMode].profile.position,
        ...roundedUpdates
      };
    } else if (elementId === 'bio') {
      // Bio hat separate Position-Eigenschaften
      if (!newConfig[viewMode].profile.bioPosition) {
        newConfig[viewMode].profile.bioPosition = {
          x: 20,
          y: 150,
          width: 260,
          height: 60
        };
      }
      newConfig[viewMode].profile.bioPosition = {
        ...newConfig[viewMode].profile.bioPosition,
        ...roundedUpdates
      };
    } else if (elementId.startsWith('link-')) {
      const linkId = parseInt(elementId.replace('link-', ''));
      const linkIndex = newConfig[viewMode].links.findIndex(link => link.id === linkId);
      if (linkIndex !== -1) {
        newConfig[viewMode].links[linkIndex].position = {
          ...newConfig[viewMode].links[linkIndex].position,
          ...roundedUpdates
        };
      }
    }
    
    setConfig(newConfig);
  };

  // Background Click Handler
  const handleBackgroundClick = () => {
    if (!isInteractive || !setSelectedElement) return;
    setSelectedElement(null);
  };

  // Selection Box Component - nur für Interactive Mode
  const SelectionBox = ({ elementId, children, style }: { 
    elementId: string; 
    children: React.ReactNode; 
    style?: React.CSSProperties;
  }) => {
    if (!isInteractive) {
      return <div style={style}>{children}</div>;
    }

    const isSelected = selectedElement === elementId;
    const contrastColor = getContrastColor(design.backgroundColor);

    return (
      <div
        id={elementId}
        className="relative"
        style={{
          ...style,
          cursor: isDragging ? 'grabbing' : 'grab',
          outline: isSelected ? `2px solid ${contrastColor}` : 'none',
          outlineOffset: '2px'
        }}
        onClick={(e) => handleElementClick(elementId, e)}
        onMouseDown={(e) => handleMouseDown(elementId, e)}
      >
        {children}
        
        {/* Resize Handles - nur wenn ausgewählt */}
        {isSelected && (
          <>
            {/* Top-left */}
            <div
              className="absolute -top-1 -left-1 rounded-full cursor-nw-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'nw', e)}
              title="Resize (Shift = proportional)"
            />
            {/* Top-right */}
            <div
              className="absolute -top-1 -right-1 rounded-full cursor-ne-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'ne', e)}
              title="Resize (Shift = proportional)"
            />
            {/* Bottom-left */}
            <div
              className="absolute -bottom-1 -left-1 rounded-full cursor-sw-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'sw', e)}
              title="Resize (Shift = proportional)"
            />
            {/* Bottom-right */}
            <div
              className="absolute -bottom-1 -right-1 rounded-full cursor-se-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'se', e)}
              title="Resize (Shift = proportional)"
            />
          </>
        )}
      </div>
    );
  };

  if (viewMode === 'desktop') {
    return (
      // Desktop Preview
      <div className="relative">
        {/* Glow Effect Background */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-2xl blur-xl opacity-75 animate-pulse"></div>
        
        {/* Desktop Mockup */}
        <div className="relative w-[900px] h-[600px] rounded-2xl border-[8px] border-gray-800 bg-gray-900 shadow-2xl overflow-hidden ring-2 ring-primary/50 ring-offset-4 ring-offset-background">
          {/* Desktop Chrome/Header */}
          <div className="h-8 bg-gray-800 flex items-center px-4 gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 text-center text-xs text-gray-400">yoursite.com</div>
          </div>

          {/* Desktop Content */}
          <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden"
            style={getBackgroundStyle()}
            onClick={handleBackgroundClick}
          >
            {/* Avatar */}
            <SelectionBox 
              elementId="avatar"
              style={{
                position: 'absolute',
                left: profile.position.x,
                top: profile.position.y,
                width: profile.position.width,
                height: profile.position.height,
              }}
            >
              <img
                src={profile.avatarUrl}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg pointer-events-none"
              />
            </SelectionBox>

            {/* Profil-Infos - getrennt */}
            <SelectionBox 
              elementId="bio"
              style={{
                position: 'absolute',
                left: profile.bioPosition?.x || (profile.position.x - 60),
                top: profile.bioPosition?.y || (profile.position.y + profile.position.height + 20),
                width: profile.bioPosition?.width || (profile.position.width + 120),
                height: profile.bioPosition?.height || 60,
              }}
            >
              <div className="text-center pointer-events-none h-full flex flex-col justify-center">
                <h2 className="font-bold text-2xl mb-2">{profile.name}</h2>
                <p className="text-base opacity-90">{profile.bio}</p>
              </div>
            </SelectionBox>

            {/* Links */}
            {links
              .sort((a, b) => a.order - b.order)
              .map((link) => (
                <SelectionBox 
                  key={link.id} 
                  elementId={`link-${link.id}`}
                  style={{
                    position: 'absolute',
                    left: link.position.x,
                    top: link.position.y,
                    width: link.position.width,
                    height: link.position.height,
                  }}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full h-full text-center font-semibold transition-all hover:scale-105 hover:shadow-lg pointer-events-none items-center justify-center"
                    style={{
                      backgroundColor: link.customColor || design.buttonColor,
                      color: link.customTextColor || design.buttonTextColor,
                      borderRadius: `${link.customBorderRadius || design.buttonBorderRadius}px`,
                      fontSize: link.fontSize || 16,
                    }}
                  >
                    {link.title}
                  </a>
                </SelectionBox>
              ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    // Mobile Preview (iPhone Mockup)
    <div className="relative">
      {/* Glow Effect Background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-[50px] blur-xl opacity-75 animate-pulse"></div>
      
      {/* iPhone Mockup */}
      <div className="relative w-[300px] h-[600px] rounded-[40px] border-[10px] border-black bg-gray-800 shadow-2xl overflow-hidden ring-2 ring-primary/50 ring-offset-4 ring-offset-background">
        {/* Notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-22 h-6 bg-black rounded-2xl z-10"></div>

      {/* Screen Content */}
      <div
        ref={containerRef}
        className="relative w-full h-full overflow-hidden pt-8"
        style={getBackgroundStyle()}
        onClick={handleBackgroundClick}
      >
        {/* Avatar */}
        <SelectionBox 
          elementId="avatar"
          style={{
            position: 'absolute',
            left: profile.position.x,
            top: profile.position.y,
            width: profile.position.width,
            height: profile.position.height,
          }}
        >
          <img
            src={profile.avatarUrl}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover border-2 border-white pointer-events-none"
          />
        </SelectionBox>

        {/* Profil-Infos - getrennt */}
        <SelectionBox 
          elementId="bio"
          style={{
            position: 'absolute',
            left: profile.bioPosition?.x || 20,
            top: profile.bioPosition?.y || (profile.position.y + profile.position.height + 20),
            width: profile.bioPosition?.width || 260,
            height: profile.bioPosition?.height || 50,
          }}
        >
          <div className="text-center pointer-events-none h-full flex flex-col justify-center">
            <h2 className="font-bold text-lg">{profile.name}</h2>
            <p className="text-sm opacity-90">{profile.bio}</p>
          </div>
        </SelectionBox>

        {/* Links */}
        {links
          .sort((a, b) => a.order - b.order)
          .map((link) => (
            <SelectionBox 
              key={link.id} 
              elementId={`link-${link.id}`}
              style={{
                position: 'absolute',
                left: link.position.x,
                top: link.position.y,
                width: link.position.width,
                height: link.position.height,
              }}
            >
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full h-full text-center font-semibold transition-transform hover:scale-105 pointer-events-none items-center justify-center"
                style={{
                  backgroundColor: link.customColor || design.buttonColor,
                  color: link.customTextColor || design.buttonTextColor,
                  borderRadius: `${link.customBorderRadius || design.buttonBorderRadius}px`,
                  fontSize: link.fontSize || 14,
                }}
              >
                {link.title}
              </a>
            </SelectionBox>
          ))}

          {/* Alignment Guides */}
          {alignmentGuides.map((guide, index) => (
            <div
              key={`guide-${index}`}
              className="absolute pointer-events-none z-50"
              style={{
                ...(guide.type === 'vertical' 
                  ? {
                      left: guide.position,
                      top: 0,
                      bottom: 0,
                      width: '1px',
                      backgroundColor: '#3b82f6',
                      boxShadow: '0 0 4px rgba(59, 130, 246, 0.8)'
                    }
                  : {
                      top: guide.position,
                      left: 0,
                      right: 0,
                      height: '1px',
                      backgroundColor: '#3b82f6',
                      boxShadow: '0 0 4px rgba(59, 130, 246, 0.8)'
                    }
                ),
              }}
            />
          ))}
      </div>
    </div>
    </div>
  );
}