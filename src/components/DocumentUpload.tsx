import React from 'react';
import { Upload } from 'lucide-react';
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
          <CardTitle className="flex items-center text-sm">
            {title}
            <span className="ml-2 text-green-600">✓ Uploaded</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <img 
              src={existingImageUrl} 
              alt={title}
              className="w-full max-w-md h-48 object-cover border rounded-lg"
            />
            <p className="text-sm text-gray-600">{description}</p>
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