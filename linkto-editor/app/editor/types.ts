// app/editor/types.ts

export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FontStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textDecoration?: 'none' | 'underline' | 'overline' | 'line-through';
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textShadow?: string;
  opacity?: number;
}

// Universelles TextElement Interface
export interface TextElement {
  id: string;
  type: 'text';
  content: string;
  position: ElementPosition;
  style: FontStyle;
  order: number;
}

export interface AlignmentGuide {
  type: 'vertical' | 'horizontal';
  position: number;
  elementId: string;
  snapType: 'edge' | 'center';
}

export interface ViewportConfig {
  profile: {
    avatarUrl: string;
    position: ElementPosition; // Avatar Position
  };
  textElements: TextElement[];
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
    fontStyle?: FontStyle;
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
    fontStyle?: FontStyle;
}

export interface Design {
    backgroundColor: string;
    buttonColor: string;
    buttonTextColor: string;
    textColor: string;
}