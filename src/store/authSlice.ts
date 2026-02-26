/**
 * Auth Slice
 * 
 * Manages authentication state: user profile, login status, tokens.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { loginUser, registerUser, logoutUser, fetchProfile } from './apiThunks';

// ─── Types ──────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  avatarUrl?: string;
}

export interface AuthState {
  readonly user: AuthUser | null;
  readonly isAuthenticated: boolean;
  readonly isLoading: boolean;
  readonly error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// ─── Slice ──────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError(state) {
      state.error = null;
    },
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    resetAuth() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        if (action.payload?.user) {
          state.user = action.payload.user as AuthUser;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        if (action.payload?.user) {
          state.user = action.payload.user as AuthUser;
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = (action.payload as string) || 'Registration failed';
      });

    // Logout
    builder
      .addCase(logoutUser.fulfilled, () => {
        return initialState;
      })
      .addCase(logoutUser.rejected, () => {
        return initialState;
      });

    // Fetch Profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload as AuthUser;
          state.isAuthenticated = true;
        }
      })
      .addCase(fetchProfile.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
      });
  },
});

export const { clearAuthError, setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;

// ─── Selectors ──────────────────────────────────────────────

export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.isAuthenticated;

export const selectAuthUser = (state: { auth: AuthState }) =>
  state.auth.user;

export const selectAuthLoading = (state: { auth: AuthState }) =>
  state.auth.isLoading;

export const selectAuthError = (state: { auth: AuthState }) =>
  state.auth.error;
