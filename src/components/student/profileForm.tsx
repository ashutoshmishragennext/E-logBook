'use client';

import { PersonalInfo } from '@/components/student/PersonalInfoTab';
import { AcademicInfo } from '@/components/student/AcademicInfoTab';
import { ProfessionalInfo } from '@/components/student/ProfessionalInfoTab';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

// Define types for the component props
interface StudentProfileProps {
  activeTab: 'personal' | 'academic' | 'professional';
  editMode: boolean;
  existingProfile: any; // Consider replacing 'any' with a proper interface for your profile data
  userId: string;
  onProfileUpdate: () => void;
}

// Profile schema for form validation
const profileSchema = z.object({
  // Personal Info Fields
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  mobileNo: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  dateOfBirth: z.date().nullable(),
  adharNo: z.string().length(12, "Aadhar number must be 12 digits").optional(),
  maritalStatus: z.string().optional(),
  children: z.string().optional(),
  nameAndOccpationOfSpouse: z.string().optional(),
  profilePhoto: z.string().optional(),
  teacherId: z.string().optional(),
  
  // Academic Info Fields
  rollNo: z.string().min(1, "Roll number is required"),
  enrollmentNo: z.string().min(1, "Enrollment number is required"),
  admissionBatch: z.string().min(1, "Admission batch is required"),
  course: z.string().min(1, "Course is required"),
  currentSemester: z.string().min(1, "Current semester is required"),
  subject: z.string().optional(),
  branchId: z.string().optional(),
  previousInstitution: z.string().optional(),
  yearOfPassing: z.string().optional(),
  attempt: z.string().optional(),
  dateOfJoining: z.date().nullable(),
  dateOfCompletion: z.date().nullable(),
  graduationDate: z.date().nullable(),
  enrollmentStatus: z.string().optional(),
  collegeIdProof: z.string().optional(),
  
  // Professional Info Fields
  previousExperience: z.string().optional(),
  specialInterest: z.string().optional(),
  futurePlan: z.string().optional(),
});

// Infer the TypeScript type from the Zod schema
type ProfileFormValues = z.infer<typeof profileSchema>;

