import { create } from 'zustand';

type FavoritesState = {
  favs: Record<string, boolean>;
  toggleFav: (id: string) => void;
  isFav: (id: string) => boolean;
};

/** Favoritos (inicia com os mesmos do protótipo). */
export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favs: { 'lumiere-blanche': true, 'corona-reale': true },
  toggleFav: id =>
    set(s => {
      const favs = { ...s.favs };
      if (favs[id]) {
        delete favs[id];
      } else {
        favs[id] = true;
      }
      return { favs };
    }),
  isFav: id => !!get().favs[id],
}));
