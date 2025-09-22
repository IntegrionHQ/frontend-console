"use client"
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { useUser } from '@/app/store/global/context/userContext'
import ProjectSelectionModals from '@/app/components/core/modals/projectSelectionModals'
import {Driver} from 'iconsax-react'
const DashboardPage = () => {
  const { user } = useUser()
  const backend = process.env.NEXT_PUBLIC_BACKEND_URI
  const [projects, setProjects] = useState<any[] | null>(null)
  const [open, setOpen] = useState(false)

  const fetchProjects = async () => {
    if (!user?.id || !backend) {
      setProjects([])
      return
    }
    try {
      const res = await fetch(`${backend}/users/${user.id}/projects`)
      if (!res.ok) {
        setProjects([])
        return
      }
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    } catch (e) {
      setProjects([])
    }
  }

  useEffect(() => {
    fetchProjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, backend])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className='flex w-full justify-between items-center'>
        <div>
          <h1 className='hemming font-medium text-2xl'>Projects</h1>
          <span className='text-sm text-gray-600'>Manage all your projects from here</span>
        </div>
        <button
          className='bg-black hover:bg-neutral-800 px-4 py-[11px] rounded-sm text-white flex items-center gap-2'
          onClick={() => setOpen(true)}
        >
          <Plus className='size-4' />
          <span className='text-[13px] tracking-wide font-normal'>Create new project</span>
        </button>
      </div>

      {!projects ? (
        <div className='flex flex-col justify-center items-center h-[50vh]'>
          <Image src="/empty-folder.png" alt="Loading" width={160} height={160} className='w-32 h-32 opacity-60' />
          <h2 className='hemming font-medium text-lg mt-4'>Loading your projects…</h2>
        </div>
      ) : projects.length === 0 ? (
        <div className='flex flex-col justify-center items-center h-[50vh]'>
<Driver
 size="60"
 color="#777777"
/>          <h2 className='hemming font-medium text-lg mt-4'>You do not have any projects configured yet</h2>
          <button
            className='mt-6 bg-black hover:bg-neutral-800 px-4 py-2 rounded-sm text-white flex items-center gap-2'
            onClick={() => setOpen(true)}
          >
            <Plus className='size-4' /> New project
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {projects.map((project) => (
            <div key={project.id} className='border p-4 rounded'>
              <div className='font-medium'>{project.projectName || project.name}</div>
              {project.projectDescription && (
                <div className='text-sm text-gray-600 mt-1'>{project.projectDescription}</div>
              )}
              {project.projectUrl && (
                <a className='text-sm text-black underline mt-2 inline-block' href={project.projectUrl} target='_blank' rel='noreferrer'>View repository</a>
              )}
              {project.projectBranch && (
                <div className='text-xs text-gray-500 mt-2'>Branch: {project.projectBranch}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {open && (
        <ProjectSelectionModals onClose={() => setOpen(false)} onCreated={fetchProjects} />
      )}
    </div>
  )
}

export default DashboardPage
