// app/editor/Preview.tsx
import { type PageConfig } from "./types";

interface PreviewProps {
  config: PageConfig;
}

export default function Preview({ config }: PreviewProps) {
  const { design, profile, links } = config;

  // Generiere den Hintergrund-Style basierend auf dem Typ
  const getBackgroundStyle = () => {
    switch (design.backgroundType) {
      case 'gradient':
        return {
          backgroundImage: `linear-gradient(${design.backgroundGradient.direction}, ${design.backgroundGradient.from}, ${design.backgroundGradient.to})`,
          backgroundColor: 'transparent',
          backgroundSize: 'auto',
          backgroundPosition: 'initial',
          backgroundRepeat: 'no-repeat',
          color: design.textColor,
        };
      case 'image':
        return {
          backgroundImage: design.backgroundImage ? `url(${design.backgroundImage})` : undefined,
          backgroundColor: design.backgroundColor, // Fallback
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          color: design.textColor,
        };
      case 'solid':
      default:
        return {
          backgroundImage: 'none',
          backgroundColor: design.backgroundColor,
          backgroundSize: 'auto',
          backgroundPosition: 'initial',
          backgroundRepeat: 'no-repeat',
          color: design.textColor,
        };
    }
  };

  return (
    // iPhone Mockup Container mit Highlighting
    <div className="relative">
      {/* Glow Effect Background */}
      <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-[50px] blur-xl opacity-75 animate-pulse"></div>
      
      {/* iPhone Mockup */}
      <div className="relative w-[300px] h-[600px] rounded-[40px] border-[10px] border-black bg-gray-800 shadow-2xl overflow-hidden ring-2 ring-primary/50 ring-offset-4 ring-offset-background">
        {/* Notch */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 w-22 h-6 bg-black rounded-2xl z-10">
        </div>

      {/* Screen Content */}
      <div
        className="w-full h-full overflow-y-auto p-4 pt-8 flex flex-col items-center gap-4"
        style={getBackgroundStyle()}
      >
        {/* Profilbild */}
        <img
          src={profile.avatarUrl}
          alt="Avatar"
          className="w-24 h-24 rounded-full object-cover border-2 border-white"
        />

        {/* Profil-Infos */}
        <div className="text-center">
          <h2 className="font-bold text-lg">{profile.name}</h2>
          <p className="text-sm opacity-90">{profile.bio}</p>
        </div>

        {/* Links */}
        <div className="w-full space-y-3 mt-4">
          {links
            .sort((a, b) => a.order - b.order) // Sortiere nach 'order'
            .map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full p-3 text-center font-semibold transition-transform hover:scale-105"
                style={{
                  backgroundColor: design.buttonColor,
                  color: design.buttonTextColor,
                  borderRadius: `${design.buttonBorderRadius}px`,
                }}
              >
                {link.title}
              </a>
            ))}
        </div>
      </div>
    </div>
    </div>
  );
}