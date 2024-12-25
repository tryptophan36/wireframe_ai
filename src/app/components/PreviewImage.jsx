import { auto } from "@anthropic-ai/sdk/_shims/registry.mjs";
import { useState } from "react";
const PreviewImage = ({ url, width = 300, className = "" }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!url) return null;

  return (
    <div className="relative" style={{ width, height:"auto" }}>
     
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <span className="text-red-500">{error}</span>
        </div>
      )}

      <img
        src={url}
        width={width}
        alt="Preview"
        className={`object-contain ${className} h-full`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setError("Failed to load image");
        }}
      />
    </div>
  );
};

export default PreviewImage
