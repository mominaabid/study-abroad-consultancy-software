import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {BASE_URL }from '../../Content/Url';

// ─── Async Thunks ──────────────────────────────────────────────────────────────

// Called on Login page submit
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return rejectWithValue(data.message || 'Login failed.');

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      return data; // { token, user: { id, name, email, role } }
    } catch {
      return rejectWithValue('Network error. Please try again.');
    }
  }
);

// Called on every app load — verifies token is still valid
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    const token = localStorage.getItem('token');
    if (!token) return rejectWithValue('No token found.');
    try {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        localStorage.removeItem('token');
        return rejectWithValue('Session expired.');
      }
      return { token, user: data.data };
    } catch {
      return rejectWithValue('Network error.');
    }
  }
);

// ─── Slice ─────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,        // { id, name, email, role }
    token: null,
    isAuthenticated: false,
    loading: true,     // true on app load — waiting for loadUser
    error: null,
  },
  reducers: {
    logout(state) {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── loginUser ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // ── loadUser ──
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(loadUser.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ─────────────────────────────────────────────────────────────────
export const selectUser          = (state) => state.auth.user;
export const selectToken         = (state) => state.auth.token;
export const selectIsAuth        = (state) => state.auth.isAuthenticated;
export const selectAuthLoading   = (state) => state.auth.loading;
export const selectAuthError     = (state) => state.auth.error;
export const selectRole          = (state) => state.auth.user?.role;