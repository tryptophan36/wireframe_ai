import axios from "axios";
import { setHtmlCode_, setSvgCode_ } from "../../redux/wireFrameSlice";
import { fixSvgCode } from "./helpers";
import { Dispatch } from "@reduxjs/toolkit";

export const generateWireframe = async (
  screenshotFile: File,
  promptText: string,
  setSvgCode: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<Error | null>>
) => {
  const formData = new FormData();
  formData.append("screenshot", screenshotFile);
  formData.append("userPrompt", promptText);
  try {
    console.log("fetching");
    const response = await axios.post("api/generateFrame", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if(response.data.error){
      setError(response.data.error);
      return;
    }
    const wireframe = response.data.wireframe.content[0].text;
    console.log("Wireframe generated:", response);
    setSvgCode(wireframe);
    localStorage.setItem("localHtmlCode", "");
    // Process the wireframe here (e.g., display it in the UI)
  } catch (error) {
    setError(error as Error);
    console.error("Error generating wireframe:", error);
  } finally {
    setIsLoading(false);
  }
};

export const convertSvgToPng = async (svgCode: string): Promise<Blob> => {
  const svgBlob = new Blob([svgCode], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);
  
  try {
    const img = new Image();
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to convert to PNG'));
        }, 'image/png');
      };
      img.onerror = () => reject(new Error('Failed to load SVG'));
      img.src = svgUrl;
    });
    
    return pngBlob;
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};

export const handleModifyWireframe = async (
  svgCode: string,
  blob: Blob,
  userPrompt: string,
  dispatch: Dispatch,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {
  try {
    const pngBlob = await convertSvgToPng(svgCode);
    
    const formData = new FormData();
    formData.append("screenshot", blob);
    formData.append("userPrompt", userPrompt);
    formData.append("svgCode", svgCode);
    formData.append("fullSvg", pngBlob);
    const response = await axios.post(" https://wireframeai-production.up.railway.app/api/modifyFrame", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const wireframeRes = response.data.wireFrame.content;
    const wireframe = fixSvgCode(wireframeRes);
    console.log("Wireframe modified:", wireframe);
    localStorage.setItem("localSvgCode", wireframe);
    dispatch(setSvgCode_(wireframe));
    dispatch(setHtmlCode_(""));
    localStorage.setItem("localHtmlCode", "");
  } catch (err) {
    console.error("Error generating wireframe:", err);
  } finally {
    setIsLoading(false);
  }
};

export const generateFrameWithIterations =  async (
  screenshotFile: File,
  promptText: string,
  setSvgCode: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<Error | null>>
) => {
  const formData = new FormData();
  formData.append("screenshot", screenshotFile);
  formData.append("userPrompt", promptText);
  try {
    console.log("fetching");
    const response = await axios.post(`https://wireframeai-production.up.railway.app/api/generate-frame-new`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    const wireframe = response.data.wireframe.iterations[0];
    console.log("Wireframe generated:", response);
    setSvgCode(wireframe);
    localStorage.setItem("localHtmlCode", "");
    // Process the wireframe here (e.g., display it in the UI)
  } catch (error) {
    setError(error as Error);
    console.error("Error generating wireframe:", error);
  } finally {
    setIsLoading(false);
  }
};

