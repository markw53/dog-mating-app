// lib/store/favoritesStore.ts
import { create } from 'zustand';
import { favoritesApi } from '@/lib/api/favorites';

interface FavoritesState {
  // Set of saved dog ids — the single source for heart states everywhere
  ids: Set<string>;
  loaded: boolean;

  // Fetch the id list once per session (no-op if already loaded)
  load: () => Promise<void>;
  // Optimistic toggle: flips the heart instantly, reverts if the API fails
  toggle: (dogId: string) => Promise<boolean>;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: new Set(),
  loaded: false,

  load: async () => {
    if (get().loaded) return;
    try {
      const { ids } = await favoritesApi.getIds();
      set({ ids: new Set(ids), loaded: true });
    } catch {
      // Not logged in / request failed — hearts just render unsaved
    }
  },

  toggle: async (dogId: string) => {
    const { ids } = get();
    const wasSaved = ids.has(dogId);

    // Optimistic update
    const next = new Set(ids);
    if (wasSaved) {
      next.delete(dogId);
    } else {
      next.add(dogId);
    }
    set({ ids: next });

    try {
      const { favorited } = await favoritesApi.toggle(dogId);
      // Trust the server's answer in case of races
      const confirmed = new Set(get().ids);
      if (favorited) {
        confirmed.add(dogId);
      } else {
        confirmed.delete(dogId);
      }
      set({ ids: confirmed });
      return favorited;
    } catch (err) {
      // Revert the optimistic flip
      const reverted = new Set(get().ids);
      if (wasSaved) {
        reverted.add(dogId);
      } else {
        reverted.delete(dogId);
      }
      set({ ids: reverted });
      throw err;
    }
  },

  clear: () => set({ ids: new Set(), loaded: false }),
}));
