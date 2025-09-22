"use client"
import React, { useEffect, useState } from 'react'
import { Plus } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'
import ProjectSelectionModals from '@/app/components/core/modals/projectSelectionModals'
import { useUser } from '@/app/store/global/context/userContext'

// import { useRouter } from 'next/router'

const page = () => {

  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false)
  const [projects, setProjects] = useState<any[] | null>(null);
  const {user} = useUser();

  const backend = process.env.NEXT_PUBLIC_BACKEND_URI
   useEffect(() => {
      const fetchUserProjects = async () => {
        if (!user?.id || !backend) {
          setProjects([])
          return
        }
        try {
          const response = await fetch(`${backend}/api/v1/users/${user.id}/projects`)
          if (!response.ok) {
            console.error("Failed to fetch user projects:", response.status)
            setProjects([])
            return
          }
          const data = await response.json()
          setProjects(Array.isArray(data) ? data : [])
        } catch (error) {
          console.error("Failed to fetch user projects:", error)
          setProjects([])
        }
      }
      fetchUserProjects()
   }, [user?.id, backend])

  const refresh = () => {
    // Re-run the effect by updating a trivial state or directly call the fetch
    if (!user?.id || !backend) return
    fetch(`${backend}/api/v1/users/${user.id}/projects`).then(async (res) => {
      if (!res.ok) return setProjects([])
      const data = await res.json()
      setProjects(Array.isArray(data) ? data : [])
    }).catch(() => setProjects([]))
  }
  return (
    <>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-10">
          <div className='flex w-full justify-between items-center '>
            {projectModalOpen && (
              <ProjectSelectionModals onClose={() => setProjectModalOpen(false)} onCreated={refresh} />
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
        {
          !projects ? (
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
            <div>
              {projects.length === 0 ? (
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
                projects.map((project) => (
                  <div key={project.id} className='border p-3 rounded mb-2'>
                    <div className='font-medium'>{project.projectName || project.name}</div>
                    {project.projectDescription && (
                      <div className='text-sm text-gray-600'>{project.projectDescription}</div>
                    )}
                  </div>
                ))
              )}
              
              </div>
          )
        }
          
        </div>
     </>
  )
}

export default page

