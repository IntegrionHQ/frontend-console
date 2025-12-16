"use client"
import React, { useState } from 'react'
import { Plus } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'
import ProjectSelectionModals from '@/app/components/core/modals/projectSelectionModals'
import { useUser } from '@/app/store/global/context/userContext'
import { useProjects } from '@/hooks'

const page = () => {
  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false)
  const { user } = useUser();
  const { projects, loading, error, refetch } = useProjects(user?.id || null);
  return (
    <>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-10">
          <div className='flex w-full justify-between items-center '>
            {projectModalOpen && (
              <ProjectSelectionModals onClose={() => setProjectModalOpen(false)} onCreated={refetch} />
            )}
            <div>
           <h2 className='hemming font-medium text-2xl'>Projects</h2>
              <span className='text-sm text-gray-600'>Manage all your projects from here</span>
            </div>
            <div className=''>
              <button className='bg-black hover:bg-neutral-800 hover:text-white px-4 py-[11px] rounded-sm text-white flex items-center justify-center gap-2 '
              onClick={()=>setProjectModalOpen(true)}
              >
                <Plus className='size-4'/>
                <span className='text-[13px] tracking-wide font-normal'>
                   Create new project
                  </span>
               
              </button>
            </div>
        
          </div>
        {loading ? (
          <div className='flex flex-col justify-center items-center h-[60vh]'>
            <Image
              src="/empty-folder.png"
              alt="Loading"
              width={200}
              height={200}
              className="w-40 h-40 opacity-60"
            />
            <h2 className='hemming font-medium text-lg mt-4'>Loading projects...</h2>
          </div>
        ) : error ? (
          <div className='flex flex-col justify-center items-center h-[60vh]'>
            <h2 className='hemming font-medium text-lg text-red-600'>{error}</h2>
            <button
              className='mt-6 bg-black hover:bg-neutral-800 px-4 py-2 rounded-sm text-white'
              onClick={refetch}
            >
              Retry
            </button>
          </div>
        ) : !projects || projects.length === 0 ? (
                <div className='flex flex-col justify-center items-center h-[60vh]'>
                  <Image
                    src="/empty-folder.png"
                    alt="No projects"
                    width={200}
                    height={200}
                    className="w-40 h-40"
                  />
                  <h2 className='hemming font-medium text-lg mt-4'>You do not have any projects configured yet</h2>
          <button
            className='mt-6 bg-black hover:bg-neutral-800 px-4 py-2 rounded-sm text-white flex items-center gap-2'
            onClick={()=>setProjectModalOpen(true)}
          >
            <Plus className='size-4' /> New project
          </button>
        </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {projects.map((project) => (
              <div key={project.id} className='border p-4 rounded'>
                <div className='font-medium'>{project.projectName}</div>
                {project.projectDescription && (
                  <div className='text-sm text-gray-600 mt-1'>{project.projectDescription}</div>
                )}
                {project.projectUrl && (
                  <div className='text-xs text-gray-500 mt-2'>{project.projectUrl}</div>
                )}
                {project.projectBranch && (
                  <div className='text-xs text-gray-500 mt-2'>Branch: {project.projectBranch}</div>
                )}
              </div>
            ))}
          </div>
        )}
          
        </div>
     </>
  )
}

export default page

