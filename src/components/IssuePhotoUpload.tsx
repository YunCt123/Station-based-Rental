import React, { useState, useRef } from 'react';
import { PlusIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { uploadIssuePhotos, validateFiles } from '@/services/uploadService';

interface IssuePhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
  className?: string;
}

const IssuePhotoUpload: React.FC<IssuePhotoUploadProps> = ({
  photos,
  onChange,
  maxPhotos = 5,
  disabled = false,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Validate files
    const validation = validateFiles(fileArray);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    // Check if total photos would exceed limit
    if (photos.length + fileArray.length > maxPhotos) {
      alert(`Tối đa ${maxPhotos} ảnh được cho phép`);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress (real progress would come from upload service)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const uploadedPhotos = await uploadIssuePhotos(fileArray);
      const photoUrls = uploadedPhotos.map(photo => photo.url);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add new photos to existing ones
      onChange([...photos, ...photoUrls]);

      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 500);

    } catch (error) {
      console.error('Upload failed:', error);
      alert(`Lỗi upload: ${error}`);
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removePhoto = (indexToRemove: number) => {
    const newPhotos = photos.filter((_, index) => index !== indexToRemove);
    onChange(newPhotos);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (!disabled && !uploading) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !uploading) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const openFileDialog = () => {
    if (!disabled && !uploading && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const canAddMore = photos.length < maxPhotos && !disabled && !uploading;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
            ${dragOver 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          
          {uploading ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Đang upload ảnh...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{uploadProgress}%</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-gray-900 mb-1">
                Kéo thả ảnh vào đây hoặc bấm để chọn
              </p>
              <p className="text-xs text-gray-500">
                Tối đa {maxPhotos} ảnh, mỗi ảnh tối đa 5MB (JPG, PNG)
              </p>
            </>
          )}
        </div>
      )}

      {/* Progress Bar when uploading */}
      {uploading && (
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
            <span className="text-sm">Đang upload {uploadProgress}%...</span>
          </div>
        </div>
      )}

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Ảnh đã chọn ({photos.length}/{maxPhotos})
            </h4>
            {canAddMore && (
              <button
                onClick={openFileDialog}
                className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Thêm ảnh</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {photos.map((photoUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={photoUrl}
                    alt={`Ảnh ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.png';
                    }}
                  />
                </div>
                
                {/* Remove button */}
                {!disabled && !uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePhoto(index);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
                
                {/* Photo number badge */}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Ảnh sẽ được nén tự động để tối ưu tốc độ upload</p>
        <p>• Khuyến nghị chụp ảnh rõ nét, đầy đủ ánh sáng</p>
        <p>• Hỗ trợ định dạng: JPEG, PNG</p>
      </div>
    </div>
  );
};

export default IssuePhotoUpload;