"use client"
import React, { useRef, useEffect, useState } from 'react';
import ModifyChat from './ModifyChat';

const DisplayWireframe = ({ svgCode }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [boxes, setBoxes] = useState([]);
  const [currentBox, setCurrentBox] = useState(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const blob = new Blob([svgCode], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  useEffect(() => {
    drawCanvas();
  }, [svgCode, boxes]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
  
    
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = '#666666'; // Border color (gray)
      ctx.lineWidth = 2; // Border width
      ctx.strokeRect(0, 0, img.width, img.height);
      drawAllBoxes(ctx);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const drawAllBoxes = (ctx) => {
    boxes.forEach(box => drawBox(ctx, box));
    if (currentBox) {
      drawBox(ctx, currentBox);
    }
  };

  const drawBox = (ctx, box) => {
    ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    
    if (box.label) {
      ctx.fillStyle = 'rgba(0, 123, 255, 0.8)';
      ctx.font = '14px Arial';
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
      height
    });

    drawCanvas();
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    if (currentBox) {
      const label = prompt('Enter a label for this region:');
      if (label) {
        console.log(currentBox)
        setBoxes([...boxes, { ...currentBox, label }]);
      }
      setCurrentBox(null);
    }
  };

  const handleDeleteBox = (index) => {
    const newBoxes = boxes.filter((_, i) => i !== index);
    setBoxes(newBoxes);
  };


  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center px-4">
        <button 
          onClick={() => setBoxes([])}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear All Boxes
        </button>
        <div className="text-sm text-gray-600">
          Click and drag to draw bounding boxes
        </div>
      </div>

      <div className="w-full max-w-4xl mx-auto p-4">
        <canvas 
          ref={canvasRef}
          width={1200}
          height={800}
          className="w-full border border-gray-200 rounded-lg shadow-sm cursor-crosshair"
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
              <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <span className='text-black'>
                  {box.label} ({Math.round(box.width)}x{Math.round(box.height)})
                </span>
                <button
                  onClick={() => handleDeleteBox(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default DisplayWireframe;