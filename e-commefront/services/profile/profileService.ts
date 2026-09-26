import { api } from "@/config/config";
import type {
  ChangePasswordInput,
  UpdateProfileInput,
} from "@/schema/profile/ProfileSchema";
import type { Profile } from "@/types/shop";

export interface ProfileResponse {
  message?: string;
  user: Profile;
}

export interface MessageResponse {
  message: string;
}

export const profileService = {
  async get(): Promise<Profile> {
    const { data } = await api.get<{ user: Profile }>("/profile");
    return data.user;
  },

  async update(values: UpdateProfileInput): Promise<ProfileResponse> {
    const { data } = await api.put<ProfileResponse>("/profile", values);
    return data;
  },

  async changePassword(values: ChangePasswordInput): Promise<MessageResponse> {
    const { data } = await api.put<MessageResponse>("/profile/password", values);
    return data;
  },

  async deleteAccount(): Promise<MessageResponse> {
    const { data } = await api.delete<MessageResponse>("/profile");
    return data;
  },
};
