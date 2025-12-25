
import { FilterDraft, User } from '../types';

const DRAFTS_KEY = 'filter_studio_drafts_v4';
const USER_KEY = 'filter_studio_user_v4';
const ACCOUNTS_KEY = 'filter_studio_accounts_v4';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const backendService = {
  // --- AUTHENTICATION ---
  signup: async (email: string, name: string): Promise<User> => {
    await delay(300);
    const accounts = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || '[]');
    let user = accounts.find((u: User) => u.email === email);
    
    if (!user) {
      user = { id: Math.random().toString(36).substr(2, 9), email, name };
      accounts.push(user);
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    }
    
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): User | null => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  logout: () => {
    localStorage.removeItem(USER_KEY);
  },

  // --- DRAFTS ---
  saveDraft: async (userId: string, draftData: Omit<FilterDraft, 'id' | 'createdAt'>): Promise<FilterDraft> => {
    await delay(200);
    const drafts = backendService.getDrafts();
    
    // On cherche un doublon exact basé sur le contenu JSON pour cet utilisateur
    const existingIndex = drafts.findIndex(d => d.userId === userId && d.canvasJson === draftData.canvasJson);
    
    if (existingIndex > -1) {
      const updatedDraft = {
        ...drafts[existingIndex],
        ...draftData,
        createdAt: Date.now()
      };
      drafts[existingIndex] = updatedDraft;
      localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
      return updatedDraft;
    }

    const newDraft = {
      ...draftData,
      id: 'f_' + Math.random().toString(36).substr(2, 9) + Date.now(),
      createdAt: Date.now(),
      userId
    };

    drafts.push(newDraft);
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts));
    return newDraft as any;
  },

  getDrafts: (): any[] => {
    const drafts = localStorage.getItem(DRAFTS_KEY);
    return drafts ? JSON.parse(drafts) : [];
  },

  getUserDrafts: async (userId: string): Promise<FilterDraft[]> => {
    const all = backendService.getDrafts();
    return all.filter(d => d.userId === userId);
  },

  deleteDraft: async (draftId: string): Promise<void> => {
    const drafts = backendService.getDrafts();
    const filtered = drafts.filter(d => String(d.id) !== String(draftId));
    localStorage.setItem(DRAFTS_KEY, JSON.stringify(filtered));
    await delay(100);
  }
};
