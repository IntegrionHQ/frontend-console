import React from 'react'

interface ProjectSelectionModalProps{
  
}
const ProjectSelectionModals = () => {
  return (
    <div className='
fixed inset-0 bg-black/50 flex items-center justify-center z-50
    '>
       <div className='bg-white rounded-md shadow-lg w-2/5 h-[75%] flex flex-col'>
       <div className='flex items-center justify-between py-3 px-4 border-b'>
        <div className='flex flex-col justify-center items-start'>
   <h2 className=' font-medium text-[18px]'>Start New Project</h2>
   <p className='text-xs text-gray-500'>Select your github repo to start testing</p>
        </div>
       
          <button className='text-gray-500 hover:text-gray-800 text-lg'>X</button> 
       </div>
       </div>
     
    </div>
  )
}

export default ProjectSelectionModals
