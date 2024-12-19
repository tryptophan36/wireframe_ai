import axios from "axios";
import { setHtmlCode_, setSvgCode_ } from "../../redux/wireFrameSlice";
import { fixSvgCode } from "./helpers";

export const generateWireframe = async (
  screenshotFile: File,
  setSvgCode: React.Dispatch<React.SetStateAction<string | null>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
) => {

  const formData = new FormData();
  formData.append("screenshot", screenshotFile);

  try {
    console.log("fetching")
    const response = await axios.post(
      "/api/generateFrame",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    const wireframe = response.data.wireframe.content[0].text;
    console.log("Wireframe generated:", wireframe);
    setSvgCode(wireframe)
    localStorage.setItem("localHtmlCode","")
    // Process the wireframe here (e.g., display it in the UI)
  } catch (error) {
    console.error("Error generating wireframe:", error);
  }finally{
   setIsLoading(false)
  }
};

export const handleModifyWireframe = async (svgCode:string,userPrompt:string,dispatch:any,setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  try {
   
    const response = await axios.post("/api/modifyWireframe", {
      svgCode,
      userPrompt,
    });
     const wireframeRes = response.data.wireFrame.content[0].text;
    const wireframe = fixSvgCode(wireframeRes)
    console.log("Wireframe modified:", wireframe);
    localStorage.setItem("localSvgCode",wireframe)
    dispatch(setSvgCode_(wireframe))
    dispatch(setHtmlCode_(""))
    localStorage.setItem("localHtmlCode","")
  } catch (err) {
    console.error("Error generating wireframe:", err);
  }finally{
   setIsLoading(false)
  }
};
