import { useCurrentUser } from "@/hooks/auth";
import { useStudentProfileStore, VerificationStatus } from "@/store/student";
import { useStudentSubjectStore } from "@/store/studentSubjectStore";
import { UploadButton } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertCircle, 
  Eye, 
  FileText, 
  Link as LinkIcon, 
  Pencil, 
  Save, 
  X, 
  CheckCircle2 
} from "lucide-react";
import { 
  Alert,
  AlertDescription 
} from "@/components/ui/alert";

// Form validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  mobileNo: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits" }),
  dateOfBirth: z.date().optional(),
  Address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  adharNo: z.string().optional(),
  maritalStatus: z.string().optional(),
  rollNo: z.string().optional(),
  collegeId: z.string().optional(),
  branchId: z.string().optional(),
  courseId: z.string().optional(),
  academicYearId: z.string().optional(),
  yearOfPassing: z.string().optional(),
  teacherId: z.string().optional(),
});

const StudentProfileCompact = () => {
  // Get current user
  const user = useCurrentUser();
  const userId = user?.id;

  // Profile store
  const { profile, loading, fetchProfile, createProfile, updateProfile } =
    useStudentProfileStore();

  // Student subject store for academic data
  const {
    colleges,
    fetchcolleges,
    college,
    fetchCollege,
    branches,
    fetchBranches,
    academicYears,
    fetchAcademicYears,
    course,
    fetchCourses,
  } = useStudentSubjectStore();

  // State
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string>("");
  const [collegeIdProofUrl, setCollegeIdProofUrl] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [viewingIdProof, setViewingIdProof] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Display name mappings
  const [collegeDisplayName, setCollegeDisplayName] = useState("");
  const [branchDisplayName, setBranchDisplayName] = useState("");
  const [courseDisplayName, setCourseDisplayName] = useState("");
  const [academicYearDisplayName, setAcademicYearDisplayName] = useState("");

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobileNo: "",
      Address: "",
      country: "",
      state: "",
      city: "",
      adharNo: "",
      maritalStatus: "",
      rollNo: "",
      collegeId: "",
      branchId: "",
      courseId: "",
      academicYearId: "",
      yearOfPassing: "",
      teacherId: "",
    },
  });

  // Fetch profile when userId is available
  useEffect(() => {
    if (userId) {
      fetchProfile({ byUserId: userId });
    }
  }, [userId, fetchProfile]);

  // Fetch academic data
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchcolleges();
        await fetchBranches();
        await fetchAcademicYears();
        await fetchCourses();

        // Fetch specific college if profile has collegeId
        if (profile?.collegeId) {
          await fetchCollege(profile.collegeId);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [profile, fetchBranches, fetchAcademicYears, fetchCourses, fetchCollege, fetchcolleges]);

  // Update form when profile is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || user?.name || "",
        email: profile.email || user?.email || "",
        mobileNo: profile.mobileNo || "",
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth) : undefined,
        Address: profile.Address || "",
        country: profile.country || "",
        state: profile.state || "",
        city: profile.city || "",
        adharNo: profile.adharNo || "",
        maritalStatus: profile.maritalStatus || "",
        rollNo: profile.rollNo || "",
        collegeId: profile.collegeId || "",
        branchId: profile.branchId || "",
        courseId: profile.courseId || "",
        academicYearId: profile.academicYearId || "",
        yearOfPassing: profile.yearOfPassing || "",
        teacherId: profile.teacherId || "",
      });

      setProfilePhotoUrl(profile.profilePhoto || "");
      setCollegeIdProofUrl(profile.collegeIdProof || "");
    }
  }, [profile, form, user]);

  // Update display names for select fields when data is loaded
  useEffect(() => {
    // Map IDs to display names when the data is loaded
    if (profile && colleges && branches && course && academicYears) {
      // Find the display names by ID
      const selectedCollege = colleges.find(c => c.id === profile.collegeId);
      const selectedBranch = branches.find(b => b.id === profile.branchId);
      const selectedCourse = course.find(c => c.id === profile.courseId);
      const selectedYear = academicYears.find(y => y.id === profile.academicYearId);

      // Set display names
      setCollegeDisplayName(selectedCollege?.name || "");
      setBranchDisplayName(selectedBranch?.name || "");
      setCourseDisplayName(selectedCourse?.name || "");
      setAcademicYearDisplayName(selectedYear?.name || "");
    }
  }, [profile, colleges, branches, course, academicYears]);

  const handleCollegeChange = async (collegeId: string) => {
    if (!collegeId) {
      form.setValue("teacherId", "");
      setCollegeDisplayName("");
      return;
    }

    try {
      await fetchCollege(collegeId);
      const selectedCollege = colleges.find((c) => c.id === collegeId);

      if (selectedCollege) {
        setCollegeDisplayName(selectedCollege.name);
        if (selectedCollege.collegeAdminId) {
          form.setValue("teacherId", selectedCollege.collegeAdminId);
        } else {
          form.setValue("teacherId", "");
        }
      }
    } catch (error) {
      console.error("Error fetching college details:", error);
      form.setValue("teacherId", "");
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      const profileData = {
        ...values,
        userId: userId as string,
        profilePhoto: profilePhotoUrl,
        collegeIdProof: collegeIdProofUrl, // Fix: renamed from CollegeIdProof to collegeIdProof
        // Set verification status to PENDING when submitting changes
        verificationStatus: 
          profile?.verificationStatus === VerificationStatus.APPROVED 
            ? VerificationStatus.APPROVED 
            : VerificationStatus.PENDING,
      };

      if (profile) {
        await updateProfile(
          { id: profile.id },
          {
            ...profileData,
            dateOfBirth: values.dateOfBirth
              ? values.dateOfBirth.toISOString()
              : undefined,
          }
        );
      } else {
        await createProfile({
          ...profileData,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.toISOString()
            : undefined,
          verificationStatus: VerificationStatus.PENDING,
        });
      }
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Request verification from college admin
  const requestVerification = async () => {
    try {
      if (profile && college?.collegeAdminId) {
        await updateProfile(
          { id: profile.id },
          {
            ...profile,
            verificationStatus: VerificationStatus.PENDING,
            teacherId: college.collegeAdminId,
          }
        );
      }
    } catch (err) {
      console.error("Error requesting verification:", err);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Card className="w-full shadow-md bg-white">
      <CardHeader className="bg-primary/90 text-white py-4 flex flex-row justify-between items-center">
        <CardTitle className="text-xl font-bold">Student Profile</CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="gap-1 bg-white text-primary hover:bg-gray-100"
            size="sm"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsEditing(false)}
              className="gap-1 text-white hover:bg-primary-foreground/10"
              size="sm"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              className="gap-1 bg-white text-primary hover:bg-gray-100"
              size="sm"
              disabled={isSubmitting}
            >
              <Save className="h-3.5 w-3.5" />
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Profile header with photo and ID proof side by side */}
            <div className="flex flex-wrap md:flex-nowrap gap-6 mb-6">
              {/* Left side: Profile photo with name and email */}
              <div className="w-full md:w-1/2 flex gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-2 border-muted">
                    <AvatarImage src={profilePhotoUrl} />
                    <AvatarFallback className="bg-primary text-white text-xl">
                      {form.getValues("name")?.charAt(0) || user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute -bottom-2 -right-2">
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          setProfilePhotoUrl(res[0].serverData.fileUrl);
                        }}
                        onUploadError={(error: Error) => {
                          console.error("Upload error:", error);
                        }}
                        appearance={{
                          button: {
                            background: "hsl(var(--primary))",
                            color: "white",
                            padding: "0.25rem",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                          },
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="mb-1">
                        <div className="font-semibold text-lg text-primary">
                          {field.value || "Your Name"}
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        {isEditing ? (
                          <>
                            <FormLabel className="text-xs text-muted-foreground">Email</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                className="h-8 text-muted-foreground" 
                                disabled
                              />
                            </FormControl>
                          </>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            {field.value || "your.email@example.com"}
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  
                  {profile?.verificationStatus && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                        profile.verificationStatus === VerificationStatus.APPROVED
                          ? "bg-green-100 text-green-800"
                          : profile.verificationStatus === VerificationStatus.REJECTED
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {profile.verificationStatus}
                      </div>
                      
                      {profile?.verificationStatus === VerificationStatus.REJECTED && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs h-6 px-2"
                          onClick={requestVerification}
                        >
                          Request Verification
                        </Button>
                      )}
                    </div>
                  )}

                  {!profile?.verificationStatus && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs h-6 px-2 mt-1"
                      onClick={requestVerification}
                    >
                      Submit for Verification
                    </Button>
                  )}
                </div>
              </div>

              {/* Right side: College ID Proof */}
              <div className="w-full md:w-1/2">
                <FormLabel className="text-xs block mb-1">College ID Proof</FormLabel>
                <div className="border rounded-md p-3 bg-muted/10 h-20 flex items-center">
                  {collegeIdProofUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground overflow-hidden text-ellipsis max-w-[150px]">
                          {collegeIdProofUrl.split('/').pop()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => window.open(collegeIdProofUrl, '_blank')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {isEditing && (
                          <UploadButton
                            endpoint="imageUploader"
                            onClientUploadComplete={(res) => {
                              setCollegeIdProofUrl(res[0].serverData.fileUrl);
                            }}
                            onUploadError={(error: Error) => {
                              console.error("Upload error:", error);
                            }}
                            appearance={{
                              button: {
                                background: "hsl(var(--primary))",
                                color: "white",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "0.25rem",
                                fontSize: "0.75rem",
                                height: "1.75rem",
                              },
                            }}
                          />
                        )}
                      </div>
                    </div>
                  ) : isEditing ? (
                    <UploadButton
                      endpoint="imageUploader"
                      onClientUploadComplete={(res) => {
                        setCollegeIdProofUrl(res[0].serverData.fileUrl);
                      }}
                      onUploadError={(error: Error) => {
                        console.error("Upload error:", error);
                      }}
                      appearance={{
                        button: {
                          background: "hsl(var(--primary))",
                          color: "white",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "0.25rem",
                          fontSize: "0.75rem",
                        },
                      }}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      No ID proof uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Verification alert if pending */}
            {profile?.verificationStatus === VerificationStatus.PENDING && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-800" />
                <AlertDescription className="text-sm text-yellow-800">
                  Your profile is awaiting verification from the college administrator. You can continue to use the platform in the meantime.
                </AlertDescription>
              </Alert>
            )}

            {/* Approved alert for verification */}
            {profile?.verificationStatus === VerificationStatus.APPROVED && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-800" />
                <AlertDescription className="text-sm text-green-800">
                  Your profile has been verified by the college administrator. You now have full access to all platform features.
                </AlertDescription>
              </Alert>
            )}

            {/* Combined profile form - all fields in one section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
              {/* Left column - Personal details */}
              <div className="space-y-4 bg-blue-50/30 p-4 rounded-lg">
                <h3 className="font-medium text-primary">Personal Details</h3>
                
                <FormField
                  control={form.control}
                  name="mobileNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Mobile Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="9876543210"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Date of Birth</FormLabel>
                      <DatePicker
                        selected={field.value}
                        onChange={field.onChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Select date"
                        className={`flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ${
                          !isEditing ? "bg-muted/30" : ""
                        }`}
                        disabled={!isEditing}
                      />
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Marital Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={!isEditing}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={!isEditing ? "bg-muted/30" : ""}
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="adharNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Aadhar Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="1234 5678 9012"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Middle column - Location details */}
              <div className="space-y-4 bg-green-50/30 p-4 rounded-lg">
                <h3 className="font-medium text-primary">Location</h3>
                
                <FormField
                  control={form.control}
                  name="Address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your address"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">State</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="State"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Country</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Country"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right column - Academic details */}
              <div className="space-y-4 bg-purple-50/30 p-4 rounded-lg">
                <h3 className="font-medium text-primary">Academic Details</h3>
                
                <FormField
                  control={form.control}
                  name="rollNo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Roll Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Roll No"
                          {...field}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-muted/30" : ""}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="collegeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">College</FormLabel>
                      {isEditing ? (
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleCollegeChange(value);
                          }}
                          value={field.value}
                          disabled={!isEditing}
                        >
                          <FormControl>
                            <SelectTrigger
                              className={!isEditing ? "bg-muted/30" : ""}
                            >
                              <SelectValue placeholder="Select College" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {colleges && colleges.map((college) => (
                              <SelectItem key={college.id} value={college.id}>
                                {college.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="p-2 bg-muted/30 border rounded-md text-sm">
                          {collegeDisplayName || "Not selected"}
                        </div>
                      )}
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Branch</FormLabel>
                        {isEditing ? (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Update branch display name
                              const selectedBranch = branches.find(b => b.id === value);
                              setBranchDisplayName(selectedBranch?.name || "");
                            }}
                            value={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={!isEditing ? "bg-muted/30" : ""}
                              >
                                <SelectValue placeholder="Select Branch" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {branches.map((branch) => (
                                <SelectItem key={branch.id} value={branch.id}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-2 bg-muted/30 border rounded-md text-sm">
                            {branchDisplayName || "Not selected"}
                          </div>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="courseId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Course</FormLabel>
                        {isEditing ? (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Update course display name
                              const selectedCourse = course?.find(c => c.id === value);
                              setCourseDisplayName(selectedCourse?.name || "");
                            }}
                            value={field.value}
                            disabled={!isEditing}
                            >
                            <FormControl>
                              <SelectTrigger
                                className={!isEditing ? "bg-muted/30" : ""}
                              >
                                <SelectValue placeholder="Select Course" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {course && course.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-2 bg-muted/30 border rounded-md text-sm">
                            {courseDisplayName || "Not selected"}
                          </div>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="academicYearId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Academic Year</FormLabel>
                        {isEditing ? (
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              // Update academic year display name
                              const selectedYear = academicYears.find(y => y.id === value);
                              setAcademicYearDisplayName(selectedYear?.name || "");
                            }}
                            value={field.value}
                            disabled={!isEditing}
                          >
                            <FormControl>
                              <SelectTrigger
                                className={!isEditing ? "bg-muted/30" : ""}
                              >
                                <SelectValue placeholder="Select Year" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {academicYears && academicYears.map((year) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="p-2 bg-muted/30 border rounded-md text-sm">
                            {academicYearDisplayName || "Not selected"}
                          </div>
                        )}
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="yearOfPassing"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Year of Passing</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Year"
                            {...field}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-muted/30" : ""}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} type="hidden" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Submit button - only visible when editing and on small screens */}
            {isEditing && (
              <div className="mt-6 flex justify-end md:hidden">
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default StudentProfileCompact;