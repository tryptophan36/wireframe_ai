export const convertToBase64 = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    let base64
    reader.onload = () => {  
       base64 = reader.result.split(",")[1]; // Extract only the Base64 string
      
    };
    reader.onerror = (error) => {
      console.error("Error converting to Base64:", error);
    };
    return base64
  };

 export const cleanSvg = (svgString) => {
    console.log(svgString)
    return svgString.replace(/\\"/g, '"').replace(/\\n/g, ''); 
  };

  export const validatePrompt = (text) => {
    if (!text.trim()) {
      return 'Please enter a prompt'
    }
    if (text.length < 3) {
      return 'Prompt must be at least 3 characters long'
    }
    if (text.length > 500) {
      return 'Prompt is too long (maximum 500 characters)'
    }
    return ''
  }

  export const fixSvgCode = (svgCode) => {
    try {
      // Try parsing the SVG using DOMParser
      const parser = new DOMParser();
      const svgDocument = parser.parseFromString(svgCode, "image/svg+xml");
  
      // Check for parsing errors
      const parseError = svgDocument.getElementsByTagName("parsererror");
      if (parseError.length > 0) {
        // Handle invalid SVG: remove incomplete parts
        const validCode = svgCode.slice(0, svgCode.lastIndexOf("<"));
        return validCode + "</svg>";
      }
  
      // If the SVG is already valid, return it
      return svgCode;
    } catch (error) {
      console.error("Error fixing SVG code:", error);
      return null;
    }
  };