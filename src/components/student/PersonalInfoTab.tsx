import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

interface PersonalInfoProps {
  form: any;
  editMode: boolean;
  profilePhotoFileName: string | null;
  setProfilePhotoFileName: (name: string | null) => void;
  existingProfile: any | null;
}

export const PersonalInfo = ({
  form,
  editMode,
  profilePhotoFileName,
  setProfilePhotoFileName,
  existingProfile,
}: PersonalInfoProps) => {
  console.log("Existing Profile:", existingProfile);
  console.log("Profile Photo File Name:", profilePhotoFileName);
  return (
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
        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>
                <span className="flex items-center gap-2">
                  <span>👨‍🏫 Assign Teacher for Verification</span>
                  {existingProfile && existingProfile.status !== "PENDING" && (
                    <span
                      className={`rounded-full px-2 py-1 text-xs ${
                        existingProfile.status === "APPROVED"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {existingProfile.status}
                    </span>
                  )}
                </span>
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  value={field.value}
                  disabled={
                    !editMode ||
                    (existingProfile &&
                      existingProfile.status === "APPROVED") ||
                    undefined
                  }
                >
                  <SelectTrigger
                    className={
                      !editMode ||
                      (existingProfile && existingProfile.status === "APPROVED")
                        ? "bg-gray-200 cursor-not-allowed text-black"
                        : ""
                    }
                  >
                    <SelectValue placeholder="Select a teacher for verification" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Teacher items would be mapped here from the teachers state */}
                  </SelectContent>
                </Select>
              </FormControl>
              {existingProfile && existingProfile.status === "APPROVED" && (
                <p className="text-sm text-gray-500 mt-1">
                  Your profile has been {existingProfile.status.toLowerCase()} and can
                  no longer be assigned to a different teacher.
                </p>
              )}
              {existingProfile && existingProfile.status === "REJECTED" && (
                <p className="text-sm text-gray-500 mt-1">
                  Your profile has been {existingProfile.status.toLowerCase()} and
                  Reason for rejection is: {existingProfile.rejection_reason}
                </p>
              )}
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
  );
};