"use client"
import React, { useState } from 'react'
import { GitBranch, Plus, ExternalLink, Github, CheckCircle } from 'lucide-react'
import { useUser } from '@/app/store/global/context/userContext'
import { useRouter } from 'next/navigation'
import ProjectSelectionModals from '@/app/components/core/modals/projectSelectionModals'
import { useProjects } from '@/hooks'
import { useAuth } from '@/hooks'

const DashboardPage = () => {
  const { user } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showGitHubInstall, setShowGitHubInstall] = useState(false)
  const [installingGitHub, setInstallingGitHub] = useState(false)
  const { projects, loading, refetch } = useProjects(user?.id || null)
  const { installGitHubApp } = useAuth()

  React.useEffect(() => {
    if (!user?.email && !user?.username && !user?.githubUsername) {
      router.push('/auth/signin')
    }
  }, [user, router])

  const handleGitHubInstall = async (installationId: string) => {
    setInstallingGitHub(true)
    try {
      await installGitHubApp({ installationId })
      setShowGitHubInstall(false)
      window.location.reload()
    } catch (error) {
      console.error('GitHub installation failed:', error)
    } finally {
      setInstallingGitHub(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex w-full justify-between items-end">
        <div>
          <span className="section-label">[ PROJECTS ]</span>
          <h1 className="text-3xl font-black text-black tracking-tight mt-1">Projects</h1>
          <p className="text-sm text-gray-500 font-aeonik-light mt-1">Manage all your projects from here</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New Project
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col justify-center items-center h-[60vh] border border-gray-200 bg-white">
          <div className="bg-dot-pattern absolute inset-0 opacity-[0.04]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-10 w-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
            <p className="nav text-xs uppercase tracking-widest text-gray-400 mt-6">Loading projects…</p>
          </div>
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className="relative flex flex-col justify-center items-center h-[60vh] border border-gray-200 bg-white">
          <div className="bg-grid-pattern absolute inset-0 opacity-[0.04]" />
          <div className="corner-plus top-0 left-0" />
          <div className="corner-plus top-0 right-0" />
          <div className="corner-plus bottom-0 left-0" />
          <div className="corner-plus bottom-0 right-0" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-16 w-16 border border-gray-200 flex items-center justify-center mb-6">
              <Plus className="h-6 w-6 text-gray-300" />
            </div>
            <h2 className="text-xl font-black text-black tracking-tight">No projects yet</h2>
            <p className="text-sm text-gray-500 font-aeonik-light mt-2">Create your first project to get started</p>
            <button className="btn-primary mt-6 flex items-center gap-2" onClick={() => setOpen(true)}>
              <Plus className="h-3.5 w-3.5" /> Create Project
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="group relative bg-white border border-gray-200 p-5 transition-all duration-200 hover:border-black hover:shadow-[3px_3px_0px_0px] hover:shadow-gray-300">
              <div className="corner-plus -top-[1px] -left-[1px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="corner-plus -top-[1px] -right-[1px] opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="nav text-[10px] uppercase tracking-widest text-gray-400">Project</span>
              <h3 className="font-bold text-black text-lg mt-1 tracking-tight">{project.projectName}</h3>
              {project.projectDescription && (
                <p className="text-sm text-gray-500 font-aeonik-light mt-2 line-clamp-2">{project.projectDescription}</p>
              )}
              {project.projectUrl && (
                <a className="inline-flex items-center gap-1 text-sm font-semibold text-black hover:underline mt-3" href={project.projectUrl} target="_blank" rel="noreferrer">
                  View repo <ExternalLink className="h-3 w-3" />
                </a>
              )}
              {project.projectBranch && (
                <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-100 flex items-center gap-1.5 nav uppercase tracking-wide">
                  <GitBranch className="h-3 w-3" />
                  {project.projectBranch}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {open && (
        <ProjectSelectionModals 
          onClose={() => setOpen(false)} 
          onCreated={refetch}
          onGitHubInstallRequired={() => setShowGitHubInstall(true)}
        />
      )}

      {/* GitHub Install Modal */}
      {showGitHubInstall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white border border-gray-200 shadow-[4px_4px_0px_0px] shadow-gray-300 w-full max-w-md p-8">
            <div className="flex flex-col items-center text-center gap-5">
              <div className="border border-gray-200 p-4">
                <Github className="h-8 w-8 text-black" />
              </div>
              <div>
                <span className="section-label">[ REQUIRED ]</span>
                <h2 className="text-2xl font-black text-black tracking-tight mt-1">Install GitHub App</h2>
                <p className="text-sm text-gray-500 font-aeonik-light mt-2">
                  To access your repositories, install the Integrion GitHub App.
                </p>
              </div>
              <div className="w-full border border-gray-100 p-4 space-y-2.5 text-left">
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-aeonik-light">Read access to your repositories</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-aeonik-light">Monitor pull requests and branches</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700 font-aeonik-light">Secure, revokable access</span>
                </div>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowGitHubInstall(false)} className="btn-outline flex-1">Cancel</button>
                <a
                  href="https://github.com/apps/YOUR_GITHUB_APP_NAME/installations/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex-1 inline-flex items-center justify-center gap-2"
                >
                  Install App <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
