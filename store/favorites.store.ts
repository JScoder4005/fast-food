import { create } from "zustand";

type FavoritesAndRatingsState = {
  favoriteIds: string[];
  userRatings: Record<string, number>; // menuItemId -> 1..5

  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  setRating: (id: string, rating: number) => void;
  getMyRating: (id: string) => number;
  clearAll: () => void;
};

export const useFavoritesStore = create<FavoritesAndRatingsState>((set, get) => ({
  favoriteIds: [],
  userRatings: {},

  toggleFavorite: (id: string) => {
    const current = new Set(get().favoriteIds);
    if (current.has(id)) current.delete(id);
    else current.add(id);
    set({ favoriteIds: Array.from(current) });
  },

  isFavorite: (id: string) => get().favoriteIds.includes(id),

  setRating: (id: string, rating: number) => {
    const safe = Math.max(1, Math.min(5, Math.round(rating)));
    set({ userRatings: { ...get().userRatings, [id]: safe } });
  },

  getMyRating: (id: string) => get().userRatings[id] ?? 0,

  clearAll: () => set({ favoriteIds: [], userRatings: {} }),
}));


