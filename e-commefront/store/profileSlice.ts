import { createAsyncThunk, createSlice, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

import {
  changePasswordSchema,
  updateProfileSchema,
  type ChangePasswordInput,
  type UpdateProfileInput,
} from "@/schema/profile/ProfileSchema";
import { profileService } from "@/services/profile/profileService";
import { clearAccessToken } from "@/config/config";
import { clearAuth } from "@/store/authSlice";
import type { Profile } from "@/types/shop";
import { getApiErrorMessage } from "@/lib/api-error";

const readError = (error: unknown) =>
  getApiErrorMessage(error, "Une erreur est survenue avec le profil.");

export const fetchProfile = createAsyncThunk<Profile, void, { rejectValue: string }>(
  "profile/fetch",
  async (_, { rejectWithValue }) => {
    try {
      return await profileService.get();
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

export const updateProfile = createAsyncThunk<
  Profile,
  UpdateProfileInput,
  { rejectValue: string }
>("profile/update", async (values, { rejectWithValue }) => {
  try {
    return (await profileService.update(updateProfileSchema.parse(values))).user;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const changePassword = createAsyncThunk<
  string,
  ChangePasswordInput,
  { rejectValue: string }
>("profile/changePassword", async (values, { rejectWithValue }) => {
  try {
    return (
      await profileService.changePassword(changePasswordSchema.parse(values))
    ).message;
  } catch (error) {
    return rejectWithValue(readError(error));
  }
});

export const deleteAccount = createAsyncThunk<void, void, { rejectValue: string }>(
  "profile/deleteAccount",
  async (_, { rejectWithValue, dispatch }) => {
    try {
      await profileService.deleteAccount();
      clearAccessToken();
      dispatch(clearAuth());
    } catch (error) {
      return rejectWithValue(readError(error));
    }
  },
);

interface ProfileState {
  profile: Profile | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  message: string | null;
  error: string | null;
}

const initialState: ProfileState = {
  profile: null,
  status: "idle",
  message: null,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfileError(state) {
      state.error = null;
    },
    setProfile(state, action: PayloadAction<Profile>) {
      state.profile = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.message = action.payload;
      })
      .addCase(deleteAccount.fulfilled, (state) => {
        state.profile = null;
      })
      .addMatcher(
        isAnyOf(fetchProfile.pending, updateProfile.pending, changePassword.pending, deleteAccount.pending),
        (state) => {
          state.status = "loading";
          state.error = null;
          state.message = null;
        },
      )
      .addMatcher(
        isAnyOf(fetchProfile.fulfilled, updateProfile.fulfilled, changePassword.fulfilled, deleteAccount.fulfilled),
        (state) => {
          state.status = "succeeded";
        },
      )
      .addMatcher(
        isAnyOf(fetchProfile.rejected, updateProfile.rejected, changePassword.rejected, deleteAccount.rejected),
        (state, action) => {
          state.status = "failed";
          state.error = action.payload ?? action.error.message ?? null;
        },
      );
  },
});

export const { clearProfileError, setProfile } = profileSlice.actions;
export default profileSlice.reducer;
