"use client"
import React,{useEffect, useState} from 'react'
import { useDispatch, useSelector } from 'react-redux'
import Editor from '@monaco-editor/react'
import WithLoader from './WithLoader'
import { setHtmlCode_ } from '../../redux/wireFrameSlice'

const DisplayHtml = () => {
    const svgCode_=useSelector((state)=>state.wireframe.svgCode_)
    const [htmlCode, setHtmlCode] = useState(useSelector((state)=>state.wireframe.htmlCode_)||"")
    const htmlCode_ = useSelector((state)=>state.wireframe.htmlCode_)
    const [streamedData, setStreamedData] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [editorDimensions, setEditorDimensions] = useState({width:"100vw",height:"100vh"});

    const dispatch=useDispatch()

     // Function to update the editor width based on screen size
     const updateEditorWidth = () => {
        if (window.innerWidth >= 768) {
          setEditorDimensions({width:"60vw",height:"100vh"}); // For medium and larger screens
        } else {
          setEditorDimensions({width:"100vw",height:"60vh"}); // For small screens
        }
      };

      const handleGenerateHtml = async () => {
      //   setStreamedData("");
      //   setIsLoading(true);
      //  console.log("api called")
      //   try {
      //   const response = await fetch("http://localhost:5000/api/generateHtmlStream", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({ svgCode:svgCode_ }),
      // });
      //    console.log(response)   
      //     const reader = response.body.getReader();
      //     const decoder = new TextDecoder("utf-8");
    
      //     while (true) {
      //       const { done, value } = await reader.read();
      //       console.log("value",value)
      //       if (done) {
      //         break;
      //       }
    
      //       const chunk = decoder.decode(value, { stream: true });
      //       const parsedChunk = chunk.split("\n\n").map((line) => line.replace("data: ", ""));
      //       setStreamedData((prev) => prev + parsedChunk.join(""));
      //       setHtmlCode(streamedData)
      //     }
      //     localStorage.setItem("localHtmlCode",streamedData)
      //     dispatch(setHtmlCode_(streamedData))
      //   } catch (error) {
      //     console.error("Error generating HTML:", error);
      //     setStreamedData("Error occurred while generating HTML.");
      //   } finally {
      //     setIsLoading(false);
      //   }
      };
      
      const handleHtmlEditorChange = (value) => {
          setHtmlCode(value)
        }

      useEffect(()=>{
        dispatch(setHtmlCode_(localStorage.getItem("localHtmlCode")))
        console.log(htmlCode)
        updateEditorWidth();
        window.addEventListener("resize", updateEditorWidth);
      if(!htmlCode){
        console.log('hit')
       handleGenerateHtml()
      }
      return () => window.removeEventListener("resize", updateEditorWidth);
    },[])

  return (
    <>
    
    <Editor
            height={editorDimensions.height}
            width={editorDimensions.width}
            defaultLanguage="html"
            defaultValue={htmlCode_}
            value={htmlCode}
            theme="vs-dark"
            onChange={handleHtmlEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              roundedSelection: false,
              scrollBeyondLastLine: true,
              readOnly: false,
              automaticLayout: true,
            }}
          />
    </>
  )
}

export default DisplayHtml