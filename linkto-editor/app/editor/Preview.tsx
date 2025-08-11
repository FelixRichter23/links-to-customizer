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
const SNAP_THRESHOLD = 8; // Smaller threshold for more precise control
const NEARBY_ELEMENT_THRESHOLD = 100; // Only snap to elements within 100px

// Constraint-System für Drag & Drop und Resize
const getConstraints = (viewMode: 'mobile' | 'desktop') => {
  if (viewMode === 'mobile') {
    return {
      container: { width: 280, height: 600 },
      avatar: { 
        minWidth: 40, maxWidth: 160, 
        minHeight: 40, maxHeight: 160,
        minX: 0, minY: 0
      },
      bio: { 
        minWidth: 100, maxWidth: 280, 
        minHeight: 20, maxHeight: 120,
        minX: 0, minY: 0
      },
      link: { 
        minWidth: 80, maxWidth: 280, 
        minHeight: 30, maxHeight: 80,
        minX: 0, minY: 0
      }
    };
  } else {
    return {
      container: { width: 848, height: 800 },
      avatar: { 
        minWidth: 60, maxWidth: 240, 
        minHeight: 60, maxHeight: 240,
        minX: 0, minY: 0
      },
      bio: { 
        minWidth: 200, maxWidth: 600, 
        minHeight: 30, maxHeight: 150,
        minX: 0, minY: 0
      },
      link: { 
        minWidth: 150, maxWidth: 600, 
        minHeight: 35, maxHeight: 100,
        minX: 0, minY: 0
      }
    };
  }
};

const validateAndClamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, Math.round(value)));
};

const getElementConstraints = (elementId: string, viewMode: 'mobile' | 'desktop') => {
  const constraints = getConstraints(viewMode);
  if (elementId === 'avatar') return constraints.avatar;
  if (elementId === 'bio') return constraints.bio;
  if (elementId.startsWith('link-')) return constraints.link;
  return constraints.link; // Fallback
};

const applyConstraintsToPosition = (
  elementId: string, 
  position: ElementPosition, 
  viewMode: 'mobile' | 'desktop'
): ElementPosition => {
  const constraints = getConstraints(viewMode);
  const elementConstraints = getElementConstraints(elementId, viewMode);
  
  // Clamp dimensions
  const clampedWidth = validateAndClamp(position.width, elementConstraints.minWidth, elementConstraints.maxWidth);
  const clampedHeight = validateAndClamp(position.height, elementConstraints.minHeight, elementConstraints.maxHeight);
  
  // Calculate max positions based on clamped dimensions
  const maxX = constraints.container.width - clampedWidth;
  const maxY = constraints.container.height - clampedHeight;
  
  // Clamp positions
  const clampedX = validateAndClamp(position.x, elementConstraints.minX, maxX);
  const clampedY = validateAndClamp(position.y, elementConstraints.minY, maxY);
  
  return {
    x: clampedX,
    y: clampedY,
    width: clampedWidth,
    height: clampedHeight
  };
};

// Hilfsfunktionen für Alignment
const getElementBounds = (element: { position: ElementPosition }) => ({
  left: element.position.x,
  right: element.position.x + element.position.width,
  top: element.position.y,
  bottom: element.position.y + element.position.height,
  centerX: element.position.x + element.position.width / 2,
  centerY: element.position.y + element.position.height / 2,
});

// Neue Funktion für Container-Bounds basierend auf ViewMode
const getContainerBounds = (viewMode: 'mobile' | 'desktop') => {
  if (viewMode === 'mobile') {
    // Mobile: iPhone mockup ist 300px breit mit 10px Border = 280px inner width
    // 600px hoch mit 10px Border oben/unten = 580px, aber 32px Notch oben
    return {
      width: 280, // Inner content area width
      height: 580 - 32, // Height minus notch
      centerX: 140, // 280/2
      centerY: (580 - 32) / 2 // Zentriert im sichtbaren Bereich
    };
  } else {
    // Desktop: 900px breit, 600px hoch (minus Header)
    return {
      width: 900,
      height: 600 - 32, // Abzüglich Header
      centerX: 450, // 900/2
      centerY: (600 - 32) / 2
    };
  }
};

