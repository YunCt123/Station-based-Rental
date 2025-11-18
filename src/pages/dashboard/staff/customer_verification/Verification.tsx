import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Search,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import {
  type PendingDocument,
  getPendingDocuments,
  approveDocument,
  getDocumentStatusColor,
} from '@/services/documentService';
import { OnlineDocumentSummaryModal } from '@/components/dashboard/staff/verify/DocumentSummary';

const Verification: React.FC = () => {
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<PendingDocument | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load pending documents and users cache on component mount
  useEffect(() => {
    console.log('🚀 Verification component mounted, loading data...');
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('🔍 Loading verification data...');
      
      // Just load pending documents - no need for user cache anymore
      await loadPendingDocuments();
    } catch (error: any) {
      console.error('❌ Error loading data:', error);
      const errorMessage = error.message || 'Failed to load data. Please try again.';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingDocuments = async () => {
    console.log('📥 Calling getPendingDocuments API...');
    const documents = await getPendingDocuments();
    console.log('✅ Received documents:', documents);
    setPendingDocuments(documents);
  };


  const handleApprove = async (userId: string) => {
    try {
      console.log('✅ Approving user:', userId);
      await approveDocument(userId, { status: 'APPROVED' });
      
      toast({
        title: 'User Verification Approved',
        description: 'User verification has been successfully approved.',
      });
      
      await loadPendingDocuments();
      setSelectedDocument(null);
    } catch (error: any) {
      console.error('❌ Error approving:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve user verification.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (userId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Rejection Reason Required',
        description: 'Please provide a reason for rejection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('❌ Rejecting user:', userId, 'Reason:', rejectionReason);
      await approveDocument(userId, { 
        status: 'REJECTED', 
        rejectionReason: rejectionReason 
      });
      
      toast({
        title: 'User Verification Rejected',
        description: 'User verification has been rejected with reason provided.',
      });
      
      await loadPendingDocuments();
      setSelectedDocument(null);
      setRejectionReason('');
    } catch (error: any) {
      console.error('❌ Error rejecting:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject user verification.',
        variant: 'destructive',
      });
    }
  };

  const getUserName = (doc: PendingDocument): string => {
    return doc.name || 'Unknown User';
  };

  const getUserEmail = (doc: PendingDocument): string => {
    return doc.email || 'No email';
  };

  const filteredDocuments = Array.isArray(pendingDocuments) ? pendingDocuments.filter(doc => {
    const userName = getUserName(doc);
    const userEmail = getUserEmail(doc);
    
    const matchesSearch = searchTerm === '' || 
      userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'ALL' || doc.verificationStatus === filterType;
    
    return matchesSearch && matchesType;
  }) : [];

  const getStatusIcon = (status: PendingDocument['verificationStatus']) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Verification Management</h1>
          <p className="text-muted-foreground">
            Review and approve user verification submissions
          </p>
        </div>
        <Button
          onClick={loadData}
          disabled={isLoading}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Documents List */}
        <div className="space-y-4">
          {/* Search and Filter */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, email, or document number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED')}
                    className="px-3 py-2 border rounded-lg bg-background"
                  >
                    <option value="ALL">All Users</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Pending User Verifications ({filteredDocuments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Error loading documents</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">{error}</p>
                  <Button
                    onClick={loadPendingDocuments}
                    size="sm"
                    className="mt-2"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              )}
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading pending documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No pending user verifications found</p>
                  <p className="text-sm">All verifications have been processed or no submissions yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedDocument?._id === doc._id ? 'border-primary bg-muted/30' : ''
                      }`}
                      onClick={() => {
                        setSelectedDocument(doc);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                           <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {doc.verificationStatus || 'PENDING'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ID: {doc._id.slice(-8)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            
                            <span className="font-medium">
                              {getUserName(doc)}
                            </span>
                            {getStatusIcon(doc.verificationStatus)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getUserEmail(doc)}
                          </p>
                          {/* <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {doc.verificationStatus || 'PENDING'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              ID: {doc._id.slice(-8)}
                            </span>
                          </div> */}
                          {/* Show available verification images */}
                          <div className="flex gap-1 mt-2">
                            {doc.idCardFront && (
                              <Badge variant="secondary" className="text-xs">ID Front</Badge>
                            )}
                            {doc.idCardBack && (
                              <Badge variant="secondary" className="text-xs">ID Back</Badge>
                            )}
                            {doc.driverLicense && (
                              <Badge variant="secondary" className="text-xs">License</Badge>
                            )}
                            {doc.selfiePhoto && (
                              <Badge variant="secondary" className="text-xs">Selfie</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-xs text-muted-foreground text-right">
                            <p>{doc.verifiedAt ? new Date(doc.verifiedAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Modal for selected document */}
        {selectedDocument && (
          <OnlineDocumentSummaryModal
            document={selectedDocument}
            userName={getUserName(selectedDocument)}
            userEmail={getUserEmail(selectedDocument)}
            onApprove={() => handleApprove(selectedDocument._id)}
            onReject={() => handleReject(selectedDocument._id)}
            rejectionReason={rejectionReason}
            setRejectionReason={setRejectionReason}
            getDocumentStatusColor={getDocumentStatusColor}
            isOpen={true}
            onClose={() => setSelectedDocument(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Verification;