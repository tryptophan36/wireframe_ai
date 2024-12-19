"use client"
import React,{useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Editor from '@monaco-editor/react'
import { setSvgCode_ } from '../../redux/wireFrameSlice'

const DisplaySvgCode = () => {
    
    const [editorDimensions, setEditorDimensions] = useState({width:"100vw",height:"100vh"});

    // Function to update the editor width based on screen size
    const updateEditorWidth = () => {
      if (window.innerWidth >= 768) {
        setEditorDimensions({width:"60vw",height:"100vh"}); // For medium and larger screens
      } else {
        setEditorDimensions({width:"100vw",height:"60vh"}); // For small screens
      }
    };
  
   
  const svgCode_ = useSelector((state) => state.wireframe.svgCode_) || ""
  const dispatch=useDispatch()

  const handleSvgEditorChange = (value) => {
    localStorage.setItem("localSvgCode",value)
    dispatch(setSvgCode_(value))
  }

  useEffect(() => {
    dispatch(setSvgCode_(localStorage.getItem("localSvgCode")))
    updateEditorWidth();
    window.addEventListener("resize", updateEditorWidth);
    return () => window.removeEventListener("resize", updateEditorWidth);
  }, []);    

  return (
    <div className='min-h-[40vh] h-full overflow-auto  '>
    <Editor
            height={editorDimensions.height}
            width={editorDimensions.width}
            defaultLanguage="html"
            defaultValue={svgCode_}
            theme="vs-dark"
            onChange={handleSvgEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: false,
              readOnly: false,
              automaticLayout: true,
            }}
            className="w-full md:w-[60vw]"
          />
    </div>
  )
}

export default DisplaySvgCode