const findAlignmentGuides = (
  targetElement: { position: ElementPosition },
  allElements: Array<{ id: string; position: ElementPosition }>,
  threshold: number = SNAP_THRESHOLD,
  viewMode: 'mobile' | 'desktop' = 'mobile'
): AlignmentGuide[] => {
  const guides: AlignmentGuide[] = [];
  const targetBounds = getElementBounds({ position: targetElement.position });
  const containerBounds = getContainerBounds(viewMode);

  // 1. Container center guides (always available)
  const centerXDistance = Math.abs(targetBounds.centerX - containerBounds.centerX);
  const centerYDistance = Math.abs(targetBounds.centerY - containerBounds.centerY);
  
  if (centerXDistance <= threshold) {
    guides.push({ 
      type: 'vertical', 
      position: containerBounds.centerX, 
      elementId: 'container', 
      snapType: 'center' 
    });
  }
  
  if (centerYDistance <= threshold) {
    guides.push({ 
      type: 'horizontal', 
      position: containerBounds.centerY, 
      elementId: 'container', 
      snapType: 'center' 
    });
  }

  // 2. Nearby element guides
  allElements.forEach(element => {
    const bounds = getElementBounds(element);
    
    // Only consider elements that are nearby (within NEARBY_ELEMENT_THRESHOLD)
    const isNearby = 
      Math.abs(targetBounds.centerX - bounds.centerX) <= NEARBY_ELEMENT_THRESHOLD &&
      Math.abs(targetBounds.centerY - bounds.centerY) <= NEARBY_ELEMENT_THRESHOLD;
    
    if (!isNearby) return;
    
    // Vertical edge alignment - check if any edge of target element is close to edges of other element
    const leftToLeftDistance = Math.abs(targetBounds.left - bounds.left);
    const leftToRightDistance = Math.abs(targetBounds.left - bounds.right);
    const rightToLeftDistance = Math.abs(targetBounds.right - bounds.left);
    const rightToRightDistance = Math.abs(targetBounds.right - bounds.right);
    
    // Add vertical guides if any edge is close enough
    if (leftToLeftDistance <= threshold || rightToLeftDistance <= threshold) {
      guides.push({ 
        type: 'vertical', 
        position: bounds.left, 
        elementId: element.id, 
        snapType: 'edge' 
      });
    }
    
    if (leftToRightDistance <= threshold || rightToRightDistance <= threshold) {
      guides.push({ 
        type: 'vertical', 
        position: bounds.right, 
        elementId: element.id, 
        snapType: 'edge' 
      });
    }
    
    // Horizontal edge alignment - check if any edge of target element is close to edges of other element
    const topToTopDistance = Math.abs(targetBounds.top - bounds.top);
    const topToBottomDistance = Math.abs(targetBounds.top - bounds.bottom);
    const bottomToTopDistance = Math.abs(targetBounds.bottom - bounds.top);
    const bottomToBottomDistance = Math.abs(targetBounds.bottom - bounds.bottom);
    
    // Add horizontal guides if any edge is close enough
    if (topToTopDistance <= threshold || bottomToTopDistance <= threshold) {
      guides.push({ 
        type: 'horizontal', 
        position: bounds.top, 
        elementId: element.id, 
        snapType: 'edge' 
      });
    }
    
    if (topToBottomDistance <= threshold || bottomToBottomDistance <= threshold) {
      guides.push({ 
        type: 'horizontal', 
        position: bounds.bottom, 
        elementId: element.id, 
        snapType: 'edge' 
      });
    }
  });

  return guides;
};

