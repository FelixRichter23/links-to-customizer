// app/editor/Controls.tsx
"use client";

import React from "react";
import { type PageConfig } from "./types";
import { Dispatch, SetStateAction } from "react";
import { PaintBucket, Image as ImageIcon, LayoutTemplate } from "lucide-react";

interface ControlsProps {
  config: PageConfig;
  setConfig: Dispatch<SetStateAction<PageConfig>>;
  compact?: boolean;
  viewMode: 'mobile' | 'desktop';
  selectedElement?: string | null;
  setSelectedElement?: (elementId: string | null) => void;
}

export default function Controls({ 
  config, 
  setConfig, 
  compact = false, 
  viewMode, 
  selectedElement, 
  setSelectedElement 
}: ControlsProps) {
  // Get current viewport config
  const currentViewport = config[viewMode];

  // --- Handler für Design-Änderungen ---
  const handleDesignChange = (key: string, value: string | number | object) => {
    setConfig((prevConfig) => ({
      ...prevConfig,
      design: { ...prevConfig.design, [key]: value },
    }));
  };

  return (
    <div className={`space-y-6 ${compact ? '' : 'mt-2'}`}>
      {/* Global Design Section */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 bg-primary/20 rounded-lg text-primary">
            <LayoutTemplate size={18} />
          </div>
          <h2 className="font-semibold text-lg tracking-tight">Global Design</h2>
        </div>
        
        <div className="space-y-5">
          {/* Background Type Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <PaintBucket size={14} /> Background Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['solid', 'gradient', 'image'].map((type) => (
                <button
                  key={type}
                  onClick={() => handleDesignChange("backgroundType", type)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl transition-all duration-200 capitalize ${
                    config.design.backgroundType === type
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                      : 'bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Solid Background */}
          {config.design.backgroundType === 'solid' && (
            <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
              <label className="text-sm font-medium">Color</label>
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                <input
                  type="color"
                  value={config.design.backgroundColor}
                  onChange={(e) => handleDesignChange("backgroundColor", e.target.value)}
                  className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Gradient Background */}
          {config.design.backgroundType === 'gradient' && (
            <div className="space-y-3 p-4 bg-black/20 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">From Color</label>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                  <input
                    type="color"
                    value={config.design.backgroundGradient.from}
                    onChange={(e) => handleDesignChange("backgroundGradient", {
                      ...config.design.backgroundGradient,
                      from: e.target.value
                    })}
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">To Color</label>
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white/20">
                  <input
                    type="color"
                    value={config.design.backgroundGradient.to}
                    onChange={(e) => handleDesignChange("backgroundGradient", {
                      ...config.design.backgroundGradient,
                      to: e.target.value
                    })}
                    className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer"
                  />
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t border-white/10">
                <label className="text-xs font-medium text-muted-foreground">Direction</label>
                <select
                  value={config.design.backgroundGradient.direction}
                  onChange={(e) => handleDesignChange("backgroundGradient", {
                    ...config.design.backgroundGradient,
                    direction: e.target.value
                  })}
                  className="w-full bg-white/5 rounded-lg text-sm text-foreground border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary p-2 outline-none appearance-none"
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
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <ImageIcon size={14} /> Image URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={config.design.backgroundImage}
                onChange={(e) => handleDesignChange("backgroundImage", e.target.value)}
                className="w-full bg-black/20 rounded-xl text-sm p-3 border border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-white/20"
              />
            </div>
          )}

          {/* Button Radius */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-muted-foreground">Button Radius</label>
              <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded-md">{config.design.buttonBorderRadius}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={config.design.buttonBorderRadius}
              onChange={(e) => handleDesignChange("buttonBorderRadius", parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}