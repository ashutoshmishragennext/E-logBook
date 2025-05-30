/*eslint-disable @typescript-eslint/no-unused-vars */
/*eslint-disable @typescript-eslint/no-explicit-any */
/*eslint-disable react-hooks/exhaustive-deps */

import { useCurrentUser } from "@/hooks/auth";
import { useStudentProfileStore, VerificationStatus } from "@/store/student";
import { useStudentSubjectStore } from "@/store/studentSubjectStore";
import { UploadButton } from "@/utils/uploadthing";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ICountry,
  IState,  
  ICity,
  Country,
  State,
  City,
} from "country-state-city";

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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Eye,
  FileText,
  Link as LinkIcon,
  Pencil,
  Save,
  X,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SearchableSubjectSelect from "@/components/adminComponent/SubjectSerachSelect";

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
  adharNo: z
    .string()
    .regex(
      /^\d{12}$/,
      "Aadhar number must be exactly 12 digits and contain no letters."
    ),
  maritalStatus: z.string().optional(),
  yearOfPassing: z.string().optional(),
  academicYearId: z.string().optional(),
  courseId: z.string().optional(),
  branchId: z.string().optional(),
  rollNo: z.string().optional(),
  collegeId: z.string().optional(),
  teacherId: z.string().optional(),
});