// Neue Funktion für Size-Snapping
const findSizeSnapTargets = (
  targetElement: { position: ElementPosition },
  allElements: Array<{ id: string; position: ElementPosition }>,
  threshold: number = SNAP_THRESHOLD
) => {
  const targetBounds = getElementBounds({ position: targetElement.position });
  let snapToWidth: number | null = null;
  let snapToHeight: number | null = null;
  let snapToElement: string | null = null;

  allElements.forEach(element => {
    const bounds = getElementBounds(element);
    
    // Prüfe Width-Snapping (wenn Höhen ähnlich sind oder übereinander gestapelt)
    const heightSimilar = Math.abs(targetElement.position.height - element.position.height) <= threshold;
    const verticallyAligned = Math.abs(targetBounds.left - bounds.left) <= threshold || 
                             Math.abs(targetBounds.right - bounds.right) <= threshold ||
                             Math.abs(targetBounds.centerX - bounds.centerX) <= threshold;
    
    if (verticallyAligned && Math.abs(targetElement.position.width - element.position.width) <= threshold * 2) {
      snapToWidth = element.position.width;
      snapToElement = element.id;
    }
    
    // Prüfe Height-Snapping (wenn Breiten ähnlich sind oder nebeneinander)
    const widthSimilar = Math.abs(targetElement.position.width - element.position.width) <= threshold;
    const horizontallyAligned = Math.abs(targetBounds.top - bounds.top) <= threshold || 
                               Math.abs(targetBounds.bottom - bounds.bottom) <= threshold ||
                               Math.abs(targetBounds.centerY - bounds.centerY) <= threshold;
    
    if (horizontallyAligned && Math.abs(targetElement.position.height - element.position.height) <= threshold * 2) {
      snapToHeight = element.position.height;
      snapToElement = element.id;
    }
  });

  return { snapToWidth, snapToHeight, snapToElement };
};

