// API Response Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T | null;
  error: {
    name: string;
    details?: string | object;
  } | null;
}

// User Types
export interface User {
  id: string;
  email: string | null;
  githubUsername: string | null;
  githubEmail: string | null;
  bitbucketUsername: string | null;
  bitbucketEmail: string | null;
  gitlabUsername: string | null;
  gitlabEmail: string | null;
  isVerified: string;
  createdAt: number;
  updatedAt: number | null;
}

export interface GitHubAuthResponse {
  user: User;
  isEmailSet?: boolean;
}

// Project Types
export interface Project {
  id: string;
  projectName: string;
  projectDescription: string;
  projectUrl: string;
  projectBranch: string;
  user: string;
  createdAt: number;
  updatedAt: number | null;
}

export interface CreateProjectDto {
  projectName: string;
  projectDescription: string;
  projectUrl: string;
  projectBranch: string;
}

export interface UpdateProjectDto {
  projectName: string;
  projectDescription: string;
  projectUrl: string;
  projectBranch: string;
}

// GitHub Types
export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  [key: string]: unknown;
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

export interface GitHubInstallation {
  id: string;
  user: string;
  installationId: string;
  createdAt: number;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
}

export interface GitHubAuthDto {
  authToken: string;
}

export interface GitHubInstallDto {
  installationId: string;
  authToken?: string;
}

