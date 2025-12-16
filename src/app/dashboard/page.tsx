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
    <div className="flex flex-col gap-4 p-4">
      <div className='flex w-full justify-between items-center'>
        <div>
          <h1 className='hemming font-medium text-2xl'>Projects</h1>
          <span className='text-sm text-gray-600'>Manage all your projects from here</span>
        </div>
        <button
          className='bg-[#8059e3]  hover:bg-neutral-800 px-4 py-[11px] rounded-sm text-white flex items-center gap-2'
          onClick={() => setOpen(true)}
        >
          <Plus className='size-4' />
          <span className='text-[13px] tracking-wide font-normal'>Create new project</span>
        </button>
      </div>

      {loading ? (
        <div className='flex flex-col justify-center items-center h-[50vh]'>
          <Image src="/empty-folder.png" alt="Loading" width={160} height={160} className='w-32 h-32 opacity-60' />
          <h2 className='hemming font-medium text-lg mt-4'>Loading your projects…</h2>
        </div>
      ) : !projects || projects.length === 0 ? (
        <div className='flex flex-col justify-center items-center h-[50vh]'>
<Driver
 size="60"
 color="#777777"
/>          <h2 className='hemming font-medium text-lg mt-4'>You do not have any projects configured yet</h2>
          <button
            className='mt-6 bg-[#8059e3]  hover:bg-neutral-800 px-4 py-2 rounded-sm text-white flex items-center gap-2'
            onClick={() => setOpen(true)}
          >
            <Plus className='size-4' /> New project
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {projects.map((project) => (
            <div key={project.id} className='bg-white border p-4 rounded'>
              <div className='font-medium'>{project.projectName}</div>
              {project.projectDescription && (
                <div className='text-sm text-gray-600 mt-1'>{project.projectDescription}</div>
              )}
              {project.projectUrl && (
                <a className='text-sm text-black underline mt-2 inline-block' href={project.projectUrl} target='_blank' rel='noreferrer'>View repository</a>
              )}
              {project.projectBranch && (
                <div className='text-xs text-gray-500 mt-2 flex justify-end items-end'>
                  <GitBranch className='inline mr-1 mb-0.5 size-4' />
                   {project.projectBranch}</div>
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
