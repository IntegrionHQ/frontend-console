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

  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectUrl, setProjectUrl] = useState("")
  const [projectBranch, setProjectBranch] = useState("main")

  // Simple repo loading - no caching, no pre-warming
  const loadRepos = async () => {
    // Early validations with user-friendly errors
    if (!backend) {
      setError('Backend URL is not configured. Please set NEXT_PUBLIC_BACKEND_URI and reload the page.')
      setRepos([])
      return
    }
    if (!user?.accessToken || !user?.githubUsername) {
      setError('Missing GitHub credentials. Please sign in again to load your repositories.')
      setRepos([])
      return
    }
    
    setError(null)
    setLoading(true)
    
    // Abort any in-flight request
    if (abortRef.current) {
      abortRef.current.abort()
    }
    const controller = new AbortController()
    abortRef.current = controller
    
    try {
      const url = `${backend}/api/v1/getUserGitHubRepositories?provider=${user.provider}&authToken=${user.authCode}&access_token=${user.accessToken}&username=${user.githubUsername}`
      console.log('[Repos] Loading repositories...')
      console.log('[Repos] Making request to backend...')

      const res = await fetch(url, { signal: controller.signal })
      
      console.log('[Repos] Response received, status:', res.status)
      
      if (!res.ok) {
        const text = await res.text()
        console.log('[Repos] Error response body:', text)
        throw new Error(text || `Failed to load repos (${res.status})`)
      }
      
      const data = await res.json()
      const list = Array.isArray(data) ? data : []
      console.log('[Repos] Loaded successfully:', list.length, 'repositories')
      setRepos(list)
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        console.log('[Repos] Request cancelled')
        return
      }
      
      let msg = e?.message || 'Failed to load repositories'
      
      // Detect common CORS errors
      if (msg.includes('CORS') || msg.includes('Access-Control-Allow-Origin') || 
          msg.includes('cross-origin') || msg.includes('Not allowed by CORS')) {
        msg = 'CORS Error: The backend server is not allowing requests from this domain. Please check the backend CORS configuration to allow requests from your frontend URL.'
      } else if (msg.includes('NetworkError') || msg.includes('fetch')) {
        msg = 'Network Error: Cannot reach the backend server. Please check if the backend URL is correct and the server is running.'
      }
      
      console.error('[Repos] Error:', msg)
      setError(msg)
      setRepos([])
    } finally {
      console.log('[Repos] Request completed, setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepos()
    return () => {
      if (abortRef.current) abortRef.current.abort()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backend, user.provider, user.authCode, user.accessToken, user.githubUsername])

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
      const res = await fetch(`${backend}/api/v1/projects`, {
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
                      onClick={loadRepos}
                      disabled={loading}
                      className='text-xs text-gray-500 hover:text-black disabled:opacity-50 flex items-center gap-1'
                      aria-label='Reload repositories'
                    >
                      <RotateCcw className='h-3.5 w-3.5' /> Reload
                    </button>
                  </label>
                  {loading ? (
                    <div className='w-full flex items-center gap-2 p-2 border rounded text-sm text-gray-600'>
                      <Loader2 className='h-4 w-4 animate-spin' />
                      Loading repositories...
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
