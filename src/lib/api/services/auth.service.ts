import { api } from '../client';
import type {
  ApiResponse,
  User,
  GitHubAuthResponse,
  LoginDto,
  RegisterDto,
  GitHubAuthDto,
} from '../types';

export const authService = {
  register: async (dto: RegisterDto): Promise<ApiResponse<User>> => {
    return api.post<User>('/auth/register', dto);
  },

  login: async (dto: LoginDto): Promise<ApiResponse<User>> => {
    return api.post<User>('/auth/login', dto);
  },

  registerWithGitHub: async (
    dto: GitHubAuthDto
  ): Promise<ApiResponse<GitHubAuthResponse>> => {
    return api.post<GitHubAuthResponse>('/auth/github/register', dto);
  },

  loginWithGitHub: async (
    dto: GitHubAuthDto
  ): Promise<ApiResponse<{ user: User }>> => {
    return api.post<{ user: User }>('/auth/github/login', dto);
  },

  installGitHubApp: async (
    dto: { installationId: string; authToken?: string }
  ): Promise<ApiResponse<{ id: string; user: string; installationId: string; createdAt: number }>> => {
    return api.post('/auth/github/install', dto);
  },
};

