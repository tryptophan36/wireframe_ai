"use client"
// src/components/ImageHandler.jsx
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { generateWireframe } from '../utils/api';
import { cleanSvg } from '../utils/helpers';
import WithLoader from './WithLoader';
import { useDispatch } from 'react-redux';
import { setHtmlCode_, setSvgCode_ } from '../../redux/wireFrameSlice';
const ImageHandler = () => {
  const [image, setImage] = useState(null);
  const [ImageFile,setImageFile]=useState(null)
  const [svgCode,setSvgCode]=useState("")
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading,setIsLoading]=useState(false)
  const [customPromptSelect, setCustomPromptSelect] = useState(false);
  const [promptText, setPromptText] = useState("");
  const router = useRouter();
  const dispatch = useDispatch()
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'image/png') {
      handleImageUpload(file);
    }
  };

  const handleImageUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    setImageFile(file)
    if (file && file.type === 'image/png') {
      handleImageUpload(file);
      
    }
  };

  const handleCreate = () => {
    if (image) {
      setIsLoading(true) 
      generateWireframe(ImageFile,promptText,setSvgCode,setIsLoading)
      // const svgCode="<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<svg width=\"1200\" height=\"800\" xmlns=\"http://www.w3.org/2000/svg\">\n  <!-- Navigation Bar -->\n  <rect x=\"0\" y=\"0\" width=\"1200\" height=\"60\" fill=\"#ffffff\" stroke=\"#000000\" stroke-dasharray=\"5,5\"/>\n  <g transform=\"translate(20,20)\">\n    <!-- Logo -->\n    <rect x=\"0\" y=\"0\" width=\"100\" height=\"20\" fill=\"#ffffff\" stroke=\"#000000\" stroke-dasharray=\"5,5\"/>\n    <text x=\"10\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Vercel Logo</text>\n    \n    <!-- Nav Items -->\n    <text x=\"120\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Products ▼</text>\n    <text x=\"220\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Solutions ▼</text>\n    <text x=\"320\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Resources ▼</text>\n    <text x=\"420\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Enterprise</text>\n    <text x=\"520\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Docs</text>\n    <text x=\"620\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Pricing</text>\n    \n    <!-- Right Nav -->\n    <text x=\"900\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Log In</text>\n    <text x=\"980\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Contact</text>\n    <rect x=\"1050\" y=\"-5\" width=\"80\" height=\"30\" rx=\"15\" fill=\"#ffffff\" stroke=\"#000000\"/>\n    <text x=\"1065\" y=\"15\" font-family=\"Arial\" font-size=\"12\">Sign Up</text>\n  </g>\n\n  <!-- Hero Section -->\n  <g transform=\"translate(0,150)\">\n    <text x=\"600\" y=\"50\" font-family=\"Arial\" font-size=\"48\" text-anchor=\"middle\" font-weight=\"bold\">Your complete platform for the web.</text>\n    \n    <text x=\"600\" y=\"120\" font-family=\"Arial\" font-size=\"18\" text-anchor=\"middle\" fill=\"#666666\">\n      Vercel provides the developer tools and cloud infrastructure\n    </text>\n    <text x=\"600\" y=\"150\" font-family=\"Arial\" font-size=\"18\" text-anchor=\"middle\" fill=\"#666666\">\n      to build, scale, and secure a faster, more personalized web.\n    </text>\n\n    <!-- CTA Buttons -->\n    <g transform=\"translate(450,200)\">\n      <rect x=\"0\" y=\"0\" width=\"150\" height=\"40\" rx=\"20\" fill=\"#ffffff\" stroke=\"#000000\"/>\n      <text x=\"75\" y=\"25\" font-family=\"Arial\" font-size=\"14\" text-anchor=\"middle\">Start Deploying</text>\n      \n      <rect x=\"170\" y=\"0\" width=\"150\" height=\"40\" rx=\"20\" fill=\"#ffffff\" stroke=\"#000000\"/>\n      <text x=\"245\" y=\"25\" font-family=\"Arial\" font-size=\"14\" text-anchor=\"middle\">Get a Demo</text>\n    </g>\n  </g>\n\n  <!-- Background Decoration -->\n  <rect x=\"0\" y=\"500\" width=\"1200\" height=\"300\" fill=\"#ffffff\" stroke=\"#000000\" stroke-dasharray=\"5,5\"/>\n  <text x=\"600\" y=\"650\" font-family=\"Arial\" font-size=\"12\" text-anchor=\"middle\">[Decorative Gradient Background]</text>\n</svg>"
    }
  };

  
  useEffect(()=>{
    if(svgCode){
      const cleanSvgCode = cleanSvg(svgCode)
      localStorage.setItem("localSvgCode",svgCode)
      dispatch(setSvgCode_(cleanSvgCode))
      router.push('/wireframe');
     }
  },[svgCode])

  return (
    <WithLoader isLoading={isLoading}>
     <div className="max-w-3xl mt-10 mx-auto p-6 ">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Upload Screenshot
        </h2>
        <p className="text-gray-300">
          Upload your website screenshot in PNG format to generate a  wireframe
        </p>
      </div>
     
      {image && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-white mb-4">
            Preview
          </h3>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img
              src={image}
              alt="Uploaded screenshot"
              className="w-full h-auto"
            />
          </div>
          <button
            onClick={handleCreate}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Generate Wireframe
          </button>
        </div>
      )}

      <div
        onClick={() => fileInputRef.current.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative
          border-2 border-dashed rounded-lg
          p-12
          text-center
          cursor-pointer
          transition-all
          ${isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
        `}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept="image/png"
          className="hidden"
        />

        <div className="space-y-4">
          <div className="flex justify-center">
            <svg
              className={`w-16 h-16 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <div>
            <p className="text-lg font-medium text-gray-700">
              Drop your PNG screenshot here
            </p>
            <p className="text-sm text-gray-500">
              or click to select file
            </p>
          </div>
        </div>
      </div>
        <div className='mt-3'>
          <input
            type="checkbox"
            id="customPromptCheckbox"
            checked={customPromptSelect}
            onChange={() => setCustomPromptSelect(!customPromptSelect)}
          />
          <label htmlFor="customPromptCheckbox" className="ml-2 text-xl text-white">
            Add Custom Prompt
          </label>
        </div>

        {customPromptSelect && (
          <div className="mt-4">
            <input
              type="text"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="  Enter your custom prompt"
              className="border h-[4rem] rounded-lg placeholder-gray-800 text-black p-2 w-full"
            />
          </div>
        )}

    
    </div>

    </WithLoader>
  );
};

export default ImageHandler;