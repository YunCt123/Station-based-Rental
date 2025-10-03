import React from "react";
import { Card } from "antd";

// Define upload guidelines
export const UPLOAD_GUIDELINES = [
  "Ensure documents are clear and all text is readable",
  "Upload high-resolution images in JPEG/PNG formats",
  "Documents must be valid and not expired",
  "Acceptable ID cards: valid current and government-issued",
  "File size should not exceed 5MB per document",
  "Supported formats: JPG, PNG, PDF",
];

const UploadGuidelines: React.FC = () => {
  return (
    <Card className="mb-4" title="Upload Guidelines">
      <ul className="text-xs text-gray-600 space-y-2 list-disc pl-5">
        {UPLOAD_GUIDELINES.map((guideline, index) => (
          <li key={index}>{guideline}</li>
        ))}
      </ul>
    </Card>
  );
};

export default UploadGuidelines;
