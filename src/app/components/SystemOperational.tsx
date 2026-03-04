import React from 'react'

const SystemOperational = () => {
  const isOperational = true;
  return (
    <div className={`py-1 px-2.5 text-[10px] nav uppercase tracking-widest flex items-center gap-1.5 border ${isOperational ? 'border-green-300 text-green-600 bg-green-50' : 'border-red-300 text-red-600 bg-red-50'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${isOperational ? 'bg-green-500' : 'bg-red-500'}`} />
      {isOperational ? 'Operational' : 'Down'}
    </div>
  )
}

export default SystemOperational
