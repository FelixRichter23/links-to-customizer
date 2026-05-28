// app/editor/ElementProperties.tsx
import React from "react";
import { type PageConfig, type TextElement, type Link } from "./types";

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

  // Handler für TextElement Änderungen
  const handleTextElementChange = (elementId: string, property: string, value: string | number | boolean) => {
    const constraints = getConstraints();
    const newConfig = JSON.parse(JSON.stringify(config));
    const elementIndex = newConfig[viewMode].textElements.findIndex((el: TextElement) => el.id === elementId);
    
    if (elementIndex !== -1) {
      if (property.startsWith('position.')) {
        const positionProp = property.split('.')[1];
        const currentPos = newConfig[viewMode].textElements[elementIndex].position;
        let newValue = Math.round(Number(value));
        
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
  const handleAvatarChange = (property: string, value: string | number | boolean) => {
    const constraints = getConstraints();
    const newConfig = JSON.parse(JSON.stringify(config));
    
    if (property.startsWith('position.')) {
      const positionProp = property.split('.')[1];
      const currentPos = newConfig[viewMode].profile.position;
      let newValue = Math.round(Number(value));
      
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
    setConfig(newConfig, property === 'avatarUrl' ? 'text-change' : 'style-change');
  };

  // Handler für Link Änderungen
  const handleLinkChange = (linkId: number, property: string, value: string | number | boolean) => {
    const constraints = getConstraints();
    const newConfig = JSON.parse(JSON.stringify(config));
    const linkIndex = newConfig[viewMode].links.findIndex((link: { id: number }) => link.id === linkId);
    
    if (linkIndex !== -1) {
      if (property.startsWith('position.')) {
        const positionProp = property.split('.')[1];
        const currentPos = newConfig[viewMode].links[linkIndex].position;
        let newValue = Math.round(Number(value));
        
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
        (newConfig[viewMode].links[linkIndex] as Record<string, string | number | boolean>)[property] = value;
      }
    }
    setConfig(newConfig, (property === 'title' || property === 'url') ? 'text-change' : 'style-change');
  };

  // UI Helpers removed from inside to avoid recreating components on every render

  if (!selectedElement) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl shadow-xl flex flex-col items-center justify-center text-center opacity-50">
        <div className="w-12 h-12 rounded-full border border-dashed border-white/20 flex items-center justify-center mb-3">
          <span className="text-white/30 text-xl">+</span>
        </div>
        <h3 className="font-medium text-sm text-foreground/80">No Element Selected</h3>
        <p className="text-xs text-muted-foreground mt-1">Click an element to edit properties</p>
      </div>
    );
  }

  // Avatar Properties
  if (selectedElement === 'avatar') {
    const profile = currentViewport.profile;
    const constraints = getConstraints();
    const maxPos = getMaxPositions('avatar', profile.position.width, profile.position.height);
    
    return (
      <PropertyCard title="Avatar" icon={<span className="text-xs">👤</span>}>
        <div className="space-y-4">
          <InputField 
            label="Image URL" 
            type="url" 
            value={profile.avatarUrl} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleAvatarChange('avatarUrl', e.target.value)} 
          />
          <PositionGrid 
            x={profile.position.x} y={profile.position.y} w={profile.position.width} h={profile.position.height}
            constraints={constraints.avatar} maxPos={maxPos}
            onChange={(prop: string, val: string) => handleAvatarChange(`position.${prop}`, parseInt(val) || 0)}
          />
        </div>
      </PropertyCard>
    );
  }

  // TextElement Properties
  if (selectedElement && (selectedElement.startsWith('profile-') || selectedElement.startsWith('text-'))) {
    const textElement = currentViewport.textElements.find((el: TextElement) => el.id === selectedElement);
    if (!textElement) return null;

    const constraints = getConstraints();
    const maxPos = getMaxPositions('textElement', textElement.position.width, textElement.position.height);
    
    return (
      <PropertyCard title="Text Element" icon={<span className="text-xs">T</span>}>
        <div className="space-y-4">
          <InputField 
            label="Content" 
            type="text" 
            value={textElement.content} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextElementChange(selectedElement, 'content', e.target.value)} 
          />
          <InputField 
            label="Font Size" 
            type="number" min="8" max="72"
            value={textElement.style.fontSize || 16} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTextElementChange(selectedElement, 'style.fontSize', parseInt(e.target.value) || 16)} 
          />
          <PositionGrid 
            x={textElement.position.x} y={textElement.position.y} w={textElement.position.width} h={textElement.position.height}
            constraints={constraints.textElement} maxPos={maxPos}
            onChange={(prop: string, val: string) => handleTextElementChange(selectedElement, `position.${prop}`, parseInt(val) || 0)}
          />
          <div className="flex items-center justify-between p-1">
            <label className="text-xs font-medium text-white/70">Text Color</label>
            <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
              <input
                type="color"
                value={textElement.style.color || "#f2f7f7"}
                onChange={(e) => handleTextElementChange(selectedElement, 'style.color', e.target.value)}
                className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </PropertyCard>
    );
  }

  // Link Properties
  if (selectedElement && selectedElement.startsWith('link-')) {
    const linkId = parseInt(selectedElement.replace('link-', ''));
    const link = currentViewport.links.find((l: Link) => l.id === linkId);
    if (!link) return null;

    const constraints = getConstraints();
    const maxPos = getMaxPositions('link', link.position.width, link.position.height);
    
    return (
      <PropertyCard title="Link" icon={<span className="text-xs">🔗</span>}>
        <div className="space-y-4">
          <InputField 
            label="Title" 
            type="text" 
            value={link.title} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(linkId, 'title', e.target.value)} 
          />
          <InputField 
            label="URL" 
            type="url" 
            value={link.url} 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleLinkChange(linkId, 'url', e.target.value)} 
          />
          <PositionGrid 
            x={link.position.x} y={link.position.y} w={link.position.width} h={link.position.height}
            constraints={constraints.link} maxPos={maxPos}
            onChange={(prop: string, val: string) => handleLinkChange(linkId, `position.${prop}`, parseInt(val) || 0)}
          />

          {/* Button Styling */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="text-sm font-medium text-muted-foreground">Button Styling</label>
            <div className="space-y-3 bg-black/20 p-3 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/70">Background</label>
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                  <input
                    type="color"
                    value={link.customColor || '#9fd2d1'}
                    onChange={(e) => handleLinkChange(linkId, 'customColor', e.target.value)}
                    className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-white/70">Text Color</label>
                <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                  <input
                    type="color"
                    value={link.customTextColor || '#070c0e'}
                    onChange={(e) => handleLinkChange(linkId, 'customTextColor', e.target.value)}
                    className="absolute -top-2 -left-2 w-10 h-10 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">Border Radius</label>
                  <span className="text-xs font-mono bg-white/10 px-1.5 py-0.5 rounded">{link.customBorderRadius ?? config.design.buttonBorderRadius}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={link.customBorderRadius ?? config.design.buttonBorderRadius}
                  onChange={(e) => handleLinkChange(linkId, 'customBorderRadius', parseInt(e.target.value))}
                  className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </PropertyCard>
    );
  }

  return null;
}

