"use client"
import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useUser } from '@/app/store/global/context/userContext'
import { Loader2, RotateCcw, X } from 'lucide-react'
import { useGitHub } from '@/hooks'
import { projectService } from '@/lib/api'
import { ApiError } from '@/lib/api'
import { useRouter } from 'next/navigation'

interface ProjectSelectionModalProps {
  onClose: () => void
  onCreated?: () => void
  onGitHubInstallRequired?: () => void
}

type Repo = {
  name: string
  html_url?: string
  default_branch?: string
  full_name?: string
}

const ProjectSelectionModals: React.FC<ProjectSelectionModalProps> = ({ onClose, onCreated, onGitHubInstallRequired }) => {
  const { user } = useUser()
  const { getRepositories, loading: githubLoading, error: githubError } = useGitHub()
  const [repos, setRepos] = useState<Repo[] | null>(null)
  const PAGE_SIZE = 5
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>('')
  const [isRepoOpen, setIsRepoOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const repoButtonRef = useRef<HTMLButtonElement | null>(null)
  const repoMenuRef = useRef<HTMLDivElement | null>(null)
  const [repoMenuPos, setRepoMenuPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const [projectName, setProjectName] = useState('')
  const [projectDescription, setProjectDescription] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [projectBranch, setProjectBranch] = useState('main')
  const router = useRouter()

  useEffect(() => {
    if (user?.id && !user.hasInstallations) {
      router.replace('/installations')
    }
  }, [user?.id, user?.hasInstallations, router])

  const loadRepos = useCallback(async () => {
    if (!user?.id) {
      setError('Please sign in to load your repositories.')
      setRepos([])
      return
    }

    setError(null)

    try {
      const reposData = await getRepositories()

      if (reposData) {
        const flatRepos = reposData.flat()
        setRepos(flatRepos)
        setVisibleCount(PAGE_SIZE)
      } else {
        setRepos([])
      }
    } catch (e: unknown) {
      const msg = e instanceof ApiError ? e.message : (e instanceof Error ? e.message : 'Failed to load repositories')

      if (msg.includes('no GitHub installation') || msg.includes('GitHub installation') || e instanceof ApiError && e.code === 400) {
        setError('GitHub App not installed. Please install the app to access your repositories.')
        if (onGitHubInstallRequired) {
          onGitHubInstallRequired()
        }
      } else {
        setError(msg)
      }
      setRepos([])
    }
  }, [user?.id, getRepositories, onGitHubInstallRequired])

  useEffect(() => {
    // Fetch once on open; no polling to reduce network traffic.
    loadRepos()
  }, [loadRepos])

  const onSelectRepo = (repoName: string) => {
    const repo = repos?.find(r => r.name === repoName)
    if (!repo) return
    setSelectedRepo(repoName)
    setProjectName(repo.name)
    const url = repo.html_url || (repo.full_name ? `https://github.com/${repo.full_name}` : '')
    setProjectUrl(url)
    setProjectBranch(repo.default_branch || 'main')
    setIsRepoOpen(false)
  }

  useEffect(() => {
    if (!isRepoOpen) return
    const rect = repoButtonRef.current?.getBoundingClientRect()
    if (rect) {
      setRepoMenuPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
    }
  }, [isRepoOpen])

  useEffect(() => {
    if (!isRepoOpen) return
    const onClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const buttonContains = repoButtonRef.current?.contains(target) ?? false
      const menuContains = repoMenuRef.current?.contains(target) ?? false
      if (!buttonContains && !menuContains) {
        setIsRepoOpen(false)
      }
    }
    window.addEventListener('mousedown', onClickOutside)
    return () => window.removeEventListener('mousedown', onClickOutside)
  }, [isRepoOpen])

  const canSubmit = useMemo(() => {
    return !!(projectName && projectUrl && projectBranch && user?.id)
  }, [projectName, projectUrl, projectBranch, user?.id])

  const visibleRepos = useMemo(() => {
    if (!repos) return []
    return repos.slice(0, visibleCount)
  }, [repos, visibleCount])

  const onRepoListScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    if (!repos) return
    const target = e.currentTarget
    const nearBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 16
    if (nearBottom && visibleCount < repos.length) {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, repos.length))
    }
  }, [repos, visibleCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id) return
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)

    try {
      const repoUrl = projectUrl.includes('github.com')
        ? projectUrl.split('github.com/')[1]?.replace('.git', '') || projectUrl
        : projectUrl

      await projectService.create({
        projectName,
        projectDescription,
        projectUrl: repoUrl,
        projectBranch,
      })

      onClose()
      onCreated?.()
    } catch (e: unknown) {
      const msg = e instanceof ApiError ? e.message : (e instanceof Error ? e.message : 'Failed to create project')
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between py-5 px-6 border-b border-gray-200">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-black">Start New Project</h2>
            <p className="text-xs text-gray-500 font-aeonik-light">Select your GitHub repo, name it, and choose a branch</p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-black" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-auto">
          {(error || githubError) ? (
            <div className="text-sm text-red-600 mb-4">{error || githubError}</div>
          ) : null}

          {!error && !githubError && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm mb-1 flex items-center gap-2 text-black">
                    Repository
                    <button
                      type="button"
                      onClick={loadRepos}
                      disabled={githubLoading}
                      className="text-xs text-gray-500 hover:text-black disabled:opacity-50 flex items-center gap-1"
                      aria-label="Reload repositories"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Reload
                    </button>
                  </label>
                  {githubLoading ? (
                    <div className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fetching repositories...
                      </div>
                      <div className="mt-2 h-1.5 w-full bg-gray-100 rounded">
                        <div className="h-1.5 w-1/3 bg-gray-300 rounded animate-pulse" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <button
                        type="button"
                        className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm text-left disabled:bg-gray-50"
                        onClick={() => setIsRepoOpen((prev) => !prev)}
                        disabled={!repos || repos.length === 0}
                        aria-haspopup="listbox"
                        aria-expanded={isRepoOpen}
                        ref={repoButtonRef}
                      >
                        {selectedRepo || 'Select from your GitHub repositories'}
                      </button>
                      {isRepoOpen && repoMenuPos && typeof document !== 'undefined' && createPortal(
                        <div
                          className="fixed z-[100] max-h-56 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg"
                          style={{ top: repoMenuPos.top, left: repoMenuPos.left, width: repoMenuPos.width }}
                          role="listbox"
                          onScroll={onRepoListScroll}
                          ref={repoMenuRef}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          {visibleRepos.map((r) => (
                            <button
                              key={r.name}
                              type="button"
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${selectedRepo === r.name ? 'bg-gray-100' : ''}`}
                              onClick={() => onSelectRepo(r.name)}
                              role="option"
                              aria-selected={selectedRepo === r.name}
                            >
                              {r.name}
                            </button>
                          ))}
                          {repos && visibleCount < repos.length && (
                            <div className="px-3 py-2 text-xs text-gray-500">Loading more...</div>
                          )}
                        </div>,
                        document.body
                      )}
                      {repos && repos.length === 0 && (
                        <div className="mt-2 text-xs text-gray-500">No repositories found</div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm mb-1 text-black">Project Name</label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm disabled:bg-gray-50"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={!selectedRepo}
                    placeholder="My Project"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm mb-1 text-black">Description</label>
                  <textarea
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm disabled:bg-gray-50"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    disabled={!selectedRepo}
                    placeholder="What is this project about?"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-black">Repository URL</label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm bg-gray-50"
                    value={projectUrl}
                    readOnly
                    placeholder="https://github.com/owner/repo"
                    aria-readonly="true"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-black">Branch</label>
                  <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 text-sm disabled:bg-gray-50"
                    value={projectBranch}
                    onChange={(e) => setProjectBranch(e.target.value)}
                    disabled={!selectedRepo}
                    placeholder="main"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <div />
                <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm rounded-md border border-gray-200 text-black hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={!canSubmit || submitting || githubLoading || !selectedRepo} className="px-4 py-2.5 text-sm rounded-md bg-black text-white disabled:opacity-50 hover:bg-neutral-800">
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProjectSelectionModals
