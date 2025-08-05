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

  if (!selectedElement) {
    return (
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="font-semibold mb-2 text-sm">Properties</h3>
        <p className="text-xs text-muted-foreground text-center py-4">
          Klicke auf ein Element<br/>um es zu bearbeiten
        </p>
      </div>
    );
  }

  const handleProfileChange = (property: string, value: any) => {
    const newConfig = { ...config };
    if (property.startsWith('position.')) {
      const positionProp = property.split('.')[1];
      newConfig[viewMode].profile.position = {
        ...newConfig[viewMode].profile.position,
        [positionProp]: Math.round(value) // Runde auf ganze Pixel
      };
    } else if (property.startsWith('bioPosition.')) {
      const positionProp = property.split('.')[1];
      if (!newConfig[viewMode].profile.bioPosition) {
        newConfig[viewMode].profile.bioPosition = {
          x: viewMode === 'mobile' ? 20 : 240,
          y: viewMode === 'mobile' ? 160 : 248,
          width: viewMode === 'mobile' ? 260 : 368,
          height: 50
        };
      }
      newConfig[viewMode].profile.bioPosition = {
        ...newConfig[viewMode].profile.bioPosition,
        [positionProp]: Math.round(value) // Runde auf ganze Pixel
      };
    } else {
      (newConfig[viewMode].profile as any)[property] = value;
    }
    setConfig(newConfig);
  };

  const handleLinkChange = (linkId: number, property: string, value: any) => {
    const newConfig = { ...config };
    const linkIndex = newConfig[viewMode].links.findIndex(link => link.id === linkId);
    if (linkIndex !== -1) {
      if (property.startsWith('position.')) {
        const positionProp = property.split('.')[1];
        newConfig[viewMode].links[linkIndex].position = {
          ...newConfig[viewMode].links[linkIndex].position,
          [positionProp]: Math.round(value) // Runde auf ganze Pixel
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
    return (
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="font-semibold mb-2 text-sm">Avatar</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs block mb-1">URL</label>
            <input
              type="url"
              value={profile.avatarUrl}
              onChange={(e) => handleProfileChange('avatarUrl', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="text-xs block mb-1">B</label>
              <input
                type="number"
                value={profile.position.width}
                onChange={(e) => handleProfileChange('position.width', Math.round(parseInt(e.target.value) || 96))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">H</label>
              <input
                type="number"
                value={profile.position.height}
                onChange={(e) => handleProfileChange('position.height', Math.round(parseInt(e.target.value) || 96))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="text-xs block mb-1">X</label>
              <input
                type="number"
                value={profile.position.x}
                onChange={(e) => handleProfileChange('position.x', Math.round(parseInt(e.target.value) || 0))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Y</label>
              <input
                type="number"
                value={profile.position.y}
                onChange={(e) => handleProfileChange('position.y', Math.round(parseInt(e.target.value) || 0))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bio Properties
  if (selectedElement === 'bio') {
    const profile = currentViewport.profile;
    const bioPos = profile.bioPosition || {
      x: viewMode === 'mobile' ? 20 : 240,
      y: viewMode === 'mobile' ? 160 : 248,
      width: viewMode === 'mobile' ? 260 : 368,
      height: 50
    };
    
    return (
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="font-semibold mb-2 text-sm">Bio & Name</h3>
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
          <div className="grid grid-cols-2 gap-1">
            <div>
              <label className="text-xs block mb-1">X</label>
              <input
                type="number"
                value={bioPos.x}
                onChange={(e) => handleProfileChange('bioPosition.x', Math.round(parseInt(e.target.value) || 0))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">Y</label>
              <input
                type="number"
                value={bioPos.y}
                onChange={(e) => handleProfileChange('bioPosition.y', Math.round(parseInt(e.target.value) || 0))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">B</label>
              <input
                type="number"
                value={bioPos.width}
                onChange={(e) => handleProfileChange('bioPosition.width', Math.round(parseInt(e.target.value) || 260))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
            </div>
            <div>
              <label className="text-xs block mb-1">H</label>
              <input
                type="number"
                value={bioPos.height}
                onChange={(e) => handleProfileChange('bioPosition.height', Math.round(parseInt(e.target.value) || 50))}
                className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
              />
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
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="font-semibold mb-2 text-sm">Profile Info</h3>
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
        </div>
      </div>
    );
  }

  // Link Properties
  if (selectedElement.startsWith('link-')) {
    const linkId = parseInt(selectedElement.replace('link-', ''));
    const link = currentViewport.links.find(l => l.id === linkId);
    
    if (!link) return null;

    return (
      <div className="bg-card border border-border rounded-lg p-3">
        <h3 className="font-semibold mb-2 text-sm">Link #{linkId}</h3>
        <div className="space-y-2">
          <div>
            <label className="text-xs block mb-1">Titel</label>
            <input
              type="text"
              value={link.title}
              onChange={(e) => handleLinkChange(linkId, 'title', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
            />
          </div>
          <div>
            <label className="text-xs block mb-1">URL</label>
            <input
              type="url"
              value={link.url}
              onChange={(e) => handleLinkChange(linkId, 'url', e.target.value)}
              className="w-full bg-input p-1 rounded text-xs text-foreground placeholder:text-muted-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
            />
          </div>
          
          {/* Position & Size - Kompakt */}
          <div className="border-t border-border pt-2 mt-2">
            <label className="text-xs block mb-1 font-medium">Position & Größe</label>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="text-xs block mb-1">X</label>
                <input
                  type="number"
                  value={link.position.x}
                  onChange={(e) => handleLinkChange(linkId, 'position.x', Math.round(parseInt(e.target.value) || 0))}
                  className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                />
              </div>
              <div>
                <label className="text-xs block mb-1">Y</label>
                <input
                  type="number"
                  value={link.position.y}
                  onChange={(e) => handleLinkChange(linkId, 'position.y', Math.round(parseInt(e.target.value) || 0))}
                  className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                />
              </div>
              <div>
                <label className="text-xs block mb-1">B</label>
                <input
                  type="number"
                  value={link.position.width}
                  onChange={(e) => handleLinkChange(linkId, 'position.width', Math.round(parseInt(e.target.value) || 200))}
                  className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                />
              </div>
              <div>
                <label className="text-xs block mb-1">H</label>
                <input
                  type="number"
                  value={link.position.height}
                  onChange={(e) => handleLinkChange(linkId, 'position.height', Math.round(parseInt(e.target.value) || 50))}
                  className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                />
              </div>
            </div>
          </div>

          {/* Styling - Kompakt */}
          <div className="border-t border-border pt-2 mt-2">
            <label className="text-xs block mb-1 font-medium">Style</label>
            <div className="grid grid-cols-2 gap-1 mb-2">
              <div className="flex items-center justify-between">
                <label className="text-xs">Button</label>
                <input
                  type="color"
                  value={link.customColor || config.design.buttonColor}
                  onChange={(e) => handleLinkChange(linkId, 'customColor', e.target.value)}
                  className="w-5 h-5 bg-transparent border-none cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs">Text</label>
                <input
                  type="color"
                  value={link.customTextColor || config.design.buttonTextColor}
                  onChange={(e) => handleLinkChange(linkId, 'customTextColor', e.target.value)}
                  className="w-5 h-5 bg-transparent border-none cursor-pointer"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1">
              <div>
                <label className="text-xs block mb-1">Radius</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={link.customBorderRadius || config.design.buttonBorderRadius}
                  onChange={(e) => handleLinkChange(linkId, 'customBorderRadius', Math.round(parseInt(e.target.value)))}
                  className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                />
              </div>
              <div>
                <label className="text-xs block mb-1">Font</label>
                <input
                  type="number"
                  min="8"
                  max="32"
                  value={link.fontSize || (viewMode === 'desktop' ? 16 : 14)}
                  onChange={(e) => handleLinkChange(linkId, 'fontSize', Math.round(parseInt(e.target.value)))}
                  className="w-full bg-input p-1 rounded text-xs text-foreground border border-border focus:ring-1 focus:ring-ring focus:border-ring outline-none"
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              handleLinkChange(linkId, 'customColor', undefined);
              handleLinkChange(linkId, 'customTextColor', undefined);
              handleLinkChange(linkId, 'customBorderRadius', undefined);
              handleLinkChange(linkId, 'fontSize', undefined);
            }}
            className="w-full mt-2 px-2 py-1 text-xs bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    );
  }

  return null;
}
