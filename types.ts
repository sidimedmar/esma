
export type Language = 'fr' | 'ar';

export interface FilterDraft {
  id: string;
  userId: string;
  name: string;
  eventType: string;
  canvasJson: string;
  previewUrl: string;
  createdAt: number;
  price: number;
  isTemplate?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin?: boolean;
}

export interface EditorTab {
  id: string;
  name: string;
  canvasJson: string;
  eventType: string;
  price: number;
}

export enum EventType {
  WEDDING = 'wedding',
  BIRTHDAY = 'birthday',
  BABY = 'baby',
  CUSTOM = 'custom'
}
