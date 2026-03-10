'use client';

import { useState } from 'react';
import { githubService } from '@/lib/api';
import type { GitHubRepository, GitHubBranch } from '@/lib/api/types';
import { ApiError } from '@/lib/api';

export function useGitHub() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRepositories = async (): Promise<GitHubRepository[][] | null> => {
    setError(null);
    const now = Date.now();

    if (reposCache && now - reposCacheAt < REPO_CACHE_TTL_MS) {
      return reposCache;
    }

    setLoading(true);
    try {
      if (reposInFlight) {
        return await reposInFlight;
      }

      reposInFlight = (async () => {
        try {
          const response = await githubService.getRepositories();
          reposCache = response.data || [];
          reposCacheAt = Date.now();
          return reposCache;
        } finally {
          reposInFlight = null;
        }
      })();

      return await reposInFlight;
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

// Cache to avoid repeated repo fetches in dev/strict mode or rapid UI opens.
const REPO_CACHE_TTL_MS = 60_000;
let reposCache: GitHubRepository[][] | null = null;
let reposCacheAt = 0;
let reposInFlight: Promise<GitHubRepository[][] | null> | null = null;
