// app/editor/components/LayersPanel.tsx
"use client";

import React, { useState } from "react";
import { type PageConfig, type TextElement, type Link, type ImageElement } from "../types";
import { 
  Layers, 
  Type, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  User, 
  Eye, 
  EyeOff, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  Plus,
  ChevronRight
} from "lucide-react";

interface LayersPanelProps {
  config: PageConfig;
  setConfig: (config: PageConfig, actionType?: string) => void;
  viewMode: 'mobile' | 'desktop';
  selectedElement: string | null;
  setSelectedElement: (elementId: string | null) => void;
  reorderElement: (elementId: string, direction: 'up' | 'down' | 'front' | 'back') => void;
}

export default function LayersPanel({
  config,
  setConfig,
  viewMode,
  selectedElement,
  setSelectedElement,
  reorderElement
}: LayersPanelProps) {
  const currentViewport = config[viewMode];
  const { profile, textElements, links, images = [] } = currentViewport;

  const [isOpen, setIsOpen] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  // Gather and sort layers by zIndex descending (top of list is front-most element)
  const getLayers = () => {
    const list: Array<{ 
      id: string; 
      name: string; 
      type: 'avatar' | 'text' | 'link' | 'image'; 
      zIndex: number; 
      visible: boolean; 
    }> = [];

    // Avatar
    list.push({
      id: "avatar",
      name: "Avatar",
      type: "avatar",
      zIndex: profile.position.zIndex ?? 10,
      visible: profile.visible !== false
    });

    // Text Elements
    textElements.forEach(t => {
      list.push({
        id: t.id,
        name: t.content || "Text Element",
        type: "text",
        zIndex: t.position.zIndex ?? 10,
        visible: t.visible !== false
      });
    });

    // Links
    links.forEach(l => {
      list.push({
        id: `link-${l.id}`,
        name: l.title || "Link Button",
        type: "link",
        zIndex: l.position.zIndex ?? 10,
        visible: l.visible !== false
      });
    });

    // Custom Images
    (images || []).forEach(img => {
      list.push({
        id: img.id,
        name: img.url ? "Image Element" : "New Image",
        type: "image",
        zIndex: img.position.zIndex ?? 10,
        visible: img.visible !== false
      });
    });

    // Sort descending by zIndex, then fallback to order/id
    return list.sort((a, b) => b.zIndex - a.zIndex);
  };

  const layers = getLayers();

  // Helper to find the maximum zIndex in the current viewport
  const getMaxZIndex = () => {
    let maxZ = 10;
    layers.forEach(l => {
      if (l.zIndex > maxZ) maxZ = l.zIndex;
    });
    return maxZ;
  };

  // Add Elements Handlers
  const handleAddText = () => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const nextZ = getMaxZIndex() + 10;
    
    // Centered defaults
    const newText: TextElement = {
      id: `text-${Date.now()}`,
      type: "text",
      content: "New Text Element",
      position: {
        x: viewMode === "mobile" ? 40 : 224,
        y: viewMode === "mobile" ? 220 : 300,
        width: viewMode === "mobile" ? 200 : 400,
        height: 40,
        zIndex: nextZ
      },
      style: {
        fontSize: viewMode === "mobile" ? 16 : 20,
        fontWeight: "normal",
        textAlign: "center",
        color: config.design.textColor || "#f2f7f7",
        fontFamily: "Arial"
      },
      order: textElements.length + 1,
      visible: true
    };

    newConfig[viewMode].textElements.push(newText);
    setConfig(newConfig, "style-change");
    setSelectedElement(newText.id);
  };

  const handleAddLink = () => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const nextZ = getMaxZIndex() + 10;
    const nextId = Math.max(...links.map(l => l.id), 0) + 1;

    const newLink: Link = {
      id: nextId,
      title: "New Link Button",
      url: "https://example.com",
      order: links.length + 1,
      position: {
        x: viewMode === "mobile" ? 40 : 224,
        y: viewMode === "mobile" ? 275 : 360,
        width: viewMode === "mobile" ? 200 : 400,
        height: 45,
        zIndex: nextZ
      },
      visible: true
    };

    newConfig[viewMode].links.push(newLink);
    setConfig(newConfig, "style-change");
    setSelectedElement(`link-${newLink.id}`);
  };

  const handleAddImage = () => {
    const newConfig = JSON.parse(JSON.stringify(config));
    const nextZ = getMaxZIndex() + 10;

    const newImage: ImageElement = {
      id: `image-${Date.now()}`,
      type: "image",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop",
      position: {
        x: viewMode === "mobile" ? 90 : 374,
        y: viewMode === "mobile" ? 340 : 430,
        width: 100,
        height: 100,
        zIndex: nextZ
      },
      borderRadius: 16,
      order: (images || []).length + 1,
      visible: true
    };

    if (!newConfig[viewMode].images) {
      newConfig[viewMode].images = [];
    }
    newConfig[viewMode].images.push(newImage);
    setConfig(newConfig, "style-change");
    setSelectedElement(newImage.id);
  };

  // Toggle Visibility Handler
  const handleToggleVisibility = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newConfig = JSON.parse(JSON.stringify(config));

    if (layerId === "avatar") {
      newConfig[viewMode].profile.visible = !(profile.visible !== false);
    } else if (layerId.startsWith("text-") || layerId.startsWith("profile-")) {
      const idx = newConfig[viewMode].textElements.findIndex((t: TextElement) => t.id === layerId);
      if (idx !== -1) {
        newConfig[viewMode].textElements[idx].visible = !newConfig[viewMode].textElements[idx].visible;
      }
    } else if (layerId.startsWith("link-")) {
      const linkId = parseInt(layerId.replace("link-", ""));
      const idx = newConfig[viewMode].links.findIndex((l: Link) => l.id === linkId);
      if (idx !== -1) {
        newConfig[viewMode].links[idx].visible = !newConfig[viewMode].links[idx].visible;
      }
    } else if (layerId.startsWith("image-")) {
      const idx = newConfig[viewMode].images.findIndex((img: ImageElement) => img.id === layerId);
      if (idx !== -1) {
        newConfig[viewMode].images[idx].visible = !newConfig[viewMode].images[idx].visible;
      }
    }

    setConfig(newConfig, "style-change");
  };

  // Delete Layer Handler
  const handleDeleteLayer = (layerId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newConfig = JSON.parse(JSON.stringify(config));

    if (layerId.startsWith("text-")) {
      newConfig[viewMode].textElements = textElements.filter(t => t.id !== layerId);
    } else if (layerId.startsWith("link-")) {
      const linkId = parseInt(layerId.replace("link-", ""));
      newConfig[viewMode].links = links.filter(l => l.id !== linkId);
    } else if (layerId.startsWith("image-")) {
      newConfig[viewMode].images = (images || []).filter(img => img.id !== layerId);
    } else {
      return; // Can't delete core avatar
    }

    setConfig(newConfig, "style-change");
    if (selectedElement === layerId) {
      setSelectedElement(null);
    }
  };

  // Double click name rename handlers
  const handleStartRename = (layerId: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(layerId);
    setEditingName(currentName);
  };

  const handleSaveRename = () => {
    if (!editingId) return;
    const newConfig = JSON.parse(JSON.stringify(config));

    if (editingId === "avatar") {
      // Core avatar is always "Avatar"
    } else if (editingId.startsWith("text-") || editingId.startsWith("profile-")) {
      const idx = newConfig[viewMode].textElements.findIndex((t: TextElement) => t.id === editingId);
      if (idx !== -1) {
        newConfig[viewMode].textElements[idx].content = editingName;
      }
    } else if (editingId.startsWith("link-")) {
      const linkId = parseInt(editingId.replace("link-", ""));
      const idx = newConfig[viewMode].links.findIndex((l: Link) => l.id === linkId);
      if (idx !== -1) {
        newConfig[viewMode].links[idx].title = editingName;
      }
    }

    setConfig(newConfig, "text-change");
    setEditingId(null);
  };

  const getLayerIcon = (type: string) => {
    switch (type) {
      case "avatar":
        return <User size={14} className="text-pink-400" />;
      case "text":
        return <Type size={14} className="text-blue-400" />;
      case "link":
        return <LinkIcon size={14} className="text-emerald-400" />;
      case "image":
        return <ImageIcon size={14} className="text-yellow-400" />;
      default:
        return <Layers size={14} />;
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-xl transition-all duration-300">
      {/* Header (Collapsible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-white/5 transition-colors border-b border-white/5"
      >
        <div className="flex items-center gap-2">
          <div className="text-primary">
            <Layers size={16} />
          </div>
          <h3 className="font-semibold tracking-tight text-sm">Layers & Elements</h3>
          <span className="text-xs bg-white/10 text-muted-foreground px-2 py-0.5 rounded-full font-mono">
            {layers.length}
          </span>
        </div>
        <ChevronRight 
          size={16} 
          className={`text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} 
        />
      </button>

      {isOpen && (
        <div className="p-4 space-y-3.5">
          {/* Add Elements Actions */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Add Elements
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleAddText}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-semibold text-foreground/80 hover:text-foreground transition-all group"
              >
                <div className="p-1 bg-blue-500/20 text-blue-400 rounded-md group-hover:scale-110 transition-transform">
                  <Plus size={12} />
                </div>
                Text
              </button>
              <button
                onClick={handleAddLink}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-semibold text-foreground/80 hover:text-foreground transition-all group"
              >
                <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-md group-hover:scale-110 transition-transform">
                  <Plus size={12} />
                </div>
                Link
              </button>
              <button
                onClick={handleAddImage}
                className="flex flex-col items-center justify-center gap-1 py-1.5 px-1 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] font-semibold text-foreground/80 hover:text-foreground transition-all group"
              >
                <div className="p-1 bg-yellow-500/20 text-yellow-400 rounded-md group-hover:scale-110 transition-transform">
                  <Plus size={12} />
                </div>
                Image
              </button>
            </div>
          </div>

          {/* Layers List */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Layer Stack (Z-Order)
            </label>
            <div className="space-y-1 max-h-[260px] overflow-y-auto pr-1 custom-scrollbar">
              {layers.map((layer, index) => {
                const isSelected = selectedElement === layer.id;
                const isAvatar = layer.type === "avatar";
                const isCustomImage = layer.type === "image";

                return (
                  <div
                    key={layer.id}
                    onClick={() => setSelectedElement(layer.id)}
                    className={`flex items-center justify-between p-1.5 rounded-lg border transition-all select-none cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 border-primary text-foreground"
                        : "bg-white/5 hover:bg-white/10 border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {/* Type Icon */}
                      <div className="flex-shrink-0">
                        {getLayerIcon(layer.type)}
                      </div>

                      {/* Name or Rename Input */}
                      {editingId === layer.id ? (
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onBlur={handleSaveRename}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveRename();
                            if (e.key === "Escape") setEditingId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-black/40 px-1.5 py-0.5 rounded text-xs text-foreground outline-none border border-white/20 focus:border-primary"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <span 
                          className="text-xs font-medium truncate flex-1 leading-none"
                          onDoubleClick={(e) => {
                            if (!isAvatar && !isCustomImage) {
                              handleStartRename(layer.id, layer.name, e);
                            }
                          }}
                          title={layer.name + (!isAvatar && !isCustomImage ? " (Double click to rename)" : "")}
                        >
                          {layer.name.length > 16 ? `${layer.name.substring(0, 16)}...` : layer.name}
                        </span>
                      )}
                    </div>

                    {/* Controls Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Reordering */}
                      {isSelected && (
                        <div className="flex items-center bg-black/30 rounded-lg p-0.5 border border-white/5 mr-1">
                          <button
                            onClick={() => reorderElement(layer.id, "up")}
                            disabled={index === 0}
                            title="Move Up (Ctrl + ])"
                            className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded text-muted-foreground hover:text-foreground transition-all"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={() => reorderElement(layer.id, "down")}
                            disabled={index === layers.length - 1}
                            title="Move Down (Ctrl + [)"
                            className="p-1 hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent rounded text-muted-foreground hover:text-foreground transition-all"
                          >
                            <ChevronDown size={12} />
                          </button>
                        </div>
                      )}

                      {/* Visibility */}
                      <button
                        onClick={(e) => handleToggleVisibility(layer.id, e)}
                        className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${
                          layer.visible ? "text-muted-foreground hover:text-foreground" : "text-red-500/80 hover:text-red-400"
                        }`}
                        title={layer.visible ? "Hide element" : "Show element"}
                      >
                        {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      </button>

                      {/* Delete */}
                      {!isAvatar && (
                        <button
                          onClick={(e) => handleDeleteLayer(layer.id, e)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors"
                          title="Delete element"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
