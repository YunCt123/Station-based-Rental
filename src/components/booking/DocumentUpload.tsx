import React from "react";
import { Card, Space, Upload, Typography } from "antd";
import {
  IdentificationIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import type { UploadProps } from "antd/es/upload/interface";

const { Paragraph } = Typography;

interface DocumentUploadProps {
  title: string;
  description: string;
  uploadProps: UploadProps;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  description,
  uploadProps,
}) => {
  return (
    <Card
      className="mb-4"
      title={
        <Space>
          <IdentificationIcon className="h-5 w-5" />
          <span>{title}</span>
        </Space>
      }
    >
      <Paragraph className="text-xs text-gray-600 mb-3">
        {description}
      </Paragraph>

      <Upload.Dragger {...uploadProps} listType="picture" className="mb-4">
        <p className="ant-upload-drag-icon">
          <CloudArrowUpIcon className="h-10 w-10 mx-auto text-gray-400" />
        </p>
        <p className="ant-upload-text">
          Click or drag file to this area to upload
        </p>
        <p className="ant-upload-hint">
          Support for a single file upload. Only JPG, PNG, or PDF.
        </p>
      </Upload.Dragger>
    </Card>
  );
};

export default DocumentUpload;
