// app/editor/ElementProperties.tsx
import React from "react";
import { type PageConfig } from "./types";

interface ElementPropertiesProps {
  selectedElement: string | null;
  config: PageConfig;
  setConfig: (config: PageConfig) => void;
  viewMode: 'mobile' | 'desktop';
}

export default function ElementProperties({ selectedElement, config, setConfig, viewMode }: ElementPropertiesProps) {
  const currentViewport = config[viewMode];

  // Standard-Werte und Constraints definieren
  const getDefaultValues = () => {
    if (viewMode === 'mobile') {
      return {
        avatar: { x: 92, y: 40, width: 96, height: 96 },
        bio: { x: 10, y: 160, width: 260, height: 45 },
        link: { x: 10, y: 220, width: 260, height: 40 }
      };
    } else {
      return {
        avatar: { x: 306, y: 80, width: 128, height: 128 },
        bio: { x: 240, y: 248, width: 368, height: 50 },
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

  const getMaxPositions = (elementType: 'avatar' | 'bio' | 'link', width: number, height: number) => {
    const constraints = getConstraints();
    return {
      maxX: constraints.container.width - width,
      maxY: constraints.container.height - height
    };
  };

  const resetToDefaults = (type: 'avatar' | 'bio' | 'link', linkId?: number) => {
    const defaults = getDefaultValues();
    const newConfig = { ...config };
    
    if (type === 'avatar') {
      newConfig[viewMode].profile.position = {
        ...newConfig[viewMode].profile.position,
        width: defaults.avatar.width,
        height: defaults.avatar.height
      };
    } else if (type === 'bio') {
      newConfig[viewMode].profile.bioPosition = {
        ...newConfig[viewMode].profile.bioPosition || defaults.bio,
        width: defaults.bio.width,
        height: defaults.bio.height
      };
    } else if (type === 'link' && linkId !== undefined) {
      const linkIndex = newConfig[viewMode].links.findIndex(link => link.id === linkId);
      if (linkIndex !== -1) {
        newConfig[viewMode].links[linkIndex].position = {
          ...newConfig[viewMode].links[linkIndex].position,
          width: defaults.link.width,
          height: defaults.link.height
        };
      }
    }
    setConfig(newConfig);
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

  const handleProfileChange = (property: string, value: any) => {
    const constraints = getConstraints();
    const newConfig = { ...config };
    
    if (property.startsWith('position.')) {
      const positionProp = property.split('.')[1];
      const currentPos = newConfig[viewMode].profile.position;
      let newValue = Math.round(value);
      
      // Validate based on property type
      if (positionProp === 'width') {
        newValue = validateAndClamp(newValue, constraints.avatar.minWidth, constraints.avatar.maxWidth);
        // Adjust X if width would push element out of bounds
        const maxPos = getMaxPositions('avatar', newValue, currentPos.height);
        if (currentPos.x > maxPos.maxX) {
          newConfig[viewMode].profile.position.x = maxPos.maxX;
        }
      } else if (positionProp === 'height') {
        newValue = validateAndClamp(newValue, constraints.avatar.minHeight, constraints.avatar.maxHeight);
        // Adjust Y if height would push element out of bounds
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
    } else if (property.startsWith('bioPosition.')) {
      const positionProp = property.split('.')[1];
      if (!newConfig[viewMode].profile.bioPosition) {
        newConfig[viewMode].profile.bioPosition = getDefaultValues().bio;
      }
      const currentPos = newConfig[viewMode].profile.bioPosition;
      let newValue = Math.round(value);
      
      // Validate based on property type
      if (positionProp === 'width') {
        newValue = validateAndClamp(newValue, constraints.bio.minWidth, constraints.bio.maxWidth);
        // Adjust X if width would push element out of bounds
        const maxPos = getMaxPositions('bio', newValue, currentPos.height);
        if (currentPos.x > maxPos.maxX) {
          newConfig[viewMode].profile.bioPosition.x = maxPos.maxX;
        }
      } else if (positionProp === 'height') {
        newValue = validateAndClamp(newValue, constraints.bio.minHeight, constraints.bio.maxHeight);
        // Adjust Y if height would push element out of bounds
        const maxPos = getMaxPositions('bio', currentPos.width, newValue);
        if (currentPos.y > maxPos.maxY) {
          newConfig[viewMode].profile.bioPosition.y = maxPos.maxY;
        }
      } else if (positionProp === 'x') {
        const maxPos = getMaxPositions('bio', currentPos.width, currentPos.height);
        newValue = validateAndClamp(newValue, constraints.bio.minX, maxPos.maxX);
      } else if (positionProp === 'y') {
        const maxPos = getMaxPositions('bio', currentPos.width, currentPos.height);
        newValue = validateAndClamp(newValue, constraints.bio.minY, maxPos.maxY);
      }
      
      newConfig[viewMode].profile.bioPosition = {
        ...newConfig[viewMode].profile.bioPosition,
        [positionProp]: newValue
      };
    } else {
      (newConfig[viewMode].profile as any)[property] = value;
    }
    setConfig(newConfig);
  };

  const handleLinkChange = (linkId: number, property: string, value: any) => {
    const constraints = getConstraints();
    const newConfig = { ...config };
    const linkIndex = newConfig[viewMode].links.findIndex(link => link.id === linkId);
    if (linkIndex !== -1) {
      if (property.startsWith('position.')) {
        const positionProp = property.split('.')[1];
        const currentPos = newConfig[viewMode].links[linkIndex].position;
        let newValue = Math.round(value);
        
        // Validate based on property type
        if (positionProp === 'width') {
          newValue = validateAndClamp(newValue, constraints.link.minWidth, constraints.link.maxWidth);
          // Adjust X if width would push element out of bounds
          const maxPos = getMaxPositions('link', newValue, currentPos.height);
          if (currentPos.x > maxPos.maxX) {
            newConfig[viewMode].links[linkIndex].position.x = maxPos.maxX;
          }
        } else if (positionProp === 'height') {
          newValue = validateAndClamp(newValue, constraints.link.minHeight, constraints.link.maxHeight);
          // Adjust Y if height would push element out of bounds
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
    setConfig(newConfig);
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
              onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
            />
          </div>
          
          {/* Position & Size - Compact Grid */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Position & Size</label>
              <button
                onClick={() => resetToDefaults('avatar')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Reset size to default"
              >
                ↺
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">X</label>
                <input
                  type="number"
                  min={constraints.avatar.minX}
                  max={maxPos.maxX}
                  value={profile.position.x}
                  onChange={(e) => handleProfileChange('position.x', parseInt(e.target.value) || 0)}
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
                  onChange={(e) => handleProfileChange('position.y', parseInt(e.target.value) || 0)}
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
                  onChange={(e) => handleProfileChange('position.width', parseInt(e.target.value) || 96)}
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
                  onChange={(e) => handleProfileChange('position.height', parseInt(e.target.value) || 96)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bio Properties
  if (selectedElement === 'bio') {
    const profile = currentViewport.profile;
    const bioPos = profile.bioPosition || getDefaultValues().bio;
    const constraints = getConstraints();
    const maxPos = getMaxPositions('bio', bioPos.width, bioPos.height);
    
    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <h3 className="font-semibold mb-2 text-xs">Bio & Name</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs block mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
            />
          </div>
          <div>
            <label className="text-xs block mb-1">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              rows={2}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none resize-none"
            />
          </div>
          {/* Position & Size - Compact Grid */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Position & Size</label>
              <button
                onClick={() => resetToDefaults('bio')}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Reset size to default"
              >
                ↺
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">X</label>
                <input
                  type="number"
                  min={constraints.bio.minX}
                  max={maxPos.maxX}
                  value={bioPos.x}
                  onChange={(e) => handleProfileChange('bioPosition.x', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">Y</label>
                <input
                  type="number"
                  min={constraints.bio.minY}
                  max={maxPos.maxY}
                  value={bioPos.y}
                  onChange={(e) => handleProfileChange('bioPosition.y', parseInt(e.target.value) || 0)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">W</label>
                <input
                  type="number"
                  min={constraints.bio.minWidth}
                  max={constraints.bio.maxWidth}
                  value={bioPos.width}
                  onChange={(e) => handleProfileChange('bioPosition.width', parseInt(e.target.value) || 260)}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] block mb-0.5 text-muted-foreground">H</label>
                <input
                  type="number"
                  min={constraints.bio.minHeight}
                  max={constraints.bio.maxHeight}
                  value={bioPos.height}
                  onChange={(e) => handleProfileChange('bioPosition.height', parseInt(e.target.value) || (viewMode === 'mobile' ? 45 : 50))}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Profile Info Properties (alte Referenz umbenennen)
  if (selectedElement === 'profile-info') {
    const profile = currentViewport.profile;
    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <h3 className="font-semibold mb-1 text-xs">Profile Info</h3>
        <div className="space-y-1">
          <div>
            <label className="text-xs block mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
            />
          </div>
          <div>
            <label className="text-xs block mb-1">Bio</label>
            <textarea
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
              rows={2}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none resize-none"
            />
          </div>
        </div>
      </div>
    );
  }

  // Link Properties
  if (selectedElement.startsWith('link-')) {
    const linkId = parseInt(selectedElement.replace('link-', ''));
    const link = currentViewport.links.find(l => l.id === linkId);
    
    if (!link) return null;

    const constraints = getConstraints();
    const maxPos = getMaxPositions('link', link.position.width, link.position.height);

    return (
      <div className="bg-card border border-border rounded-lg p-2">
        <h3 className="font-semibold mb-2 text-xs">Link #{linkId}</h3>
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
          
          {/* Position & Size - Compact Grid */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Position & Size</label>
              <button
                onClick={() => resetToDefaults('link', linkId)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Reset size to default"
              >
                ↺
              </button>
            </div>
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
                  onChange={(e) => handleLinkChange(linkId, 'position.width', parseInt(e.target.value) || 200)}
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
                  onChange={(e) => handleLinkChange(linkId, 'position.height', parseInt(e.target.value) || (viewMode === 'mobile' ? 40 : 50))}
                  className="w-full bg-input p-0.5 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring outline-none"
                />
              </div>
            </div>
          </div>

          {/* Styling - Compact */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium">Colors</label>
              <button
                onClick={() => {
                  handleLinkChange(linkId, 'customColor', undefined);
                  handleLinkChange(linkId, 'customTextColor', undefined);
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                title="Reset colors"
              >
                ↺
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div className="flex items-center justify-between bg-muted/30 p-1 rounded">
                <label className="text-xs">Button</label>
                <input
                  type="color"
                  value={link.customColor || config.design.buttonColor}
                  onChange={(e) => handleLinkChange(linkId, 'customColor', e.target.value)}
                  className="w-5 h-5 bg-transparent border-none cursor-pointer rounded"
                />
              </div>
              <div className="flex items-center justify-between bg-muted/30 p-1 rounded">
                <label className="text-xs">Text</label>
                <input
                  type="color"
                  value={link.customTextColor || config.design.buttonTextColor}
                  onChange={(e) => handleLinkChange(linkId, 'customTextColor', e.target.value)}
                  className="w-5 h-5 bg-transparent border-none cursor-pointer rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
