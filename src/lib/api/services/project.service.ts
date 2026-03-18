import { api } from '../client';
import type {
  ApiResponse,
  Project,
  CreateProjectDto,
  UpdateProjectDto,
} from '../types';

export const projectService = {
  create: async (dto: CreateProjectDto): Promise<ApiResponse<Project>> => {
    return api.post<Project>('/projects', dto);
  },

  getById: async (projectId: string): Promise<ApiResponse<Project>> => {
    return api.get<Project>(`/projects/${projectId}`);
  },

  update: async (
    projectId: string,
    dto: UpdateProjectDto
  ): Promise<ApiResponse<Project>> => {
    return api.put<Project>(`/projects/${projectId}`, dto);
  },

  delete: async (projectId: string): Promise<ApiResponse<Project>> => {
    return api.delete<Project>(`/projects/${projectId}`);
  },

  getByUserId: async (): Promise<ApiResponse<Project[]>> => {
    return api.get<Project[]>(`/projects`);
  },
  
  initiateTest: async (data: { accessToken: string; repo: string; branch: string }): Promise<ApiResponse<any>> => {
    return api.post<any>('/tests', data);
  },
};

