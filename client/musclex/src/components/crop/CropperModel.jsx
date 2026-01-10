import React, { useState } from "react";
import Cropper from "react-easy-crop";

const CropperModal = ({ image, onCropDone, onClose }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const onCropComplete = (_, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImage = async () => {
    const canvas = document.createElement("canvas");
    const img = document.createElement("img");
    img.src = image;

    await new Promise((resolve) => (img.onload = resolve));

    const ctx = canvas.getContext("2d");

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      img,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    canvas.toBlob((blob) => {
      onCropDone(blob);
    }, "image/png");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg">
        <div className="relative w-[300px] h-[300px]">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex justify-between mt-4">
          <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={getCroppedImage}
            className="px-3 py-1 bg-purple-600 text-white rounded"
          >
            Crop & Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropperModal;
