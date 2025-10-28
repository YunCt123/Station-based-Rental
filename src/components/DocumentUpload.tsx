import React, { useState } from 'react';
import { Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentUploadProps {
  title: string;
  description: string;
  onUpload: (file: File) => void;
  isUploading?: boolean;
  existingImageUrl?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  title, 
  description, 
  onUpload, 
  isUploading = false,
  existingImageUrl 
}) => {
  const [isImageVisible, setIsImageVisible] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  if (existingImageUrl) {
    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              {title}
              <span className="ml-2 text-green-600">✓ Uploaded</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsImageVisible(!isImageVisible)}
              className="p-2"
            >
              {isImageVisible ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {isImageVisible ? (
              <img 
                src={existingImageUrl} 
                alt={title}
                className="w-full max-w-md h-48 object-cover border rounded-lg"
              />
            ) : (
              <div className="w-full max-w-md h-48 bg-gray-100 border rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Click the eye icon to view image</p>
                </div>
              </div>
            )}
            <label htmlFor={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}>
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Replace Image
                </span>
              </Button>
            </label>
            <input
              id={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleFileChange}
              className="hidden"
              disabled={isUploading}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{description}</p>
          <label htmlFor={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}>
            <Button 
              variant="outline" 
              className="w-full"
              disabled={isUploading}
              asChild
            >
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Choose File'}
              </span>
            </Button>
          </label>
          <input
            id={`file-${title.replace(/\s+/g, '-').toLowerCase()}`}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          <p className="text-xs text-gray-500">
            Accepted formats: JPG, PNG, PDF (max 5MB)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;