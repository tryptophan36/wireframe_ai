"use client"
// src/components/ImageHandler.jsx
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation'; 
import { generateWireframe,generateFrameWithIterations } from '../utils/api';
import { cleanSvg } from '../utils/helpers';
import WithLoader from './WithLoader';
import { useDispatch } from 'react-redux';
import {  setSvgCode_ } from '../../redux/wireFrameSlice';
import { ToastContainer, toast } from 'react-toastify';


const ImageHandler = () => {
  const [image, setImage] = useState(null);
  const [ImageFile,setImageFile]=useState(null)
  const [svgCode,setSvgCode]=useState("")
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading,setIsLoading]=useState(false)
  const [customPromptSelect, setCustomPromptSelect] = useState(false);
  const [promptText, setPromptText] = useState("");
  const [error,setError]=useState("")
  const router = useRouter();
  const dispatch = useDispatch()
  const [generationType, setGenerationType] = useState('iterative');
  
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
    if (!image) {
      toast.error('Please upload an image first');
      return;
    }

    setIsLoading(true);
    if(generationType==="omniparser"){
    generateWireframe(ImageFile, promptText, setSvgCode, setIsLoading, (error) => {
      setError(error);
      toast.error(error || 'Failed to generate wireframe. Please try again.');
    });
  }else if(generationType==="iterative"){
    generateFrameWithIterations(ImageFile, promptText, setSvgCode, setIsLoading, (error) => {
      setError(error);
      toast.error(error || 'Failed to generate wireframe. Please try again.');
    });
  }
  }

  useEffect(() => {
    if (svgCode) {
      try {
        const cleanSvgCode = cleanSvg(svgCode);
        localStorage.setItem("localSvgCode", svgCode);
        dispatch(setSvgCode_(cleanSvgCode));
        router.push('/wireframe');
      } catch (err) {
        toast.error('Error processing SVG code');
        setError(err.message);
      }
    }
  }, [svgCode]);

  return (
    <>
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
          <div className="mt-4 flex items-center gap-4 my-2">
                <select
                  value={generationType}
                  onChange={(e) => setGenerationType(e.target.value)}
                  className="px-4 py-2 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="iterative">Iterative Generation</option>
                  <option value="omniparser">Omniparser</option>
                </select>

                
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
                  className=" my-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
      
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"  // or "light" based on your preference
      />

    </>
  );
};

export default ImageHandler;