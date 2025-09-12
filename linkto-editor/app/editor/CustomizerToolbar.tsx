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
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
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
  const [textTransform, setTextTransform] = useState("none");
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

  const toggleTextTransform = () => {
    const newTransform = textTransform === "none" ? "uppercase" : "none";
    setTextTransform(newTransform);
    onTextTransformChange?.(newTransform);
  };

  const handleTextAlign = (align: string) => {
    setTextAlign(align);
    onTextAlignChange?.(align);
  };

  const toggleFontWeight = () => {
    const newWeight = fontWeight === "normal" ? "bold" : "normal";
    setFontWeight(newWeight);
    onFontWeightChange?.(newWeight);
  };

  const toggleTextDecoration = (decoration: string) => {
    const newDecoration = textDecoration === decoration ? "none" : decoration;
    setTextDecoration(newDecoration);
    onTextDecorationChange?.(newDecoration);
  };

  // Primäre Tools (immer sichtbar)
  const PrimaryTools = () => (
    <>
      {/* Color Picker */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
          title="Text Color"
        >
          <Palette size={16} />
          <div 
            className="w-4 h-4 rounded border border-border"
            style={{ backgroundColor: selectedColor }}
          />
        </button>
        
        {showColorPicker && (
          <div className="absolute top-full mt-2 left-0 bg-popover border border-border rounded-lg shadow-lg p-3 z-50">
            <div className="grid grid-cols-6 gap-2 mb-3">
              {[
                '#000000', '#374151', '#ef4444', '#f97316', 
                '#eab308', '#22c55e', '#3b82f6', '#8b5cf6',
                '#ec4899', '#f3f4f6', '#9ca3af', '#dc2626'
              ].map(color => (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  className="w-6 h-6 rounded border border-border hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => handleColorChange(e.target.value)}
              className="w-full h-8 rounded border border-border cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Font Selector */}
      <div className="relative">
        <button
          onClick={() => setShowFontDropdown(!showFontDropdown)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors min-w-[100px]"
          title="Font Family"
        >
          <Type size={16} />
          <span className="text-sm truncate">{selectedFont}</span>
        </button>
        
        {showFontDropdown && (
          <div className="absolute top-full mt-2 left-0 bg-popover border border-border rounded-lg shadow-lg py-2 z-50 min-w-[160px]">
            {FONT_OPTIONS.map(font => (
              <button
                key={font.value}
                onClick={() => handleFontChange(font.value)}
                className="w-full px-3 py-2 text-left text-sm hover:bg-accent/50 transition-colors"
                style={{ fontFamily: font.value }}
              >
                {font.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Text Transform Toggle */}
      <button
        onClick={toggleTextTransform}
        className={`px-3 py-2 rounded-lg border border-border transition-colors ${
          textTransform === "uppercase" 
            ? "bg-primary text-primary-foreground" 
            : "hover:bg-accent/50"
        }`}
        title="Toggle Uppercase"
      >
        <span className="text-sm font-medium">Aa</span>
      </button>
    </>
  );

  // Sekundäre Tools (auf mobil im More-Menü)
  const SecondaryTools = () => (
    <>
      {/* Text Alignment */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        {[
          { align: "left", icon: AlignLeft },
          { align: "center", icon: AlignCenter },
          { align: "right", icon: AlignRight }
        ].map(({ align, icon: Icon }) => (
          <button
            key={align}
            onClick={() => handleTextAlign(align)}
            className={`px-2 py-2 transition-colors ${
              textAlign === align 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-accent/50"
            }`}
            title={`Align ${align}`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Text Styling */}
      <div className="flex gap-1">
        <button
          onClick={toggleFontWeight}
          className={`px-2 py-2 rounded border border-border transition-colors ${
            fontWeight === "bold" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent/50"
          }`}
          title="Bold"
        >
          <Bold size={16} />
        </button>
        
        <button
          onClick={() => toggleTextDecoration("italic")}
          className={`px-2 py-2 rounded border border-border transition-colors ${
            textDecoration === "italic" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent/50"
          }`}
          title="Italic"
        >
          <Italic size={16} />
        </button>
        
        <button
          onClick={() => toggleTextDecoration("underline")}
          className={`px-2 py-2 rounded border border-border transition-colors ${
            textDecoration === "underline" 
              ? "bg-primary text-primary-foreground" 
              : "hover:bg-accent/50"
          }`}
          title="Underline"
        >
          <Underline size={16} />
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Toolbar */}
      <div className={`hidden md:flex items-center gap-3 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-4 py-3 ${className}`}>
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <div className="w-2 h-2 bg-primary rounded-full" />
          {selectedElement} selected
        </div>
        
        <div className="w-px h-6 bg-border" />
        
        <div className="flex items-center gap-3">
          <PrimaryTools />
          <div className="w-px h-6 bg-border" />
          <SecondaryTools />
        </div>
      </div>

      {/* Mobile Toolbar */}
      <div className={`flex md:hidden items-center gap-2 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-lg px-3 py-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
          {selectedElement}
        </div>
        
        <div className="w-px h-4 bg-border" />
        
        <div className="flex items-center gap-2">
          <PrimaryTools />
          
          {/* More Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="px-2 py-2 rounded-lg border border-border hover:bg-accent/50 transition-colors"
            title="More Options"
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* Mobile More Menu */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/20" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">More Options</h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-1 rounded hover:bg-accent/50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <SecondaryTools />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
