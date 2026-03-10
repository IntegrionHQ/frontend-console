import { api } from '../client';
import type {
  ApiResponse,
  GitHubRepository,
  GitHubBranch,
} from '../types';

const USE_PROXY = process.env.NEXT_PUBLIC_USE_API_PROXY !== 'false';
const API_BASE_URL = USE_PROXY ? '' : (process.env.NEXT_PUBLIC_BACKEND_URI || 'https://backend-lvlw.onrender.com');
const API_PREFIX = USE_PROXY ? '/api/proxy' : '/api/v1';

export const githubService = {
  getRepositories: async (): Promise<ApiResponse<GitHubRepository[][]>> => {
    return api.get<GitHubRepository[][]>('/github/repos');
  },

  getBranches: async (
    url: string
  ): Promise<ApiResponse<GitHubBranch[]>> => {
    return api.get<GitHubBranch[]>(`/github/repo/branches?url=${encodeURIComponent(url)}`);
  },

  getRepositoryContent: async (
    accessToken: string,
    username: string,
    repo: string
  ): Promise<string> => {
    const endpoint = `/github/repo-content?accessToken=${encodeURIComponent(accessToken)}&username=${encodeURIComponent(username)}&repo=${encodeURIComponent(repo)}`;
    const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
    const response = await fetch(url, { credentials: 'include' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repository content: ${response.statusText}`);
    }
    
    return response.text();
  },
};
