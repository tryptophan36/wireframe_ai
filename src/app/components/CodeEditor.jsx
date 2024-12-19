"use client"
import React, { useEffect, useState } from 'react'
import Editor from '@monaco-editor/react'
import DisplayWireframe from './DisplayWireframe'
import { useSelector } from 'react-redux'
import DisplayHtml from './DisplayHtml'
import DisplaySvgCode from './DisplaySvgCode'
import ExportSvg from './ExportSvg'

const CodeEditor = () => {
  const [activeTab, setActiveTab] = useState('preview')
   const svgCode_ = useSelector((state) => state.wireframe.svgCode_) || ""


  const tabs = [
    { id: 'code', label: '💻 Svg' },
    { id: 'preview', label: '👁️ Preview' },
    {id:'html',label:"💻 Html"}
  ]

  return (
    <div className="w-full sm:h-screen bg-gray-900  overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex gap-3 p-3 items-center bg-gray-800 sm:gap-3 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-medium transition-colors duration-200
              ${activeTab === tab.id 
                ? 'text-blue-400 border-b-2 border-blue-400 bg-gray-900' 
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
              }`}
          >
            {tab.label}
          </button>
        ))}
        <ExportSvg/>
      </div>

      {/* Editor/Preview Content */}
      <div className="h-[calc(100%-44px)] "> {/* 44px is the height of the tab bar */}
        {activeTab === 'code' && (
          <div className='h-full'>
            <DisplaySvgCode/>
          </div>
        )}
        {activeTab === 'html' && (
          <DisplayHtml/>
        )}
        {activeTab === 'preview' && (
          <div className="h-full bg-white p-4 overflow-auto">
            <div className="bg-white rounded-lg p-4">
              <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                <DisplayWireframe svgCode={svgCode_}/>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CodeEditor
