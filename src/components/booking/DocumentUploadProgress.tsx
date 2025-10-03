import React from "react";
import { Card, Space, Progress, Typography } from "antd";
import { DocumentTextIcon } from "@heroicons/react/24/outline";

const { Text } = Typography;

interface DocumentUploadProgressProps {
  uploadStatus: { [key: string]: string };
}

const DocumentUploadProgress: React.FC<DocumentUploadProgressProps> = ({
  uploadStatus,
}) => {
  // Calculate upload progress percentage
  const getUploadProgress = () => {
    const uploadedDocs = Object.values(uploadStatus).filter(
      (status) => status === "success"
    ).length;
    return (uploadedDocs / 3) * 100;
  };

  return (
    <Card
      className="mb-4"
      title={
        <Space>
          <DocumentTextIcon className="h-5 w-5" />
          <span>Document Upload Progress</span>
        </Space>
      }
    >
      <Space className="mb-2">
        <Text
          type="warning"
          className="bg-warning-100 text-warning-800 py-1 px-2 rounded text-xs"
        >
          {`${
            Object.values(uploadStatus).filter((status) => status === "success")
              .length
          }/3 documents uploaded`}
        </Text>
      </Space>
      <Progress percent={getUploadProgress()} showInfo={false} />
    </Card>
  );
};

export default DocumentUploadProgress;
