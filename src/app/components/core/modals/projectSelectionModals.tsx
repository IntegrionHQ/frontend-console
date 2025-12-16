"use client"
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useUser } from '@/app/store/global/context/userContext'
import { Loader2, RotateCcw } from 'lucide-react'
import { useGitHub } from '@/hooks'
import { projectService } from '@/lib/api'
import { ApiError } from '@/lib/api'

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

const ProjectSelectionModals: React.FC<ProjectSelectionModalProps> = ({ onClose, onCreated }) => {
  const { user } = useUser()
  const { getRepositories, loading: githubLoading, error: githubError } = useGitHub()
  const [repos, setRepos] = useState<Repo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>("")

  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectUrl, setProjectUrl] = useState("")
  const [projectBranch, setProjectBranch] = useState("main")

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
        // Flatten the array of arrays into a single array
        const flatRepos = reposData.flat()
        setRepos(flatRepos)
      } else {
        setRepos([])
      }
    } catch (e: unknown) {
      const msg = e instanceof ApiError ? e.message : (e instanceof Error ? e.message : 'Failed to load repositories')
      setError(msg)
      setRepos([])
    }
  }, [user?.id, getRepositories])

  useEffect(() => {
    loadRepos()
  }, [loadRepos])

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
    if (!user?.id) return
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    
    try {
      // Extract repo name from URL if needed
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
          {(error || githubError) ? (
            <div className='text-sm text-red-600 mb-4'>{error || githubError}</div>
          ) : null}
          {!error && !githubError && (
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='text-sm mb-1 flex items-center gap-2'>
                    Repository
                    <button
                      type='button'
                      onClick={loadRepos}
                      disabled={githubLoading}
                      className='text-xs text-gray-500 hover:text-black disabled:opacity-50 flex items-center gap-1'
                      aria-label='Reload repositories'
                    >
                      <RotateCcw className='h-3.5 w-3.5' /> Reload
                    </button>
                  </label>
                  {githubLoading ? (
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
                <button type='submit' disabled={!canSubmit || submitting || githubLoading || !selectedRepo} className='px-4 py-2 text-sm rounded bg-black text-white disabled:opacity-50 hover:bg-neutral-800'>
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
