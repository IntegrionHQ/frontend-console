"use client"
import React, { useState } from 'react'
import { Plus } from "lucide-react"
import Link from 'next/link'
import Image from 'next/image'
import ProjectSelectionModals from '@/app/components/core/modals/projectSelectionModals'


const page = () => {

  const [projectModalOpen, setProjectModalOpen] = useState<boolean>(false)

  const projects= [

  ]
 
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
          projects.length === 0 ? (
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
              </div>
          )
        }
          
        </div>
     </>
  )
}

export default page

