"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSvgCode_ } from "../../redux/wireFrameSlice";
import { handleModifyWireframe } from "../utils/api";
import WithLoader from "./WithLoader";
import { validatePrompt } from "../utils/helpers";

const ModifyChat = ({ svgCode }) => {
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const examplePrompts = [
    "Add three tabs to the hero section",
    "Add a footer component at the bottom",
    "Add a contact form with 3 input fields",
    "Change the layout to two columns",
  ];
  const svgCode_ = useSelector((state) => state.wireframe.svgCode_);
  const handleModify = async () => {
    const validationError = validatePrompt(prompt);
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setIsLoading(true);
      handleModifyWireframe(svgCode_, prompt, dispatch, setIsLoading);
    } catch (error) {
      setIsLoading(false);
      console.error("Error modifying wireframe:", error);
    }
  };

  useEffect(() => {
    dispatch(setSvgCode_(localStorage.getItem("localSvgCode")));
  }, []);
  
  return (
    <div className=" max-w-2xl flex justify-center items-center h-full mx-auto p-6 bg-gray-800 shadow-lg">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Modify Wireframe</h2>
        {/* Input and Button Section */}
        <div className="space-y-4">
          <WithLoader isLoading={isLoading}>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your modification prompt..."
                className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
              <button
                onClick={handleModify}
                className=" bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                Modify
              </button>
            </div>
            {error && (
              <span className="text-red-500 text-start text-sm">{error}</span>
            )}
            {/* Example Prompts Section */}
            <div className="mt-6">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-300 mb-3">
                Example prompts:
              </h3>
              <div className="flex flex-wrap gap-2">
                {examplePrompts.map((examplePrompt, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(examplePrompt)}
                    className="text-sm px-3 py-1.5 bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                  >
                    "{examplePrompt}"
                  </button>
                ))}
              </div>
            </div>
          </WithLoader>
        </div>
      </div>
    </div>
  );
};

export default ModifyChat;
