// app/editor/ElementProperties.tsx
import React from "react";
import { type PageConfig } from "./types";

interface ElementPropertiesProps {
  selectedElement: string | null;
  config: PageConfig;
  setConfig: (config: PageConfig, actionType?: string) => void;
  viewMode: 'mobile' | 'desktop';
}

export default function ElementProperties({ selectedElement, config, setConfig, viewMode }: ElementPropertiesProps) {
  const currentViewport = config[viewMode];

  // Standard-Werte und Constraints definieren
  const getDefaultValues = () => {
    if (viewMode === 'mobile') {
      return {
        avatar: { x: 92, y: 40, width: 96, height: 96 },
        textElement: { x: 10, y: 160, width: 260, height: 30 },
        link: { x: 10, y: 220, width: 260, height: 40 }
      };
    } else {
      return {
        avatar: { x: 306, y: 80, width: 128, height: 128 },
        textElement: { x: 240, y: 248, width: 368, height: 40 },
        link: { x: 240, y: 320, width: 368, height: 50 }
      };
    }
  };

  const getConstraints = () => {
    if (viewMode === 'mobile') {
      return {
        container: { width: 280, height: 600 },
        avatar: { 
          minWidth: 40, maxWidth: 160, 
          minHeight: 40, maxHeight: 160,
          minX: 0, minY: 0
        },
        textElement: { 
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
        textElement: { 
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

  const getMaxPositions = (elementType: string, width: number, height: number) => {
    const constraints = getConstraints();
    return {
      maxX: constraints.container.width - width,
      maxY: constraints.container.height - height
    };
  };

  if (!selectedElement) {
    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <h3 className="font-semibold mb-1 text-xs">Properties</h3>
        <p className="text-xs text-muted-foreground text-center py-3">
          Click on an element<br/>to edit it
        </p>
      </div>
    );
  }

  // Handler für TextElement Änderungen
  const handleTextElementChange = (elementId: string, property: string, value: any) => {
    const constraints = getConstraints();
    const newConfig = JSON.parse(JSON.stringify(config));
    const elementIndex = newConfig[viewMode].textElements.findIndex((el: any) => el.id === elementId);
    
    if (elementIndex !== -1) {
      if (property.startsWith('position.')) {
        const positionProp = property.split('.')[1];
        const currentPos = newConfig[viewMode].textElements[elementIndex].position;
        let newValue = Math.round(value);
        
        if (positionProp === 'width') {
          newValue = validateAndClamp(newValue, constraints.textElement.minWidth, constraints.textElement.maxWidth);
          const maxPos = getMaxPositions('textElement', newValue, currentPos.height);
          if (currentPos.x > maxPos.maxX) {
            newConfig[viewMode].textElements[elementIndex].position.x = maxPos.maxX;
          }
        } else if (positionProp === 'height') {
          newValue = validateAndClamp(newValue, constraints.textElement.minHeight, constraints.textElement.maxHeight);
          const maxPos = getMaxPositions('textElement', currentPos.width, newValue);
          if (currentPos.y > maxPos.maxY) {
            newConfig[viewMode].textElements[elementIndex].position.y = maxPos.maxY;
          }
        } else if (positionProp === 'x') {
          const maxPos = getMaxPositions('textElement', currentPos.width, currentPos.height);
          newValue = validateAndClamp(newValue, constraints.textElement.minX, maxPos.maxX);
        } else if (positionProp === 'y') {
          const maxPos = getMaxPositions('textElement', currentPos.width, currentPos.height);
          newValue = validateAndClamp(newValue, constraints.textElement.minY, maxPos.maxY);
        }
        
        newConfig[viewMode].textElements[elementIndex].position = {
          ...newConfig[viewMode].textElements[elementIndex].position,
          [positionProp]: newValue
        };
      } else if (property === 'content') {
        newConfig[viewMode].textElements[elementIndex].content = value;
      } else if (property.startsWith('style.')) {
        const styleProp = property.split('.')[1];
        newConfig[viewMode].textElements[elementIndex].style = {
          ...newConfig[viewMode].textElements[elementIndex].style,
          [styleProp]: value
        };
      }
    }
    setConfig(newConfig, property === 'content' ? 'text-change' : 'style-change');
  };

  // Handler für Avatar Änderungen
  const handleAvatarChange = (property: string, value: any) => {
    const constraints = getConstraints();
    const newConfig = JSON.parse(JSON.stringify(config));
    
    if (property.startsWith('position.')) {
      const positionProp = property.split('.')[1];
      const currentPos = newConfig[viewMode].profile.position;
      let newValue = Math.round(value);
      
      if (positionProp === 'width') {
        newValue = validateAndClamp(newValue, constraints.avatar.minWidth, constraints.avatar.maxWidth);
        const maxPos = getMaxPositions('avatar', newValue, currentPos.height);
        if (currentPos.x > maxPos.maxX) {
          newConfig[viewMode].profile.position.x = maxPos.maxX;
        }
      } else if (positionProp === 'height') {
        newValue = validateAndClamp(newValue, constraints.avatar.minHeight, constraints.avatar.maxHeight);
        const maxPos = getMaxPositions('avatar', currentPos.width, newValue);
        if (currentPos.y > maxPos.maxY) {
          newConfig[viewMode].profile.position.y = maxPos.maxY;
        }
      } else if (positionProp === 'x') {
        const maxPos = getMaxPositions('avatar', currentPos.width, currentPos.height);
        newValue = validateAndClamp(newValue, constraints.avatar.minX, maxPos.maxX);
      } else if (positionProp === 'y') {
        const maxPos = getMaxPositions('avatar', currentPos.width, currentPos.height);
        newValue = validateAndClamp(newValue, constraints.avatar.minY, maxPos.maxY);
      }
      
      newConfig[viewMode].profile.position = {
        ...newConfig[viewMode].profile.position,
        [positionProp]: newValue
      };
    } else if (property === 'avatarUrl') {
      newConfig[viewMode].profile.avatarUrl = value;
    }
    setConfig(newConfig, 'avatar-change');
  };

  // Handler für Link Änderungen
  const handleLinkChange = (linkId: number, property: string, value: any) => {
    const constraints = getConstraints();
    const newConfig = JSON.parse(JSON.stringify(config));
    const linkIndex = newConfig[viewMode].links.findIndex((link: any) => link.id === linkId);
    
    if (linkIndex !== -1) {
      if (property.startsWith('position.')) {
        const positionProp = property.split('.')[1];
        const currentPos = newConfig[viewMode].links[linkIndex].position;
        let newValue = Math.round(value);
        
        if (positionProp === 'width') {
          newValue = validateAndClamp(newValue, constraints.link.minWidth, constraints.link.maxWidth);
          const maxPos = getMaxPositions('link', newValue, currentPos.height);
          if (currentPos.x > maxPos.maxX) {
            newConfig[viewMode].links[linkIndex].position.x = maxPos.maxX;
          }
        } else if (positionProp === 'height') {
          newValue = validateAndClamp(newValue, constraints.link.minHeight, constraints.link.maxHeight);
          const maxPos = getMaxPositions('link', currentPos.width, newValue);
          if (currentPos.y > maxPos.maxY) {
            newConfig[viewMode].links[linkIndex].position.y = maxPos.maxY;
          }
        } else if (positionProp === 'x') {
          const maxPos = getMaxPositions('link', currentPos.width, currentPos.height);
          newValue = validateAndClamp(newValue, constraints.link.minX, maxPos.maxX);
        } else if (positionProp === 'y') {
          const maxPos = getMaxPositions('link', currentPos.width, currentPos.height);
          newValue = validateAndClamp(newValue, constraints.link.minY, maxPos.maxY);
        }
        
        newConfig[viewMode].links[linkIndex].position = {
          ...newConfig[viewMode].links[linkIndex].position,
          [positionProp]: newValue
        };
      } else {
        (newConfig[viewMode].links[linkIndex] as any)[property] = value;
      }
    }
    setConfig(newConfig, 'link-change');
  };

  // Avatar Properties
  if (selectedElement === 'avatar') {
    const profile = currentViewport.profile;
    const constraints = getConstraints();
    const maxPos = getMaxPositions('avatar', profile.position.width, profile.position.height);
    
    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <h3 className="font-semibold mb-2 text-xs">Avatar</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs block mb-1">URL</label>
            <input
              type="url"
              value={profile.avatarUrl}
              onChange={(e) => handleAvatarChange('avatarUrl', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium">Position & Size</label>
            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">X</label>
                <input
                  type="number"
                  min={constraints.avatar.minX}
                  max={maxPos.maxX}
                  value={profile.position.x}
                  onChange={(e) => handleAvatarChange('position.x', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">Y</label>
                <input
                  type="number"
                  min={constraints.avatar.minY}
                  max={maxPos.maxY}
                  value={profile.position.y}
                  onChange={(e) => handleAvatarChange('position.y', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">W</label>
                <input
                  type="number"
                  min={constraints.avatar.minWidth}
                  max={constraints.avatar.maxWidth}
                  value={profile.position.width}
                  onChange={(e) => handleAvatarChange('position.width', parseInt(e.target.value) || 96)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">H</label>
                <input
                  type="number"
                  min={constraints.avatar.minHeight}
                  max={constraints.avatar.maxHeight}
                  value={profile.position.height}
                  onChange={(e) => handleAvatarChange('position.height', parseInt(e.target.value) || 96)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TextElement Properties
  if (selectedElement && (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-'))) {
    const textElement = currentViewport.textElements.find(el => el.id === selectedElement);
    if (!textElement) return null;

    const constraints = getConstraints();
    const maxPos = getMaxPositions('textElement', textElement.position.width, textElement.position.height);
    
    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <h3 className="font-semibold mb-2 text-xs">Text Element</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs block mb-1">Content</label>
            <input
              type="text"
              value={textElement.content}
              onChange={(e) => handleTextElementChange(selectedElement, 'content', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          
          <div>
            <label className="text-xs block mb-1">Font Size</label>
            <input
              type="number"
              min="8"
              max="72"
              value={textElement.style.fontSize || 16}
              onChange={(e) => handleTextElementChange(selectedElement, 'style.fontSize', parseInt(e.target.value) || 16)}
              className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium">Position & Size</label>
            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">X</label>
                <input
                  type="number"
                  min={constraints.textElement.minX}
                  max={maxPos.maxX}
                  value={textElement.position.x}
                  onChange={(e) => handleTextElementChange(selectedElement, 'position.x', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">Y</label>
                <input
                  type="number"
                  min={constraints.textElement.minY}
                  max={maxPos.maxY}
                  value={textElement.position.y}
                  onChange={(e) => handleTextElementChange(selectedElement, 'position.y', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">W</label>
                <input
                  type="number"
                  min={constraints.textElement.minWidth}
                  max={constraints.textElement.maxWidth}
                  value={textElement.position.width}
                  onChange={(e) => handleTextElementChange(selectedElement, 'position.width', parseInt(e.target.value) || 260)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">H</label>
                <input
                  type="number"
                  min={constraints.textElement.minHeight}
                  max={constraints.textElement.maxHeight}
                  value={textElement.position.height}
                  onChange={(e) => handleTextElementChange(selectedElement, 'position.height', parseInt(e.target.value) || 30)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Link Properties
  if (selectedElement && selectedElement.startsWith('link-')) {
    const linkId = parseInt(selectedElement.replace('link-', ''));
    const link = currentViewport.links.find(l => l.id === linkId);
    if (!link) return null;

    const constraints = getConstraints();
    const maxPos = getMaxPositions('link', link.position.width, link.position.height);
    
    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <h3 className="font-semibold mb-2 text-xs">Link</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs block mb-1">Title</label>
            <input
              type="text"
              value={link.title}
              onChange={(e) => handleLinkChange(linkId, 'title', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          
          <div>
            <label className="text-xs block mb-1">URL</label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => handleLinkChange(linkId, 'url', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-medium">Position & Size</label>
            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">X</label>
                <input
                  type="number"
                  min={constraints.link.minX}
                  max={maxPos.maxX}
                  value={link.position.x}
                  onChange={(e) => handleLinkChange(linkId, 'position.x', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">Y</label>
                <input
                  type="number"
                  min={constraints.link.minY}
                  max={maxPos.maxY}
                  value={link.position.y}
                  onChange={(e) => handleLinkChange(linkId, 'position.y', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">W</label>
                <input
                  type="number"
                  min={constraints.link.minWidth}
                  max={constraints.link.maxWidth}
                  value={link.position.width}
                  onChange={(e) => handleLinkChange(linkId, 'position.width', parseInt(e.target.value) || 260)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">H</label>
                <input
                  type="number"
                  min={constraints.link.minHeight}
                  max={constraints.link.maxHeight}
                  value={link.position.height}
                  onChange={(e) => handleLinkChange(linkId, 'position.height', parseInt(e.target.value) || 40)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-2">
      <h3 className="font-semibold mb-1 text-xs">Properties</h3>
      <p className="text-xs text-muted-foreground text-center py-3">
        Unknown element type
      </p>
    </div>
  );
}
