# Integrion Frontend - Onboarding Flow

## Overview
This document describes the seamless onboarding flow implementation based on the backend API documentation.

## Authentication Flow

### 1. Sign Up Flow

#### Email/Password Registration
1. User visits `/auth/signup`
2. User enters email and password
3. Frontend validates:
   - Email format
   - Password requirements (min 8 chars, uppercase, lowercase, number, special char)
4. Frontend calls `POST /api/v1/auth/register`
5. Backend sets HTTP-only `authToken` cookie
6. User context is updated with user data
7. User is redirected to `/dashboard`

#### GitHub OAuth Registration
1. User clicks "GitHub" button on signup page
2. User is redirected to GitHub OAuth
3. GitHub redirects back with `code` parameter
4. Frontend calls `POST /api/v1/auth/github/register` with authToken
5. Backend sets HTTP-only `authToken` cookie
6. User context is updated with GitHub user data
7. User is redirected to `/dashboard`

### 2. Sign In Flow

#### Email/Password Login
1. User visits `/auth/signin`
2. User enters credentials
3. Frontend validates input
4. Frontend calls `POST /api/v1/auth/login`
5. Backend sets HTTP-only `authToken` cookie
6. User context is updated
7. User is redirected to `/dashboard`

#### GitHub OAuth Login
1. User clicks "GitHub" button on signin page
2. User is redirected to GitHub OAuth
3. GitHub redirects back with `code` parameter
4. Frontend calls `POST /api/v1/auth/github/login` with authToken
5. Backend sets HTTP-only `authToken` cookie
6. User context is updated
7. User is redirected to `/dashboard`

## Project Management Flow

### 1. View Projects
1. User lands on `/dashboard`
2. Frontend fetches projects: `GET /api/v1/users/:userId/projects`
3. Projects are displayed in a modern card grid
4. Empty state shown if no projects exist

### 2. Create Project
1. User clicks "Create Project" button
2. Modal opens with repository selection
3. Frontend fetches GitHub repos: `GET /api/v1/github/repos`
4. User selects repository, enters name/description, selects branch
5. Frontend calls `POST /api/v1/projects` with:
   - `projectName`
   - `projectDescription`
   - `projectUrl` (cleaned repo identifier)
   - `projectBranch`
6. Backend creates project (user ID from cookie)
7. Modal closes, projects list refreshes
8. New project appears in the list

## Key Implementation Details

### API Client Configuration
- Base URL: `process.env.NEXT_PUBLIC_BACKEND_URI`
- API Prefix: `/api/v1`
- **Credentials**: `'include'` (for HTTP-only cookies)
- Content-Type: `application/json`

### Error Handling
All API responses follow this format:
```typescript
{
  code: number,
  message: string,
  data: T | null,
  error: {
    name: string,
    details?: string | object
  } | null
}
```

Errors are caught and displayed with user-friendly messages:
- Validation errors from form validation
- API errors from backend responses
- Network errors with generic fallback messages

### User Context
- Stored in React Context API
- Persisted to localStorage
- Includes: id, email, username, githubUsername, provider, etc.
- Automatically synced across tabs
- Cleared on sign out

### Authentication State
- HTTP-only cookies (authToken) managed by backend
- Frontend doesn't store or manipulate auth tokens
- Cookies automatically included in all API requests via `credentials: 'include'`

## Security Considerations

1. **HTTP-Only Cookies**: Auth tokens stored in HTTP-only cookies, not accessible to JavaScript
2. **CORS Configuration**: Backend must allow credentials from frontend origin
3. **Validation**: Client-side validation for user experience, server-side for security
4. **Password Requirements**: Strong password policy enforced
5. **OAuth Flow**: Secure redirect-based flow for GitHub integration

## Navigation Flow

```
Sign Up/Sign In → Dashboard → Projects
                      ↓
                Create Project
                      ↓
                Repository Selection
                      ↓
                Project Created
```

## User Experience Enhancements

1. **Loading States**: Spinners shown during API calls
2. **Error Messages**: Clear, actionable error messages
3. **Empty States**: Helpful prompts when no data exists
4. **Form Validation**: Real-time validation with helpful hints
5. **Success Feedback**: Smooth transitions after successful actions
6. **Modern UI**: Consistent design with Tailwind CSS

## Environment Variables Required

```env
NEXT_PUBLIC_BACKEND_URI=http://localhost:3001
NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
NEXT_PUBLIC_SIGNIN_REDIRECT_URI_GITHUB=http://localhost:3000/auth/signin?provider=github&
NEXT_PUBLIC_GITLAB_CLIENT_ID=your_gitlab_client_id
NEXT_PUBLIC_REDIRECT_URI_GITLAB=http://localhost:3000/auth/signin?provider=gitlab&
```

## Testing the Flow

### Email/Password Flow
1. Open `/auth/signup`
2. Enter valid email and strong password
3. Submit form
4. Verify redirect to `/dashboard`
5. Verify user info in localStorage
6. Sign out
7. Sign in with same credentials
8. Verify successful login

