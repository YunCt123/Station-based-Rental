import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  uploadDocument,
  getUserDocuments,
  validateDocumentFile,
  type Document,
  type DocumentUpload,
} from "@/services/documentService";

const DriverLicense = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingType, setUploadingType] = useState<string>("");
  
  const [driverLicenseNumber, setDriverLicenseNumber] = useState("");
  const [driverLicenseExpiry, setDriverLicenseExpiry] = useState("");
  const [idCardNumber, setIdCardNumber] = useState("");
  const [idCardExpiry, setIdCardExpiry] = useState("");

  const driverLicenseInputRef = useRef<HTMLInputElement>(null);
  const idCardFrontInputRef = useRef<HTMLInputElement>(null);
  const idCardBackInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const docs = await getUserDocuments();
      setDocuments(docs);
      
      const driverLicense = docs.find(d => d.type === "DRIVER_LICENSE");
      if (driverLicense) {
        setDriverLicenseNumber(driverLicense.number || "");
        setDriverLicenseExpiry(driverLicense.expiry || "");
      }
      
      const idCard = docs.find(d => d.type === "ID_CARD_FRONT");
      if (idCard) {
        setIdCardNumber(idCard.number || "");
        setIdCardExpiry(idCard.expiry || "");
      }
    } catch (error: any) {
      console.error("Failed to load documents:", error);
      toast({
        title: "Error",
        description: "Failed to load documents. Please refresh the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (_type: Document["type"], inputRef: React.RefObject<HTMLInputElement | null>) => {
    inputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    type: Document["type"]
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateDocumentFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid file",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    let number = "";
    let expiry = "";
    
    if (type === "DRIVER_LICENSE") {
      if (!driverLicenseNumber.trim()) {
        toast({
          title: "Document number required",
          description: "Please enter your driver license number before uploading",
          variant: "destructive",
        });
        return;
      }
      if (!driverLicenseExpiry) {
        toast({
          title: "Expiry date required",
          description: "Please enter the expiry date before uploading",
          variant: "destructive",
        });
        return;
      }
      number = driverLicenseNumber;
      expiry = driverLicenseExpiry;
    } else {
      if (!idCardNumber.trim()) {
        toast({
          title: "ID card number required",
          description: "Please enter your ID card number before uploading",
          variant: "destructive",
        });
        return;
      }
      if (!idCardExpiry) {
        toast({
          title: "Expiry date required",
          description: "Please enter the expiry date before uploading",
          variant: "destructive",
        });
        return;
      }
      number = idCardNumber;
      expiry = idCardExpiry;
    }

    setUploadingType(getDocumentLabel(type));

    try {
      const documentData: DocumentUpload = {
        type,
        file,
        number,
        expiry,
      };

      const result = await uploadDocument(documentData);
      
      setDocuments((prev) => {
        const filtered = prev.filter((doc) => doc.type !== type);
        return [...filtered, result];
      });

      toast({
        title: "Upload successful",
        description: `${getDocumentLabel(type)} has been uploaded and is pending verification`,
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload document. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingType("");
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const getDocumentLabel = (type: Document["type"]) => {
    switch (type) {
      case "DRIVER_LICENSE":
        return "Driver License";
      case "ID_CARD_FRONT":
        return "ID Card (Front)";
      case "ID_CARD_BACK":
        return "ID Card (Back)";
    }
  };

  const getDocument = (type: Document["type"]) => {
    return documents.find((doc) => doc.type === type);
  };

  const getStatusBadge = (status: Document["status"]) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            APPROVED
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            PENDING
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            REJECTED
          </Badge>
        );
    }
  };

  const renderDocumentCard = (
    type: Document["type"],
    title: string,
    inputRef: React.RefObject<HTMLInputElement | null>,
    numberValue: string,
    setNumberValue: (val: string) => void,
    expiryValue: string,
    setExpiryValue: (val: string) => void
  ) => {
    const doc = getDocument(type);
    const isUploaded = !!doc;
    const isUploading = uploadingType === getDocumentLabel(type);

    return (
      <div className="border rounded-lg p-4 bg-white relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-gray-500" />
            <h3 className="font-medium text-sm">{title}</h3>
          </div>
          {isUploaded && getStatusBadge(doc.status)}
        </div>

        <div className="mb-4">
          {!isUploaded ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">No document uploaded yet</p>
            </div>
          ) : (
            <div className="relative rounded-lg overflow-hidden bg-gray-100">
              <img
                src={doc.image_url}
                alt={title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}
        </div>

        {isUploaded && (
          <div className="space-y-2 mb-4">
            <div>
              <Label className="text-xs text-gray-500">Document Number</Label>
              <p className="text-sm font-medium">{doc.number}</p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Expiry Date</Label>
              <p className="text-sm font-medium">
                {doc.expiry ? new Date(doc.expiry).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <Label className="text-xs text-gray-500">Uploaded On</Label>
              <p className="text-sm font-medium">
                {new Date(doc.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        )}

        {(!isUploaded || doc?.status === "REJECTED") && (
          <div className="space-y-3 mb-4">
            <div>
              <Label htmlFor={`${type}-number`} className="text-sm">
                Document Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`${type}-number`}
                value={numberValue}
                onChange={(e) => setNumberValue(e.target.value)}
                placeholder="Enter document number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`${type}-expiry`} className="text-sm">
                Expiry Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id={`${type}-expiry`}
                type="date"
                value={expiryValue}
                onChange={(e) => setExpiryValue(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
        )}

        <Button
          onClick={() => handleFileSelect(type, inputRef)}
          disabled={isUploading || isLoading}
          variant="outline"
          className="w-full"
        >
          {isUploading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {isUploaded ? "Re-upload" : "Upload Document"}
            </>
          )}
        </Button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          onChange={(e) => handleFileUpload(e, type)}
          className="hidden"
        />
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading documents...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">License Verification</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Upload your identity documents for verification. All documents must be clear, valid, and not expired.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-900">
                Document Requirements
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                <li>Images must be clear and readable</li>
                <li>All corners of the document must be visible</li>
                <li>File size should not exceed 5MB</li>
                <li>Accepted formats: JPG, PNG, PDF</li>
                <li>Documents must be valid and not expired</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderDocumentCard(
            "DRIVER_LICENSE",
            "Driver License",
            driverLicenseInputRef,
            driverLicenseNumber,
            setDriverLicenseNumber,
            driverLicenseExpiry,
            setDriverLicenseExpiry
          )}
          {renderDocumentCard(
            "ID_CARD_FRONT",
            "ID Card (Front)",
            idCardFrontInputRef,
            idCardNumber,
            setIdCardNumber,
            idCardExpiry,
            setIdCardExpiry
          )}
          {renderDocumentCard(
            "ID_CARD_BACK",
            "ID Card (Back)",
            idCardBackInputRef,
            idCardNumber,
            setIdCardNumber,
            idCardExpiry,
            setIdCardExpiry
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DriverLicense;
