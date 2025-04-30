// / PersonalInfoTab.jsx with submission handler
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { useState, FormEvent } from 'react';

interface PersonalInfoProps {
  form: any;
  editMode: boolean;
  setEditMode: (mode: boolean) => void;
  profilePhotoFileName: string | null;
  setProfilePhotoFileName: (name: string | null) => void;
  existingProfile: any | null;
  userId: string;
  onProfileUpdate: () => void;
}

export const PersonalInfo = ({
  form,
  editMode,
  setEditMode,
  profilePhotoFileName,
  setProfilePhotoFileName,
  existingProfile,
  userId,
  onProfileUpdate,
}: PersonalInfoProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  console.log("userId:", userId);

  // Cancel edit mode
  const cancelEditMode = () => {
    setEditMode(false);
    // Reset form to original values
    if (existingProfile) {
      form.reset({
        name: form.getValues('name'),
        email: form.getValues('email'),
        mobileNo: form.getValues('mobileNo'),
        dateOfBirth: form.getValues('dateOfBirth'),
        adharNo: form.getValues('adharNo'),
        maritalStatus: form.getValues('maritalStatus'),
        children: form.getValues('children'),
        nameAndOccpationOfSpouse: form.getValues('nameAndOccpationOfSpouse'),
        profilePhoto: form.getValues('profilePhoto'),
        teacherId: form.getValues('teacherId'),
      });
    }
  };

  // Handle form submission
  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!editMode) {
      return;
    }
    
    // Let react-hook-form handle validation
    form.handleSubmit(onSubmit)(e);
  };

  // Actual submission handler after validation passes
  const onSubmit = async (data: any) => {
    if (!userId) {
      toast.error("User ID is required");
      return;
    }

    setIsLoading(true);
    console.log("Submitting form data:", data);
    
    try {
      // Only include personal info fields
      const personalData = {
        userId,
        name: data.name,
        email: data.email,
        mobileNo: data.mobileNo,
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
        adharNo: data.adharNo,
        maritalStatus: data.maritalStatus,
        children: data.children,
        nameAndOccpationOfSpouse: data.nameAndOccpationOfSpouse,
        profilePhoto: data.profilePhoto,
        teacherId: data.teacherId,
      };

      // Determine if creating or updating
      const method = existingProfile?.id ? "PUT" : "POST";
      const url = existingProfile?.id 
        ? `/api/student-profile?id=${existingProfile.id}` 
        : "/api/student-profile";

      console.log(`Making ${method} request to ${url} with data:`, personalData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(personalData),
      });

      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("API error response:", errorData);
        throw new Error(errorData.message || "Failed to save profile data");
      }

      const responseData = await response.json();
      console.log("API success response:", responseData);

      // Call the update function from parent
      onProfileUpdate();
      
      toast.success("Personal information saved successfully");
      
      // Return to view mode after successful save
      setEditMode(false);
      
    } catch (error) {
      console.error("Error saving personal information:", error);
      toast.error(`Failed to save personal information: ${(error as Error).message || "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent form submission via keyboard when not in edit mode
  const handleFormKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !editMode) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  console.log("Existing Profile:", existingProfile);
  console.log("Profile Photo File Name:", profilePhotoFileName);
  
  return (
    <form
      onSubmit={handleFormSubmit}
      onKeyDown={handleFormKeyPress}
      noValidate
      onClick={(e) => !editMode && (e.target as HTMLElement).tagName === 'BUTTON' && e.preventDefault()}
    >
      <div className="flex flex-col md:flex-row gap-6">
        {/* Profile Photo Upload Section */}
        <div className="md:w-1/3">
          <FormField
            control={form.control}
            name="profilePhoto"
            render={({ field }) => (
              <FormItem className="mb-6">
                <FormLabel>Profile Photo</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center justify-center">
                    {field.value ? (
                      <div className="mb-4">
                        <Image
                          src={field.value}
                          alt="Profile"
                          className="h-48 w-48 rounded-full object-cover border-4 border-gray-200"
                          width={192}
                          height={192}
                        />
                      </div>
                    ) : (
                      <div className="h-48 w-48 rounded-full bg-gray-200 flex items-center justify-center mb-4">
                        <span className="text-gray-500 text-5xl">👤</span>
                      </div>
                    )}

                    {editMode && (
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res.length > 0) {
                            const uploadedFileUrl = res[0].serverData.fileUrl;
                            form.setValue("profilePhoto", uploadedFileUrl);
                            setProfilePhotoFileName(res[0].name);
                            toast.success("Profile Photo Uploaded");
                          }
                        }}
                        onUploadError={(error) => {
                          toast.error("Upload Error");
                          console.log("Upload Error:", error);
                        }}
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
        </div>

        {/* Personal Information Fields */}
        <div className="md:w-2/3">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your full name"
                      {...field}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                      readOnly
                      className="bg-gray-100 cursor-not-allowed"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mobile Number */}
            <FormField
              control={form.control}
              name="mobileNo"
              rules={{
                required: "Mobile number is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobile Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      {...field}
                      maxLength={10}
                      readOnly={!editMode}
                      className={
                        !editMode
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date of Birth */}
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <div className="relative w-full">
                      <DatePicker
                        selected={field.value}
                        onChange={(date) => field.onChange(date)}
                        dateFormat="PPP"
                        disabled={!editMode}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        className={cn(
                          "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                          !editMode &&
                            "bg-gray-100 cursor-not-allowed"
                        )}
                        placeholderText="Pick a date"
                        maxDate={new Date()}
                        minDate={new Date("1900-01-01")}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aadhar Number */}
            <FormField
              control={form.control}
              name="adharNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Aadhar Number</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="Enter your 12-digit Aadhar number"
                      {...field}
                      readOnly={!editMode}
                      onInput={(e) => {
                        const target = e.target as HTMLInputElement;
                        target.value = target.value
                          .replace(/\D/g, "")
                          .slice(0, 12);
                        field.onChange((e.target as HTMLInputElement).value);
                      }}
                      className={
                        !editMode
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Marital Status */}
            <FormField
              control={form.control}
              name="maritalStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marital Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!editMode}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={
                          !editMode
                            ? "bg-gray-100 cursor-not-allowed"
                            : ""
                        }
                      >
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Single">Single</SelectItem>
                      <SelectItem value="Married">Married</SelectItem>
                      <SelectItem value="Divorced">Divorced</SelectItem>
                      <SelectItem value="Widowed">Widowed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Children */}
            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Children (if any)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Number of children"
                      {...field}
                      readOnly={!editMode}
                      className={
                        !editMode
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Spouse Information */}
            <FormField
              control={form.control}
              name="nameAndOccpationOfSpouse"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>
                    Spouse Name & Occupation (if applicable)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="E.g. John Doe, Doctor"
                      {...field}
                      readOnly={!editMode}
                      className={
                        !editMode
                          ? "bg-gray-100 cursor-not-allowed"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Add the Save/Cancel buttons inside the personal info component */}
      {editMode && (
        <div className="flex justify-end gap-2 mt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={cancelEditMode}
            className="flex items-center gap-1"
          >
            <X size={16} /> Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? "Saving..." : (
              <>
                <Save size={16} /> Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
};