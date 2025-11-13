# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and this project adheres to Semantic Versioning where possible.

## [Unreleased]
- 

## [0.1.0] - 2025-09-22

### Added
- Global UserContext with localStorage persistence, including `id`, `accessToken`, and GitHub profile fields.
- GitHub OAuth sign-in flow: robust response parsing, error handling, and redirect to dashboard.
- Pre-warm GitHub repositories cache after sign-in for faster first open of Create Project modal.
- Dashboard and Projects pages list user-specific projects via `GET /users/:userId/projects` with empty states.
- Create Project modal with GitHub repo selection, branch selection, and POST `/projects` integration.
- In-memory + sessionStorage caching (5-minute TTL) for GitHub repositories.
- AbortController to cancel stale repo fetches; debounced Reload button.
- Skeleton loader and inline select loader for repo fetching.
- Custom Tailwind sidebar and breadcrumb; removed shadcn sidebar components.
- Signup form with Formik + Yup password validation and visibility toggle.

### Changed
- Replaced blue accent styles with black across dashboard, projects, and modal UIs.
- Dashboard shell refactor to a lightweight client component, improving hydration stability.
- Sign-in redirect robustness with fallback navigation.

### Fixed
- Hydration errors caused by nested `<html>`/`<body>` by removing them from `src/app/dashboard/layout.tsx` (only root `app/layout.tsx` defines HTML/Body).
- Improved error tolerance for backend auth responses and repo fetches.

### Notes
- NS_BINDING_ABORTED entries in network tab can be expected when fetches are intentionally aborted (e.g., due to effect reruns in development or Reload actions). The final request should complete and populate the repo list.

[0.1.0]: https://example.com/releases/0.1.0
