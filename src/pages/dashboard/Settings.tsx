import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Shield,
  FileText,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import DocumentUpload from "@/components/DocumentUpload";
import { userService } from "@/services/userService";

const Settings = () => {
  const { t, language, setLanguage } = useTranslation();
  const {
    profile,
    verificationStatus,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
  } = useUserProfile();

  const { toast } = useToast();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [notifications, setNotifications] = useState({
    emailBooking: true,
    emailPromotions: false,
    smsReminders: true,
    pushNotifications: true,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [imageVisibility, setImageVisibility] = useState({
    driverLicense: false,
    idCardFront: false,
    idCardBack: false,
    selfiePhoto: false,
  });

  const toggleImageVisibility = (documentType: keyof typeof imageVisibility) => {
    setImageVisibility(prev => ({
      ...prev,
      [documentType]: !prev[documentType]
    }));
  };

  const validateForm = (data: {
    name?: string;
    phone?: string;
    dateOfBirth?: string;
    licenseNumber?: string;
    licenseExpiry?: string;
    licenseClass?: string;
  }) => {
    const errors: Record<string, string> = {};

    if (!data.name || data.name.trim() === "") {
      errors.name = "Name is required";
    }

    if (
      data.phone &&
      data.phone.trim() !== "" &&
      !/^[\d\s+\-()]+$/.test(data.phone)
    ) {
      errors.phone = "Invalid phone number format";
    }

    if (data.dateOfBirth && new Date(data.dateOfBirth) > new Date()) {
      errors.dateOfBirth = "Date of birth cannot be in the future";
    }

    return errors;
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      setValidationErrors({});

      // Get form values
      const name = (document.getElementById("name") as HTMLInputElement)?.value;
      const phone = (document.getElementById("phone") as HTMLInputElement)
        ?.value;
      const dateOfBirth = (
        document.getElementById("dateOfBirth") as HTMLInputElement
      )?.value;
      const licenseNumber = (
        document.getElementById("licenseNumber") as HTMLInputElement
      )?.value;
      const licenseExpiry = (
        document.getElementById("licenseExpiry") as HTMLInputElement
      )?.value;
      const licenseClass = (
        document.getElementById("licenseClass") as HTMLInputElement
      )?.value;

      // Validate form
      const formData = {
        name,
        phone,
        dateOfBirth,
        licenseNumber,
        licenseExpiry,
        licenseClass,
      };
      const errors = validateForm(formData);

      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        toast({
          title: "Validation Error",
          description: "Please fix the errors in the form",
          variant: "destructive",
        });
        return;
      }

      // Update profile - split name into firstName and lastName for backend
      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      await updateProfile({
        firstName,
        lastName,
        phone,
        dateOfBirth,
        licenseNumber,
        licenseExpiry,
        licenseClass,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (err) {
      console.error("💥 Failed to update profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDocumentUpload = async (
    file: File,
    documentType: "Driver License" | "Card Front" | "Card Back" | "Selfie Photo"
  ) => {
    try {
      setIsUploadingDoc(true);

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Only JPEG and PNG files are allowed');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size must be less than 5MB');
      }

      console.log(`📁 Uploading ${documentType}:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Convert file to base64 data URL (keep the full data URI format)
      const base64DataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            // Keep the full data URL format: data:image/jpeg;base64,xxxxx
            resolve(reader.result);
          } else {
            reject(new Error('Failed to read file as base64'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });

      console.log(`✅ Base64 data URL conversion complete:`, {
        documentType,
        dataUrlLength: base64DataUrl.length,
        preview: base64DataUrl.substring(0, 50) + '...',
        hasDataPrefix: base64DataUrl.startsWith('data:')
      });

      // Map document type to correct backend field name
      const fieldMapping = {
        "Driver License": "driverLicense",
        "Card Front": "idCardFront", 
        "Card Back": "idCardBack",
        "Selfie Photo": "selfiePhoto"
      };
      
      const fieldName = fieldMapping[documentType];
      if (!fieldName) {
        throw new Error(`Invalid document type: ${documentType}`);
      }

      // Upload full data URL to server
      const uploadData = { [fieldName]: base64DataUrl };
      console.log(`🔄 Uploading to backend with field name:`, fieldName, {
        uploadDataKeys: Object.keys(uploadData),
        fieldName
      });
      
      await userService.uploadVerificationImages(uploadData);

      console.log(`🚀 Upload successful for ${documentType}`);

      // Refresh verification status
      await refreshProfile();

      toast({
        title: "Success",
        description: `${documentType} uploaded successfully!`,
      });
    } catch (error: unknown) {
      console.error("Document upload error:", error);
      
      let errorMessage = "Failed to upload document. Please try again.";
      const err = error as { message?: string; response?: { data?: { message?: string } } };
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const getVerificationStatusIcon = () => {
    if (!verificationStatus) return <Clock className="h-4 w-4 text-gray-500" />;

    // Check if all required documents are uploaded
    const hasAllDocuments = verificationStatus.hasImages?.driverLicense && 
                           verificationStatus.hasImages?.idCardFront && 
                           verificationStatus.hasImages?.idCardBack && 
                           verificationStatus.hasImages?.selfiePhoto;

    switch (verificationStatus.verificationStatus) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        // Only show pending if ALL 4 documents uploaded (ignore BE PENDING status if incomplete)
        if (hasAllDocuments) {
          return <Clock className="h-4 w-4 text-yellow-500" />;
        }
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVerificationStatusText = () => {
    if (!verificationStatus) return "Not verified";

    // Check if all required documents are uploaded
    const hasAllDocuments = verificationStatus.hasImages?.driverLicense && 
                           verificationStatus.hasImages?.idCardFront && 
                           verificationStatus.hasImages?.idCardBack && 
                           verificationStatus.hasImages?.selfiePhoto;

    switch (verificationStatus.verificationStatus) {
      case "APPROVED":
        return "Verified";
      case "REJECTED":
        return "Verification rejected";
      default:
        // Only show "Pending review" if ALL 4 documents uploaded (ignore BE PENDING status if incomplete)
        if (hasAllDocuments) {
          return "Pending review";
        }
        return "Not verified";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
            {t("settings.title")}
          </h1>
          <p className="text-xl text-black/90 mb-8 max-w-2xl mx-auto">
            {t("settings.subtitle")}
          </p>
        </div>
      </div> */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
            {/* <TabsTrigger value="documents">Documents</TabsTrigger> */}
            <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
            {/* <TabsTrigger value="notifications">
              {t("settings.notifications")}
            </TabsTrigger> */}
            <TabsTrigger value="billing">{t("settings.billing")}</TabsTrigger>
            <TabsTrigger value="language">{t("settings.language")}</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {t("settings.personalInfo")}
                  <div className="ml-auto flex items-center space-x-2">
                    {getVerificationStatusIcon()}
                    <span className="text-sm font-normal">
                      {getVerificationStatusText()}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Loading profile...</span>
                  </div>
                ) : profile ? (
                  <>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          defaultValue={`${profile.firstName} ${profile.lastName}`.trim()}
                          className={`text-black ${
                            validationErrors.name ? "border-red-500" : ""
                          }`}
                        />
                        {validationErrors.name && (
                          <p className="text-sm text-red-500 mt-1">
                            {validationErrors.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">{t("settings.email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        defaultValue={profile.email}
                        className="text-black"
                        disabled
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Email cannot be changed
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="phone">{t("settings.phone")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        defaultValue={profile.phone}
                        className={`text-black ${
                          validationErrors.phone ? "border-red-500" : ""
                        }`}
                        placeholder="Enter phone number"
                      />
                      {validationErrors.phone && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">
                        {t("settings.dateOfBirth")}
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        defaultValue={profile.dateOfBirth}
                        className={`text-black ${
                          validationErrors.dateOfBirth ? "border-red-500" : ""
                        }`}
                      />
                      {validationErrors.dateOfBirth && (
                        <p className="text-sm text-red-500 mt-1">
                          {validationErrors.dateOfBirth}
                        </p>
                      )}
                    </div>

                    <Separator />

                    <div>
                      {/* Document Upload/View Section */}
                      <div className="space-y-4">
                        <h4 className="font-medium">Verification Documents</h4>

                        {verificationStatus?.verificationStatus ===
                        "APPROVED" ? (
                          // Show verified documents (read-only view)
                          <div className="space-y-4">
                            {/* <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center mb-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-green-800 font-medium">
                                  Your documents have been verified
                                </span>
                              </div>
                              <p className="text-sm text-green-700">
                                All your verification documents have been
                                approved. You can now make bookings without
                                restrictions.
                              </p>
                            </div> */}

                            {/* Display verified documents */}
                            {profile.driverLicense && (
                              <Card className="mb-4">
                                <CardHeader>
                                  <CardTitle className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      Driver's License
                                      <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleImageVisibility('driverLicense')}
                                      className="p-2"
                                    >
                                      {imageVisibility.driverLicense ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {imageVisibility.driverLicense ? (
                                    <img
                                      src={profile.driverLicense}
                                      alt="Driver's License"
                                      className="w-full max-w-md h-48 object-cover border rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full max-w-md h-48 bg-gray-100 border rounded-lg flex items-center justify-center">
                                      <div className="text-center text-gray-500">
                                        <Eye className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Click the eye icon to view document</p>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            {profile.idCardFront && (
                              <Card className="mb-4">
                                <CardHeader>
                                  <CardTitle className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      National ID - Front
                                      <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleImageVisibility('idCardFront')}
                                      className="p-2"
                                    >
                                      {imageVisibility.idCardFront ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {imageVisibility.idCardFront ? (
                                    <img
                                      src={profile.idCardFront}
                                      alt="National ID Front"
                                      className="w-full max-w-md h-48 object-cover border rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full max-w-md h-48 bg-gray-100 border rounded-lg flex items-center justify-center">
                                      <div className="text-center text-gray-500">
                                        <Eye className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Click the eye icon to view document</p>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            {profile.idCardBack && (
                              <Card className="mb-4">
                                <CardHeader>
                                  <CardTitle className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      National ID - Back
                                      <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleImageVisibility('idCardBack')}
                                      className="p-2"
                                    >
                                      {imageVisibility.idCardBack ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {imageVisibility.idCardBack ? (
                                    <img
                                      src={profile.idCardBack}
                                      alt="National ID Back"
                                      className="w-full max-w-md h-48 object-cover border rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full max-w-md h-48 bg-gray-100 border rounded-lg flex items-center justify-center">
                                      <div className="text-center text-gray-500">
                                        <Eye className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Click the eye icon to view document</p>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}

                            {profile.selfiePhoto && (
                              <Card className="mb-4">
                                <CardHeader>
                                  <CardTitle className="flex items-center justify-between text-sm">
                                    <div className="flex items-center">
                                      Selfie Photo
                                      <CheckCircle className="ml-2 h-4 w-4 text-green-600" />
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleImageVisibility('selfiePhoto')}
                                      className="p-2"
                                    >
                                      {imageVisibility.selfiePhoto ? (
                                        <EyeOff className="w-4 h-4" />
                                      ) : (
                                        <Eye className="w-4 h-4" />
                                      )}
                                    </Button>
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  {imageVisibility.selfiePhoto ? (
                                    <img
                                      src={profile.selfiePhoto}
                                      alt="Selfie Photo"
                                      className="w-full max-w-md h-48 object-cover border rounded-lg"
                                    />
                                  ) : (
                                    <div className="w-full max-w-md h-48 bg-gray-100 border rounded-lg flex items-center justify-center">
                                      <div className="text-center text-gray-500">
                                        <Eye className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-sm">Click the eye icon to view document</p>
                                      </div>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        ) : (
                          // Show upload forms (for pending/rejected/not started)
                          <div className="space-y-4">
                            {verificationStatus?.verificationStatus ===
                              "REJECTED" && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center mb-2">
                                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                  <span className="text-red-800 font-medium">
                                    Verification Rejected
                                  </span>
                                </div>
                                <p className="text-sm text-red-700 mb-2">
                                  {verificationStatus.rejectionReason ||
                                    "Your documents were rejected. Please upload new documents."}
                                </p>
                                <p className="text-sm text-red-600">
                                  Please upload new documents to complete
                                  verification.
                                </p>
                              </div>
                            )}

                            {(() => {
                              // Check if all required documents are uploaded
                              const hasAllDocuments = verificationStatus?.hasImages?.driverLicense && 
                                                     verificationStatus?.hasImages?.idCardFront && 
                                                     verificationStatus?.hasImages?.idCardBack && 
                                                     verificationStatus?.hasImages?.selfiePhoto;

                              // Debug logging
                              console.log('🔍 Verification status debug:', {
                                verificationStatus: verificationStatus?.verificationStatus,
                                hasImages: verificationStatus?.hasImages,
                                hasAllDocuments,
                                individual: {
                                  driverLicense: verificationStatus?.hasImages?.driverLicense,
                                  idCardFront: verificationStatus?.hasImages?.idCardFront,
                                  idCardBack: verificationStatus?.hasImages?.idCardBack,
                                  selfiePhoto: verificationStatus?.hasImages?.selfiePhoto
                                }
                              });

                              // Show pending message ONLY if all 4 documents are uploaded (ignore BE status if incomplete)
                              if (hasAllDocuments && verificationStatus?.verificationStatus !== "REJECTED") {
                                return (
                                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center mb-2">
                                      <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                                      <span className="text-yellow-800 font-medium">
                                        Pending Review
                                      </span>
                                    </div>
                                    <p className="text-sm text-yellow-700">
                                      Your documents have been submitted and are under review. 
                                      We'll notify you once the verification is complete.
                                    </p>
                                  </div>
                                );
                              }

                              // Show not verified if no documents or incomplete (default state)
                              if (!hasAllDocuments && 
                                  !["APPROVED", "REJECTED", "PENDING"].includes(verificationStatus?.verificationStatus || "")) {
                                return (
                                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center mb-2">
                                      <Clock className="h-5 w-5 text-blue-600 mr-2" />
                                      <span className="text-blue-800 font-medium">
                                        Upload Required Documents
                                      </span>
                                    </div>
                                    <p className="text-sm text-blue-700">
                                      Please upload all 4 required documents to start the verification process:
                                      <br />• Driver's License {verificationStatus?.hasImages?.driverLicense ? "✅" : "❌"}
                                      <br />• National ID - Front {verificationStatus?.hasImages?.idCardFront ? "✅" : "❌"}
                                      <br />• National ID - Back {verificationStatus?.hasImages?.idCardBack ? "✅" : "❌"}
                                      <br />• Selfie Photo {verificationStatus?.hasImages?.selfiePhoto ? "✅" : "❌"}
                                    </p>
                                  </div>
                                );
                              }

                              return null;
                            })()}

                            <DocumentUpload
                              title="Driver's License"
                              description="Please upload your driver's license"
                              onUpload={(file) =>
                                handleDocumentUpload(file, "Driver License")
                              }
                              isUploading={isUploadingDoc}
                              existingImageUrl={
                                verificationStatus?.hasImages?.driverLicense
                                  ? profile.driverLicense
                                  : undefined
                              }
                            />

                            <DocumentUpload
                              title="National ID - Front"
                              description="Please upload the front side of your national ID card"
                              onUpload={(file) =>
                                handleDocumentUpload(file, "Card Front")
                              }
                              isUploading={isUploadingDoc}
                              existingImageUrl={
                                verificationStatus?.hasImages?.idCardFront
                                  ? profile.idCardFront
                                  : undefined
                              }
                            />

                            <DocumentUpload
                              title="National ID - Back"
                              description="Please upload the back side of your national ID card"
                              onUpload={(file) =>
                                handleDocumentUpload(file, "Card Back")
                              }
                              isUploading={isUploadingDoc}
                              existingImageUrl={
                                verificationStatus?.hasImages?.idCardBack
                                  ? profile.idCardBack
                                  : undefined
                              }
                            />

                            <DocumentUpload
                              title="Selfie Photo"
                              description="Please upload a clear selfie photo"
                              onUpload={(file) =>
                                handleDocumentUpload(file, "Selfie Photo")
                              }
                              isUploading={isUploadingDoc}
                              existingImageUrl={
                                verificationStatus?.hasImages?.selfiePhoto
                                  ? profile.selfiePhoto
                                  : undefined
                              }
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <Button onClick={handleSaveProfile} disabled={isUpdating}>
                      {isUpdating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Saving...
                        </>
                      ) : (
                        t("settings.saveChanges")
                      )}
                    </Button>
                  </>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to load profile data. Please try refreshing the
                      page.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          {/* <TabsContent value="documents"> */}
            {/* <DriverLicense /> */}
          {/* </TabsContent> */}

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    {t("common.passwordAndSecurity")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">
                      {t("common.currentPassword")}
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      className="text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">
                      {t("common.newPassword")}
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      className="text-black"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      {t("common.confirmNewPassword")}
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="text-black"
                    />
                  </div>
                  <Button>{t("common.updatePassword")}</Button>
                </CardContent>
              </Card>

              {/* <Card>
                <CardHeader>
                  <CardTitle>{t("common.twoFactorAuthentication")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Receive a verification code via SMS when signing in
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <Separator className="my-4" />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Receive a verification code via email when signing in
                      </p>
                    </div>
                    <Switch />
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          {/* <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 mr-2" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Booking Confirmations</p>
                    <p className="text-sm text-muted-foreground">
                      Get notified when your booking is confirmed or modified
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailBooking}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailBooking: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Promotional Emails</p>
                    <p className="text-sm text-muted-foreground">
                      Receive updates about new vehicles and special offers
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailPromotions}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        emailPromotions: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Reminders</p>
                    <p className="text-sm text-muted-foreground">
                      Get SMS reminders for upcoming bookings and returns
                    </p>
                  </div>
                  <Switch
                    checked={notifications.smsReminders}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        smsReminders: checked,
                      })
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive mobile app notifications on your device
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        pushNotifications: checked,
                      })
                    }
                  />
                </div>

                <Button>Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent> */}

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              {/* <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">**** **** **** 1234</p>
                          <p className="text-sm text-muted-foreground">
                            Expires 12/26
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline">Add New Payment Method</Button>
                  </div>
                </CardContent>
              </Card> */}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">Invoice #BK002</p>
                        <p className="text-sm text-muted-foreground">
                          Jan 12, 2024
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$240.00</p>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="font-medium">Invoice #BK001</p>
                        <p className="text-sm text-muted-foreground">
                          Jan 08, 2024
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">$360.00</p>
                        <Button variant="ghost" size="sm">
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Globe className="h-5 w-5 mr-2" />
                  {t("settings.language")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="language-select">
                    {t("settings.selectLanguage")}
                  </Label>
                  <Select
                    value={language}
                    onValueChange={(value: "en" | "vi") => setLanguage(value)}
                  >
                    <SelectTrigger className="w-full mt-2">
                      <SelectValue placeholder={t("settings.selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        {t("settings.english")}
                      </SelectItem>
                      <SelectItem value="vi">
                        {t("settings.vietnamese")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === "en"
                      ? "Choose your preferred language for the application interface."
                      : "Chọn ngôn ngữ ưa thích cho giao diện ứng dụng."}
                  </p>
                </div>

                <Separator />

                {/* <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Language Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Currency Display</p>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? "Show prices in Vietnamese Dong (VND)"
                            : "Hiển thị giá bằng Đồng Việt Nam (VND)"}
                        </p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Date Format</p>
                        <p className="text-sm text-muted-foreground">
                          {language === "en"
                            ? "Use local date format (DD/MM/YYYY)"
                            : "Sử dụng định dạng ngày địa phương (DD/MM/YYYY)"}
                        </p>
                      </div>
                      <Switch defaultChecked={language === "vi"} />
                    </div>
                  </div>
                </div> */}

                <Button>{t("settings.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </div>
  );
};

export default Settings;
