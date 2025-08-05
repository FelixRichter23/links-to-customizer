// app/editor/types.ts

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  elementId: string;
  snapType: 'edge' | 'center';
}

export interface ViewportConfig {
  profile: {
    name: string;
    bio: string;
    avatarUrl: string;
    position: ElementPosition; // Avatar Position
    bioPosition?: ElementPosition; // Separate Bio Position
    nameStyle?: {
      fontSize?: number;
      fontWeight?: string;
      color?: string;
    };
    bioStyle?: {
      fontSize?: number;
      color?: string;
    };
  };
  links: {
    id: number;
    title: string;
    url: string;
    order: number;
    position: ElementPosition;
    customColor?: string;
    customTextColor?: string;
    customBorderRadius?: number;
    fontSize?: number;
  }[];
}

export interface PageConfig {
  design: {
    backgroundColor: string;
    backgroundType: 'solid' | 'gradient' | 'image';
    backgroundGradient: {
      from: string;
      to: string;
      direction: string;
    };
    backgroundImage: string;
    buttonColor: string;
    buttonTextColor: string;
    textColor: string;
    buttonBorderRadius: number;
  };
  mobile: ViewportConfig;
  desktop: ViewportConfig;
}

// Hier könntest du auch separate Typen für Link, Design etc. definieren,
// wenn du sie an mehreren Stellen einzeln brauchst.
export interface Link {
    id: number;
    title: string;
    url: string;
    order: number;
    position: ElementPosition;
    customColor?: string;
    customTextColor?: string;
    customBorderRadius?: number;
    fontSize?: number;
}

export interface Design {
    backgroundColor: string;
    buttonColor: string;
    buttonTextColor: string;
    textColor: string;
}