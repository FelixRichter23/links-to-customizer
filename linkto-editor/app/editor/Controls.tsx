// app/editor/Controls.tsx
"use client";

import React from "react";
import { type PageConfig } from "./types";
import { Dispatch, SetStateAction, useState } from "react";
import { Trash, GripVertical } from "lucide-react";

interface ControlsProps {
  config: PageConfig;
  setConfig: Dispatch<SetStateAction<PageConfig>>;
  compact?: boolean;
  viewMode: 'mobile' | 'desktop';
}

export default function Controls({ config, setConfig, compact = false, viewMode }: ControlsProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // Get current viewport config
  const currentViewport = config[viewMode];

  // --- Handler für Design-Änderungen ---
  const handleDesignChange = (key: string, value: string | number | object) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      design: { ...prevConfig.design, [key]: value },
    }));
  };

  // --- Handler für Profile-Änderungen ---
  const handleProfileChange = (key: string, value: string) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [viewMode]: {
        ...prevConfig[viewMode],
        profile: { ...prevConfig[viewMode].profile, [key]: value },
      }
    }));
  };

  // --- Handler für Link-Änderungen ---
  const handleAddLink = () => {
    const linkCount = currentViewport.links.length;
    const newLink = {
      id: Date.now(), // Einfache eindeutige ID für den PoC
      title: "New Link",
      url: "https://",
      order: linkCount + 1,
      position: {
        x: viewMode === 'mobile' ? 10 : 350, // Mobile: centered in 280px container, Desktop: zentriert
        y: viewMode === 'mobile' ? 
           (220 + (linkCount * 55)) : // Mobile: Start bei 220, 55px Abstand (40px + 15px spacing)
           (320 + (linkCount * 70)),   // Desktop: Start bei 320, 70px Abstand
        width: viewMode === 'mobile' ? 260 : 200, // Mobile: fits in 280px with 10px margins each side
        height: viewMode === 'mobile' ? 40 : 50 // Mobile: 40px, Desktop: 50px
      }
    };
    setConfig((prevConfig) => ({
      ...prevConfig,
      [viewMode]: {
        ...prevConfig[viewMode],
        links: [...prevConfig[viewMode].links, newLink],
      }
    }));
  };

  const handleDeleteLink = (id: number) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      [viewMode]: {
        ...prevConfig[viewMode],
        links: prevConfig[viewMode].links.filter((link) => link.id !== id),
      }
    }));
  };

  const handleLinkChange = (id: number, field: 'title' | 'url', value: string) => {
      setConfig(prevConfig => ({
          ...prevConfig,
          [viewMode]: {
            ...prevConfig[viewMode],
            links: prevConfig[viewMode].links.map(link =>
                link.id === id ? { ...link, [field]: value } : link
            )
          }
      }));
  };

  // Drag-and-Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", id.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    const draggedId = parseInt(e.dataTransfer.getData("text/html"));
    
    if (draggedId === targetId) return;

    setConfig(prevConfig => {
      const newLinks = [...prevConfig[viewMode].links];
      const draggedIndex = newLinks.findIndex(link => link.id === draggedId);
      const targetIndex = newLinks.findIndex(link => link.id === targetId);
      
      // Swap the items
      const draggedLink = newLinks[draggedIndex];
      newLinks.splice(draggedIndex, 1);
      newLinks.splice(targetIndex, 0, draggedLink);
      
      // Update order numbers
      newLinks.forEach((link, index) => {
        link.order = index + 1;
      });
      
      return {
        ...prevConfig,
        [viewMode]: {
          ...prevConfig[viewMode],
          links: newLinks
        }
      };
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      {/* Profile Section */}
      <div className={`bg-card rounded-lg border border-border ${compact ? 'p-3' : 'p-4'}`}>
        <h2 className={`font-semibold ${compact ? 'text-base mb-2' : 'text-lg mb-3'}`}>Profile</h2>
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          <div>
            <label className={`block mb-1 ${compact ? 'text-xs' : 'text-sm'}`}>Bio</label>
            <textarea
              placeholder="Your short and catchy bio goes here!"
              value={currentViewport.profile.bio}
              onChange={(e) => handleProfileChange("bio", e.target.value)}
              rows={compact ? 2 : 3}
              className={`w-full bg-input rounded text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none resize-none ${
                compact ? 'p-1.5 text-xs' : 'p-2 text-sm'
              }`}
            />
          </div>
        </div>
      </div>

      {/* Design Section */}
      <div className={`bg-card rounded-lg border border-border ${compact ? 'p-3' : 'p-4'}`}>
        <h2 className={`font-semibold ${compact ? 'text-base mb-2' : 'text-lg mb-3'}`}>Design</h2>
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          {/* Background Type Selector */}
          <div className="space-y-2">
            <label className={compact ? 'text-xs block' : 'text-sm block'}>Background Type</label>
            <select
              value={config.design.backgroundType}
              onChange={(e) => handleDesignChange("backgroundType", e.target.value)}
              className={`w-full bg-input rounded text-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none ${
                compact ? 'p-1.5 text-xs' : 'p-2 text-sm'
              }`}
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>

          {/* Solid Background */}
          {config.design.backgroundType === 'solid' && (
            <div className="flex items-center justify-between">
              <label className={compact ? 'text-xs' : 'text-sm'}>Background</label>
              <input
                type="color"
                value={config.design.backgroundColor}
                onChange={(e) => handleDesignChange("backgroundColor", e.target.value)}
                className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-transparent border-none cursor-pointer`}
              />
            </div>
          )}

          {/* Gradient Background */}
          {config.design.backgroundType === 'gradient' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className={compact ? 'text-xs' : 'text-sm'}>From Color</label>
                <input
                  type="color"
                  value={config.design.backgroundGradient.from}
                  onChange={(e) => handleDesignChange("backgroundGradient", {
                    ...config.design.backgroundGradient,
                    from: e.target.value
                  })}
                  className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-transparent border-none cursor-pointer`}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className={compact ? 'text-xs' : 'text-sm'}>To Color</label>
                <input
                  type="color"
                  value={config.design.backgroundGradient.to}
                  onChange={(e) => handleDesignChange("backgroundGradient", {
                    ...config.design.backgroundGradient,
                    to: e.target.value
                  })}
                  className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-transparent border-none cursor-pointer`}
                />
              </div>
              <div className="space-y-1">
                <label className={compact ? 'text-xs block' : 'text-sm block'}>Direction</label>
                <select
                  value={config.design.backgroundGradient.direction}
                  onChange={(e) => handleDesignChange("backgroundGradient", {
                    ...config.design.backgroundGradient,
                    direction: e.target.value
                  })}
                  className={`w-full bg-input rounded text-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none ${
                    compact ? 'p-1.5 text-xs' : 'p-2 text-sm'
                  }`}
                >
                  <option value="to bottom right">↘ Bottom Right</option>
                  <option value="to bottom">↓ Bottom</option>
                  <option value="to bottom left">↙ Bottom Left</option>
                  <option value="to right">→ Right</option>
                  <option value="to left">← Left</option>
                  <option value="to top right">↗ Top Right</option>
                  <option value="to top">↑ Top</option>
                  <option value="to top left">↖ Top Left</option>
                </select>
              </div>
            </div>
          )}

          {/* Image Background */}
          {config.design.backgroundType === 'image' && (
            <div className="space-y-1">
              <label className={compact ? 'text-xs block' : 'text-sm block'}>Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={config.design.backgroundImage}
                onChange={(e) => handleDesignChange("backgroundImage", e.target.value)}
                className={`w-full bg-input rounded text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none ${
                  compact ? 'p-1.5 text-xs' : 'p-2 text-sm'
                }`}
              />
            </div>
          )}

          {/* Color Controls */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between">
              <label className={compact ? 'text-xs' : 'text-sm'}>Button</label>
              <input
                type="color"
                value={config.design.buttonColor}
                onChange={(e) => handleDesignChange("buttonColor", e.target.value)}
                className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-transparent border-none cursor-pointer`}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className={compact ? 'text-xs' : 'text-sm'}>Button Text</label>
              <input
                type="color"
                value={config.design.buttonTextColor}
                onChange={(e) => handleDesignChange("buttonTextColor", e.target.value)}
                className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-transparent border-none cursor-pointer`}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className={compact ? 'text-xs' : 'text-sm'}>Text Color</label>
            <input
              type="color"
              value={config.design.textColor}
              onChange={(e) => handleDesignChange("textColor", e.target.value)}
              className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-transparent border-none cursor-pointer`}
            />
          </div>

          {/* Button Border Radius */}
          <div className="space-y-1">
            <label className={compact ? 'text-xs block' : 'text-sm block'}>Button Border Radius</label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="50"
                value={config.design.buttonBorderRadius}
                onChange={(e) => handleDesignChange("buttonBorderRadius", parseInt(e.target.value))}
                className="flex-1"
              />
              <span className={`${compact ? 'text-xs' : 'text-sm'} text-muted-foreground min-w-[3rem]`}>
                {config.design.buttonBorderRadius}px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div className={`bg-card rounded-lg border border-border ${compact ? 'p-3' : 'p-4'}`}>
        <div className="flex justify-between items-center mb-3">
          <h2 className={`font-semibold ${compact ? 'text-base' : 'text-lg'}`}>Links</h2>
          <button
            onClick={handleAddLink}
            className={`bg-primary hover:bg-primary/80 text-primary-foreground rounded cursor-pointer transition-colors ${
              compact ? 'px-2 py-1 text-xs' : 'px-3 py-1 text-xs'
            }`}
          >
            Add Link
          </button>
        </div>
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          {currentViewport.links
            .sort((a, b) => a.order - b.order)
            .map((link) => (
            <div 
              key={link.id} 
              className={`bg-muted rounded border-secondary/30 transition-all duration-200 ${
                draggedItem === link.id ? 'opacity-50' : 'hover:bg-muted/80'
              } ${compact ? 'p-2' : 'p-3'}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, link.id)}
            >
                <div className={compact ? 'flex items-start gap-2' : 'flex items-start gap-3'}>
                    <div 
                        className={`cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent/20 ${
                          compact ? 'mt-1' : 'mt-2'
                        }`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, link.id)}
                        onDragEnd={handleDragEnd}
                        title="Drag to reorder"
                    >
                        <GripVertical size={compact ? 14 : 16} />
                    </div>
                    <div className={compact ? 'flex-1 space-y-1' : 'flex-1 space-y-2'}>
                        <input
                            type="text"
                            placeholder="Title"
                            value={link.title}
                            onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                            className={`w-full bg-input rounded text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none ${
                              compact ? 'p-1 text-xs' : 'p-1 text-sm'
                            }`}
                        />
                        <input
                            type="url"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                            className={`w-full bg-input rounded text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none ${
                              compact ? 'p-1 text-xs' : 'p-1 text-sm'
                            }`}
                        />
                    </div>
                    <button 
                        onClick={() => handleDeleteLink(link.id)} 
                        className={`text-destructive hover:text-destructive/80 cursor-pointer ${
                          compact ? 'mt-1' : 'mt-1'
                        }`}
                    >
                      <Trash size={compact ? 14 : 16} />
                    </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}