# API Integration

Clean, minimal API client for Integrion Backend API.

## Structure

```
src/lib/api/
├── types.ts          # TypeScript interfaces
├── client.ts         # Base API client
├── services/         # Service layer
│   ├── auth.service.ts
│   ├── github.service.ts
│   └── project.service.ts
└── index.ts          # Public exports
```

## Usage

### Direct Service Usage

```typescript
import { authService, projectService, githubService } from '@/lib/api';

// Authentication
const response = await authService.login({ email, password });
const user = response.data;

// Projects
const projects = await projectService.getByUserId(userId);
const newProject = await projectService.create({
  projectName: 'My Project',
  projectDescription: 'Description',
  projectUrl: 'username/repo',
  projectBranch: 'main'
});

// GitHub
const repos = await githubService.getRepositories();
const branches = await githubService.getBranches('username/repo');
```

### React Hooks

```typescript
import { useAuth, useProjects, useGitHub } from '@/hooks';

// Authentication
const { login, register, loading, error } = useAuth();
await login({ email, password });

// Projects
const { projects, createProject, loading } = useProjects(userId);
await createProject({ projectName: '...', ... });

// GitHub
const { getRepositories, loading } = useGitHub();
const repos = await getRepositories();
```

## Error Handling

All services throw `ApiError` on failure:

```typescript
import { ApiError } from '@/lib/api';

try {
  await authService.login({ email, password });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.code, error.message, error.error);
  }
}
```

## Configuration

Set `NEXT_PUBLIC_BACKEND_URI` in your `.env.local`:

```
NEXT_PUBLIC_BACKEND_URI=http://localhost:3001
```