const snapPositionToGuides = (
  position: ElementPosition,
  guides: AlignmentGuide[]
): ElementPosition => {
  let snappedPosition = { ...position };
  const bounds = getElementBounds({ position });

  // Only snap to the closest guide in each direction
  let closestVerticalGuide: AlignmentGuide | null = null;
  let closestVerticalDistance = Infinity;
  let closestHorizontalGuide: AlignmentGuide | null = null;
  let closestHorizontalDistance = Infinity;

  // Find closest guides
  guides.forEach(guide => {
    if (guide.type === 'vertical') {
      let distance: number;
      if (guide.snapType === 'center') {
        distance = Math.abs(bounds.centerX - guide.position);
      } else {
        // Edge snapping: find the minimum distance from any edge of current element to the guide
        const leftToGuideDistance = Math.abs(bounds.left - guide.position);
        const rightToGuideDistance = Math.abs(bounds.right - guide.position);
        distance = Math.min(leftToGuideDistance, rightToGuideDistance);
      }
      
      if (distance < closestVerticalDistance) {
        closestVerticalGuide = guide;
        closestVerticalDistance = distance;
      }
    } else if (guide.type === 'horizontal') {
      let distance: number;
      if (guide.snapType === 'center') {
        distance = Math.abs(bounds.centerY - guide.position);
      } else {
        // Edge snapping: find the minimum distance from any edge of current element to the guide
        const topToGuideDistance = Math.abs(bounds.top - guide.position);
        const bottomToGuideDistance = Math.abs(bounds.bottom - guide.position);
        distance = Math.min(topToGuideDistance, bottomToGuideDistance);
      }
      
      if (distance < closestHorizontalDistance) {
        closestHorizontalGuide = guide;
        closestHorizontalDistance = distance;
      }
    }
  });

  // Apply snapping
  if (closestVerticalGuide !== null && closestVerticalDistance <= SNAP_THRESHOLD) {
    const vGuide = closestVerticalGuide as AlignmentGuide;
    if (vGuide.snapType === 'center') {
      snappedPosition.x = vGuide.position - position.width / 2;
    } else {
      // Edge snapping: snap the closest edge to the guide position
      const leftDistance = Math.abs(bounds.left - vGuide.position);
      const rightDistance = Math.abs(bounds.right - vGuide.position);
      
      if (leftDistance < rightDistance) {
        // Snap left edge to guide position
        snappedPosition.x = vGuide.position;
      } else {
        // Snap right edge to guide position
        snappedPosition.x = vGuide.position - position.width;
      }
    }
  }
  
  if (closestHorizontalGuide !== null && closestHorizontalDistance <= SNAP_THRESHOLD) {
    const hGuide = closestHorizontalGuide as AlignmentGuide;
    if (hGuide.snapType === 'center') {
      snappedPosition.y = hGuide.position - position.height / 2;
    } else {
      // Edge snapping: snap the closest edge to the guide position
      const topDistance = Math.abs(bounds.top - hGuide.position);
      const bottomDistance = Math.abs(bounds.bottom - hGuide.position);
      
      if (topDistance < bottomDistance) {
        // Snap top edge to guide position
        snappedPosition.y = hGuide.position;
      } else {
        // Snap bottom edge to guide position
        snappedPosition.y = hGuide.position - position.height;
      }
    }
  }

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
    direction: '' as 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e',
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
    } else if (elementId.startsWith('link-')) {
      const linkId = parseInt(elementId.replace('link-', ''));
      const link = links.find(l => l.id === linkId);
      return link ? { id: elementId, position: link.position } : null;
    } else {
      // Fallback für andere Formate
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
      const linkElementId = `link-${link.id}`;
      if (linkElementId !== excludeId) {
        elements.push({ id: linkElementId, position: link.position });
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
  }, [isInteractive, setConfig, setSelectedElement, viewMode]);

  const handleResizeMouseDown = useCallback((elementId: string, direction: 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e', e: React.MouseEvent) => {
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
  }, [isInteractive, setConfig, setSelectedElement, viewMode]);

  // Mouse Move & Up Effects
  useEffect(() => {
    if (!isInteractive || !setConfig) return;

    const handleMouseMove = (e: MouseEvent) => {
      const isCtrlPressed = e.ctrlKey; // Ctrl-Taste deaktiviert Snapping
      
      if (isDragging && selectedElement) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        // Berechne neue Position
        let newX = dragStart.elementX + deltaX;
        let newY = dragStart.elementY + deltaY;
        
        // Hole aktuelle Element-Position für Constraints
        const currentElement = getCurrentElementPosition(selectedElement);
        if (currentElement) {
          // Wende Constraints an
          const constrainedPosition = applyConstraintsToPosition(
            selectedElement,
            { 
              x: newX, 
              y: newY, 
              width: currentElement.position.width, 
              height: currentElement.position.height 
            },
            viewMode
          );
          
          newX = constrainedPosition.x;
          newY = constrainedPosition.y;

          // Snapping nur wenn Ctrl NICHT gedrückt ist
          if (!isCtrlPressed) {
            // Hole die aktuellen Element-Positionen für Alignment
            const otherElements = getAllOtherElements(selectedElement);
            const tempPosition = { ...currentElement.position, x: newX, y: newY };
            
            // Finde Alignment-Guides (mit ViewMode)
            const guides = findAlignmentGuides({ position: tempPosition }, otherElements, SNAP_THRESHOLD, viewMode);
            setAlignmentGuides(guides);
            
            // Snapping anwenden
            const snappedPosition = snapPositionToGuides(tempPosition, guides);
            
            // Wende Constraints auch auf gesnappte Position an
            const finalPosition = applyConstraintsToPosition(
              selectedElement,
              snappedPosition,
              viewMode
            );
            
            newX = finalPosition.x;
            newY = finalPosition.y;
          } else {
            // Guides verstecken wenn Ctrl gedrückt
            setAlignmentGuides([]);
          }
        }

        updateElementPosition(selectedElement, { x: newX, y: newY });
      }

      if (isResizing && selectedElement) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        const isShiftPressed = e.shiftKey;
        const isCtrlPressed = e.ctrlKey; // Ctrl deaktiviert Snapping
        const containerBounds = getContainerBounds(viewMode);
        
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
            // Edge Handles - proportional
            case 'n': // Top - verwende deltaY als führend
              const nProportionalDeltaX = deltaY * resizeStart.aspectRatio;
              newY = Math.max(0, resizeStart.elementY + deltaY);
              newX = Math.max(0, resizeStart.elementX - nProportionalDeltaX / 2);
              newHeight = Math.max(30, resizeStart.height - deltaY);
              newWidth = Math.max(50, resizeStart.width + nProportionalDeltaX);
              break;
            case 's': // Bottom - verwende deltaY als führend
              const sProportionalDeltaX = deltaY * resizeStart.aspectRatio;
              newHeight = Math.max(30, resizeStart.height + deltaY);
              newX = Math.max(0, resizeStart.elementX - sProportionalDeltaX / 2);
              newWidth = Math.max(50, resizeStart.width + sProportionalDeltaX);
              break;
            case 'w': // Left - verwende deltaX als führend
              const wProportionalDeltaY = deltaX / resizeStart.aspectRatio;
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newY = Math.max(0, resizeStart.elementY - wProportionalDeltaY / 2);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(30, resizeStart.height + wProportionalDeltaY);
              break;
            case 'e': // Right - verwende deltaX als führend
              const eProportionalDeltaY = deltaX / resizeStart.aspectRatio;
              newWidth = Math.max(50, resizeStart.width + deltaX);
              newY = Math.max(0, resizeStart.elementY - eProportionalDeltaY / 2);
              newHeight = Math.max(30, resizeStart.height + eProportionalDeltaY);
              break;
          }
        } else {
          // Normales Resizing mit Container-Grenzen
          switch (resizeStart.direction) {
            case 'nw': // Top-Left
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newY = Math.max(0, resizeStart.elementY + deltaY);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(30, resizeStart.height - deltaY);
              break;
            case 'ne': // Top-Right
              newY = Math.max(0, resizeStart.elementY + deltaY);
              newWidth = Math.max(50, Math.min(containerBounds.width - newX, resizeStart.width + deltaX));
              newHeight = Math.max(30, resizeStart.height - deltaY);
              break;
            case 'sw': // Bottom-Left
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              newHeight = Math.max(30, Math.min(containerBounds.height - newY, resizeStart.height + deltaY));
              break;
            case 'se': // Bottom-Right
              newWidth = Math.max(50, Math.min(containerBounds.width - newX, resizeStart.width + deltaX));
              newHeight = Math.max(30, Math.min(containerBounds.height - newY, resizeStart.height + deltaY));
              break;
            // Edge Handles - nur eine Dimension mit Container-Grenzen
            case 'n': // Top
              newY = Math.max(0, resizeStart.elementY + deltaY);
              newHeight = Math.max(30, resizeStart.height - deltaY);
              break;
            case 's': // Bottom
              newHeight = Math.max(30, Math.min(containerBounds.height - newY, resizeStart.height + deltaY));
              break;
            case 'w': // Left
              newX = Math.max(0, resizeStart.elementX + deltaX);
              newWidth = Math.max(50, resizeStart.width - deltaX);
              break;
            case 'e': // Right
              newWidth = Math.max(50, Math.min(containerBounds.width - newX, resizeStart.width + deltaX));
              break;
          }
        }

        // Wende Constraints an (vor Snapping)
        const constrainedPosition = applyConstraintsToPosition(
          selectedElement,
          { x: newX, y: newY, width: newWidth, height: newHeight },
          viewMode
        );
        
        newX = constrainedPosition.x;
        newY = constrainedPosition.y;
        newWidth = constrainedPosition.width;
        newHeight = constrainedPosition.height;

        // Alignment beim Resizing - nur wenn Ctrl NICHT gedrückt ist
        if (!isCtrlPressed) {
          const currentElement = getCurrentElementPosition(selectedElement);
          if (currentElement) {
            const otherElements = getAllOtherElements(selectedElement);
            const tempPosition = { x: newX, y: newY, width: newWidth, height: newHeight };
            
            // Finde Alignment-Guides (mit ViewMode)
            const guides = findAlignmentGuides({ position: tempPosition }, otherElements, SNAP_THRESHOLD, viewMode);
            setAlignmentGuides(guides);
            
            // Size-Snapping nur wenn NICHT proportional resized wird (kein Shift)
            if (!isShiftPressed) {
              // Finde Size-Snap Targets
              const sizeSnaps = findSizeSnapTargets({ position: tempPosition }, otherElements);
              
              // Size-Snapping anwenden (hat Priorität über normale Resize-Berechnung)
              if (sizeSnaps.snapToWidth !== null && 
                  (resizeStart.direction.includes('e') || resizeStart.direction.includes('w') || 
                   resizeStart.direction.includes('n') || resizeStart.direction.includes('s'))) {
                
                // Berechne neue X-Position basierend auf Resize-Richtung
                if (resizeStart.direction.includes('w')) {
                  // Links resizing - X Position anpassen
                  newX = newX + newWidth - sizeSnaps.snapToWidth;
                }
                newWidth = sizeSnaps.snapToWidth;
              }
              
              if (sizeSnaps.snapToHeight !== null && 
                  (resizeStart.direction.includes('n') || resizeStart.direction.includes('s') || 
                   resizeStart.direction.includes('e') || resizeStart.direction.includes('w'))) {
                
                // Berechne neue Y-Position basierend auf Resize-Richtung
                if (resizeStart.direction.includes('n')) {
                  // Oben resizing - Y Position anpassen
                  newY = newY + newHeight - sizeSnaps.snapToHeight;
                }
                newHeight = sizeSnaps.snapToHeight;
              }
            }
            
            // Position-Snapping NUR bei Edge-Resizing und nur für die entsprechende Kante
            if (!isShiftPressed) {
              const finalPosition = { x: newX, y: newY, width: newWidth, height: newHeight };
              
              // Nur die relevanten Guides für die aktuelle Resize-Richtung berücksichtigen
              const relevantGuides = guides.filter(guide => {
                if (guide.type === 'vertical') {
                  // Bei West-Resize: nur linke Kante, bei East-Resize: nur rechte Kante
                  if (resizeStart.direction.includes('w')) {
                    return guide.snapType === 'edge'; // Linke Kante kann snappen
                  } else if (resizeStart.direction.includes('e')) {
                    return guide.snapType === 'edge'; // Rechte Kante kann snappen
                  }
                } else if (guide.type === 'horizontal') {
                  // Bei North-Resize: nur obere Kante, bei South-Resize: nur untere Kante
                  if (resizeStart.direction.includes('n')) {
                    return guide.snapType === 'edge'; // Obere Kante kann snappen
                  } else if (resizeStart.direction.includes('s')) {
                    return guide.snapType === 'edge'; // Untere Kante kann snappen
                  }
                }
                return false;
              });
              
              // Sanftes Position-Snapping nur für die resize-relevante Kante
              relevantGuides.forEach(guide => {
                if (guide.type === 'vertical') {
                  const currentBounds = getElementBounds({ position: finalPosition });
                  
                  if (resizeStart.direction.includes('w')) {
                    // West-Resize: Linke Kante snappen
                    const leftDistance = Math.abs(currentBounds.left - guide.position);
                    if (leftDistance <= SNAP_THRESHOLD) {
                      const snapDelta = guide.position - currentBounds.left;
                      newX += snapDelta;
                      newWidth -= snapDelta;
                    }
                  } else if (resizeStart.direction.includes('e')) {
                    // East-Resize: Rechte Kante snappen
                    const rightDistance = Math.abs(currentBounds.right - guide.position);
                    if (rightDistance <= SNAP_THRESHOLD) {
                      newWidth = guide.position - newX;
                    }
                  }
                } else if (guide.type === 'horizontal') {
                  const currentBounds = getElementBounds({ position: finalPosition });
                  
                  if (resizeStart.direction.includes('n')) {
                    // North-Resize: Obere Kante snappen
                    const topDistance = Math.abs(currentBounds.top - guide.position);
                    if (topDistance <= SNAP_THRESHOLD) {
                      const snapDelta = guide.position - currentBounds.top;
                      newY += snapDelta;
                      newHeight -= snapDelta;
                    }
                  } else if (resizeStart.direction.includes('s')) {
                    // South-Resize: Untere Kante snappen
                    const bottomDistance = Math.abs(currentBounds.bottom - guide.position);
                    if (bottomDistance <= SNAP_THRESHOLD) {
                      newHeight = guide.position - newY;
                    }
                  }
                }
              });
              
              // Wende Constraints erneut an (nach Snapping)
              const finalConstrainedPosition = applyConstraintsToPosition(
                selectedElement,
                { x: newX, y: newY, width: newWidth, height: newHeight },
                viewMode
              );
              
              newX = finalConstrainedPosition.x;
              newY = finalConstrainedPosition.y;
              newWidth = finalConstrainedPosition.width;
              newHeight = finalConstrainedPosition.height;
            }
          }
        } else {
          // Guides verstecken wenn Ctrl gedrückt
          setAlignmentGuides([]);
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
      const currentPos = newConfig[viewMode].profile.position;
      const newPos = { ...currentPos, ...roundedUpdates };
      
      // Wende Constraints an
      const constrainedPos = applyConstraintsToPosition(elementId, newPos, viewMode);
      
      newConfig[viewMode].profile.position = constrainedPos;
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
      const currentPos = newConfig[viewMode].profile.bioPosition;
      const newPos = { ...currentPos, ...roundedUpdates };
      
      // Wende Constraints an
      const constrainedPos = applyConstraintsToPosition(elementId, newPos, viewMode);
      
      newConfig[viewMode].profile.bioPosition = constrainedPos;
    } else if (elementId.startsWith('link-')) {
      const linkId = parseInt(elementId.replace('link-', ''));
      const linkIndex = newConfig[viewMode].links.findIndex(link => link.id === linkId);
      if (linkIndex !== -1) {
        const currentPos = newConfig[viewMode].links[linkIndex].position;
        const newPos = { ...currentPos, ...roundedUpdates };
        
        // Wende Constraints an
        const constrainedPos = applyConstraintsToPosition(elementId, newPos, viewMode);
        
        newConfig[viewMode].links[linkIndex].position = constrainedPos;
      }
    }

    setConfig(newConfig);
  };  // Background Click Handler
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
            {/* Corner Handles */}
            {/* Top-left */}
            <div
              className="absolute -top-1 -left-1 rounded-full cursor-nw-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'nw', e)}
              title="Resize (Shift = proportional, Ctrl = disable snapping)"
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
              title="Resize (Shift = proportional, Ctrl = disable snapping)"
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
              title="Resize (Shift = proportional, Ctrl = disable snapping)"
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
              title="Resize (Shift = proportional, Ctrl = disable snapping)"
            />
            
            {/* Edge Handles - Mitte der Seiten */}
            {/* Top */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-full cursor-n-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'n', e)}
              title="Resize vertikal (Shift = proportional, Ctrl = disable snapping)"
            />
            {/* Bottom */}
            <div
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full cursor-s-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 's', e)}
              title="Resize vertikal (Shift = proportional, Ctrl = disable snapping)"
            />
            {/* Left */}
            <div
              className="absolute -left-1 top-1/2 -translate-y-1/2 rounded-full cursor-w-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'w', e)}
              title="Resize horizontal (Shift = proportional, Ctrl = disable snapping)"
            />
            {/* Right */}
            <div
              className="absolute -right-1 top-1/2 -translate-y-1/2 rounded-full cursor-e-resize hover:scale-125 transition-transform"
              style={{
                backgroundColor: contrastColor,
                width: RESIZE_HANDLE_SIZE,
                height: RESIZE_HANDLE_SIZE,
              }}
              onMouseDown={(e) => handleResizeMouseDown(elementId, 'e', e)}
              title="Resize horizontal (Shift = proportional, Ctrl = disable snapping)"
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

            {/* Alignment Guides für Desktop */}
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
            left: profile.bioPosition?.x || 10, // Centered in 280px container
            top: profile.bioPosition?.y || (profile.position.y + profile.position.height + 20),
            width: profile.bioPosition?.width || 260, // Fits in 280px with 10px margin each side
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