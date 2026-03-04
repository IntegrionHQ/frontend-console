"use client"
import React, { useState } from 'react'
import Image from 'next/image'
import { GitBranch, Plus } from 'lucide-react'
import { useUser } from '@/app/store/global/context/userContext'
import { useRouter } from 'next/navigation'
import ProjectSelectionModals from '@/app/components/core/modals/projectSelectionModals'
import {Driver} from 'iconsax-react'
import { useProjects } from '@/hooks'
import { useAuth } from '@/hooks'
import { Github, ExternalLink, CheckCircle } from 'lucide-react'

const DashboardPage = () => {
  const { user } = useUser()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [showGitHubInstall, setShowGitHubInstall] = useState(false)
  const [installingGitHub, setInstallingGitHub] = useState(false)
  const { projects, loading, refetch } = useProjects(user?.id || null)
  const { installGitHubApp } = useAuth()
  
  // Redirect to sign-in if no valid user context
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
      // Refresh to load repos
      window.location.reload()
    } catch (error) {
      console.error('GitHub installation failed:', error)
    } finally {
      setInstallingGitHub(false)
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className='flex w-full justify-between items-center'>
        <div>
          <h1 className='hemming font-semibold text-3xl text-slate-900'>Projects</h1>
          <span className='text-sm text-slate-600 manrope'>Manage all your projects from here</span>
        </div>
        <button
          className='bg-slate-900 hover:bg-slate-800 px-5 py-3 rounded-xl text-white flex items-center gap-2 shadow-sm transition-all hover:shadow-md'
          onClick={() => setOpen(true)}
        >
          <Plus className='size-4' />
          <span className='text-sm font-semibold manrope'>Create Project</span>
        </button>
      </div>

      {loading ? (
        <div className='flex flex-col justify-center items-center h-[60vh] bg-white rounded-2xl border border-slate-200'>
          <Image src="/empty-folder.png" alt="Loading" width={160} height={160} className='w-32 h-32 opacity-40' />
          <h2 className='hemming font-medium text-xl mt-6 text-slate-700'>Loading your projects…</h2>
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className='flex flex-col justify-center items-center h-[60vh] bg-white rounded-2xl border border-slate-200'>
          <Driver size="60" color="#94a3b8" />
          <h2 className='hemming font-semibold text-xl mt-6 text-slate-900'>No projects yet</h2>
          <p className='text-sm text-slate-600 manrope mt-2'>Create your first project to get started</p>
          <button
            className='mt-8 bg-slate-900 hover:bg-slate-800 px-6 py-3 rounded-xl text-white flex items-center gap-2 shadow-sm transition-all hover:shadow-md'
            onClick={() => setOpen(true)}
          >
            <Plus className='size-4' /> <span className='font-semibold'>Create Project</span>
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {projects.map((project) => (
            <div key={project.id} className='bg-white border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-all hover:border-slate-300 group'>
              <div className='hemming font-semibold text-lg text-slate-900 group-hover:text-slate-700'>{project.projectName}</div>
              {project.projectDescription && (
                <div className='text-sm text-slate-600 manrope mt-2'>{project.projectDescription}</div>
              )}
              {project.projectUrl && (
                <a className='text-sm text-slate-900 font-semibold hover:underline mt-4 inline-block' href={project.projectUrl} target='_blank' rel='noreferrer'>View repository →</a>
              )}
              {project.projectBranch && (
                <div className='text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 manrope'>
                  <GitBranch className='size-3.5' />
                  {project.projectBranch}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <ProjectSelectionModals 
          onClose={() => setOpen(false)} 
          onCreated={refetch}
          onGitHubInstallRequired={() => setShowGitHubInstall(true)}
        />
      )}

      {showGitHubInstall && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-8'>
            <div className='flex flex-col items-center text-center gap-4'>
              <div className='rounded-full bg-slate-100 p-4'>
                <Github className='h-8 w-8 text-slate-900' />
              </div>
              
              <div>
                <h2 className='hemming text-2xl font-semibold text-slate-900'>Install GitHub App</h2>
                <p className='text-sm text-slate-600 manrope mt-2'>
                  To access your repositories, you need to install the Integrion GitHub App.
                </p>
              </div>

              <div className='w-full bg-slate-50 rounded-xl p-4 space-y-2 text-left'>
                <div className='flex items-start gap-2 text-sm'>
                  <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span className='text-slate-700 manrope'>Read access to your repositories</span>
                </div>
                <div className='flex items-start gap-2 text-sm'>
                  <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span className='text-slate-700 manrope'>Monitor pull requests and branches</span>
                </div>
                <div className='flex items-start gap-2 text-sm'>
                  <CheckCircle className='h-4 w-4 text-green-600 mt-0.5 flex-shrink-0' />
                  <span className='text-slate-700 manrope'>Secure, revokable access</span>
                </div>
              </div>

              <div className='flex gap-3 w-full'>
                <button
                  onClick={() => setShowGitHubInstall(false)}
                  className='flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50'
                >
                  Cancel
                </button>
                <a
                  href={`https://github.com/apps/YOUR_GITHUB_APP_NAME/installations/new`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
                >
                  Install App <ExternalLink className='h-4 w-4' />
                </a>
              </div>

              <p className='text-xs text-slate-500 manrope'>
                After installation, you'll receive an installation ID. Enter it to complete the setup.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DashboardPage
