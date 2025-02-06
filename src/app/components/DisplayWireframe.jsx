"use client";
import React, { useRef, useEffect, useState } from "react";
import ModifyChat from "./ModifyChat";
import { useDispatch,useSelector} from "react-redux";
import { setModificationImage_ } from "@/redux/wireFrameSlice";
import { setSvgCode_ } from "@/redux/wireFrameSlice";
const DisplayWireframe = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [currentBox, setCurrentBox] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const svgCode=useSelector((state)=>state.wireframe.svgCode_)
  const [modificationImage,setModificationImage]=useState(useSelector((state)=>state.wireframe.modificationImage))
  const [prevState,setPrevState]=useState()

  const dispatch = useDispatch()
  const blob = new Blob([svgCode], { type: "image/svg+xml" });
  const url =  URL.createObjectURL(blob);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = "#666666"; // Border color (gray)
      ctx.lineWidth = 2; // Border width
      ctx.strokeRect(0, 0, img.width, img.height);
      drawAllBoxes(ctx);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const drawAllBoxes = (ctx) => {
    boxes.forEach((box) => drawBox(ctx, box));
    if (currentBox) {
      drawBox(ctx, currentBox);
    }
  };

  const drawBox = (ctx, box) => {
    ctx.strokeStyle = "rgba(0, 123, 255, 0.8)";
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);

    if (box.label) {
      ctx.fillStyle = "rgba(0, 123, 255, 0.8)";
      ctx.font = "14px Arial";
      ctx.fillText(box.label, box.x, box.y - 5);
    }
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    setIsDrawing(true);
    setStartPos({ x, y });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const width = x - startPos.x;
    const height = y - startPos.y;

    setCurrentBox({
      x: startPos.x,
      y: startPos.y,
      width,
      height,
    });

    drawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    if (currentBox) {
      const label = prompt("Enter a label for this region:");
      if (label) {
        console.log(currentBox);
        setBoxes([{ ...currentBox, label }]);
        captureCanvasPortionAndSend(currentBox.x,currentBox.y,currentBox.width,currentBox.height)
      }
      setCurrentBox(null);
    }
  };

  const handleDeleteBox = (index) => {
    const newBoxes = boxes.filter((_, i) => i !== index);
    setBoxes(newBoxes);
    dispatch(setModificationImage_(""))
  };


  const captureCanvasPortionAndSend = async ( x, y, width, height) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d");
  
    // Get the image data of the specified portion
    const imageData = ctx.getImageData(x, y, width, height);
  
    // Create a temporary canvas
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = width;
    tempCanvas.height = height;
  
    // Draw the extracted image data on the temporary canvas
    const tempCtx = tempCanvas.getContext("2d");
    tempCtx.putImageData(imageData, 0, 0);

    // Convert the temporary canvas to a Blob (PNG format)
    tempCanvas.toBlob(async (blob) => {
      if (!blob) {
        console.error("Failed to create Blob from canvas portion");
        return;
      }
      
      // Create object URL from blob
      const objectUrl = URL.createObjectURL(blob);
      console.log(objectUrl)
      setModificationImage(objectUrl)
      dispatch(setModificationImage_(objectUrl))
    }, "image/png")

  };

  
  const handleClear = ()=>{
    console.log(modificationImage)
    URL.revokeObjectURL(modificationImage);
    setModificationImage("")
    setBoxes([])
    dispatch(setModificationImage_(""))
  }
  
  const handleUndo = ()=>{
    dispatch(setSvgCode_(prevState))
    localStorage.setItem("localSvgCode",prevState)
  }

  
  
  useEffect(()=>{
    dispatch(setSvgCode_(localStorage.getItem("localSvgCode")));
    setPrevState(localStorage.getItem("localSvgCode"))
  },[])
  
  useEffect(() => {
    drawCanvas();
  }, [svgCode, boxes]);
  

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center px-4">
        <div className="flex gap-3">
        <button onClick={handleClear} className="bg-red-500 p-2 rounded-md text-black" >Clear Box</button>
        <button onClick={handleUndo} className="bg-blue-500 p-2 rounded-md text-black" >Undo</button>
        </div>
        <div className="text-sm text-gray-600">
          Click and drag to draw bounding boxes
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4">
        <canvas
          ref={canvasRef}
          width={1400}
          height={800}
          className="w-full rounded-lg shadow-sm cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => setIsDrawing(false)}
        />
      </div>


      {boxes.length > 0 && (
        <div className="w-full max-w-4xl mx-auto px-4">
          <h3 className="font-semibold text-black mb-2">Labeled Regions:</h3>
          <div className="space-y-2">
            {boxes.map((box, index) => (
              <div
                key={index}
                className="flex justify-between items-center bg-gray-50 p-2 rounded"
              >
                <span className="text-black">
                  {box.label} ({Math.round(box.width)}x{Math.round(box.height)})
                </span>
                <button
                  onClick={() => handleDeleteBox(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayWireframe;
