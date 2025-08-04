// app/editor/types.ts

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
  profile: {
    name: string;
    bio: string;
    avatarUrl: string;
  };
  links: {
    id: number;
    title: string;
    url: string;
    order: number;
  }[];
}

// Hier könntest du auch separate Typen für Link, Design etc. definieren,
// wenn du sie an mehreren Stellen einzeln brauchst.
export interface Link {
    id: number;
    title: string;
    url: string;
    order: number;
}

export interface Design {
    backgroundColor: string;
    buttonColor: string;
    buttonTextColor: string;
    textColor: string;
}