/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps*/

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/auth";
import { UploadButton } from "@/utils/uploadthing";
import debounce from "lodash/debounce";
import { Edit, Loader2, Mail, Phone, Save, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useTeacherStore } from "@/store/teacherStore";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Types based on the schema
type College = {
  id: string;
  name: string;
  code: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  phaseId: string;
  phaseName?: string;
  branchName?: string;
  courseName?: string;
  academicYearName?: string;
};

type CollegeAdmin = {
  id: string;
  name: string;
  email: string;
  mobileNo: string;
};

// Teacher profile validation schema
const teacherProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  mobileNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" }),
  Address: z.string().min(1, { message: "Location is required" }),
  profilePhoto: z.string().optional(),
  teacherIdProof: z.string().optional(),
  collegeId: z.string().min(1, { message: "College is required" }),
  designation: z.string().min(1, { message: "Designation is required" }),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
});

type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>;

export function TeacherProfilePage() {
  const user = useCurrentUser();
  const [isEditMode, setIsEditMode] = useState(false);
  const [profilePhotoFileName, setProfilePhotoFileName] = useState<
    string | null
  >(null);
  const [teacherIdProofFileName, setTeacherIdProofFileName] = useState<
    string | null
  >(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFetchingData, setIsFetchingData] = useState<boolean>(true);
  const [collegeAdmin, setCollegeAdmin] = useState<CollegeAdmin | null>(null);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState<boolean>(false);

  // Get data from Zustand store
  const { subjects, fetchSubjects, isLoadingSubjects, hasSubjects } =
    useTeacherStore();

  // State for dropdown data
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);

  // State for search
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [isSearchingCollege, setIsSearchingCollege] = useState(false);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);

  const form = useForm<TeacherProfileFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobileNo: "",
      Address: "",
      profilePhoto: "",
      teacherIdProof: "",
      collegeId: "",
      designation: "",
      employeeId: "",
    },
  });

  // Get selected college and branch names for display
  const getSelectedCollegeName = () => {
    const collegeId = form.getValues("collegeId");
    const college = colleges.find((c) => c.id === collegeId);
    return college
      ? `${college.name} (${college.code})`
      : "No college selected";
  };

  // Fetch initial data
  useEffect(() => {
    fetchColleges("");
  }, []);

  // Fetch college admin details
  const fetchCollegeAdmin = async (collegeId: string) => {
    if (!collegeId) return;

    setIsLoadingAdmin(true);
    try {
      const response = await fetch(`/api/college?collegeId=${collegeId}`);
      const data = await response.json();

      if (data.success && data.data) {
        setCollegeAdmin(data.data);
      } else {
        setCollegeAdmin(null);
      }
    } catch (error) {
      console.error("Error fetching college admin:", error);
      setCollegeAdmin(null);
    } finally {
      setIsLoadingAdmin(false);
    }
  };

  // Fetch existing profile if user is logged in
  useEffect(() => {
    async function fetchExistingProfile() {
      if (user?.id) {
        try {
          setIsFetchingData(true);
          const response = await fetch(
            `/api/teacher-profile?userId=${user.id}`
          );
          const data = await response.json();
          const dataResponse = data.data;

          if (dataResponse) {
            const profile = dataResponse;
            setExistingProfile(profile);

            // Populate form with existing data
            form.reset({
              name: profile.name,
              email: profile.email,
              mobileNo: profile.mobileNo,
              Address: profile.Address || "",
              profilePhoto: profile.profilePhoto || "",
              teacherIdProof: profile.teacherIdProof || "",
              collegeId: profile.collegeId,
              designation: profile.designation,
              employeeId: profile.employeeId,
            });

            // Set file names if URLs exist
            if (profile.profilePhoto) {
              setProfilePhotoFileName(
                profile.profilePhoto.split("/").pop() || null
              );
            }
            if (profile.teacherIdProof) {
              setTeacherIdProofFileName(
                profile.teacherIdProof.split("/").pop() || null
              );
            }

            // Fetch allocated subjects
            await fetchSubjects(profile.id);

            // Fetch college admin details
            fetchCollegeAdmin(profile.collegeId);

            fetchColleges("");
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setIsFetchingData(false);
        }
      } else {
        setIsFetchingData(false);
      }
    }

    fetchExistingProfile();
  }, [user?.id, form, fetchSubjects]);

  console.log("subjects: ", subjects);

  // Fetch methods for dropdown data
  const fetchColleges = async (searchTerm: string) => {
    setIsSearchingCollege(true);
    try {
      const response = await fetch(`/api/search/college?q=${searchTerm}`);
      const data = await response.json();
      setColleges(data);
      setFilteredColleges(data);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setIsSearchingCollege(false);
    }
  };

  // Debounced search
  const debouncedCollegeSearch = debounce((term: string) => {
    if (colleges.length > 0) {
      const filtered = colleges.filter(
        (college) =>
          college.name.toLowerCase().includes(term.toLowerCase()) ||
          college.code.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredColleges(filtered);
    } else {
      fetchColleges(term);
    }
  }, 300);

  // Handle form field changes
  const handleCollegeChange = (collegeId: string) => {
    form.setValue("collegeId", collegeId);
    setShowCollegeDropdown(false);

    // Fetch college admin when college changes
    fetchCollegeAdmin(collegeId);
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      // Reset form to original values if cancelling
      if (existingProfile) {
        form.reset({
          name: existingProfile.name,
          email: existingProfile.email,
          mobileNo: existingProfile.mobileNo,
          Address: existingProfile.Address || "",
          profilePhoto: existingProfile.profilePhoto || "",
          teacherIdProof: existingProfile.teacherIdProof || "",
          collegeId: existingProfile.collegeId,
          designation: existingProfile.designation,
          employeeId: existingProfile.employeeId,
        });
      }
    }
  };

  // Handle form submission
  const onSubmit = async (values: TeacherProfileFormData) => {
    setIsLoading(true);
    try {
      const endpoint = existingProfile
        ? `/api/teacher-profile?id=${existingProfile.id}`
        : `/api/teacher-profile`;

      const method = existingProfile ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          userId: user?.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Profile saved successfully", data);

        // If this is a new profile, now we save the subjects
        const teacherId = existingProfile ? existingProfile.id : data.id;

        setExistingProfile(data);
        setIsEditMode(false);

        // Show success message (replace with your toast system)
        alert(
          existingProfile
            ? "Profile updated successfully"
            : "Profile created successfully"
        );

        // Refresh college admin data if college changed
        if (values.collegeId !== existingProfile?.collegeId) {
          fetchCollegeAdmin(values.collegeId);
        }
      } else {
        console.error("Error saving profile:", data);
        alert(`Error: ${data.message || "Failed to save profile"}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      alert("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetchingData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading profile data...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-3 max-w-9xl">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-3xl font-bold">Teacher Profile</h1>
        {existingProfile && (
          <Button
            onClick={toggleEditMode}
            variant={isEditMode ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isEditMode ? (
              <>
                <X size={16} />
                Cancel Editing
              </>
            ) : (
              <>
                <Edit size={16} />
                Edit Profile
              </>
            )}
          </Button>
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Personal Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Basic personal and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 flex flex-col items-center space-y-4">
                  {/* Profile Photo */}
                  <FormField
                    control={form.control}
                    name="profilePhoto"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel className="text-center block">
                          Profile Photo
                        </FormLabel>
                        <FormControl>
                          <div className="flex flex-col items-center space-y-4">
                            {field.value ? (
                              <Image
                                src={field.value}
                                alt="Profile"
                                className="h-40 w-40 rounded-full object-cover border-4 border-primary/20"
                                width={160}
                                height={160}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-40 w-40 rounded-full bg-muted">
                                <span className="text-3xl text-muted-foreground">
                                  {user?.name?.charAt(0) || "U"}
                                </span>
                              </div>
                            )}
                            {isEditMode && (
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
                                  }
                                }}
                                onUploadError={(error) => {
                                  console.error("Upload Error:", error);
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

                <div className="md:col-span-2 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your full name"
                              {...field}
                              readOnly
                              className="bg-gray-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your email"
                              {...field}
                              readOnly
                              className="bg-gray-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile Number Field */}
                    <FormField
                      control={form.control}
                      name="mobileNo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter 10-digit mobile number"
                              {...field}
                              type="tel"
                              readOnly={!isEditMode}
                              className={!isEditMode ? "bg-gray-50" : ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Location Field */}
                    <FormField
                      control={form.control}
                      name="Address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your location"
                              {...field}
                              readOnly={!isEditMode}
                              className={!isEditMode ? "bg-gray-50" : ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Teacher ID Proof Upload */}
                  <FormField
                    control={form.control}
                    name="teacherIdProof"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teacher ID Proof</FormLabel>
                        <FormControl>
                          <div className="space-y-2">
                            {field.value && (
                              <div className="p-3 border rounded-md bg-muted/20">
                                <a
                                  href={field.value}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="mr-2"
                                  >
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                  </svg>
                                  {teacherIdProofFileName ||
                                    "View Uploaded Document"}
                                </a>
                              </div>
                            )}
                            {isEditMode && (
                              <div className="flex justify-start">
                                <UploadButton
                                  endpoint="docUploader"
                                  onClientUploadComplete={(res) => {
                                    if (res.length > 0) {
                                      const uploadedFileUrl =
                                        res[0].serverData.fileUrl;
                                      form.setValue(
                                        "teacherIdProof",
                                        uploadedFileUrl
                                      );
                                      setTeacherIdProofFileName(res[0].name);
                                    }
                                  }}
                                  onUploadError={(error) => {
                                    console.error("Upload Error:", error);
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Academic Information Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Academic Information</CardTitle>
              <CardDescription className="text-sm">
                Institution and academic background details
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* College Selection */}
                <FormField
                  control={form.control}
                  name="collegeId"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">College</FormLabel>
                      {isEditMode ? (
                        <div className="relative">
                          <div className="flex items-center border rounded-md">
                            <input
                              className="flex h-9 w-full rounded-md border-0 bg-background px-3 py-1 text-sm"
                              placeholder="Search colleges..."
                              value={
                                collegeSearchTerm || getSelectedCollegeName()
                              }
                              onChange={(e) => {
                                setCollegeSearchTerm(e.target.value);
                                debouncedCollegeSearch(e.target.value);
                              }}
                              onFocus={() => {
                                setShowCollegeDropdown(true);
                                setCollegeSearchTerm("");
                              }}
                            />
                            {isSearchingCollege ? (
                              <div className="px-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              <div className="px-2">
                                <Search className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          {showCollegeDropdown && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover shadow-lg border">
                              {filteredColleges.map((college) => (
                                <div
                                  key={college.id}
                                  className={`relative cursor-default select-none px-3 py-2 text-sm hover:bg-accent ${
                                    field.value === college.id
                                      ? "bg-accent"
                                      : ""
                                  }`}
                                  onClick={() => {
                                    handleCollegeChange(college.id);
                                    setShowCollegeDropdown(false);
                                    setCollegeSearchTerm("");
                                  }}
                                >
                                  <div className="flex justify-between">
                                    <span className="truncate">
                                      {college.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {college.code}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {filteredColleges.length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  No colleges found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          value={getSelectedCollegeName()}
                          readOnly
                          className="h-9 bg-muted text-sm"
                        />
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Designation and Employee ID in one row */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm">Designation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your designation"
                            {...field}
                            readOnly={!isEditMode}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel className="text-sm">Employee ID</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your ID"
                            {...field}
                            readOnly={!isEditMode}
                            className="h-9 text-sm"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          {isEditMode && (
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          )}
        </form>
      </Form>

      {/* Allocated Subjects Section */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Allocated Subjects</CardTitle>
          <CardDescription>
            Subjects allocated to you for teaching
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingSubjects ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
              <span>Loading subjects...</span>
            </div>
          ) : hasSubjects ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Phase</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Academic Year</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.id || subject.subjectId}>
                    <TableCell className="font-medium">
                      {subject.name}
                    </TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>{subject.phaseName}</TableCell>
                    <TableCell>{subject.branchName}</TableCell>
                    <TableCell>{subject.courseName}</TableCell>
                    <TableCell>{subject.academicYearName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="space-y-6">
              <Alert
                variant="destructive"
                className="bg-amber-50 border-amber-200"
              >
                <AlertTitle className="text-amber-800">
                  No subjects allocated
                </AlertTitle>
                <AlertDescription className="text-amber-700">
                  You don't have any subjects allocated to you yet. Please
                  contact your college administrator for subject allocation.
                </AlertDescription>
              </Alert>

              {isLoadingAdmin ? (
                <div className="flex items-center justify-center h-16">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading admin contact...</span>
                </div>
              ) : collegeAdmin ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="font-medium mb-2">
                    College Administrator Contact:
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm">{collegeAdmin.name}</p>
                    <div className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                      <a
                        href={`mailto:${collegeAdmin.email}`}
                        className="text-primary hover:underline"
                      >
                        {collegeAdmin.email}
                      </a>
                    </div>
                    {collegeAdmin.mobileNo && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a
                          href={`tel:${collegeAdmin.mobileNo}`}
                          className="text-primary hover:underline"
                        >
                          {collegeAdmin.mobileNo}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  College administrator contact information is not available.
                  Please contact your institution directly.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
