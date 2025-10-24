import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
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
  Bell,
  CreditCard,
  FileText,
  Trash2,
  Globe,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Settings = () => {
  const { t, language, setLanguage } = useTranslation();
  const { 
    profile, 
    verificationStatus, 
    isLoading, 
    error, 
    updateProfile, 
    refreshProfile 
  } = useUserProfile();
  
  console.log("🖥️ [Settings] Component state:", {
    profile,
    verificationStatus,
    isLoading,
    error
  });
  
  const [notifications, setNotifications] = useState({
    emailBooking: true,
    emailPromotions: false,
    smsReminders: true,
    pushNotifications: true,
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setIsUpdating(true);
      
      // Get form values
      const firstName = (document.getElementById("firstName") as HTMLInputElement)?.value;
      const lastName = (document.getElementById("lastName") as HTMLInputElement)?.value;
      const dateOfBirth = (document.getElementById("dateOfBirth") as HTMLInputElement)?.value;
      
      await updateProfile({
        firstName,
        lastName,
        dateOfBirth,
      });
      
      // Show success message (you can add toast here)
      console.log("Profile updated successfully");
      
    } catch (err) {
      console.error("Failed to update profile:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getVerificationStatusIcon = () => {
    if (!verificationStatus) return <Clock className="h-4 w-4 text-gray-500" />;
    
    switch (verificationStatus.verificationStatus) {
      case "APPROVED":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "REJECTED":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getVerificationStatusText = () => {
    if (!verificationStatus) return "Not verified";
    
    switch (verificationStatus.verificationStatus) {
      case "APPROVED":
        return "Verified";
      case "REJECTED":
        return "Verification rejected";
      default:
        return "Verification pending";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {/* <div className="bg-gradient-hero py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("settings.title")}
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {t("settings.subtitle")}
          </p>
        </div>
      </div> */}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
            <TabsTrigger value="security">{t("settings.security")}</TabsTrigger>
            <TabsTrigger value="notifications">
              {t("settings.notifications")}
            </TabsTrigger>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t("settings.firstName")}</Label>
                        <Input
                          id="firstName"
                          defaultValue={profile.firstName}
                          className="text-black"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t("settings.lastName")}</Label>
                        <Input
                          id="lastName"
                          defaultValue={profile.lastName}
                          className="text-black"
                        />
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
                        className="text-black"
                        placeholder="Not provided"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Phone number feature coming soon
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="dateOfBirth">
                        {t("settings.dateOfBirth")}
                      </Label>
                      <Input
                        id="dateOfBirth"
                        type="date"
                        defaultValue={profile.dateOfBirth}
                        className="text-black"
                      />
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-semibold mb-4">
                        {t("settings.driversLicense")}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="licenseNumber">
                            {t("settings.licenseNumber")}
                          </Label>
                          <Input
                            id="licenseNumber"
                            defaultValue={profile.licenseNumber}
                            className="text-black"
                            placeholder="Not provided"
                          />
                          <p className="text-sm text-gray-500 mt-1">
                            License management feature coming soon
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="licenseExpiry">
                            {t("settings.expiryDate")}
                          </Label>
                          <Input
                            id="licenseExpiry"
                            type="date"
                            defaultValue={profile.licenseExpiry}
                            className="text-black"
                          />
                        </div>
                      </div>
                    </div>

                    {verificationStatus?.rejectionReason && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Verification rejected:</strong> {verificationStatus.rejectionReason}
                        </AlertDescription>
                      </Alert>
                    )}

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
                      Failed to load profile data. Please try refreshing the page.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabsContent>

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

              <Card>
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
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
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
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing">
            <div className="space-y-6">
              <Card>
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
              </Card>

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

                <div>
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
                </div>

                <Button>{t("settings.saveChanges")}</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
