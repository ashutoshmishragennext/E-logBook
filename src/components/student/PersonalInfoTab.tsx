"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Check,
  Loader2,
  Pencil,
  X,
} from "lucide-react";
// import { toast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Define the form schema
const personalInfoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  rollNo: z.string().min(1, "Roll Number is required"),
  mobileNo: z
    .string()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  email: z.string().email("Invalid email address"),
  dateOfBirth: z.date().nullable().optional(),
  localAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  adharNo: z
    .string()
    .regex(/^\d{12}$/, "Aadhar number must be 12 digits")
    .optional(),
  state: z.string().optional(),
  maritalStatus: z.string().optional(),
  children: z.string().optional(),
  specialInterest: z.string().optional(),
  previousInstitution: z.string().optional(),
  yearOfPassing: z.string().optional(),
  attempt: z.string().optional(),
});

interface PersonalInfoComponentProps {
  userId: string;
  existingProfile?: {
    name?: string;
    rollNo?: string;
    mobileNo?: string;
    email?: string;
    dateOfBirth?: string;
    localAddress?: string;
    permanentAddress?: string;
    adharNo?: string;
    state?: string;
    maritalStatus?: string;
    children?: string;
    specialInterest?: string;
    previousInstitution?: string;
    yearOfPassing?: string;
    attempt?: string;
    profilePhoto?: string;
  };
  onProfileUpdate?: (updatedData: Partial<{
    name?: string;
    rollNo?: string;
    mobileNo?: string;
    email?: string;
    dateOfBirth?: string;
    localAddress?: string;
    permanentAddress?: string;
    adharNo?: string;
    state?: string;
    maritalStatus?: string;
    children?: string;
    specialInterest?: string;
    previousInstitution?: string;
    yearOfPassing?: string;
    attempt?: string;
    profilePhoto?: string;
  }>) => Promise<void>;
}

