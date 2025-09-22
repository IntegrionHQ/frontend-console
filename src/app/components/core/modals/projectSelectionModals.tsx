"use client"
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useUser } from '@/app/store/global/context/userContext'
import { Loader2, RotateCcw } from 'lucide-react'

interface ProjectSelectionModalProps {
  onClose: () => void
  onCreated?: () => void
}

type Repo = {
  name: string
  html_url?: string
  default_branch?: string
  full_name?: string
}

// Simple in-memory cache for the session
const reposCache = new Map<string, Repo[]>()

const ProjectSelectionModals: React.FC<ProjectSelectionModalProps> = ({ onClose, onCreated }) => {
  const { user } = useUser()
  const backend = process.env.NEXT_PUBLIC_BACKEND_URI
  const [repos, setRepos] = useState<Repo[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const abortRef = useRef<AbortController | null>(null)
  const reloadTimerRef = useRef<number | null>(null)

  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectUrl, setProjectUrl] = useState("")
  const [projectBranch, setProjectBranch] = useState("main")

  // Load GitHub repositories on open
  const cacheKey = useMemo(() => `${user.githubUsername || ''}:${user.accessToken || ''}`, [user.githubUsername, user.accessToken])

  const loadRepos = async (forceReload = false) => {
    if (!backend) return
    setError(null)
    // sessionStorage cache (persists across page reloads in session)
    const storageKey = `gh:repos:${cacheKey}`
    const TTL = 5 * 60 * 1000 // 5 minutes
    if (!forceReload) {
      try {
        const cachedStr = sessionStorage.getItem(storageKey)
        if (cachedStr) {
          const parsed = JSON.parse(cachedStr) as { ts: number; repos: Repo[] }
          if (parsed && parsed.ts && Date.now() - parsed.ts < TTL) {
            setRepos(parsed.repos || [])
            reposCache.set(cacheKey, parsed.repos || [])
            return
          }
        }
      } catch {}
    }
    setLoading(true)
    // Use in-memory cached data unless forceReload
    if (!forceReload && reposCache.has(cacheKey)) {
      setRepos(reposCache.get(cacheKey) || [])
      setLoading(false)
      return
    }
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller
    try {
      const url = `${backend}/api/v1/getUserGitHubRepositories?provider=${user.provider}&authToken=${user.authCode}&access_token=${user.accessToken}&username=${user.githubUsername}`
      const res = await fetch(url, { signal: controller.signal })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to load repos (${res.status})`)
      }
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      setRepos(list)
      reposCache.set(cacheKey, list)
      try {
        sessionStorage.setItem(storageKey, JSON.stringify({ ts: Date.now(), repos: list }))
      } catch {}
    } catch (e: any) {
      if (e?.name === 'AbortError') return
      setError(e?.message || 'Failed to load repositories')
      setRepos([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepos()
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend, cacheKey, user.provider, user.authCode, user.accessToken, user.githubUsername])

  // When a repo is selected, prefill name/url/branch
  const onSelectRepo = (repoName: string) => {
    const repo = repos?.find(r => r.name === repoName)
    if (!repo) return
    setSelectedRepo(repoName)
    setProjectName(repo.name)
    const url = repo.html_url || (repo.full_name ? `https://github.com/${repo.full_name}` : "")
    setProjectUrl(url)
    setProjectBranch(repo.default_branch || 'main')
  }

  const canSubmit = useMemo(() => {
    return !!(projectName && projectUrl && projectBranch && user?.id)
  }, [projectName, projectUrl, projectBranch, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!backend || !user?.id) return
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`${backend}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          projectDescription,
          projectUrl,
          projectBranch,
          user: user.id,
        })
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || `Failed to create project (${res.status})`)
      }
  onClose()
  onCreated?.()
    } catch (e: any) {
      setError(e?.message || 'Failed to create project')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-md shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col'>
        <div className='flex items-center justify-between py-3 px-4 border-b'>
          <div className='flex flex-col'>
            <h2 className='font-medium text-[18px]'>Start New Project</h2>
            <p className='text-xs text-gray-500'>Select your GitHub repo, name it, and choose a branch</p>
          </div>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-800 text-lg' aria-label='Close'>×</button>
        </div>
        <div className='p-4 overflow-auto'>
          {error ? (
            <div className='text-sm text-red-600'>{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm mb-1 flex items-center gap-2'>
                    Repository
                    <button
                      type='button'
                      onClick={() => {
                        if (reloadTimerRef.current) window.clearTimeout(reloadTimerRef.current)
                        reloadTimerRef.current = window.setTimeout(() => loadRepos(true), 200)
                      }}
                      disabled={loading}
                      className='text-xs text-gray-500 hover:text-black disabled:opacity-50 flex items-center gap-1'
                      aria-label='Reload repositories'
                    >
                      <RotateCcw className='h-3.5 w-3.5' /> Reload
                    </button>
                  </label>
                  {loading ? (
                    <div className='w-full'>
                      <div className='h-9 rounded bg-gray-200 animate-pulse' />
                      <div className='mt-2 h-3 w-40 rounded bg-gray-200 animate-pulse' />
                    </div>
                  ) : (
                    <div className='relative'>
                      <select
                        className={'w-full border rounded px-2 py-2 pr-8 text-sm disabled:bg-gray-50'}
                        onChange={(e) => onSelectRepo(e.target.value)}
                        value={selectedRepo || ''}
                        disabled={!repos}
                      >
                        {repos && repos.length === 0 ? (
                          <option value='' disabled>No repositories found</option>
                        ) : (
                          <>
                            <option value='' disabled>Select from your GitHub repositories</option>
                            {(repos || []).map((r) => (
                              <option key={r.name} value={r.name}>{r.name}</option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>
                  )}
                </div>
                <div>
                  <label className='block text-sm mb-1'>Project Name</label>
                  <input
                    className='w-full border rounded px-2 py-2 text-sm disabled:bg-gray-50'
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={!selectedRepo}
                    placeholder='My Project'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='block text-sm mb-1'>Description</label>
                  <textarea
                    className='w-full border rounded px-2 py-2 text-sm disabled:bg-gray-50'
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    disabled={!selectedRepo}
                    placeholder='What is this project about?'
                  />
                </div>
                <div>
                  <label className='block text-sm mb-1'>Repository URL</label>
                  <input
                    className='w-full border rounded px-2 py-2 text-sm bg-gray-50'
                    value={projectUrl}
                    readOnly
                    placeholder='https://github.com/owner/repo'
                    aria-readonly="true"
                  />
                </div>
                <div>
                  <label className='block text-sm mb-1'>Branch</label>
                  <input
                    className='w-full border rounded px-2 py-2 text-sm disabled:bg-gray-50'
                    value={projectBranch}
                    onChange={(e) => setProjectBranch(e.target.value)}
                    disabled={!selectedRepo}
                    placeholder='main'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-2 pt-2'>
                <button type='button' onClick={onClose} className='px-4 py-2 text-sm rounded border'>Cancel</button>
                <button type='submit' disabled={!canSubmit || submitting || loading || !selectedRepo} className='px-4 py-2 text-sm rounded bg-black text-white disabled:opacity-50 hover:bg-neutral-800'>
                  {submitting ? 'Creating…' : 'Create Project'}
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
