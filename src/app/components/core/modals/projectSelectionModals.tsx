"use client"
import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRepo, setSelectedRepo] = useState<string>("")
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectUrl, setProjectUrl] = useState("")
  const [projectBranch, setProjectBranch] = useState("main")
  const router = useRouter()

  useEffect(() => {
    if (!user.hasInstallations) {
      router.replace("/installations")
    }
  }, [])

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
      } else {
        setRepos([])
      }
    } catch (e: unknown) {
      const msg = e instanceof ApiError ? e.message : (e instanceof Error ? e.message : 'Failed to load repositories')
      if (msg.includes('no GitHub installation') || msg.includes('GitHub installation') || e instanceof ApiError && e.code === 400) {
        setError('GitHub App not installed. Please install the app to access your repositories.')
        if (onGitHubInstallRequired) onGitHubInstallRequired()
      } else {
        setError(msg)
      }
      setRepos([])
    }
  }, [user?.id, getRepositories, onGitHubInstallRequired])

  useEffect(() => {
    loadRepos()
  }, [])

  const onSelectRepo = (repoName: string) => {
    const repo = repos?.find(r => r.name === repoName)
    if (!repo) return
    setSelectedRepo(repoName)
    setProjectName(repo.name)
    const url = repo.html_url || (repo.full_name ? `https://github.com/${repo.full_name}` : "")
    setProjectUrl(url)
    setProjectBranch(repo.default_branch || 'main')
  }

  const canSubmit = useMemo(() => !!(projectName && projectUrl && projectBranch && user?.id), [projectName, projectUrl, projectBranch, user?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !canSubmit) return
    setSubmitting(true)
    setError(null)
    try {
      const repoUrl = projectUrl.includes('github.com')
        ? projectUrl.split('github.com/')[1]?.replace('.git', '') || projectUrl
        : projectUrl
      await projectService.create({ projectName, projectDescription, projectUrl: repoUrl, projectBranch })
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
      <div className="bg-white border border-gray-200 shadow-[4px_4px_0px_0px] shadow-gray-300 w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between py-3 px-5 border-b border-gray-200">
          <div>
            <span className="section-label">[ NEW PROJECT ]</span>
            <h2 className="font-black text-lg text-black tracking-tight mt-0.5">Start New Project</h2>
          </div>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center border border-gray-200 text-gray-500 hover:text-black hover:border-black transition-all" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-auto">
          {(error || githubError) && (
            <div className="text-sm text-red-600 border border-red-200 bg-red-50 px-4 py-3 mb-4">{error || githubError}</div>
          )}
          {!error && !githubError && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-black flex items-center gap-2">
                    Repository
                    <button type="button" onClick={loadRepos} disabled={githubLoading} className="nav text-[10px] uppercase tracking-wide text-gray-400 hover:text-black disabled:opacity-50 flex items-center gap-1" aria-label="Reload repositories">
                      <RotateCcw className="h-3 w-3" /> Reload
                    </button>
                  </label>
                  {githubLoading ? (
                    <div className="w-full flex items-center gap-2 p-2.5 border border-gray-200 text-sm text-gray-500">
                      <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                    </div>
                  ) : (
                    <select className="input-base" onChange={(e) => onSelectRepo(e.target.value)} value={selectedRepo || ''} disabled={!repos}>
                      {repos && repos.length === 0 ? (
                        <option value="" disabled>No repositories found</option>
                      ) : (
                        <>
                          <option value="" disabled>Select repository</option>
                          {(repos || []).map((r) => (
                            <option key={r.name} value={r.name}>{r.name}</option>
                          ))}
                        </>
                      )}
                    </select>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-black">Project Name</label>
                  <input className="input-base" value={projectName} onChange={(e) => setProjectName(e.target.value)} disabled={!selectedRepo} placeholder="My Project" />
                </div>
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-black">Description</label>
                  <textarea className="input-base resize-none" rows={2} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} disabled={!selectedRepo} placeholder="What is this project about?" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-black">Repository URL</label>
                  <input className="input-base bg-gray-50" value={projectUrl} readOnly placeholder="https://github.com/owner/repo" aria-readonly="true" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-black">Branch</label>
                  <input className="input-base" value={projectBranch} onChange={(e) => setProjectBranch(e.target.value)} disabled={!selectedRepo} placeholder="main" />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
                <button type="submit" disabled={!canSubmit || submitting || githubLoading || !selectedRepo} className="btn-primary">
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
