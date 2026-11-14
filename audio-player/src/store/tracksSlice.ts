import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../services/api';
import { tracks as initialTracks } from '../data/tracks';

export interface Track {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  cover: string;
  added: string;
  liked?: boolean;
}

interface TracksState {
  tracks: Track[];
  favorites: number[];
  searchQuery: string;
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const initialState: TracksState = {
  tracks: initialTracks,
  favorites: initialTracks.filter((track) => track.liked).map((track) => track.id),
  searchQuery: '',
  loading: false,
  error: null,
  page: 1,
  hasMore: false,
};

export const fetchTracks = createAsyncThunk(
  'tracks/fetchTracks',
  async (page: number) => {
    const data = await api.getTracks();

    const tracks: Track[] = data.flatMap((item) => {
      const id = Number(item.id);
      if (!Number.isInteger(id)) return [];

      const localTrack = initialTracks.find((track) => track.id === id);
      if (localTrack) {
        return [{ ...localTrack, title: item.title, artist: item.artist }];
      }

      return [{
        id,
        title: item.title,
        artist: item.artist,
        album: '',
        duration: '',
        cover: '',
        added: '',
        liked: false,
      }];
    });

    return { tracks, page, hasMore: false };
  }
);

export const fetchFavorites = createAsyncThunk<number[]>(
  'tracks/fetchFavorites',
  async () => {
    const ids = await api.getFavorites();
    return ids
      .map(Number)
      .filter((id) => Number.isInteger(id));
  }
);

const tracksSlice = createSlice({
  name: 'tracks',
  initialState,
  reducers: {
    toggleLike: (state, action: PayloadAction<number>) => {
      const id = action.payload;
      const track = state.tracks.find((item) => item.id === id);
      if (!track) return;

      track.liked = !track.liked;
      if (track.liked) {
        if (!state.favorites.includes(id)) state.favorites.push(id);
      } else {
        state.favorites = state.favorites.filter((favoriteId) => favoriteId !== id);
      }
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTracks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTracks.fulfilled, (state, action) => {
        state.loading = false;
        const { tracks: newTracks, page, hasMore } = action.payload;
        if (page === 1) state.tracks = newTracks;
        else state.tracks = [...state.tracks, ...newTracks];
        state.page = page;
        state.hasMore = hasMore;
      })
      .addCase(fetchTracks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Ошибка загрузки треков';
      })
      .addCase(fetchFavorites.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.favorites = action.payload;
        state.tracks.forEach((track) => {
          track.liked = action.payload.includes(track.id);
        });
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка загрузки избранного';
      });
  },
});

export const { toggleLike, setSearchQuery } = tracksSlice.actions;
export default tracksSlice.reducer;