// UI Helpers (Moved outside ElementProperties to prevent focus loss)
const PropertyCard = ({ children, title, icon }: { children: React.ReactNode, title: string, icon?: React.ReactNode }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl transition-all duration-300">
    <div className="flex items-center gap-2 mb-4">
      {icon && <div className="p-1.5 bg-primary/20 rounded-lg text-primary">{icon}</div>}
      <h3 className="font-semibold tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

interface InputFieldProps {
  label: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string | number;
  max?: string | number;
}

const InputField = ({ label, type, value, onChange, min, max }: InputFieldProps) => (
  <div className="space-y-1.5">
    <label className="text-xs font-medium text-muted-foreground">{label}</label>
    <input
      type={type}
      min={min}
      max={max}
      value={value}
      onChange={onChange}
      className="w-full bg-black/20 p-2.5 rounded-xl text-sm text-foreground border border-white/5 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
    />
  </div>
);

interface PositionGridProps {
  x: number;
  y: number;
  w: number;
  h: number;
  onChange: (prop: string, val: string) => void;
  constraints: {
    minX: number;
    minWidth: number;
    maxWidth: number;
    minY: number;
    minHeight: number;
    maxHeight: number;
  };
  maxPos: {
    maxX: number;
    maxY: number;
  };
}

const PositionGrid = ({ x, y, w, h, onChange, constraints, maxPos }: PositionGridProps) => (
  <div className="space-y-2 pt-2">
    <label className="text-sm font-medium text-muted-foreground">Position & Size</label>
    <div className="grid grid-cols-4 gap-2">
      <div className="bg-black/20 border border-white/5 rounded-xl p-2 flex flex-col items-center">
        <label className="text-[10px] uppercase text-white/50 mb-1 font-semibold">X</label>
        <input type="number" min={constraints.minX} max={maxPos.maxX} value={x} onChange={(e) => onChange('x', e.target.value)} className="w-full bg-transparent text-center text-sm outline-none" />
      </div>
      <div className="bg-black/20 border border-white/5 rounded-xl p-2 flex flex-col items-center">
        <label className="text-[10px] uppercase text-white/50 mb-1 font-semibold">Y</label>
        <input type="number" min={constraints.minY} max={maxPos.maxY} value={y} onChange={(e) => onChange('y', e.target.value)} className="w-full bg-transparent text-center text-sm outline-none" />
      </div>
      <div className="bg-black/20 border border-white/5 rounded-xl p-2 flex flex-col items-center">
        <label className="text-[10px] uppercase text-white/50 mb-1 font-semibold">W</label>
        <input type="number" min={constraints.minWidth} max={constraints.maxWidth} value={w} onChange={(e) => onChange('width', e.target.value)} className="w-full bg-transparent text-center text-sm outline-none" />
      </div>
      <div className="bg-black/20 border border-white/5 rounded-xl p-2 flex flex-col items-center">
        <label className="text-[10px] uppercase text-white/50 mb-1 font-semibold">H</label>
        <input type="number" min={constraints.minHeight} max={constraints.maxHeight} value={h} onChange={(e) => onChange('height', e.target.value)} className="w-full bg-transparent text-center text-sm outline-none" />
      </div>
    </div>
  </div>
);
