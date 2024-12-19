"use client"
import React from 'react'

const Loader = ({text}) => {
  return (
    <div className="flex flex-col items-center gap-2 justify-center min-h-[200px]">
      <div className="relative w-16 h-16">
        {/* Outer circle */}
        <div className="absolute w-full h-full border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin"></div>
        
        {/* Inner circle */}
        <div className="absolute top-2 left-2 w-12 h-12 border-4 border-gray-700 border-t-blue-500 rounded-full animate-spin-reverse"></div>
        
        {/* Center dot */}
      </div>
      <p className="text-gray-200 font-medium">{text||"Generating...."}</p>
    </div>
  )
}

export default Loader