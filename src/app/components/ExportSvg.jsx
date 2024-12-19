"use client"
import React, { useState } from 'react'
import { useSelector } from 'react-redux'

const ExportSvg = () => {
  const [isOpen, setIsOpen] = useState(false)
  const svgCode = useSelector((state) => state.wireframe.svgCode_)

  const handleExportPNG = () => {
    // Create a temporary container and insert the SVG
    const container = document.createElement('div')
    container.innerHTML = svgCode

    const svgElement = container.querySelector('svg')
    if (!svgElement) {
      console.error('Invalid SVG code')
      return
    }

    // Temporarily add the SVG to the document to get its dimensions
    document.body.appendChild(svgElement)
    const svgRect = svgElement.getBoundingClientRect()

    // Create a canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Set canvas dimensions
    canvas.width = svgRect.width || 800 // fallback width
    canvas.height = svgRect.height || 600 // fallback height

    // Create an image from the SVG
    const svgData = new XMLSerializer().serializeToString(svgElement)
    const img = new Image()
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0)
      // Convert canvas to PNG and download
      const a = document.createElement('a')
      a.download = 'wireframe.png'
      a.href = canvas.toDataURL('image/png')
      a.click()
      
      // Cleanup
      document.body.removeChild(svgElement)
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)))
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 text-sm text-gray-300  bg-gray-900 hover:bg-gray-800"
      >
        Export ▼
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg z-50">
          <div className="py-1">
            <button
              onClick={handleExportPNG}
              className="block w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 text-left"
            >
              Export as PNG
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExportSvg