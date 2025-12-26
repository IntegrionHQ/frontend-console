'use client';

import { useState, useEffect, useCallback } from 'react';
import { projectService } from '@/lib/api';
import type { Project, CreateProjectDto, UpdateProjectDto } from '@/lib/api/types';
import { ApiError } from '@/lib/api';

export function useProjects(userId: string | null) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!userId) {
      setProjects([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await projectService.getByUserId();
      setProjects(response.data || []);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to fetch projects');
      }
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = async (dto: CreateProjectDto): Promise<Project | null> => {
    try {
      const response = await projectService.create(dto);
      if (response.data) {
        await fetchProjects();
        return response.data;
      }
      return null;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to create project');
      }
      return null;
    }
  };

  const updateProject = async (
    projectId: string,
    dto: UpdateProjectDto
  ): Promise<Project | null> => {
    try {
      const response = await projectService.update(projectId, dto);
      if (response.data) {
        await fetchProjects();
        return response.data;
      }
      return null;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to update project');
      }
      return null;
    }
  };

  const deleteProject = async (projectId: string): Promise<boolean> => {
    try {
      await projectService.delete(projectId);
      await fetchProjects();
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Failed to delete project');
      }
      return false;
    }
  };

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects,
  };
}

