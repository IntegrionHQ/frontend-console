import React from 'react'

const SystemOperational = () => {
  const isOperational = true; // This would typically come from props or state
  return (
    <div className={`py-1 px-3 rounded-full text-xs font-semibold tracking-wide nav uppercase  ${isOperational ? 'bg-green-200 border-2 border-green-500 text-green-500 ' : 'bg-red-200 border-2 border-red-500 text-red-500 '}`}  >
      <span className={`h-2 w-2 rounded-full mr-2 inline-block ${isOperational ? 'bg-green-500' : 'bg-red-500'}`}></span>
      {isOperational ? 'All Systems Operational' : 'System is down'}
    </div>
  )
}

export default SystemOperational
