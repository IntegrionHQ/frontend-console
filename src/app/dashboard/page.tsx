"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { GitBranch, Plus } from 'lucide-react'
import { useUser } from '@/app/store/global/context/userContext'
import ProjectSelectionModals from '@/app/components/core/modals/projectSelectionModals'
import {Driver} from 'iconsax-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useProjects } from '@/hooks'
import { useAuth } from '@/hooks'

const DashboardPage = () => {
  const { user, setUser } = useUser()
  const [open, setOpen] = useState(false)
  const params = useSearchParams()
  const router = useRouter()
  const provider = params.get("provider")
  const authCode = params.get("code")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const { projects, loading, refetch } = useProjects(user?.id || null)
  const { loginWithGitHub } = useAuth()
  
  const loginWithGitHubRef = useRef(loginWithGitHub)
  const setUserRef = useRef(setUser)
  
  // Keep refs updated
  useEffect(() => {
    loginWithGitHubRef.current = loginWithGitHub
    setUserRef.current = setUser
  }, [loginWithGitHub, setUser])

  // Handle GitHub OAuth callback if code is present
  const handleGithubAuth = useCallback(async (code: string) => {
    try {
      setIsAuthenticating(true)
      const response = await loginWithGitHubRef.current({ authToken: code })
      
      if (response?.data?.user) {
        const userData = {
          id: response.data.user.id,
          email: response.data.user.email || response.data.user.githubEmail || "",
          username: response.data.user.githubUsername || "",
          githubUsername: response.data.user.githubUsername || "",
          primaryEmail: response.data.user.email || response.data.user.githubEmail || "",
          gitlabUsername: response.data.user.gitlabUsername || "",
          bitbucketUsername: response.data.user.bitbucketUsername || "",
          accessToken: "",
          authCode: code,
          provider: 'github'
        }
        
        setUserRef.current(userData)
        router.replace('/dashboard')
      }
    } catch (error) {
      console.error('[Dashboard GitHub Auth] Error:', error)
    } finally {
      setIsAuthenticating(false)
    }
  }, [router])
  
  useEffect(() => {
    if (authCode && provider === 'github' && !isAuthenticating && !user?.id) {
      handleGithubAuth(authCode)
    }
  }, [authCode, provider, user?.id, isAuthenticating, handleGithubAuth])

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
        <ProjectSelectionModals onClose={() => setOpen(false)} onCreated={refetch} />
      )}
    </div>
  )
}

export default DashboardPage