export default function StudentProfile({ 
  activeTab, 
  editMode, 
  existingProfile, 
  userId, 
  onProfileUpdate 
}: StudentProfileProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [profilePhotoFileName, setProfilePhotoFileName] = useState<string | null>(null);
  const [collegeIdProofFileName, setCollegeIdProofFileName] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); // Replace 'any' with a proper type if possible
  
  // Get user data from session
  useEffect(() => {
    if (!userId) return;
    
    const fetchUserData = async () => {
      try {
        const res = await fetch(`/api/user?userId=${userId}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to fetch user");
        }
        
        const data = await res.json();
        setUserData(data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        toast.error("Failed to fetch user data");
      }
    };

    fetchUserData();
  }, [userId]);
  
  // Initialize form with TypeScript type
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      mobileNo: "",
      dateOfBirth: null,
      adharNo: "",
      maritalStatus: "",
      children: "",
      nameAndOccpationOfSpouse: "",
      profilePhoto: "",
      teacherId: "",
      
      rollNo: "",
      enrollmentNo: "",
      admissionBatch: "",
      course: "",
      currentSemester: "",
      subject: "",
      branchId: "",
      previousInstitution: "",
      yearOfPassing: "",
      attempt: "",
      dateOfJoining: null,
      dateOfCompletion: null,
      graduationDate: null,
      enrollmentStatus: "ACTIVE",
      collegeIdProof: "",
      
      previousExperience: "",
      specialInterest: "",
      futurePlan: "",
    }
  });
  
  // Update form when existingProfile or user changes
  useEffect(() => {
    if (existingProfile || userData) {
      console.log("Setting form values from:", { existingProfile, userData });
      
      form.reset({
        // Prioritize user data from session, fall back to existingProfile
        name: userData?.name || existingProfile?.name || "",
        email: userData?.email || existingProfile?.email || "",
        mobileNo: userData?.phone || existingProfile?.mobileNo || "",
        
        // Rest of the fields from existingProfile
        dateOfBirth: existingProfile?.dateOfBirth ? new Date(existingProfile.dateOfBirth) : null,
        adharNo: existingProfile?.adharNo || "",
        maritalStatus: existingProfile?.maritalStatus || "",
        children: existingProfile?.children || "",
        nameAndOccpationOfSpouse: existingProfile?.nameAndOccpationOfSpouse || "",
        profilePhoto: existingProfile?.profilePhoto || "",
        teacherId: existingProfile?.teacherId || "",
        
        rollNo: existingProfile?.rollNo || "",
        enrollmentNo: existingProfile?.enrollmentNo || "",
        admissionBatch: existingProfile?.admissionBatch || "",
        course: existingProfile?.course || "",
        currentSemester: existingProfile?.currentSemester || "",
        subject: existingProfile?.subject || "",
        branchId: existingProfile?.branchId || "",
        previousInstitution: existingProfile?.previousInstitution || "",
        yearOfPassing: existingProfile?.yearOfPassing || "",
        attempt: existingProfile?.attempt || "",
        dateOfJoining: existingProfile?.dateOfJoining ? new Date(existingProfile.dateOfJoining) : null,
        dateOfCompletion: existingProfile?.dateOfCompletion ? new Date(existingProfile.dateOfCompletion) : null,
        graduationDate: existingProfile?.graduationDate ? new Date(existingProfile.graduationDate) : null,
        enrollmentStatus: existingProfile?.enrollmentStatus || "ACTIVE",
        collegeIdProof: existingProfile?.collegeIdProof || "",
        
        previousExperience: existingProfile?.previousExperience || "",
        specialInterest: existingProfile?.specialInterest || "",
        futurePlan: existingProfile?.futurePlan || "",
      });
    }
  }, [existingProfile, userData, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) {
      toast.error("User ID is required");
      return;
    }

    setIsLoading(true);
    console.log("Submitting form data:", data);
    
    try {
      // Prepare the data for API
      const apiData = {
        userId,
        ...data,
        // Convert Date objects to ISO strings for API
        dateOfBirth: data.dateOfBirth ? data.dateOfBirth.toISOString() : null,
        dateOfJoining: data.dateOfJoining ? data.dateOfJoining.toISOString() : null,
        dateOfCompletion: data.dateOfCompletion ? data.dateOfCompletion.toISOString() : null,
        graduationDate: data.graduationDate ? data.graduationDate.toISOString() : null,
      };

      // Determine if creating or updating
      const method = existingProfile?.id ? "PUT" : "POST";
      const url = existingProfile?.id 
        ? `/api/student-profile?id=${existingProfile.id}` 
        : "/api/student-profile";

      console.log(`Making ${method} request to ${url} with data:`, apiData);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
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
      
      toast.success("Profile information saved successfully");
      
    } catch (error) {
      console.error("Error saving profile information:", error);
      toast.error(`Failed to save profile information: ${(error as Error).message || "Please try again."}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Provide your basic personal details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <PersonalInfo
                    form={form}
                    editMode={editMode}
                    profilePhotoFileName={profilePhotoFileName}
                    setProfilePhotoFileName={setProfilePhotoFileName}
                    existingProfile={existingProfile}
                  />
                  <div className="flex justify-end mt-6">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !editMode}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      case 'academic':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Academic Information</CardTitle>
              <CardDescription>
                Provide details about your academic background
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <AcademicInfo
                    form={form}
                    editMode={editMode}
                    existingProfile={existingProfile}
                    collegeIdProofFileName={collegeIdProofFileName}
                    setCollegeIdProofFileName={setCollegeIdProofFileName}
                  />
                  <div className="flex justify-end mt-6">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !editMode}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      case 'professional':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Professional Information</CardTitle>
              <CardDescription>
                Share your professional experiences and aspirations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <ProfessionalInfo
                    form={form}
                    editMode={editMode}
                  />
                  <div className="flex justify-end mt-6">
                    <Button 
                      type="submit" 
                      disabled={isLoading || !editMode}
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        );
        
      default:
        return (
          <div className="text-center p-8 text-gray-500">
            Select a profile section
          </div>
        );
    }
  };

  return renderContent();
}