### GitHub OAuth Flow
1. Open `/auth/signup`
2. Click "GitHub" button
3. Complete GitHub OAuth
4. Verify redirect to `/dashboard`
5. Verify GitHub username in context

### Project Creation
1. Ensure signed in
2. Click "Create Project" on dashboard
3. Wait for repos to load
4. Select repository
5. Enter project details
6. Submit
7. Verify project appears in list

## Troubleshooting

### "Cannot POST /projects" Error
- **Cause**: Frontend hitting `/projects` instead of `/api/v1/projects`
- **Fix**: Already implemented - all endpoints use `/api/v1` prefix

### CORS Errors
- **Cause**: Backend not configured to accept credentials from frontend origin
- **Fix**: Backend must set `Access-Control-Allow-Origin` and `Access-Control-Allow-Credentials: true`

### User Context Not Persisting
- **Cause**: localStorage not being set or cleared
- **Fix**: Check browser console for errors, ensure localStorage is enabled

### OAuth Redirect Issues
- **Cause**: Incorrect redirect URI configuration
- **Fix**: Ensure GitHub App redirect URI matches `NEXT_PUBLIC_SIGNIN_REDIRECT_URI_GITHUB`

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/register` - Email/password registration
- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/github/register` - GitHub OAuth registration
- `POST /api/v1/auth/github/login` - GitHub OAuth login
- `POST /api/v1/auth/github/install` - Save GitHub App installation

### Projects
- `GET /api/v1/users/:userId/projects` - Get user's projects
- `POST /api/v1/projects` - Create new project
- `GET /api/v1/projects/:projectId` - Get project by ID
- `PUT /api/v1/projects/:projectId` - Update project
- `DELETE /api/v1/projects/:projectId` - Delete project

### GitHub Integration
- `GET /api/v1/github/repos` - Get user's GitHub repositories
- `GET /api/v1/github/repo/branches?url=repo` - Get repository branches
- `GET /api/v1/github/repo-content?accessToken=x&username=x&repo=x` - Get repo content

## Email Verification Flow (OTP)

### Implementation
The OTP verification flow has been implemented for email/password registrations:

1. **After Registration**: Users who sign up with email/password are redirected to `/auth/signup/otp`
2. **OTP Input**: Modern 6-digit OTP input with auto-focus and keyboard navigation
3. **Verification**: Users enter the code sent to their email
4. **Resend**: Users can request a new code if needed
5. **Success**: After verification, users are redirected to dashboard

### Technical Details
- Route: `/auth/signup/otp`
- Layout: Matches sign-in/sign-up pages with hero panel
- Features:
  - Auto-focus next input on digit entry
  - Backspace navigation
  - Resend functionality
  - Loading states
  - Error handling
- **Note**: Backend OTP endpoints need to be implemented:
  - `POST /api/v1/auth/verify-otp` - Verify OTP code
  - `POST /api/v1/auth/resend-otp` - Resend OTP code

### User Flow
```
Sign Up (Email) → OTP Page → Enter Code → Verify → Dashboard
                      ↓
                  Resend if needed
```

## GitHub App Installation Flow

### Implementation
The GitHub App installation flow has been added to handle repository access:

1. **Detection**: When fetching repos fails due to missing installation
2. **Modal Display**: Beautiful installation modal explains what's needed
3. **Installation Link**: Users click to install GitHub App
4. **Post-Install**: Users return and installation ID is saved
5. **Repo Access**: Users can now fetch repositories

### Technical Details
- Modal Component: Integrated in dashboard page
- API Hook: `installGitHubApp({ installationId })` from `useAuth()`
- Trigger: Automatically shown when repo fetch returns 400 with installation error
- Features:
  - Clear explanation of permissions needed
  - Visual checklist of app capabilities
  - External link to GitHub App installation
  - Cancel option

### User Flow
```
Create Project → Load Repos → No Installation Detected
                                    ↓
                          Show Installation Modal
                                    ↓
                          User Installs GitHub App
                                    ↓
                          Installation ID Saved
                                    ↓
                          Repos Load Successfully
```

### Installation Modal Features
- GitHub icon and branding
- Permission checklist:
  - Read access to repositories
  - Monitor pull requests and branches
  - Secure, revokable access
- Direct link to GitHub App installation page
- Clear call-to-action buttons

### Backend Integration
Uses existing endpoint:
- `POST /api/v1/auth/github/install`
- Requires: `installationId` (string)
- Optional: `authToken` (string)
- Returns: Installation record with ID, user ID, and timestamp

## Remaining Next Steps

1. **Backend OTP Endpoints**: Implement OTP verification and resend endpoints
2. **Error Recovery**: Add retry mechanisms for failed requests
3. **Offline Support**: Add service worker for offline capabilities
4. **Analytics**: Track user journey through onboarding flow
5. **GitHub App Setup**: Configure actual GitHub App and update installation URL
