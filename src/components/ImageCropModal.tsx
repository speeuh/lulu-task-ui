import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, Check } from 'lucide-react';
import './ImageCropModal.css';

interface ImageCropModalProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
  circular?: boolean;
  aspect?: number; // Aspect ratio (ex: 16/9, 4/3, 1 para quadrado)
}

interface Area {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ 
  image, 
  onCropComplete, 
  onClose,
  circular = true,
  aspect = 1 
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: { x: number; y: number }) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onCropAreaChange = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const createCroppedImage = async () => {
    if (!croppedAreaPixels) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageElement = new Image();
      imageElement.src = image;

      await new Promise((resolve) => {
        imageElement.onload = resolve;
      });

      // Set canvas size to cropped area
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      // Draw cropped image
      ctx.drawImage(
        imageElement,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      }, 'image/jpeg', 0.95);
    } catch (error) {
      console.error('Error cropping image:', error);
    }
  };

  return (
    <div className="crop-modal-overlay" onClick={onClose}>
      <div className="crop-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>{circular ? 'Ajustar Foto de Perfil' : 'Ajustar Imagem'}</h3>
          <button onClick={onClose} className="crop-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="crop-container">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            cropShape={circular ? "round" : "rect"}
            showGrid={!circular}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onCropComplete={onCropAreaChange}
          />
        </div>

        <div className="crop-controls">
          <div className="zoom-control">
            <span>Zoom</span>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>

          <div className="crop-actions">
            <button onClick={onClose} className="crop-cancel-btn">
              Cancelar
            </button>
            <button onClick={createCroppedImage} className="crop-confirm-btn">
              <Check size={18} />
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;

