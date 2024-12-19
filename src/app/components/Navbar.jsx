import React from 'react'
import Link from 'next/link'

const Navbar = () => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <h1 className="text-blue-400 font-bold text-xl">
              AI Wireframe Builder
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-4">
            <Link
               href={'/'}
              className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Generate
            </Link>
            <Link
              href="/wireframe"
              className="text-gray-300 hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Playground
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
