import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VPNKey } from '../../types';

interface VPNState {
  keys: VPNKey[];
  loading: boolean;
  error: string | null;
  selectedKey: VPNKey | null;
}

const initialState: VPNState = {
  keys: [],
  loading: false,
  error: null,
  selectedKey: null,
};

const vpnSlice = createSlice({
  name: 'vpn',
  initialState,
  reducers: {
    setKeys: (state, action: PayloadAction<VPNKey[]>) => {
      state.keys = action.payload;
    },
    addKey: (state, action: PayloadAction<VPNKey>) => {
      state.keys.push(action.payload);
    },
    removeKey: (state, action: PayloadAction<string>) => {
      state.keys = state.keys.filter((key) => key.id !== action.payload);
    },
    updateKey: (state, action: PayloadAction<VPNKey>) => {
      const index = state.keys.findIndex((k) => k.id === action.payload.id);
      if (index !== -1) {
        state.keys[index] = action.payload;
      }
    },
    setSelectedKey: (state, action: PayloadAction<VPNKey | null>) => {
      state.selectedKey = action.payload;
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
  setKeys,
  addKey,
  removeKey,
  updateKey,
  setSelectedKey,
  setLoading,
  setError,
  clearError,
} = vpnSlice.actions;

export const selectVPNKeys = (state: { vpn: VPNState }) => state.vpn.keys;
export const selectSelectedVPNKey = (state: { vpn: VPNState }) => state.vpn.selectedKey;
export const selectVPNLoading = (state: { vpn: VPNState }) => state.vpn.loading;
export const selectVPNError = (state: { vpn: VPNState }) => state.vpn.error;

export default vpnSlice.reducer;
