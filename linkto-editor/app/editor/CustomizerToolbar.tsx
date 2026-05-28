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
  currentColor?: string;
  currentFont?: string;
  currentFontWeight?: string;
  currentTextDecoration?: string;
  currentTextAlign?: string;
  onColorChange?: (color: string) => void;
  onFontChange?: (font: string) => void;
  onTextTransformChange?: (transform: string) => void;
  onTextAlignChange?: (align: string) => void;
  onFontWeightChange?: (weight: string) => void;
  onTextDecorationChange?: (decoration: string) => void;
  className?: string;
}

const FONT_OPTIONS = [
  { value: 'inherit', label: 'Default (Inter)' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'monospace', label: 'Mono' },
];

const PREDEFINED_COLORS = [
  '#000000', '#ffffff', '#ff3b30', '#34c759', '#007aff',
  '#ffcc00', '#ff2d55', '#5ac8fa', '#8e8e93', '#ff9500'
];

export default function CustomizerToolbar({
  selectedElement,
  currentColor,
  currentFont,
  currentFontWeight,
  currentTextDecoration,
  currentTextAlign,
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
  const [selectedColor, setSelectedColor] = useState(currentColor || "#ffffff");
  const [selectedFont, setSelectedFont] = useState(currentFont || "inherit");
  const [textAlign, setTextAlign] = useState(currentTextAlign || "left");
  const [fontWeight, setFontWeight] = useState(currentFontWeight || "normal");
  const [textDecoration, setTextDecoration] = useState(currentTextDecoration || "none");

  // Sync state when props change
  React.useEffect(() => {
    if (currentColor) setSelectedColor(currentColor);
    if (currentFont) setSelectedFont(currentFont);
    if (currentTextAlign) setTextAlign(currentTextAlign);
    if (currentFontWeight) setFontWeight(currentFontWeight);
    if (currentTextDecoration) setTextDecoration(currentTextDecoration);
  }, [currentColor, currentFont, currentTextAlign, currentFontWeight, currentTextDecoration]);

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
    <div className={`bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl p-1.5 max-w-fit flex items-center transition-all ${className}`}>
      <div className="flex items-center gap-1 sm:gap-2 px-1">
        {/* Element Label */}
        <div className="hidden sm:flex items-center gap-2 pr-3 border-r border-white/10">
          <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
          <span className="text-xs font-medium text-white/70 capitalize">
            {selectedElement.replace(/^(profile-|text-|link-)/, '').replace(/-/g, ' ')}
          </span>
        </div>

        {/* Color Picker */}
        <div className="relative">
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowFontDropdown(false); }}
            className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 hover:bg-white/10 rounded-full transition-colors"
            title="Text Color"
          >
            <div 
              className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-white/20 shadow-inner"
              style={{ backgroundColor: selectedColor }}
            />
          </button>
          
          {showColorPicker && (
            <div className="absolute top-full mt-3 left-0 bg-black/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-3 z-60 w-44 animate-in fade-in zoom-in-95 duration-200">
              <div className="grid grid-cols-5 gap-2 mb-3">
                {PREDEFINED_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform shadow-sm cursor-pointer"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-full h-8 rounded-lg border border-white/10 cursor-pointer bg-transparent p-0 block outline-none"
              />
            </div>
          )}
        </div>

        {/* Font Family */}
        <div className="relative">
          <button
            onClick={() => { setShowFontDropdown(!showFontDropdown); setShowColorPicker(false); }}
            className="flex items-center gap-2 px-3 h-8 sm:h-9 hover:bg-white/10 rounded-full transition-colors text-white/80"
            title="Font Family"
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-xs max-w-16 sm:max-w-24 truncate font-medium">{selectedFont}</span>
            <MoreHorizontal className="w-3 h-3 text-white/40" />
          </button>
          
          {showFontDropdown && (
            <div className="absolute top-full mt-3 left-0 bg-black/40 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl p-1 z-60 min-w-36 animate-in fade-in zoom-in-95 duration-200">
              {FONT_OPTIONS.map((font) => (
                <button
                  key={font.value}
                  onClick={() => handleFontChange(font.value)}
                  className="w-full px-4 py-2 text-sm text-left hover:bg-white/10 rounded-xl transition-colors text-white/80"
                  style={{ fontFamily: font.value }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleBold}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${fontWeight === 'bold' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={toggleUnderline}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${textDecoration === 'underline' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            title="Underline"
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        {/* Text Alignment */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => handleAlignChange('left')}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${textAlign === 'left' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Align Left"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAlignChange('center')}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${textAlign === 'center' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Align Center"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleAlignChange('right')}
            className={`w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full transition-all ${textAlign === 'right' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
            title="Align Right"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
