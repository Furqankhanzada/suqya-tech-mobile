import { api } from "./axios";
import type {
  Collection,
  User,
} from "./types";

export interface LoginResponse {
  message: string;
  user: User;
  token: string;
  exp: number;
}

export interface LogoutResponse {
  message: string;
}

export interface RefreshResponse {
  message: string;
  refreshedToken: string;
  exp: number;
  user: {
    email: string;
    id: string;
    collection: string;
  };
}

export interface MeResponse {
  user: User;
  collection: string;
  token: string;
  exp: number;
}

export const login = async (
  collection: Collection,
  username: string,
  password: string
): Promise<LoginResponse> => {
  return (
    await api.post<LoginResponse>(`/${collection}/login`, {
      username,
      password,
    })
  ).data;
};

export const logout = async (
  collection: Collection
): Promise<LogoutResponse> => {
  return (await api.post(`/${collection}/logout`)).data;
};

export const refreshToken = async (
  collection: Collection
): Promise<RefreshResponse> => {
  return (await api.post<RefreshResponse>(`/${collection}/refresh-token`)).data;
};

export const fetchUser = async (
  collection: Collection
): Promise<MeResponse> => {
  return (await api.get<MeResponse>(`/${collection}/me`)).data;
};
