import React, { useRef, useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import ImageCropModal from './ImageCropModal';
import './ImageUpload.css';

interface ImageUploadProps {
  currentImage?: string;
  onImageUploaded: (url: string) => void;
  label?: string;
  circular?: boolean;
  aspect?: number; // Aspect ratio para crop (ex: 16/9, 4/3, 1 para quadrado)
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  currentImage, 
  onImageUploaded, 
  label = 'Escolher Imagem',
  circular = false,
  aspect = 1
}) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(currentImage);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  // Sync preview with currentImage prop
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione apenas imagens');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Read file and show crop modal if circular
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageDataUrl = reader.result as string;
      if (circular) {
        setImageToCrop(imageDataUrl);
        setShowCropModal(true);
      } else {
        // Direct upload without crop
        uploadImage(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setShowCropModal(false);
    
    // Convert blob to file
    const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(croppedFile);
    
    // Upload
    await uploadImage(croppedFile);
  };

  const uploadImage = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      onImageUploaded(data.url);
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
      setPreview(currentImage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <div className="image-upload">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading}
        />

        {preview ? (
          <div className={`image-preview ${circular ? 'circular' : ''}`}>
            <img src={preview} alt="Preview" />
            <button
              type="button"
              onClick={handleRemove}
              className="remove-button"
              disabled={uploading}
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="upload-button"
            disabled={uploading}
          >
            <Upload size={24} />
            <span>{uploading ? 'Enviando...' : label}</span>
          </button>
        )}
      </div>

      {showCropModal && (
        <ImageCropModal
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={() => setShowCropModal(false)}
          circular={circular}
          aspect={aspect}
        />
      )}
    </>
  );
};

export default ImageUpload;

