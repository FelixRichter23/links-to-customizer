// app/editor/CustomizerToolbar.tsx
"use client";

import React, { useState } from "react";
import { 
  Palette, 
  Type, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Bold,
  Italic,
  Underline,
  MoreHorizontal,
  MoreVertical,
  X
} from "lucide-react";

interface CustomizerToolbarProps {
  selectedElement?: string | null;
  onColorChange?: (color: string) => void;
  onFontChange?: (font: string) => void;
  onTextTransformChange?: (transform: string) => void;
  onTextAlignChange?: (align: string) => void;
  onFontWeightChange?: (weight: string) => void;
  onTextDecorationChange?: (decoration: string) => void;
  className?: string;
}

const FONT_OPTIONS = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'monospace', label: 'Mono' },
];

const PREDEFINED_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff',
  '#ffff00', '#ff00ff', '#00ffff', '#808080', '#ffa500'
];

export default function CustomizerToolbar({
  selectedElement,
  onColorChange,
  onFontChange,
  onTextTransformChange,
  onTextAlignChange,
  onFontWeightChange,
  onTextDecorationChange,
  className = ""
}: CustomizerToolbarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFontDropdown, setShowFontDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [selectedFont, setSelectedFont] = useState("Arial");
  const [textAlign, setTextAlign] = useState("left");
  const [fontWeight, setFontWeight] = useState("normal");
  const [textDecoration, setTextDecoration] = useState("none");

  // Wenn kein Element selektiert ist, zeige die Toolbar nicht
  if (!selectedElement) {
    return null;
  }

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    onColorChange?.(color);
    setShowColorPicker(false);
  };

  const handleFontChange = (font: string) => {
    setSelectedFont(font);
    onFontChange?.(font);
    setShowFontDropdown(false);
  };

  const handleAlignChange = (align: string) => {
    setTextAlign(align);
    onTextAlignChange?.(align);
  };

  const toggleBold = () => {
    const newWeight = fontWeight === "normal" ? "bold" : "normal";
    setFontWeight(newWeight);
    onFontWeightChange?.(newWeight);
  };

  const toggleUnderline = () => {
    const newDecoration = textDecoration === "none" ? "underline" : "none";
    setTextDecoration(newDecoration);
    onTextDecorationChange?.(newDecoration);
  };

  return (
    <div className={`bg-background/95 backdrop-blur-sm border border-border/50 rounded-lg shadow-lg max-w-fit ${className}`}>
      <div className="flex items-center gap-1 px-2 py-1.5 h-8 sm:h-10 sm:px-3">
        {/* Element Label - Hidden on mobile for space */}
        <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-border/30">
          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
          <span className="text-xs font-medium text-muted-foreground">
            {selectedElement.replace(/^(profile-|text-|link-)/, '').replace(/-/g, ' ')}
          </span>
        </div>

        {/* Mobile: Compact Color Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColorPicker(!showColorPicker)}
            className="flex items-center gap-1 px-1.5 py-1 text-xs hover:bg-muted/50 rounded transition-colors sm:px-2"
            title="Text Color"
          >
            <Palette className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <div 
              className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded border border-border/30"
              style={{ backgroundColor: selectedColor }}
            />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full mt-1 left-0 bg-background border border-border rounded-lg shadow-lg p-2 z-60">
              <div className="grid grid-cols-5 gap-1 mb-2">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-6 h-6 rounded border border-border/30 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-6 rounded border border-border/30 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Mobile: Compact Font Family */}
        <div className="relative">
          <button
            onClick={() => setShowFontDropdown(!showFontDropdown)}
            className="flex items-center gap-1 px-1.5 py-1 text-xs hover:bg-muted/50 rounded transition-colors sm:px-2"
            title="Font Family"
          >
            <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="text-xs max-w-8 sm:max-w-16 truncate hidden sm:inline">{selectedFont}</span>
            <MoreHorizontal className="w-2.5 h-2.5 sm:w-3 sm:h-3 rotate-90" />
          </button>
          
          {showFontDropdown && (
            <div className="absolute top-full mt-1 left-0 bg-background border border-border rounded-lg shadow-lg py-1 z-60 min-w-32">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleFontChange(font.value)}
                  className="w-full px-3 py-1 text-xs text-left hover:bg-muted/50 transition-colors"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile: Compact Text Formatting */}
        <div className="flex items-center gap-0.5 sm:gap-1 px-1 border-l border-r border-border/30">
          <button
            onClick={toggleBold}
            className={`p-0.5 sm:p-1 rounded transition-colors ${fontWeight === 'bold' ? 'bg-blue-500/20 text-blue-600' : 'hover:bg-muted/50'}`}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={toggleUnderline}
            className={`p-0.5 sm:p-1 rounded transition-colors ${textDecoration === 'underline' ? 'bg-blue-500/20 text-blue-600' : 'hover:bg-muted/50'}`}
            title="Underline"
          >
            <Underline className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Mobile: Compact Text Alignment */}
        <div className="flex items-center gap-0.5 sm:gap-1 px-1">
          <button
            onClick={() => handleAlignChange('left')}
            className={`p-0.5 sm:p-1 rounded transition-colors ${textAlign === 'left' ? 'bg-blue-500/20 text-blue-600' : 'hover:bg-muted/50'}`}
            title="Align Left"
          >
            <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => handleAlignChange('center')}
            className={`p-0.5 sm:p-1 rounded transition-colors ${textAlign === 'center' ? 'bg-blue-500/20 text-blue-600' : 'hover:bg-muted/50'}`}
            title="Align Center"
          >
            <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => handleAlignChange('right')}
            className={`p-0.5 sm:p-1 rounded transition-colors ${textAlign === 'right' ? 'bg-blue-500/20 text-blue-600' : 'hover:bg-muted/50'}`}
            title="Align Right"
          >
            <AlignRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Mobile: More Options Menu */}
        <div className="relative sm:hidden">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-0.5 hover:bg-muted/50 rounded transition-colors ml-1"
            title="More Options"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          
          {showMobileMenu && (
            <div className="absolute top-full mt-1 right-0 bg-background border border-border rounded-lg shadow-lg py-1 z-60 min-w-32">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground border-b border-border">
                {selectedElement.replace(/^(profile-|text-|link-)/, '').replace(/-/g, ' ')}
              </div>
              <button className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 transition-colors flex items-center gap-2">
                <Type className="w-3.5 h-3.5" />
                Font Options
              </button>
              <button className="w-full px-3 py-2 text-xs text-left hover:bg-muted/50 transition-colors flex items-center gap-2">
                <Palette className="w-3.5 h-3.5" />
                More Colors
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
