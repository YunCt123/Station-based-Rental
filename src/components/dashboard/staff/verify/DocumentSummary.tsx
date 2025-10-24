import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { FileText, User, Eye, CheckCircle, XCircle } from 'lucide-react';
import { type PendingDocument, type Document } from '@/services/documentService';

interface OnlineDocumentSummaryProps {
  document: PendingDocument;
  userName: string;
  userEmail: string;
  onApprove: () => void;
  onReject: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  getDocumentStatusColor: (status: Document['status']) => string;
  getDocumentTypeLabel: (type: Document['type']) => string;
}

export const OnlineDocumentSummary: React.FC<OnlineDocumentSummaryProps> = ({
  document,
  userName,
  userEmail,
  onApprove,
  onReject,
  rejectionReason,
  setRejectionReason,
  getDocumentStatusColor,
  getDocumentTypeLabel,
}) => {
  return (
    <>
      {/* Document Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Customer</p>
            <p className="text-muted-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground">{userEmail}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Document Type</p>
            <Badge variant="outline">
              {getDocumentTypeLabel(document.type)}
            </Badge>
          </div>
          {document.number && (
            <div>
              <p className="text-sm font-medium">Document Number</p>
              <p className="text-muted-foreground">{document.number}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium">Status</p>
            <Badge className={getDocumentStatusColor(document.status)}>
              {document.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Document Image Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Document Image
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative border rounded-lg overflow-hidden">
              <img
                src={document.image_url}
                alt="Document"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-document.png';
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => window.open(document.image_url, '_blank')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Full Size
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Actions Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Verification Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Rejection Reason (if rejecting)
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-3 py-2 border rounded-lg resize-none h-20"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onApprove}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={onReject}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Modal version with full functionality
export const OnlineDocumentSummaryModal: React.FC<{
  document: PendingDocument;
  userName: string;
  userEmail: string;
  getDocumentStatusColor: (status: Document['status']) => string;
  getDocumentTypeLabel: (type: Document['type']) => string;
  onApprove?: () => void;
  onReject?: () => void;
  rejectionReason?: string;
  setRejectionReason?: (reason: string) => void;
  isOpen?: boolean;
  onClose?: () => void;
  trigger?: React.ReactNode;
}> = ({
  document,
  userName,
  userEmail,
  getDocumentStatusColor,
  getDocumentTypeLabel,
  onApprove,
  onReject,
  rejectionReason = '',
  setRejectionReason,
  isOpen,
  onClose,
  trigger,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-6xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Summary
          </DialogTitle>
        </DialogHeader>
        
        {/* Layout ngang: Left = Image, Right = Info */}
        <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(85vh-8rem)] pr-2">
          {/* Left Column - Document Image */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Document Image</h3>
            <div className="relative border rounded-lg overflow-hidden bg-muted">
              <img
                src={document.image_url}
                alt="Document"
                className="w-full h-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-document.png';
                }}
              />
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => window.open(document.image_url, '_blank')}
              >
                <Eye className="h-4 w-4 mr-1" />
                Full Size
              </Button>
            </div>
          </div>

          {/* Right Column - Customer Info & Details */}
          <div className="space-y-4">
            {/* Customer Info */}
            <div className="space-y-2 p-4 bg-muted/30 rounded-lg">
              <h3 className="font-semibold text-sm text-muted-foreground">Customer</h3>
              <div>
                <p className="font-medium text-lg">{userName}</p>
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              </div>
            </div>

            {/* Document Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Document Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Document Type</p>
                  <Badge variant="outline" className="mt-1">
                    {getDocumentTypeLabel(document.type)}
                  </Badge>
                </div>
                {document.number && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Document Number</p>
                    <p className="font-medium mt-1 text-sm">{document.number}</p>
                  </div>
                )}
                {document.expiry && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Expiry Date</p>
                    <p className="font-medium mt-1 text-sm">
                      {new Date(document.expiry).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Status</p>
                  <Badge className={`${getDocumentStatusColor(document.status)} mt-1`}>
                    {document.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Upload Date</p>
                  <p className="font-medium mt-1 text-sm">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Verification Actions - Only show if handlers are provided */}
            {(onApprove || onReject) && (
              <div className="space-y-3 border-t pt-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Verification Actions</h3>
                
                {/* Rejection Reason */}
                {setRejectionReason && (
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">
                      Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection..."
                      className="w-full px-3 py-2 text-sm border rounded-lg resize-none h-16"
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {onApprove && (
                    <Button
                      onClick={onApprove}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      onClick={onReject}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
