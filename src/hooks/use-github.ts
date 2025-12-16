'use client';

import { useState } from 'react';
import { githubService } from '@/lib/api';
import type { GitHubRepository, GitHubBranch } from '@/lib/api/types';
import { ApiError } from '@/lib/api';

export function useGitHub() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRepositories = async (): Promise<GitHubRepository[][] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await githubService.getRepositories();
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch repositories');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getBranches = async (url: string): Promise<GitHubBranch[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await githubService.getBranches(url);
      return response.data;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch branches');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getRepositoryContent = async (
    accessToken: string,
    username: string,
    repo: string
  ): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      return await githubService.getRepositoryContent(accessToken, username, repo);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch repository content');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getRepositories,
    getBranches,
    getRepositoryContent,
  };
}

