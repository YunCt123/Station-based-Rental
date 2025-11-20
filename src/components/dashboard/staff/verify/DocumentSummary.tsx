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
import { type PendingDocument } from '@/services/documentService';

interface OnlineDocumentSummaryProps {
  document: PendingDocument;
  userName: string;
  userEmail: string;
  onApprove: () => void;
  onReject: () => void;
  rejectionReason: string;
  setRejectionReason: (reason: string) => void;
  getDocumentStatusColor: (status: PendingDocument['verificationStatus']) => string;
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
          {/*<div>
            <p className="text-sm font-medium">Document Type</p>
            <Badge variant="outline">
              {getDocumentTypeLabel(document.type)}
            </Badge>
          </div>*/}
          {/*document.number && ( (
            <div>
              <p className="text-sm font-medium">Document Number</p>
              <p className="text-muted-foreground">{document.number}</p>
            </div>
          )*/}
          <div>
            <p className="text-sm font-medium">Status</p>
            <Badge className={getDocumentStatusColor(document.verificationStatus)}>
              {document.verificationStatus}
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
                src={document.idCardFront || '/placeholder-document.png'}
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
                onClick={() => window.open(document.idCardFront || '', '_blank')}
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
  getDocumentStatusColor: (status: PendingDocument['verificationStatus']) => string;
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
  getDocumentStatusColor: _getDocumentStatusColor,
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
            <User className="h-5 w-5" />
            User Verification Review
          </DialogTitle>
        </DialogHeader>
        
        {/* Layout ngang: Left = Images, Right = Info */}
        <div className="grid grid-cols-2 gap-6 overflow-y-auto max-h-[calc(85vh-8rem)] pr-2">
          {/* Left Column - Verification Images */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-muted-foreground">Verification Images</h3>
            <div className="space-y-4">
              {/* ID Card Front */}
              {document.idCardFront && (
                <div className="relative border rounded-lg overflow-hidden bg-muted">
                  <div className="text-xs font-medium p-2 bg-blue-50 border-b">ID Card (Front)</div>
                  <img
                    src={document.idCardFront}
                    alt="ID Card Front"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-document.png';
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-8 right-2"
                    onClick={() => window.open(document.idCardFront, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* ID Card Back */}
              {document.idCardBack && (
                <div className="relative border rounded-lg overflow-hidden bg-muted">
                  <div className="text-xs font-medium p-2 bg-blue-50 border-b">ID Card (Back)</div>
                  <img
                    src={document.idCardBack}
                    alt="ID Card Back"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-document.png';
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-8 right-2"
                    onClick={() => window.open(document.idCardBack, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Driver License */}
              {document.driverLicense && (
                <div className="relative border rounded-lg overflow-hidden bg-muted">
                  <div className="text-xs font-medium p-2 bg-green-50 border-b">Driver License</div>
                  <img
                    src={document.driverLicense}
                    alt="Driver License"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-document.png';
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-8 right-2"
                    onClick={() => window.open(document.driverLicense, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* Selfie Photo */}
              {document.selfiePhoto && (
                <div className="relative border rounded-lg overflow-hidden bg-muted">
                  <div className="text-xs font-medium p-2 bg-purple-50 border-b">Selfie Photo</div>
                  <img
                    src={document.selfiePhoto}
                    alt="Selfie Photo"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-document.png';
                    }}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-8 right-2"
                    onClick={() => window.open(document.selfiePhoto, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
              )}
              
              {/* No images available */}
              {!document.idCardFront && !document.idCardBack && !document.driverLicense && !document.selfiePhoto && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No verification images uploaded yet</p>
                </div>
              )}
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

            {/* User Verification Details */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">Verification Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Verification Status</p>
                  <Badge variant="outline" className="mt-1">
                    {document.verificationStatus}
                  </Badge>
                </div>
                {document.phoneNumber && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Phone Number</p>
                    <p className="font-medium mt-1 text-sm">{document.phoneNumber}</p>
                  </div>
                )}
                {document.dateOfBirth && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Date of Birth</p>
                    <p className="font-medium mt-1 text-sm">
                      {new Date(document.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-medium text-muted-foreground">Account Verified</p>
                  <Badge className={`mt-1 ${document.isVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {document.isVerified ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {document.verifiedAt && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Upload Date</p>
                    <p className="font-medium mt-1 text-sm">
                      {new Date(document.verifiedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              {/* Rejection Reason if exists */}
              {document.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-medium text-red-800 mb-1">Previous Rejection Reason</p>
                  <p className="text-sm text-red-700">{document.rejectionReason}</p>
                </div>
              )}
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
