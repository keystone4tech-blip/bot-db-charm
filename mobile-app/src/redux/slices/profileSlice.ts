import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, ReferralStats } from '../../types';

interface ProfileState {
  user: User | null;
  referralStats: ReferralStats | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  user: null,
  referralStats: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setReferralStats: (state, action: PayloadAction<ReferralStats>) => {
      state.referralStats = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setUser,
  updateUser,
  setReferralStats,
  setLoading,
  setError,
  clearError,
} = profileSlice.actions;

export const selectProfileUser = (state: { profile: ProfileState }) => state.profile.user;
export const selectReferralStats = (state: { profile: ProfileState }) => state.profile.referralStats;
export const selectProfileLoading = (state: { profile: ProfileState }) => state.profile.loading;
export const selectProfileError = (state: { profile: ProfileState }) => state.profile.error;

export default profileSlice.reducer;
