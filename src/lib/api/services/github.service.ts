import { api } from '../client';
import type {
  ApiResponse,
  GitHubRepository,
  GitHubBranch,
} from '../types';

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
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URI || 'http://localhost:3001'}/api/v1${endpoint}`,
      { credentials: 'include' }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch repository content: ${response.statusText}`);
    }
    
    return response.text();
  },
};

