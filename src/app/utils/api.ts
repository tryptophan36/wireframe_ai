import axios from "axios";
import { setHtmlCode_, setSvgCode_ } from "../../redux/wireFrameSlice";
import { fixSvgCode } from "./helpers";
import { Dispatch } from "@reduxjs/toolkit";

export const generateWireframe = async (
  screenshotFile: File,
  promptText: string,
  setSvgCode: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>
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
    setError("Error generating wireframe");
    console.error("Error generating wireframe:", error);
  } finally {
    setIsLoading(false);
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
    const formData = new FormData();
    formData.append("screenshot", blob);
    formData.append("userPrompt", userPrompt);
    formData.append("svgCode", svgCode);
    const response = await axios.post("https://wireframeai-production.up.railway.app/api/modifyFrame", formData, {
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
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
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
    console.error("Error generating wireframe:", error);
  } finally {
    setIsLoading(false);
  }
};

