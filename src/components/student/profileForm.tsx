/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any*/
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

// Zod validation schema

interface Teacher {
  email: string;
  id: string;
  name: string;
  department?: string;
}
const studentProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  rollNo: z
    .string()
    .min(4, { message: "Roll Number must be at least 4 characters" }),
  mobileNo: z
    .string()
    .regex(/^[0-9]{10}$/, { message: "Mobile number must be 10 digits" }),
  email: z.string().email({ message: "Invalid email address" }),
  profilePhoto: z.string().optional(),
  dateOfBirth: z.date().optional(),
  teacherId: z.string().optional(), // Added teacherId field

  // Location Information
  localAddress: z.string().optional(),
  permanentAddress: z.string().optional(),
  state: z.string().optional(),

  // Personal Information
  adharNo: z.string().optional(),
  maritalStatus: z.string().optional(),
  children: z.string().optional(),
  nameAndOccpationOfSpouse: z.string().optional(),

  // Academic Information
  admissionBatch: z.string().min(4, { message: "Admission Batch is required" }),
  course: z.string().min(2, { message: "Course is required" }),
  subject: z.string().min(2, { message: "Subject is required" }),
  collegeIdProof: z.string().optional(),
  previousInstitution: z.string().optional(),
  yearOfPassing: z.string().optional(),
  attempt: z.string().optional(),
  dateOfJoining: z.date().optional(),
  dateOfCompletion: z.date().optional(),

  // Professional Information
  previousExperience: z.string().optional(),
  specialInterest: z.string().optional(),
  futurePlan: z.string().optional(),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(), // Added status field
  rejection_reason: z.string().optional(), // Added rejection reason field
});