export default function PersonalInfoComponent({
  userId,
  existingProfile,
  onProfileUpdate,
}: PersonalInfoComponentProps) {
  const [editMode, setEditMode] = useState(!existingProfile);
  const [submitting, setSubmitting] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(
    existingProfile?.profilePhoto || null
  );

  // Initialize form
  const form = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: "",
      rollNo: "",
      mobileNo: "",
      email: "",
      dateOfBirth: null,
      localAddress: "",
      permanentAddress: "",
      adharNo: "",
      state: "",
      maritalStatus: "",
      children: "",
      specialInterest: "",
      previousInstitution: "",
      yearOfPassing: "",
      attempt: "",
    },
  });

  // Update form values when existing profile data changes
  useEffect(() => {
    if (existingProfile) {
      form.reset({
        name: existingProfile.name || "",
        rollNo: existingProfile.rollNo || "",
        mobileNo: existingProfile.mobileNo || "",
        email: existingProfile.email || "",
        dateOfBirth: existingProfile.dateOfBirth
          ? new Date(existingProfile.dateOfBirth)
          : null,
        localAddress: existingProfile.localAddress || "",
        permanentAddress: existingProfile.permanentAddress || "",
        adharNo: existingProfile.adharNo || "",
        state: existingProfile.state || "",
        maritalStatus: existingProfile.maritalStatus || "",
        children: existingProfile.children || "",
        specialInterest: existingProfile.specialInterest || "",
        previousInstitution: existingProfile.previousInstitution || "",
        yearOfPassing: existingProfile.yearOfPassing || "",
        attempt: existingProfile.attempt || "",
      });

      setProfilePhotoPreview(existingProfile.profilePhoto || null);
    }
  }, [existingProfile, form]);

  // Handle profile photo change
  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setProfilePhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data: {
    name: string;
    rollNo: string;
    mobileNo: string;
    email: string;
    children?: string;
    dateOfBirth?: Date | null;
    localAddress?: string;
    permanentAddress?: string;
    adharNo?: string;
    state?: string;
    maritalStatus?: string;
    specialInterest?: string;
    previousInstitution?: string;
    yearOfPassing?: string;
    attempt?: string;
  }) => {
    if (!userId) {
      console.error("User ID is required for form submission");
      // toast({
      //   title: 'Error',
      //   description: 'User ID is required',
      //   variant: 'destructive'
      // });
      return;
    }

    setSubmitting(true);

    try {
      // Create FormData instance for file upload
      const formData = new FormData();

      // Add all form values to FormData
      Object.keys(data).forEach((key) => {
        if (
          data[key as keyof typeof data] !== null &&
          data[key as keyof typeof data] !== undefined
        ) {
          if (key === "dateOfBirth" && data.dateOfBirth instanceof Date) {
            formData.append(key, data.dateOfBirth.toISOString());
          } else if (
            data[key as keyof typeof data] !== null &&
            data[key as keyof typeof data] !== undefined
          ) {
            formData.append(key, data[key as keyof typeof data] as string);
          }
        }
      });

      // Add profile photo if selected
      if (profilePhotoFile) {
        formData.append("profilePhoto", profilePhotoFile);
      }

      // Add userId to FormData
      formData.append("userId", userId);

      // Send request to API
      const response = await fetch("/api/student/profile/personal", {
        method: existingProfile ? "PUT" : "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to save personal information");
      }

      const updatedProfile = await response.json();

      // Call parent callback to refresh data with the updated profile
      if (onProfileUpdate) {
        onProfileUpdate(updatedProfile);
      }

      // toast({
      //   title: 'Success',
      //   description: 'Personal information saved successfully',
      // });

      // Exit edit mode if profile was updated
      if (existingProfile) {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error saving personal information:", error);
      // toast({
      //   title: 'Error',
      //   description: error.message || 'Failed to save personal information',
      //   variant: 'destructive'
      // });
    } finally {
      setSubmitting(false);
    }
  };

  // Function to cancel edit mode
  const handleCancel = () => {
    form.reset({
      name: existingProfile?.name || "",
      rollNo: existingProfile?.rollNo || "",
      mobileNo: existingProfile?.mobileNo || "",
      email: existingProfile?.email || "",
      dateOfBirth: existingProfile?.dateOfBirth
        ? new Date(existingProfile.dateOfBirth)
        : null,
      localAddress: existingProfile?.localAddress || "",
      permanentAddress: existingProfile?.permanentAddress || "",
      adharNo: existingProfile?.adharNo || "",
      state: existingProfile?.state || "",
      maritalStatus: existingProfile?.maritalStatus || "",
      children: existingProfile?.children || "",
      specialInterest: existingProfile?.specialInterest || "",
      previousInstitution: existingProfile?.previousInstitution || "",
      yearOfPassing: existingProfile?.yearOfPassing || "",
      attempt: existingProfile?.attempt || "",
    });

    setProfilePhotoPreview(existingProfile?.profilePhoto || null);
    setProfilePhotoFile(null);
    setEditMode(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {editMode
              ? "Provide your basic personal details"
              : "View your personal information"}
          </CardDescription>
        </div>
        {!editMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditMode(true)}
            className="flex items-center gap-1"
          >
            <Pencil size={16} /> Edit
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={profilePhotoPreview || undefined}
                    alt="Profile"
                  />
                  <AvatarFallback>
                    {form.getValues("name")?.charAt(0) || "S"}
                  </AvatarFallback>
                </Avatar>
                {editMode && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Basic Information */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="Your full name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rollNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Roll Number *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="Your roll number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobileNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="10-digit mobile number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        type="email"
                        placeholder="your.email@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full pl-3 text-left font-normal ${
                              !editMode ? "pointer-events-none" : ""
                            }`}
                            disabled={!editMode}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span className="text-muted-foreground">
                                Pick a date
                              </span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value ?? undefined}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adharNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aadhar Number</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="12-digit Aadhar number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Information */}
              <FormField
                control={form.control}
                name="localAddress"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Local Address</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={!editMode}
                        placeholder="Your current address"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permanentAddress"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Permanent Address</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={!editMode}
                        placeholder="Your permanent address"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="Your state"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Personal Details */}
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <Select
                      disabled={!editMode}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
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

              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="Number of children"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Background Information */}
              <FormField
                control={form.control}
                name="previousInstitution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Institution</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="Name of previous institution"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearOfPassing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year of Passing</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="Year of passing previous education"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attempt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Attempt</FormLabel>
                    <FormControl>
                      <Input
                        disabled={!editMode}
                        placeholder="Attempt details"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialInterest"
                render={({ field }) => (
                  <FormItem className="col-span-full">
                    <FormLabel>Special Interests</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={!editMode}
                        placeholder="Your hobbies or special interests"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {editMode && (
              <div className="flex justify-end space-x-2 pt-4">
                {existingProfile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={submitting}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Save Information
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
