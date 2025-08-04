// app/editor/page.tsx
"use client";

import { useState } from "react";
import Controls from "./Controls";
import Preview from "./Preview";
import { type PageConfig } from "./types"; // Erstelle eine types.ts Datei für die Interfaces
import { Download } from "lucide-react";

// Startkonfiguration für den Editor
const initialConfig: PageConfig = {
  design: {
    backgroundColor: "#070c0e",
    backgroundType: "solid" as const,
    backgroundGradient: {
      from: "#070c0e",
      to: "#1a1a2e",
      direction: "to bottom right",
    },
    backgroundImage: "",
    buttonColor: "#9fd2d1",
    buttonTextColor: "#070c0e",
    textColor: "#f2f7f7",
    buttonBorderRadius: 8,
  },
  profile: {
    name: "Your Name",
    bio: "Your short and catchy bio goes here!",
    avatarUrl: "https://avatar.vercel.sh/your-name", // Platzhalter-Avatar
  },
  links: [
    { id: 1, title: "My Website", url: "https://example.com", order: 1 },
    { id: 2, title: "Twitter / X", url: "https://twitter.com", order: 2 },
  ],
};

export default function EditorPage() {
  const [config, setConfig] = useState<PageConfig>(initialConfig);
    const handleDownloadJson = () => {
    // Konvertiere das config-Objekt in einen formatierten JSON-String
    const jsonString = JSON.stringify(config, null, 2);
    // Erstelle ein Blob-Objekt aus dem String
    const blob = new Blob([jsonString], { type: "application/json" });
    // Erstelle eine URL für das Blob-Objekt
    const url = URL.createObjectURL(blob);

    // Erstelle ein temporäres Link-Element
    const a = document.createElement("a");
    a.href = url;
    a.download = "flextree-config.json"; // Der Dateiname für den Download
    document.body.appendChild(a); // Füge den Link zum DOM hinzu
    a.click(); // Simuliere einen Klick auf den Link, um den Download zu starten
    document.body.removeChild(a); // Entferne den Link wieder aus dem DOM
    URL.revokeObjectURL(url); // Gib den Speicher für die Blob-URL frei
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Haupt-Layout mit zwei Spalten */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Linke Spalte: Steuerung */}
        <div className="lg:col-span-1">
          <Controls config={config} setConfig={setConfig} />
        </div>

        {/* Mittlere Spalte: Vorschau */}
        <div className="lg:col-span-1 flex justify-center items-start">
          <Preview config={config} />
        </div>

        {/* Rechte Spalte: Live JSON-Ansicht mit Download-Button */}
        <div className="relative bg-card p-4 rounded-lg border border-border">
          {/* --- NEUER DOWNLOAD BUTTON --- */}
          <button
            onClick={handleDownloadJson}
            className="absolute top-3 right-3 p-1.5 bg-muted hover:bg-accent rounded text-muted-foreground hover:text-accent-foreground transition-colors cursor-pointer"
            title="Download JSON"
          >
            <Download size={16} />
          </button>
          {/* --- ENDE DOWNLOAD BUTTON --- */}

          <h2 className="text-lg font-semibold mb-2">Live JSON Config</h2>
          <pre className="text-xs bg-muted p-3 rounded overflow-auto h-[80vh] text-muted-foreground">
            {JSON.stringify(config, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}