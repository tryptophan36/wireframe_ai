"use client";
import React, { useEffect, useState } from "react";
import DisplayWireframe from "./DisplayWireframe";
import { useDispatch, useSelector } from "react-redux";
import DisplayHtml from "./DisplayHtml";
import DisplaySvgCode from "./DisplaySvgCode";
import ExportSvg from "./ExportSvg";
import { setSvgCode_ } from "@/redux/wireFrameSlice";
import { toast } from "react-toastify";

const CodeEditor = () => {
  const [activeTab, setActiveTab] = useState("preview");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const svgCode_ = useSelector((state) => state.wireframe.svgCode_) || "";
  const dispatch = useDispatch();

  const tabs = [
    { id: "code", label: "💻 Svg" },
    { id: "preview", label: "👁️ Preview" },
    { id: "html", label: "💻 Html" },
  ];

  const [rating, setRating] = useState(0);

  const handleSaveWithFeedback = async (svgCode) => {
    setIsLoading(true);
    try {
      const id = Date.now().toString();
      
      // Create a new Image and Canvas
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Convert SVG to data URL
      const svgBlob = new Blob([svgCode], { type: 'image/svg+xml' });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      // Wait for image to load
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = svgUrl;
      });
      
      // Set canvas dimensions to match the image
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image on canvas with white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      // Convert canvas to PNG blob
      const pngBlob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      // Clean up
      URL.revokeObjectURL(svgUrl);

      const formData = new FormData();
      formData.append("rating", rating.toString());
      formData.append("pngImage", pngBlob);

      const response = await fetch("/api/add_feedback", {
        method: "PUT",
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        throw new Error(result.error);
      }
      toast.success("Feedback saved successfully!");
      console.log("Image URL:", result);
    } catch (error) {
      toast.error("Failed to save feedback: " + error.message);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    dispatch(setSvgCode_(localStorage.getItem("localSvgCode")));
  }, []);

  return (
    <div className="w-full sm:h-screen bg-gray-900  overflow-hidden">
      {/* Tab Navigation */}
      <div className="flex gap-3 p-3 items-center bg-gray-800 sm:gap-3 border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-medium transition-colors duration-200
              ${
                activeTab === tab.id
                  ? "text-blue-400 border-b-2 border-blue-400 bg-gray-900"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
              }`}
          >
            {tab.label}
          </button>
        ))}
        <ExportSvg />
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          Rate
        </button>
      </div>

      {/* Rating Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h2 className="text-xl text-white mb-4">Rate your experience</h2>
            <select
              value={rating}
              onChange={(e) => setRating(parseInt(e.target.value))}
              className="w-full px-4 py-2 mb-4 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0">Select Rating</option>
              <option value="1">1 - Poor</option>
              <option value="2">2 - Fair</option>
              <option value="3">3 - Good</option>
              <option value="4">4 - Very Good</option>
              <option value="5">5 - Excellent</option>
            </select>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveWithFeedback(svgCode_)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                disabled={rating === 0 || isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor/Preview Content */}
      <div className="h-[calc(100%-44px)] ">
        {" "}
        {/* 44px is the height of the tab bar */}
        {activeTab === "code" && (
          <div className="h-full">
            <DisplaySvgCode />
          </div>
        )}
        {activeTab === "html" && <DisplayHtml />}
        {activeTab === "preview" && (
          <div className="h-full bg-white p-4 overflow-auto">
            <div className="bg-white rounded-lg p-4">
              <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">
                <DisplayWireframe svgCode={svgCode_} />
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor;