export default function StudentProfileForm({
  onProfileUpdate,
}: {
  onProfileUpdate: (profileData: any) => void;
}) {
  const user = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  interface StudentProfile {
    rejection_reason: string;
    id: any;
    status: string;
    name: string;
    rollNo: string;
    mobileNo: string;
    email: string;
    // Add other fields as per your schema
  }

  const [existingProfile, setExistingProfile] = useState<StudentProfile | null>(
    null
  );
  const [profilePhotoFileName, setProfilePhotoFileName] = useState<
    string | null
  >(null);
  const [collegeIdProofFileName, setCollegeIdProofFileName] = useState<
    string | null
  >(null);
  const [editMode, setEditMode] = useState(false);

  // Initialize form with react-hook-form and zod
  const form = useForm<z.infer<typeof studentProfileSchema>>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: user?.name || "",
      rollNo: "",
      mobileNo: "",
      email: user?.email || "",
      localAddress: "",
      permanentAddress: "",
      adharNo: "",
      admissionBatch: "",
      course: "",
      subject: "",
      profilePhoto: "",
      collegeIdProof: "",
      previousInstitution: "",
      yearOfPassing: "",
      attempt: "",
      state: "",
      previousExperience: "",
      maritalStatus: "",
      children: "",
      specialInterest: "",
      nameAndOccpationOfSpouse: "",
      futurePlan: "",
      teacherId: "",
      status: "PENDING",
      rejection_reason: "",
    },
  });

  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Add this function to fetch teachers
  useEffect(() => {
    async function fetchTeachers() {
      try {
        const response = await fetch("/api/teacher-profile");
        const data = await response.json();
        console.log("Fetched teachers:", data);
        setTeachers(data);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    }

    fetchTeachers();
  }, []);

  // Fetch existing profile on component mount
  useEffect(() => {
    async function fetchExistingProfile() {
      console.log("Fetching existing profile for user ID:", user?.id);
      if (user?.id) {
        try {
          const response = await fetch(
            `/api/student-profile?byUserId=${user?.id}`
          );

          const data = await response.json();

          console.log("Fetched profile data:", data);

          // Check if the response indicates the student wasn't found
          if (data.message === "Student not found") {
            console.log("No existing profile found for this user");
            setExistingProfile(null); // Clear any existing profile data
            setEditMode(true); // Enable edit mode for new profiles
            form.reset(); // Reset the form to empty values
            setProfilePhotoFileName(null);
            setCollegeIdProofFileName(null);
            return;
          }

          // Handle successful profile fetch
          if (data) {
            const profile = data;
            console.log("Existing profile data:", profile);
            setExistingProfile(profile);
            setEditMode(false); // Disable edit mode for existing profiles

            // Convert string dates to Date objects
            const dateOfBirth = profile.dateOfBirth
              ? new Date(profile.dateOfBirth)
              : undefined;
            const dateOfJoining = profile.dateOfJoining
              ? new Date(profile.dateOfJoining)
              : undefined;
            const dateOfCompletion = profile.dateOfCompletion
              ? new Date(profile.dateOfCompletion)
              : undefined;

            form.reset({
              name: profile.name,
              rollNo: profile.rollNo,
              mobileNo: profile.mobileNo,
              email: profile.email,
              localAddress: profile.localAddress || "",
              permanentAddress: profile.permanentAddress || "",
              adharNo: profile.adharNo || "",
              admissionBatch: profile.admissionBatch,
              course: profile.course,
              subject: profile.subject,
              profilePhoto: profile.profilePhoto || "",
              collegeIdProof: profile.collegeIdProof || "",
              dateOfBirth: dateOfBirth,
              previousInstitution: profile.previousInstitution || "",
              yearOfPassing: profile.yearOfPassing || "",
              attempt: profile.attempt || "",
              state: profile.state || "",
              dateOfJoining: dateOfJoining,
              previousExperience: profile.previousExperience || "",
              maritalStatus: profile.maritalStatus || "",
              children: profile.children || "",
              specialInterest: profile.specialInterest || "",
              dateOfCompletion: dateOfCompletion,
              nameAndOccpationOfSpouse: profile.nameAndOccpationOfSpouse || "",
              futurePlan: profile.futurePlan || "",
            });

            // Set file names if URLs exist
            if (profile.profilePhoto) {
              setProfilePhotoFileName(
                profile.profilePhoto.split("/").pop() || null
              );
            }
            if (profile.collegeIdProof) {
              setCollegeIdProofFileName(
                profile.collegeIdProof.split("/").pop() || null
              );
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          // toast.error('Failed to fetch existing profile');
        }
      }
    }

    fetchExistingProfile();
  }, [user?.id, form]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof studentProfileSchema>) => {
    setIsLoading(true);
    console.log("Form submitted with values:", values);
    if (values.teacherId === "") {
      alert("Please select a teacher for verification.");
      setIsLoading(false);
      return;
    }
    try {
      const endpoint = existingProfile
        ? `/api/student-profile?userId=${user?.id}&id=${existingProfile?.id}`
        : `/api/student-profile?userId=${user?.id}`;

      const method = existingProfile ? "PUT" : "POST";

      // Format date values
      const formattedValues = {
        ...values,
        status: "PENDING",
        dateOfBirth: values.dateOfBirth
          ? values.dateOfBirth.toISOString()
          : null,
        dateOfJoining: values.dateOfJoining
          ? values.dateOfJoining.toISOString()
          : null,
        dateOfCompletion: values.dateOfCompletion
          ? values.dateOfCompletion.toISOString()
          : null,
      };

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedValues),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Profile saved successfully", data);
        toast.success(
          existingProfile
            ? "Profile Updated Successfully"
            : "Profile Created Successfully",
          {
            description: `Your student profile has been ${
              existingProfile ? "updated" : "created"
            }.`,
          }
        );
        setExistingProfile(data);
        setEditMode(false); // Disable edit mode after saving
        console.log("Profile data:", data);
      } else {
        console.error("Error saving profile:", data);
        toast.error("Error", {
          description: data.message || "Something went wrong",
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Error", {
        description: "Network error. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      <Card className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="flex items-center justify-between border-b p-6">
          <h2 className="text-2xl font-bold">
            {existingProfile ? "Student Profile" : "Create Student Profile"}
          </h2>

          {existingProfile && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {editMode ? "Edit Mode" : "View Mode"}
              </span>
              <Switch
                checked={editMode}
                onCheckedChange={toggleEditMode}
                aria-label="Toggle edit mode"
              />
            </div>
          )}
        </div>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="personal">Personal Info</TabsTrigger>
                  <TabsTrigger value="academic">Academic Info</TabsTrigger>
                  <TabsTrigger value="address">Address Info</TabsTrigger>
                  <TabsTrigger value="professional">
                    Professional Info
                  </TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal" className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Photo Upload */}
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
                                    <span className="text-gray-500 text-5xl">
                                      👤
                                    </span>
                                  </div>
                                )}

                                {editMode && (
                                  <UploadButton
                                    endpoint="imageUploader"
                                    onClientUploadComplete={(res) => {
                                      if (res.length > 0) {
                                        const uploadedFileUrl =
                                          res[0].serverData.fileUrl;
                                        form.setValue(
                                          "profilePhoto",
                                          uploadedFileUrl
                                        );
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

                                {/* {profilePhotoFileName && (
                                  <div className="mt-2 text-sm text-gray-600">
                                    {profilePhotoFileName}
                                  </div>
                                )} */}
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
                                {existingProfile &&
                                  existingProfile.status !== "PENDING" && (
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
                                    existingProfile.status !== "PENDING") ||
                                  undefined
                                }
                              >
                                <SelectTrigger
                                  className={
                                    !editMode ||
                                    (existingProfile &&
                                      existingProfile.status !== "PENDING")
                                      ? "bg-gray-200 cursor-not-allowed text-black"
                                      : ""
                                  }
                                >
                                  <SelectValue placeholder="Select a teacher for verification">
                                    {field.value
                                      ? (() => {
                                          const selectedTeacher = teachers.find(
                                            (teacher) =>
                                              teacher.id === field.value
                                          );
                                          return selectedTeacher
                                            ? `${selectedTeacher.name} - ${selectedTeacher.email}`
                                            : "Select a teacher for verification";
                                        })()
                                      : "Select a teacher for verification"}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                  {teachers.map((teacher) => (
                                    <SelectItem
                                      key={teacher.id}
                                      value={teacher.id}
                                    >
                                      {teacher.name} - {teacher.email}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            {existingProfile &&
                              existingProfile.status === "APPROVED" && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Your profile has been{" "}
                                  {existingProfile.status.toLowerCase()} and can
                                  no longer be assigned to a different teacher.
                                </p>
                              )}
                            {existingProfile &&
                              existingProfile.status === "REJECTED" && (
                                <p className="text-sm text-gray-500 mt-1">
                                  Your profile has been{" "}
                                  {existingProfile.status.toLowerCase()} and
                                  Reason for rejection is:{" "}
                                  {existingProfile.rejection_reason}
                                </p>
                              )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mobile Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="Enter 10-digit mobile number"
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

                        {/* Date of Birth */}
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
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground",
                                        !editMode &&
                                          "bg-gray-100 cursor-not-allowed"
                                      )}
                                      disabled={!editMode}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP") // Date only (no time)
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={!editMode}
                                    initialFocus
                                    captionLayout="dropdown" // Enables year/month dropdowns
                                    fromYear={1900} // Minimum selectable year
                                    toYear={new Date().getFullYear()} // Maximum selectable year
                                  />
                                </PopoverContent>
                              </Popover>
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
                                  type="number"
                                  placeholder="Enter your Aadhar number"
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
                                  <SelectItem value="Married">
                                    Married
                                  </SelectItem>
                                  <SelectItem value="Divorced">
                                    Divorced
                                  </SelectItem>
                                  <SelectItem value="Widowed">
                                    Widowed
                                  </SelectItem>
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
                </TabsContent>

                {/* Academic Information Tab */}
                <TabsContent value="academic" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Roll Number */}
                    <FormField
                      control={form.control}
                      name="rollNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Roll Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your roll number"
                              {...field}
                              readOnly={!editMode || !!existingProfile}
                              className={
                                !editMode || existingProfile
                                  ? "bg-gray-100 cursor-not-allowed"
                                  : ""
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Admission Batch */}
                    <FormField
                      control={form.control}
                      name="admissionBatch"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admission Batch</FormLabel>
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
                                <SelectValue placeholder="Select admission batch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const year = 2020 + i;
                                return (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Course */}
                    <FormField
                      control={form.control}
                      name="course"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Course</FormLabel>
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
                                <SelectValue placeholder="Select course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="MBBS">MBBS</SelectItem>
                              <SelectItem value="MD">MD</SelectItem>
                              <SelectItem value="MS">MS</SelectItem>
                              <SelectItem value="BDS">BDS</SelectItem>
                              <SelectItem value="Pharm.D">Pharm.D</SelectItem>
                              <SelectItem value="BSc Nursing">
                                BSc Nursing
                              </SelectItem>
                              <SelectItem value="MSc Nursing">
                                MSc Nursing
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Subject */}
                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject/Specialization</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your subject or specialization"
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

                    {/* Previous Institution */}
                    <FormField
                      control={form.control}
                      name="previousInstitution"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Institution</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your previous institution"
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

                    {/* Year of Passing */}
                    <FormField
                      control={form.control}
                      name="yearOfPassing"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year of Passing</FormLabel>
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
                                <SelectValue placeholder="Select year of passing" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 20 }, (_, i) => {
                                const year = 2010 + i;
                                return (
                                  <SelectItem
                                    key={year}
                                    value={year.toString()}
                                  >
                                    {year}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Attempt */}
                    <FormField
                      control={form.control}
                      name="attempt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attempt</FormLabel>
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
                                <SelectValue placeholder="Select attempt" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => {
                                const attempt = i + 1;
                                return (
                                  <SelectItem
                                    key={attempt}
                                    value={attempt.toString()}
                                  >
                                    {attempt}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date of Joining */}
                    <FormField
                      control={form.control}
                      name="dateOfJoining"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Joining</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                    !editMode &&
                                      "bg-gray-100 cursor-not-allowed"
                                  )}
                                  disabled={!editMode}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={!editMode}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date of Completion */}
                    <FormField
                      control={form.control}
                      name="dateOfCompletion"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expected Date of Completion</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground",
                                    !editMode &&
                                      "bg-gray-100 cursor-not-allowed"
                                  )}
                                  disabled={!editMode}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={!editMode}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* College ID Proof Upload */}
                    <FormField
                      control={form.control}
                      name="collegeIdProof"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>College ID Proof</FormLabel>
                          <FormControl>
                            <div className="flex flex-col items-start space-y-2 w-full">
                              {editMode && (
                                <div className="w-full">
                                  <UploadButton
                                    endpoint="docUploader"
                                    onClientUploadComplete={(res) => {
                                      if (res.length > 0) {
                                        const uploadedFileUrl =
                                          res[0].serverData.fileUrl;
                                        form.setValue(
                                          "collegeIdProof",
                                          uploadedFileUrl
                                        );
                                        setCollegeIdProofFileName(res[0].name);
                                        toast.success("ID Proof Uploaded");
                                      }
                                    }}
                                    onUploadError={(error) => {
                                      toast.error("Upload Error");
                                      console.log("Upload Error:", error);
                                    }}
                                  />
                                </div>
                              )}

                              {field.value && (
                                <div className="flex items-center gap-2">
                                  <a
                                    href={field.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline flex items-center"
                                  >
                                    View Uploaded ID
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4 ml-1"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                      />
                                    </svg>
                                  </a>
                                </div>
                              )}

                              {/* {collegeIdProofFileName && (
            <div className="mt-1 text-sm text-gray-600">
              {collegeIdProofFileName}
            </div>
          )} */}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Address Information Tab */}
                <TabsContent value="address" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Local Address */}
                    <FormField
                      control={form.control}
                      name="localAddress"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Local Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your local address"
                              {...field}
                              rows={3}
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

                    {/* Permanent Address */}
                    <FormField
                      control={form.control}
                      name="permanentAddress"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Permanent Address</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your permanent address"
                              {...field}
                              rows={3}
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

                    {/* State */}
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
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
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Andhra Pradesh">
                                Andhra Pradesh
                              </SelectItem>
                              <SelectItem value="Arunachal Pradesh">
                                Arunachal Pradesh
                              </SelectItem>
                              <SelectItem value="Assam">Assam</SelectItem>
                              <SelectItem value="Bihar">Bihar</SelectItem>
                              <SelectItem value="Chhattisgarh">
                                Chhattisgarh
                              </SelectItem>
                              <SelectItem value="Goa">Goa</SelectItem>
                              <SelectItem value="Gujarat">Gujarat</SelectItem>
                              <SelectItem value="Haryana">Haryana</SelectItem>
                              <SelectItem value="Himachal Pradesh">
                                Himachal Pradesh
                              </SelectItem>
                              <SelectItem value="Jharkhand">
                                Jharkhand
                              </SelectItem>
                              <SelectItem value="Karnataka">
                                Karnataka
                              </SelectItem>
                              <SelectItem value="Kerala">Kerala</SelectItem>
                              <SelectItem value="Madhya Pradesh">
                                Madhya Pradesh
                              </SelectItem>
                              <SelectItem value="Maharashtra">
                                Maharashtra
                              </SelectItem>
                              <SelectItem value="Manipur">Manipur</SelectItem>
                              <SelectItem value="Meghalaya">
                                Meghalaya
                              </SelectItem>
                              <SelectItem value="Mizoram">Mizoram</SelectItem>
                              <SelectItem value="Nagaland">Nagaland</SelectItem>
                              <SelectItem value="Odisha">Odisha</SelectItem>
                              <SelectItem value="Punjab">Punjab</SelectItem>
                              <SelectItem value="Rajasthan">
                                Rajasthan
                              </SelectItem>
                              <SelectItem value="Sikkim">Sikkim</SelectItem>
                              <SelectItem value="Tamil Nadu">
                                Tamil Nadu
                              </SelectItem>
                              <SelectItem value="Telangana">
                                Telangana
                              </SelectItem>
                              <SelectItem value="Tripura">Tripura</SelectItem>
                              <SelectItem value="Uttar Pradesh">
                                Uttar Pradesh
                              </SelectItem>
                              <SelectItem value="Uttarakhand">
                                Uttarakhand
                              </SelectItem>
                              <SelectItem value="West Bengal">
                                West Bengal
                              </SelectItem>
                              <SelectItem value="Delhi">Delhi</SelectItem>
                              <SelectItem value="Jammu and Kashmir">
                                Jammu and Kashmir
                              </SelectItem>
                              <SelectItem value="Ladakh">Ladakh</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                {/* Professional Information Tab */}
                <TabsContent value="professional" className="space-y-6">
                  <div className="grid md:grid-cols-1 gap-4">
                    {/* Previous Experience */}
                    <FormField
                      control={form.control}
                      name="previousExperience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Previous Experience</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your previous work experience"
                              {...field}
                              rows={3}
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

                    {/* Special Interest */}
                    <FormField
                      control={form.control}
                      name="specialInterest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Special Interest</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="List your areas of special interest"
                              {...field}
                              rows={3}
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

                    {/* Future Plans */}
                    <FormField
                      control={form.control}
                      name="futurePlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Future Plans</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your future career plans"
                              {...field}
                              rows={3}
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
                </TabsContent>
              </Tabs>

              {editMode && (
                <div className="flex justify-end gap-4 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (existingProfile) {
                        // Reset the form to the existing profile values
                        form.reset({
                          name: existingProfile.name,
                          rollNo: existingProfile.rollNo,
                          mobileNo: existingProfile.mobileNo,
                          email: existingProfile.email,
                          // Reset all other fields as needed...
                        });
                      } else {
                        // Reset the form to empty values
                        form.reset();
                      }
                      setEditMode(false);
                    }}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <div className="flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Saving...
                      </div>
                    ) : (
                      "Save Profile"
                    )}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
