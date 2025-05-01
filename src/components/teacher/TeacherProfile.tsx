import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentUser } from "@/hooks/auth";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/utils/uploadthing";
import debounce from "lodash/debounce";
import { Edit, Loader2, Save, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Types based on the schema
type College = {
  id: string;
  name: string;
  code: string;
};

type Branch = {
  id: string;
  name: string;
  code: string;
  collegeId: string;
};

type Course = {
  id: string;
  name: string;
  code: string;
  level: string;
  branchId: string;
};

type AcademicYear = {
  id: string;
  name: string;
};

type Phase = {
  id: string;
  name: string;
  academicYearId: string;
};

type Subject = {
  id: string;
  name: string;
  code: string;
  phaseId: string;
};

// Teacher profile validation schema
const teacherProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  mobileNo: z
    .string()
    .regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" }),
  location: z.string().min(1, { message: "Location is required" }),
  profilePhoto: z.string().optional(),
  teacherIdProof: z.string().optional(),
  collegeId: z.string().min(1, { message: "College is required" }),
  branchId: z.string().min(1, { message: "Branch/Department is required" }),
  courseId: z.string().min(1, { message: "Course is required" }),
  academicYearId: z.string().min(1, { message: "Academic Year is required" }),
  phaseId: z.string().min(1, { message: "Phase is required" }),
  designation: z.string().min(1, { message: "Designation is required" }),
  employeeId: z.string().min(1, { message: "Employee ID is required" }),
  joiningDate: z.date({ required_error: "Joining date is required" }),
  isActive: z.string().default("true"),
  subjectIds: z.string().array().optional(),
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

  // State for dropdown data
  const [colleges, setColleges] = useState<College[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);

  // State for search
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [isSearchingCollege, setIsSearchingCollege] = useState(false);
  const [isSearchingBranch, setIsSearchingBranch] = useState(false);
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const userId = user?.id || null;

  const form = useForm<TeacherProfileFormData>({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobileNo: "",
      location: "",
      profilePhoto: "",
      teacherIdProof: "",
      collegeId: "",
      branchId: "",
      courseId: "",
      academicYearId: "",
      phaseId: "",
      designation: "",
      employeeId: "",
      joiningDate: new Date(),
      isActive: "true",
      subjectIds: [],
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

  const getSelectedBranchName = () => {
    const branchId = form.getValues("branchId");
    const branch = branches.find((b) => b.id === branchId);
    return branch ? `${branch.name} (${branch.code})` : "No branch selected";
  };

  // Fetch initial data
  useEffect(() => {
    fetchAcademicYears();
    fetchColleges("");
  }, []);

  // Fetch existing profile if user is logged in
  useEffect(() => {
    async function fetchExistingProfile() {
      if (user?.id) {
        try {
          setIsFetchingData(true);
          const response = await fetch(`/api/teacher-profile?id=${user.id}`);
          const data = await response.json();

          if (data && data.length > 0) {
            const profile = data[0];
            setExistingProfile(profile);

            // Populate form with existing data
            form.reset({
              name: profile.name,
              email: profile.email,
              mobileNo: profile.mobileNo,
              location: profile.location || "",
              profilePhoto: profile.profilePhoto || "",
              teacherIdProof: profile.teacherIdProof || "",
              collegeId: profile.collegeId,
              branchId: profile.branchId,
              courseId: profile.courseId,
              academicYearId: profile.academicYearId,
              phaseId: profile.phaseId,
              designation: profile.designation,
              employeeId: profile.employeeId,
              joiningDate: new Date(profile.joiningDate),
              isActive: profile.isActive,
              subjectIds: [],
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

            // Fetch dependencies
            fetchColleges("");
            if (profile.collegeId) {
              fetchBranches(profile.collegeId, "");
            }
            if (profile.branchId) {
              fetchCourses(profile.branchId);
            }
            if (profile.academicYearId) {
              fetchPhases(profile.academicYearId);
            }
            if (profile.phaseId) {
              fetchSubjects(profile.phaseId);
            }
            // Fetch selected subjects
            fetchTeacherSubjects(profile.id);
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
  }, [user?.id, form]);

  // Fetch teacher subjects
  const fetchTeacherSubjects = async (teacherId: string) => {
    try {
      const response = await fetch(
        `/api/teacher-subjects?teacherId=${teacherId}`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const subjectIds = data.map((item: any) => item.subjectId);
        setSelectedSubjects(subjectIds);
        form.setValue("subjectIds", subjectIds);
      }
    } catch (error) {
      console.error("Error fetching teacher subjects:", error);
    }
  };

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

  const fetchBranches = async (collegeId: string, searchTerm: string) => {
    setIsSearchingBranch(true);
    try {
      const response = await fetch(
        `/api/search/branch?collegeId=${collegeId}&search=${searchTerm}`
      );
      const data = await response.json();
      setBranches(data);
      setFilteredBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsSearchingBranch(false);
    }
  };

  const fetchCourses = async (branchId: string) => {
    try {
      const response = await fetch(`/api/search/course?branchId=${branchId}`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const fetchAcademicYears = async () => {
    try {
      const response = await fetch("/api/academicYears");
      const data = await response.json();
      setAcademicYears(data);
    } catch (error) {
      console.error("Error fetching academic years:", error);
    }
  };

  const fetchPhases = async (academicYearId: string) => {
    try {
      const response = await fetch(
        `/api/phase?academicYears=${academicYearId}`
      );
      const data = await response.json();
      setPhases(data);
    } catch (error) {
      console.error("Error fetching phases:", error);
    }
  };

  const fetchSubjects = async (phaseId: string) => {
    try {
      const response = await fetch(`/api/subject?PhaseId=${phaseId}`);
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
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

  const debouncedBranchSearch = debounce((collegeId: string, term: string) => {
    if (branches.length > 0) {
      const filtered = branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(term.toLowerCase()) ||
          branch.code.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredBranches(filtered);
    } else {
      fetchBranches(collegeId, term);
    }
  }, 300);

  // Handle form field changes
  const handleCollegeChange = (collegeId: string) => {
    form.setValue("collegeId", collegeId);
    form.setValue("branchId", "");
    form.setValue("courseId", "");
    setBranches([]);
    setCourses([]);
    fetchBranches(collegeId, "");
    setShowCollegeDropdown(false);
  };

  const handleBranchChange = (branchId: string) => {
    form.setValue("branchId", branchId);
    form.setValue("courseId", "");
    setCourses([]);
    fetchCourses(branchId);
    setShowBranchDropdown(false);
  };

  const handleAcademicYearChange = (academicYearId: string) => {
    form.setValue("academicYearId", academicYearId);
    form.setValue("phaseId", "");
    setPhases([]);
    fetchPhases(academicYearId);
  };

  const handlePhaseChange = (phaseId: string) => {
    form.setValue("phaseId", phaseId);
    fetchSubjects(phaseId);
  };

  const handleSubjectSelection = (subjectId: string) => {
    if (!isEditMode) return;

    const currentSubjects = selectedSubjects.slice();
    const index = currentSubjects.indexOf(subjectId);

    if (index === -1) {
      currentSubjects.push(subjectId);
    } else {
      currentSubjects.splice(index, 1);
    }

    setSelectedSubjects(currentSubjects);
    form.setValue("subjectIds", currentSubjects);
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
          location: existingProfile.location || "",
          profilePhoto: existingProfile.profilePhoto || "",
          teacherIdProof: existingProfile.teacherIdProof || "",
          collegeId: existingProfile.collegeId,
          branchId: existingProfile.branchId,
          courseId: existingProfile.courseId,
          academicYearId: existingProfile.academicYearId,
          phaseId: existingProfile.phaseId,
          designation: existingProfile.designation,
          employeeId: existingProfile.employeeId,
          joiningDate: new Date(existingProfile.joiningDate),
          isActive: existingProfile.isActive,
          subjectIds: selectedSubjects,
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
          joiningDate: values.joiningDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Profile saved successfully", data);

        // If this is a new profile, now we save the subjects
        let teacherId = existingProfile ? existingProfile.id : data.id;

        // Save selected subjects
        if (values.subjectIds && values.subjectIds.length > 0) {
          const subjectsResponse = await fetch("/api/teacher-subjects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              teacherId,
              subjectIds: values.subjectIds,
              academicYearId: values.academicYearId,
              phaseId: values.phaseId,
            }),
          });

          if (!subjectsResponse.ok) {
            console.error("Error saving subjects");
          }
        }

        setExistingProfile(data);
        setIsEditMode(false);

        // Show success message (replace with your toast system)
        alert(
          existingProfile
            ? "Profile updated successfully"
            : "Profile created successfully"
        );
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

                  {/* Status */}
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            value={field.value}
                            className="flex space-x-4"
                            disabled={!isEditMode}
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="true" id="active" />
                              <Label htmlFor="active">Active</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="false" id="inactive" />
                              <Label htmlFor="inactive">Inactive</Label>
                            </div>
                          </RadioGroup>
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
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
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

                {/* Branch Selection */}
                <FormField
                  control={form.control}
                  name="branchId"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">
                        Branch/Department
                      </FormLabel>
                      {isEditMode ? (
                        <div className="relative">
                          <div className="flex items-center border rounded-md">
                            <input
                              className="flex h-9 w-full rounded-md border-0 bg-background px-3 py-1 text-sm"
                              placeholder="Search branches..."
                              value={
                                branchSearchTerm || getSelectedBranchName()
                              }
                              onChange={(e) => {
                                setBranchSearchTerm(e.target.value);
                                debouncedBranchSearch(
                                  form.getValues("collegeId"),
                                  e.target.value
                                );
                              }}
                              onFocus={() => {
                                setShowBranchDropdown(true);
                                setBranchSearchTerm("");
                              }}
                              disabled={!form.getValues("collegeId")}
                            />
                            {isSearchingBranch ? (
                              <div className="px-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                              </div>
                            ) : (
                              <div className="px-2">
                                <Search className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                          {showBranchDropdown && (
                            <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover shadow-lg border">
                              {filteredBranches.map((branch) => (
                                <div
                                  key={branch.id}
                                  className={`relative cursor-default select-none px-3 py-2 text-sm hover:bg-accent ${
                                    field.value === branch.id ? "bg-accent" : ""
                                  }`}
                                  onClick={() => {
                                    handleBranchChange(branch.id);
                                    setShowBranchDropdown(false);
                                    setBranchSearchTerm("");
                                  }}
                                >
                                  <div className="flex justify-between">
                                    <span className="truncate">
                                      {branch.name}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2">
                                      {branch.code}
                                    </span>
                                  </div>
                                </div>
                              ))}
                              {filteredBranches.length === 0 && (
                                <div className="px-3 py-2 text-sm text-muted-foreground">
                                  {form.getValues("collegeId")
                                    ? "No branches found"
                                    : "Select college first"}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Input
                          value={getSelectedBranchName()}
                          readOnly
                          className="h-9 bg-muted text-sm"
                        />
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Course Selection */}
                <FormField
                  control={form.control}
                  name="courseId"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">Course</FormLabel>
                      {isEditMode ? (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={!form.getValues("branchId")}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((course) => (
                              <SelectItem
                                key={course.id}
                                value={course.id}
                                className="text-sm"
                              >
                                <span className="truncate">
                                  {course.name} ({course.code}) - {course.level}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={
                            courses.find((c) => c.id === field.value)?.name ||
                            "Not selected"
                          }
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
                {/* Academic Year Selection */}
                <FormField
                  control={form.control}
                  name="academicYearId"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">Academic Year</FormLabel>
                      {isEditMode ? (
                        <Select
                          onValueChange={(value) => {
                            handleAcademicYearChange(value);
                            field.onChange(value);
                          }}
                          value={field.value}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent>
                            {academicYears.map((year) => (
                              <SelectItem
                                key={year.id}
                                value={year.id}
                                className="text-sm"
                              >
                                {year.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={
                            academicYears.find((y) => y.id === field.value)
                              ?.name || "Not selected"
                          }
                          readOnly
                          className="h-9 bg-muted text-sm"
                        />
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Phase Selection */}
                <FormField
                  control={form.control}
                  name="phaseId"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">Phase</FormLabel>
                      {isEditMode ? (
                        <Select
                          onValueChange={(value) => {
                            handlePhaseChange(value);
                            field.onChange(value);
                          }}
                          value={field.value}
                          disabled={!form.getValues("academicYearId")}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue placeholder="Select phase" />
                          </SelectTrigger>
                          <SelectContent>
                            {phases.map((phase) => (
                              <SelectItem
                                key={phase.id}
                                value={phase.id}
                                className="text-sm"
                              >
                                {phase.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={
                            phases.find((p) => p.id === field.value)?.name ||
                            "Not selected"
                          }
                          readOnly
                          className="h-9 bg-muted text-sm"
                        />
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

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

                {/* Joining Date */}
                {/* <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem className="space-y-1">
                      <FormLabel className="text-sm">Joining Date</FormLabel>
                      {isEditMode ? (
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full h-9 justify-start text-left font-normal text-sm",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      ) : (
                        <Input
                          value={
                            field.value
                              ? format(field.value, "PPP")
                              : "Not specified"
                          }
                          readOnly
                          className="h-9 bg-muted text-sm"
                        />
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                /> */}
              </div>
            </CardContent>
          </Card>

          {/* Subjects Section */}
          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
              <CardDescription>Select the subjects you teach</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="subjectIds"
                render={() => (
                  <FormItem>
                    <div className="flex flex-wrap gap-2">
                      {subjects.length > 0 ? (
                        subjects.map((subject) => (
                          <Badge
                            key={subject.id}
                            variant={
                              selectedSubjects.includes(subject.id)
                                ? "default"
                                : "outline"
                            }
                            className={cn(
                              "cursor-pointer",
                              !isEditMode && "cursor-default"
                            )}
                            onClick={() => handleSubjectSelection(subject.id)}
                          >
                            {subject.name} ({subject.code})
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {form.getValues("phaseId")
                            ? "No subjects available for the selected phase"
                            : "Please select a phase first"}
                        </p>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
    </div>
  );
}
