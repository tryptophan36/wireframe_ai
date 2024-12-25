export const drawCanvas = (canvasRef, svgCode, boxes, currentBox, url) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
  
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      ctx.strokeStyle = '#666666'; // Border color (gray)
      ctx.lineWidth = 2; // Border width
      ctx.strokeRect(0, 0, img.width, img.height);
      drawAllBoxes(ctx, boxes, currentBox);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };
  
  export const drawAllBoxes = (ctx, boxes, currentBox) => {
    boxes.forEach(box => drawBox(ctx, box));
    if (currentBox) {
      drawBox(ctx, currentBox);
    }
  };
  
  export const drawBox = (ctx, box) => {
    ctx.strokeStyle = 'rgba(0, 123, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x, box.y, box.width, box.height);
  
    if (box.label) {
      ctx.fillStyle = 'rgba(0, 123, 255, 0.8)';
      ctx.font = '14px Arial';
      ctx.fillText(box.label, box.x, box.y - 5);
    }
  };
  
  export const handleMousePosition = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
  
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
  
    return { x, y };
  };
  