// app/editor/Controls.tsx
"use client";

import { type PageConfig } from "./types";
import { Dispatch, SetStateAction, useState } from "react";
import { Trash, GripVertical } from "lucide-react";

interface ControlsProps {
  config: PageConfig;
  setConfig: Dispatch<SetStateAction<PageConfig>>;
}

export default function Controls({ config, setConfig }: ControlsProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  // --- Handler für Design-Änderungen ---
  const handleDesignChange = (key: string, value: string | number | object) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      design: { ...prevConfig.design, [key]: value },
    }));
  };

  // --- Handler für Link-Änderungen ---
  const handleAddLink = () => {
    const newLink = {
      id: Date.now(), // Einfache eindeutige ID für den PoC
      title: "New Link",
      url: "https://",
      order: config.links.length + 1,
    };
    setConfig((prevConfig) => ({
      ...prevConfig,
      links: [...prevConfig.links, newLink],
    }));
  };

  const handleDeleteLink = (id: number) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      links: prevConfig.links.filter((link) => link.id !== id),
    }));
  };

  const handleLinkChange = (id: number, field: 'title' | 'url', value: string) => {
      setConfig(prevConfig => ({
          ...prevConfig,
          links: prevConfig.links.map(link =>
              link.id === id ? { ...link, [field]: value } : link
          )
      }));
  };

  // --- Drag & Drop Handler ---
  const handleDragStart = (e: React.DragEvent, linkId: number) => {
    setDraggedItem(linkId);
    e.dataTransfer?.setData('text/plain', linkId.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    
    if (!draggedItem || draggedItem === targetId) return;

    setConfig(prevConfig => {
      const newLinks = [...prevConfig.links];
      const draggedIndex = newLinks.findIndex(link => link.id === draggedItem);
      const targetIndex = newLinks.findIndex(link => link.id === targetId);
      
      // Vertausche die Links
      [newLinks[draggedIndex], newLinks[targetIndex]] = [newLinks[targetIndex], newLinks[draggedIndex]];
      
      // Aktualisiere die order-Werte
      newLinks.forEach((link, index) => {
        link.order = index + 1;
      });
      
      return {
        ...prevConfig,
        links: newLinks
      };
    });
    
    setDraggedItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };


  return (
    <div className="bg-card p-4 rounded-lg border border-border space-y-6">
      {/* Design Section */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Design</h2>
        <div className="space-y-3">
          {/* Background Type Selector */}
          <div className="space-y-2">
            <label className="text-sm block">Background Type</label>
            <select
              value={config.design.backgroundType}
              onChange={(e) => handleDesignChange("backgroundType", e.target.value)}
              className="w-full bg-input p-2 rounded text-sm text-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none"
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="image">Image</option>
            </select>
          </div>

          {/* Solid Background */}
          {config.design.backgroundType === 'solid' && (
            <div className="flex items-center justify-between">
              <label className="text-sm">Background</label>
              <input
                type="color"
                value={config.design.backgroundColor}
                onChange={(e) => handleDesignChange("backgroundColor", e.target.value)}
                className="w-8 h-8 bg-transparent border-none cursor-pointer"
              />
            </div>
          )}

          {/* Gradient Background */}
          {config.design.backgroundType === 'gradient' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">From Color</label>
                <input
                  type="color"
                  value={config.design.backgroundGradient.from}
                  onChange={(e) => handleDesignChange("backgroundGradient", {
                    ...config.design.backgroundGradient,
                    from: e.target.value
                  })}
                  className="w-8 h-8 bg-transparent border-none cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm">To Color</label>
                <input
                  type="color"
                  value={config.design.backgroundGradient.to}
                  onChange={(e) => handleDesignChange("backgroundGradient", {
                    ...config.design.backgroundGradient,
                    to: e.target.value
                  })}
                  className="w-8 h-8 bg-transparent border-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm block">Direction</label>
                <select
                  value={config.design.backgroundGradient.direction}
                  onChange={(e) => handleDesignChange("backgroundGradient", {
                    ...config.design.backgroundGradient,
                    direction: e.target.value
                  })}
                  className="w-full bg-input p-1 rounded text-sm text-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                >
                  <option value="to bottom">Top to Bottom</option>
                  <option value="to right">Left to Right</option>
                  <option value="to bottom right">Diagonal ↘</option>
                  <option value="to bottom left">Diagonal ↙</option>
                  <option value="45deg">45° Angle</option>
                  <option value="135deg">135° Angle</option>
                </select>
              </div>
            </div>
          )}

          {/* Image Background */}
          {config.design.backgroundType === 'image' && (
            <div className="space-y-2">
              <label className="text-sm block">Background Image URL</label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={config.design.backgroundImage}
                onChange={(e) => handleDesignChange("backgroundImage", e.target.value)}
                className="w-full bg-input p-2 rounded text-sm text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none"
              />
              <div className="text-xs text-muted-foreground">
                Recommended: High resolution images work best
              </div>
            </div>
          )}

          <div className="border-t border-border pt-2 mt-4">
            <div className="flex items-center justify-between">
              <label className="text-sm">Button</label>
              <input
                type="color"
                value={config.design.buttonColor}
                onChange={(e) => handleDesignChange("buttonColor", e.target.value)}
                className="w-8 h-8 bg-transparent border-none cursor-pointer"
              />
            </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Button Text</label>
            <input
              type="color"
              value={config.design.buttonTextColor}
              onChange={(e) => handleDesignChange("buttonTextColor", e.target.value)}
              className="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm">Text Color</label>
            <input
              type="color"
              value={config.design.textColor}
              onChange={(e) => handleDesignChange("textColor", e.target.value)}
              className="w-8 h-8 bg-transparent border-none cursor-pointer"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm block">Button Roundness</label>
            <input
              type="range"
              min="0"
              max="50"
              value={config.design.buttonBorderRadius || 8}
              onChange={(e) => handleDesignChange("buttonBorderRadius", e.target.value)}
              className="w-full"
            />
            <div className="text-xs text-muted-foreground text-center">
              {config.design.buttonBorderRadius || 8}px
            </div>
          </div>
        </div>
      </div>

      {/* Links Section */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Links</h2>
          <button
            onClick={handleAddLink}
            className="px-3 py-1 text-xs bg-primary hover:bg-primary/80 text-primary-foreground rounded cursor-pointer"
          >
            Add Link
          </button>
        </div>
        <div className="space-y-3">
          {config.links
            .sort((a, b) => a.order - b.order)
            .map((link) => (
            <div 
              key={link.id} 
              className={`bg-muted p-3 rounded border-secondary/30 transition-all duration-200 ${
                draggedItem === link.id ? 'opacity-50' : 'hover:bg-muted/80'
              }`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, link.id)}
            >
                <div className="flex items-start gap-3">
                    <div 
                        className="cursor-grab active:cursor-grabbing mt-2 text-muted-foreground hover:text-foreground p-1 rounded hover:bg-accent/20"
                        draggable
                        onDragStart={(e) => handleDragStart(e, link.id)}
                        onDragEnd={handleDragEnd}
                        title="Drag to reorder"
                    >
                        <GripVertical size={16} />
                    </div>
                    <div className="flex-1 space-y-2">
                        <input
                            type="text"
                            placeholder="Title"
                            value={link.title}
                            onChange={(e) => handleLinkChange(link.id, 'title', e.target.value)}
                            className="w-full bg-input p-1 rounded text-sm text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                        />
                        <input
                            type="url"
                            placeholder="URL"
                            value={link.url}
                            onChange={(e) => handleLinkChange(link.id, 'url', e.target.value)}
                            className="w-full bg-input p-1 rounded text-sm text-foreground placeholder:text-muted-foreground border border-border focus:ring-2 focus:ring-ring focus:border-ring outline-none"
                        />
                    </div>
                    <button onClick={() => handleDeleteLink(link.id)} className="text-destructive hover:text-destructive/80 cursor-pointer mt-1">
                      <Trash size={16} />
                    </button>
                </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
  );
}