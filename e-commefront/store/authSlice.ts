import axios from "axios";
import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";

import {
  authService,
  type AuthUser,
  type LoginCredentials,
  type PasswordResetPayload,
  type RegisterPayload,
} from "@/services/auth/authService";
import { clearAccessToken, setAccessToken } from "@/config/config";

type AuthFailure = { message: string; unauthorized: boolean };

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated" | "error";
};

const initialState: AuthState = {
  user: null,
  status: "idle",
};

function toAuthFailure(error: unknown): AuthFailure {
  const unauthorized = axios.isAxiosError(error) && error.response?.status === 401;
  if (unauthorized) clearAccessToken();

  const responseMessage = axios.isAxiosError<{ message?: string }>(error)
    ? error.response?.data?.message
    : undefined;

  return {
    message: responseMessage ?? (error instanceof Error ? error.message : "Une erreur est survenue."),
    unauthorized,
  };
}

export const fetchCurrentUser = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: AuthFailure }
>("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    return await authService.currentUserWithRole();
  } catch (error) {
    return rejectWithValue(toAuthFailure(error));
  }
});

export const loginUser = createAsyncThunk<
  AuthUser,
  LoginCredentials,
  { rejectValue: AuthFailure }
>("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    setAccessToken(response.access_token);
    return await authService.currentUserWithRole();
  } catch (error) {
    clearAccessToken();
    return rejectWithValue(toAuthFailure(error));
  }
});

export const registerUser = createAsyncThunk<
  AuthUser,
  RegisterPayload,
  { rejectValue: AuthFailure }
>("auth/register", async (payload, { rejectWithValue }) => {
  try {
    const response = await authService.register(payload);
    setAccessToken(response.access_token);
    return await authService.currentUserWithRole();
  } catch (error) {
    clearAccessToken();
    return rejectWithValue(toAuthFailure(error));
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: AuthFailure }>(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(toAuthFailure(error));
    } finally {
      clearAccessToken();
      if (typeof window !== "undefined") {
        try {
          const cacheNames = await window.caches.keys();
          await Promise.all(cacheNames.map((cacheName) => window.caches.delete(cacheName)));
        } catch {
          // La navigation et la déconnexion restent possibles si Cache Storage est indisponible.
        }
        window.location.replace("/");
      }
    }
  },
);

export const refreshSession = createAsyncThunk<
  AuthUser,
  void,
  { rejectValue: AuthFailure }
>("auth/refresh", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refresh();
    setAccessToken(response.access_token);
    return await authService.currentUserWithRole();
  } catch (error) {
    return rejectWithValue(toAuthFailure(error));
  }
});

export const requestPasswordReset = createAsyncThunk(
  "auth/forgotPassword",
  (email: string) => authService.forgotPassword(email),
);

export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  (payload: PasswordResetPayload) => authService.resetPassword(payload),
);

export const verifyEmail = createAsyncThunk(
  "auth/verifyEmail",
  ({ id, hash, signedQuery }: { id: string; hash: string; signedQuery: string }) =>
    authService.verifyEmail(id, hash, signedQuery),
);

export const resendVerificationEmail = createAsyncThunk(
  "auth/resendVerificationEmail",
  () => authService.resendVerification(),
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = "authenticated";
    },
    clearAuth(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.status = action.payload?.unauthorized
          ? "unauthenticated"
          : "error";
      })
      .addCase(loginUser.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(loginUser.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(registerUser.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(logoutUser.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      })
      .addCase(refreshSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = "authenticated";
      })
      .addCase(refreshSession.rejected, (state) => {
        state.user = null;
        state.status = "unauthenticated";
      });
  },
});

export const { setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
