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
  const [projects, setProjects] = useState<any[]>([]);
  const {user} = useUser();

  const backend = process.env.NEXT_PUBLIC_BACKEND_URI
   useEffect(() => {
      const fetchProjects = async () => {
        try {
          const response = await fetch(`${backend}/api/v1/getUserGitHubRepositories?provider=${user.provider}&authToken=${user.authCode}&access_token=${user.accessToken}&username=${user.githubUsername}`);
          const data = await response.json();
          console.log(data)
          setProjects(data);
        } catch (error) {
          console.error("Failed to fetch projects:", error);
          setProjects([]);
        }
      };
      fetchProjects();
   }, [])
  return (
    <>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-10">
          <div className='flex w-full justify-between items-center '>
            {projectModalOpen && (
              <>
              <ProjectSelectionModals/>
              </>
            )}
            <div>
           <h2 className='hemming font-medium text-2xl'>Projects</h2>
              <span className='text-sm text-gray-600'>Manage all your projects from here</span>
            </div>
            <div className=''>
              <button className='bg-blue-600 hover:bg-blue-800 hover:text-white px-4 py-[11px] rounded-sm text-white flex items-center justify-center gap-2 '
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
          !projects? (
            <div className='flex flex-col justify-center items-center h-[60vh]'>
                  <Image
                  src="/empty-folder.png"
                  alt="No projects"
                  width={200}
                  height={200}
                  className="w-40 h-40"
                />
                <h2 className='hemming font-medium text-lg'>You do not have any projects currently</h2>
              </div>
          ) : (
            <div>
              {projects.map((project)=>
              (
                <>
                <div>
                  {project.name}
                </div>
                </>
              ))}
              
              </div>
          )
        }
          
        </div>
     </>
  )
}

export default page