const StudentProfileCompact = () => {
  // Get current user
  const user = useCurrentUser();
  const userId = user?.id;

  // Profile store
  const { profile, loading, error, fetchProfile, createProfile, updateProfile } =
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  // Country, State, City selection
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedState, setSelectedState] = useState<IState | null>(null);
  const [selectedCity, setSelectedCity] = useState<ICity | null>(null);
  const [allCountries, setAllCountries] = useState<ICountry[]>([]);
  const [states, setStates] = useState<IState[]>([]);
  const [cities, setCities] = useState<ICity[]>([]);

  // Display name mappings
  const [collegeDisplayName, setCollegeDisplayName] = useState("");
  const [branchDisplayName, setBranchDisplayName] = useState("");
  const [courseDisplayName, setCourseDisplayName] = useState("");
  const [academicYearDisplayName, setAcademicYearDisplayName] = useState("");

  // Check if profile is verified (used to lock certain fields)
  const isProfileVerified =
    profile?.verificationStatus === VerificationStatus.APPROVED;

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNo: "",
      Address: "",
      country: "",
      state: "",
      city: "",
      adharNo: "",
      maritalStatus: "",
      yearOfPassing: "",
      academicYearId: "",
      courseId: "",
      branchId: "",
      rollNo: "",
      collegeId: "",
      teacherId: "",
    },
  });

  // Debug logging
  useEffect(() => {
    console.log('Form state changed:', {
      isEditing,
      isSubmitting,
      profileExists: !!profile,
      profileId: profile?.id,
      formInitialized,
      formValues: form.getValues(),
      formErrors: form.formState.errors
    });
  }, [isEditing, isSubmitting, profile, form.formState, formInitialized]);

  // Initialize countries on component mount
  useEffect(() => {
    try {
      const countries = Country.getAllCountries();
      setAllCountries(countries || []);
    } catch (error) {
      console.error("Error loading countries:", error);
      setAllCountries([]);
    }
  }, []);

  // Get states for selected country
  useEffect(() => {
    if (selectedCountry) {
      try {
        const stateList = State.getStatesOfCountry(selectedCountry.isoCode);
        setStates(stateList || []);
        setSelectedState(null);
        setSelectedCity(null);
        setCities([]);
        if (!formInitialized) {
          form.setValue("state", "");
          form.setValue("city", "");
        }
      } catch (error) {
        console.error("Error loading states:", error);
        setStates([]);
      }
    } else {
      setStates([]);
      setSelectedState(null);
      setSelectedCity(null);
      setCities([]);
    }
  }, [selectedCountry, form, formInitialized]);

  // Get cities for selected state
  useEffect(() => {
    if (selectedState && selectedCountry) {
      try {
        const cityList = City.getCitiesOfState(
          selectedState.countryCode,
          selectedState.isoCode
        );
        setCities(cityList || []);
        setSelectedCity(null);
        if (!formInitialized) {
          form.setValue("city", "");
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        setCities([]);
      }
    } else {
      setCities([]);
      setSelectedCity(null);
    }
  }, [selectedState, selectedCountry, form, formInitialized]);

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
        await Promise.all([
          fetchcolleges(),
          fetchBranches(),
          fetchAcademicYears(),
          fetchCourses(),
        ]);

        // Fetch specific college if profile has collegeId
        if (profile?.collegeId) {
          await fetchCollege(profile.collegeId);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [
    profile?.collegeId,
    fetchBranches,
    fetchAcademicYears,
    fetchCourses,
    fetchCollege,
    fetchcolleges,
  ]);

  // Reset form data function
  const resetFormData = useCallback(() => {
    if (!profile) return;

    const formData = {
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
      yearOfPassing: profile.yearOfPassing || "",
      academicYearId: profile.academicYearId || "",
      courseId: profile.courseId || "",
      branchId: profile.branchId || "",
      rollNo: profile.rollNo || "",
      collegeId: profile.collegeId || "",
      teacherId: profile.teacherId || "",
    };

    form.reset(formData);
    setProfilePhotoUrl(profile.profilePhoto || "");
    setCollegeIdProofUrl(profile.collegeIdProof || "");
    setFormInitialized(true);
  }, [profile, user, form]);

  // Update form when profile is loaded - CRITICAL FIX
  useEffect(() => {
    if (profile && !loading && !error) {
      console.log('Profile loaded, updating form data');
      
      // Only reset form if we're not in edit mode to prevent form reset during editing
      if (!isEditing) {
        resetFormData();
      }

      // Set location selections
      if (profile.country && allCountries.length > 0) {
        const country = allCountries.find((c) => c.name === profile.country);
        if (country) {
          setSelectedCountry(country);
        }
      }
    }
  }, [profile, loading, error, isEditing, allCountries, resetFormData]);

  // Set state and city selections when data is available
  useEffect(() => {
    if (profile?.state && states.length > 0 && !isEditing) {
      const state = states.find((s) => s.name === profile.state);
      if (state) {
        setSelectedState(state);
      }
    }
  }, [profile?.state, states, isEditing]);

  useEffect(() => {
    if (profile?.city && cities.length > 0 && !isEditing) {
      const city = cities.find((c) => c.name === profile.city);
      if (city) {
        setSelectedCity(city);
      }
    }
  }, [profile?.city, cities, isEditing]);

  // Update display names for select fields when data is loaded
  useEffect(() => {
    if (profile && colleges && branches && course && academicYears) {
      const selectedCollege = colleges.find((c) => c.id === profile.collegeId);
      const selectedBranch = branches.find((b) => b.id === profile.branchId);
      const selectedCourse = course.find((c) => c.id === profile.courseId);
      const selectedYear = academicYears.find(
        (y) => y.id === profile.academicYearId
      );

      setCollegeDisplayName(selectedCollege?.name || "");
      setBranchDisplayName(selectedBranch?.name || "");
      setCourseDisplayName(selectedCourse?.name || "");
      setAcademicYearDisplayName(selectedYear?.name || "");
    }
  }, [profile, colleges, branches, course, academicYears]);

  const handleCountrySelect = (countryName: string) => {
    const country = allCountries.find((c) => c.name === countryName);
    setSelectedCountry(country || null);
    form.setValue("country", countryName);
  };

  const handleStateSelect = (stateName: string) => {
    const state = states.find((s) => s.name === stateName);
    setSelectedState(state || null);
    form.setValue("state", stateName);
  };

  const handleCitySelect = (cityName: string) => {
    const city = cities.find((c) => c.name === cityName);
    setSelectedCity(city || null);
    form.setValue("city", cityName);
  };

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

  const handleEditClick = () => {
    console.log("Edit button clicked");
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    console.log("Cancel button clicked");
    // Reset form to original profile data
    if (profile) {
      resetFormData();
    }
    setIsEditing(false);
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    console.log("Save button clicked");

    // Prevent any default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (isProfileVerified) {
      console.log("Profile is verified - showing dialog");
      setDialogOpen(true);
    } else {
      console.log("Profile not verified - submitting form directly");
      // Trigger form validation and submission
      form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log("=== FORM SUBMISSION STARTED ===");
    console.log("Form values:", values);
    console.log("Current profile:", profile);
    console.log("Is profile verified:", isProfileVerified);

    try {
      setIsSubmitting(true);
      setDialogOpen(false);

      // Validate required fields
      if (!values.name || !values.email || !values.mobileNo) {
        throw new Error("Please fill in all required fields");
      }

      let profileData: any;

      if (isProfileVerified && profile) {
        console.log("Updating verified profile - preserving locked fields");
        profileData = {
          ...values,
          userId: userId as string,
          profilePhoto: profilePhotoUrl,
          collegeIdProof: collegeIdProofUrl,
          // Preserve locked fields for verified profiles
          adharNo: profile.adharNo,
          dateOfBirth: profile.dateOfBirth,
          rollNo: profile.rollNo,
          collegeId: profile.collegeId,
          branchId: profile.branchId,
          courseId: profile.courseId,
          academicYearId: profile.academicYearId,
          yearOfPassing: profile.yearOfPassing,
          verificationStatus: VerificationStatus.APPROVED,
        };
      } else {
        console.log("Creating new profile or updating unverified profile");
        profileData = {
          ...values,
          userId: userId as string,
          profilePhoto: profilePhotoUrl,
          collegeIdProof: collegeIdProofUrl,
          verificationStatus:
            profile?.verificationStatus === VerificationStatus.APPROVED
              ? VerificationStatus.APPROVED
              : VerificationStatus.PENDING,
        };
      }

      let result;
      if (profile?.id) {
        console.log("Updating existing profile with ID:", profile.id);
        result = await updateProfile(
          { id: profile.id },
          {
            ...profileData,
            dateOfBirth: isProfileVerified
              ? profile.dateOfBirth
              : values.dateOfBirth
              ? values.dateOfBirth.toISOString()
              : undefined,
          }
        );
        console.log("Profile updated successfully:", result);
      } else {
        console.log("Creating new profile");
        result = await createProfile({
          ...profileData,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.toISOString()
            : undefined,
          verificationStatus: VerificationStatus.PENDING,
        });
        console.log("Profile created successfully:", result);
      }

      // Success: exit edit mode and refresh data
      setIsEditing(false);
      setFormInitialized(false); // Allow form to be reinitialized with new data

      console.log("=== FORM SUBMISSION COMPLETED SUCCESSFULLY ===");
    } catch (err: any) {
      console.error("=== FORM SUBMISSION ERROR ===", err);

      // Handle specific error types
      if (err.message.includes("network") || err.message.includes("fetch")) {
        console.error("Network error - check your internet connection");
      } else if (err.message.includes("validation")) {
        console.error("Validation error - check your form data");
      }

      // Optional: Show error message to user
      alert(`Error saving profile: ${err.message}`);
    } finally {
      setIsSubmitting(false);
      console.log("Form submission cleanup completed");
    }
  };

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
            onClick={handleEditClick}
            className="gap-1 bg-white text-primary hover:bg-gray-100"
            size="sm"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={handleCancelClick}
            className="gap-1 text-white hover:bg-primary-foreground/10"
            size="sm"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-4">
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault(); // Critical: prevent default browser form submission
              console.log("Form submit event triggered");
              form.handleSubmit(onSubmit)(e);
            }}
          >
            {/* Profile header with photo and ID proof side by side */}
            <div className="flex flex-wrap md:flex-nowrap gap-6 mb-6">
              {/* Left side: Profile photo with name and email */}
              <div className="w-full md:w-1/2 flex gap-4">
                <div className="relative px-4">
                  <Avatar className="h-20 w-20 border-2 border-muted">
                    <AvatarImage src={profilePhotoUrl} />
                    <AvatarFallback className="bg-primary text-white text-xl">
                      {form.getValues("name")?.charAt(0) ||
                        user?.name?.charAt(0) ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <div className="absolute ">
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
                            padding: "0",
                            margin: "3px 4px",
                            width: "100px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px",
                            cursor: "pointer",
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
                            <FormLabel className="text-xs text-muted-foreground">
                              Email
                            </FormLabel>
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
                      <div
                        className={`text-xs px-2 py-0.5 rounded-full inline-block ${
                          profile.verificationStatus ===
                          VerificationStatus.APPROVED
                            ? "bg-green-100 text-green-800"
                            : profile.verificationStatus ===
                              VerificationStatus.REJECTED
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {profile.verificationStatus}
                      </div>

                      {profile?.verificationStatus ===
                        VerificationStatus.REJECTED && (
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

                  {!profile?.verificationStatus && !profile && (
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
                <FormLabel className="text-xs block mb-1">
                  College ID Proof
                </FormLabel>
                <div className="border rounded-md p-3 bg-muted/10 flex items-center">
                  {collegeIdProofUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 w-full">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground overflow-hidden text-ellipsis max-w-[150px]">
                          {collegeIdProofUrl.split("/").pop()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() =>
                            window.open(collegeIdProofUrl, "_blank")
                          }
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        {isEditing && !isProfileVerified && (
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
                  ) : isEditing && !isProfileVerified ? (
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

            {/* Verification alerts */}
            {profile?.verificationStatus === VerificationStatus.PENDING && (
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-800" />
                <AlertDescription className="text-sm text-yellow-800">
                  Your profile is awaiting verification from the college
                  administrator. You can continue to use the platform in the
                  meantime.
                </AlertDescription>
              </Alert>
            )}

            {profile?.verificationStatus === VerificationStatus.APPROVED && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-800" />
                <AlertDescription className="text-sm text-green-800">
                  Your profile has been verified by the college administrator.
                  You now have full access to all platform features.
                </AlertDescription>
              </Alert>
            )}

            {profile?.verificationStatus === VerificationStatus.REJECTED && (
              <Alert className="mb-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-800" />
                <AlertDescription className="text-sm text-red-800">
                  Your profile verification was rejected. Reason - {""}
                  {profile?.rejectionReason}
                </AlertDescription>
              </Alert>
            )}

            {/* Personal Information Section */}
            <Separator className="my-4" />
            <h3 className="font-medium text-sm mb-3">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Your full name"
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
                    <FormLabel className="text-xs flex items-center gap-1">
                      Date of Birth
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={
                          field.value
                            ? typeof field.value === "string"
                              ? field.value
                              : field.value instanceof Date
                              ? field.value.toISOString().slice(0, 10)
                              : ""
                            : ""
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value ? new Date(value) : undefined);
                        }}
                        className={`h-9 ${
                          !isEditing || (isProfileVerified && isEditing)
                            ? "bg-muted/30"
                            : ""
                        }`}
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                      />
                    </FormControl>
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
                    <FormControl>
                      <SearchableSubjectSelect
                        options={[
                          { label: "Single", value: "single" },
                          { label: "Married", value: "married" },
                          { label: "Divorced", value: "divorced" },
                          { label: "Widowed", value: "widowed" },
                        ]}
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select status"
                        disabled={!isEditing}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adharNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      Aadhar Number
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="1234 5678 9012"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 12);
                          field.onChange(value);
                        }}
                        value={field.value}
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                        className={
                          !isEditing || (isProfileVerified && isEditing)
                            ? "bg-muted/30"
                            : ""
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Address Information Section */}
            <Separator className="my-4" />
            <h3 className="font-medium text-sm mb-3">Address Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Country</FormLabel>
                    <FormControl>
                      <SearchableSubjectSelect
                        options={allCountries.map((country) => ({
                          label: country.name,
                          value: country.name,
                        }))}
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                          handleCountrySelect(value);
                        }}
                        placeholder="Select country"
                        disabled={!isEditing}
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
                      <SearchableSubjectSelect
                        options={states.map((state) => ({
                          label: state.name,
                          value: state.name,
                        }))}
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                          handleStateSelect(value);
                        }}
                        placeholder="Select state"
                        disabled={!isEditing || !selectedCountry}
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
                      <SearchableSubjectSelect
                        options={cities.map((city) => ({
                          label: city.name,
                          value: city.name,
                        }))}
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                          handleCitySelect(value);
                        }}
                        placeholder="Select city"
                        disabled={!isEditing || !selectedState}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="Address"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel className="text-xs">Address</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your full address"
                      {...field}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-muted/30" : ""}
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            {/* Academic Information Section */}
            <Separator className="my-4" />
            <h3 className="font-medium text-sm mb-3">Academic Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <FormField
                control={form.control}
                name="rollNo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      Roll Number
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter roll number"
                        {...field}
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                        className={
                          !isEditing || (isProfileVerified && isEditing)
                            ? "bg-muted/30"
                            : ""
                        }
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
                    <FormLabel className="text-xs flex items-center gap-1">
                      College
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <SearchableSubjectSelect
                        options={
                          colleges?.map((college) => ({
                            label: college.name,
                            value: college.id,
                          })) || []
                        }
                        value={field.value || ""}
                        onChange={(value) => {
                          field.onChange(value);
                          handleCollegeChange(value);
                        }}
                        placeholder="Select college"
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="yearOfPassing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      Year of Passing
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2024"
                        {...field}
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                        className={
                          !isEditing || (isProfileVerified && isEditing)
                            ? "bg-muted/30"
                            : ""
                        }
                        min="1950"
                        max="2030"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicYearId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      Academic Year
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <SearchableSubjectSelect
                        options={
                          academicYears?.map((year) => ({
                            label: year.name,
                            value: year.id,
                          })) || []
                        }
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select academic year"
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      Course
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <SearchableSubjectSelect
                        options={
                          course?.map((c) => ({
                            label: c.name,
                            value: c.id,
                          })) || []
                        }
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select course"
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs flex items-center gap-1">
                      Branch
                      {isProfileVerified && isEditing && (
                        <span className="text-xs text-amber-600">
                          <span title="Cannot be changed after verification">
                            <Info className="h-3 w-3" />
                          </span>
                        </span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <SearchableSubjectSelect
                        options={
                          branches?.map((branch) => ({
                            label: branch.name,
                            value: branch.id,
                          })) || []
                        }
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Select branch"
                        disabled={
                          !isEditing || (isProfileVerified && isEditing)
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Save Button */}
            {isEditing && (
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button" // Keep as button to prevent form submission
                  onClick={handleSaveClick}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            )}
          </form>
        </Form>

        {/* Confirmation Dialog for Verified Profile Changes */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Profile Already Verified</DialogTitle>
              <DialogDescription>
                Your profile has already been verified by the college
                administrator. Some fields cannot be modified after
                verification. Are you sure you want to proceed with saving the
                changes to the allowed fields?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Dialog confirmed - submitting form");
                  form.handleSubmit(onSubmit)();
                }}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StudentProfileCompact;
