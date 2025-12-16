'use client';

import { useState } from 'react';
import { authService } from '@/lib/api';
import type { LoginDto, RegisterDto, GitHubAuthDto } from '@/lib/api/types';
import { ApiError } from '@/lib/api';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async <T,>(
    requestFn: () => Promise<T>
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await requestFn();
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    register: (dto: RegisterDto) =>
      handleRequest(() => authService.register(dto)),
    login: (dto: LoginDto) =>
      handleRequest(() => authService.login(dto)),
    registerWithGitHub: (dto: GitHubAuthDto) =>
      handleRequest(() => authService.registerWithGitHub(dto)),
    loginWithGitHub: (dto: GitHubAuthDto) =>
      handleRequest(() => authService.loginWithGitHub(dto)),
    installGitHubApp: (dto: { installationId: string; authToken?: string }) =>
      handleRequest(() => authService.installGitHubApp(dto)),
  };
}

