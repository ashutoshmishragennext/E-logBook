// StudentProfile.jsx (Main Component)
'use client';

import { PersonalInfo } from '@/components/student/PersonalInfoTab';
import { AcademicInfo } from '@/components/student/AcademicInfoTab';
import { ProfessionalInfo } from '@/components/student/ProfessionalInfoTab';
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react"; // Import icons

// Define types for the component props
interface StudentProfileProps {
  activeTab: 'personal' | 'academic' | 'professional';
  initialEditMode?: boolean; // Changed to make this optional with a default
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
  rollNo: z.string().optional(),
  enrollmentNo: z.string().optional(),
  admissionBatch: z.string().optional(),
  course: z.string().optional(),
  currentSemester: z.string(),
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
  initialEditMode = false, // Default to view mode if not specified
  existingProfile, 
  userId, 
  onProfileUpdate 
}: StudentProfileProps) {
  const [profilePhotoFileName, setProfilePhotoFileName] = useState<string | null>(null);
  const [collegeIdProofFileName, setCollegeIdProofFileName] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null); // Replace 'any' with a proper type if possible
  const [editMode, setEditMode] = useState<boolean>(initialEditMode); // Local state for edit mode

  // Enable edit mode
  const enableEditMode = () => setEditMode(true);
  
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

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {editMode ? 'Provide your basic personal details' : 'View your personal information'}
                </CardDescription>
              </div>
              {!editMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={enableEditMode}
                  className="flex items-center gap-1"
                >
                  <Pencil size={16} /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <PersonalInfo
                  form={form}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  profilePhotoFileName={profilePhotoFileName}
                  setProfilePhotoFileName={setProfilePhotoFileName}
                  existingProfile={existingProfile}
                  userId={userId}
                  onProfileUpdate={onProfileUpdate}
                />
              </Form>
            </CardContent>
          </Card>
        );
        
      case 'academic':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Academic Information</CardTitle>
                <CardDescription>
                  {editMode ? 'Provide details about your academic background' : 'View your academic information'}
                </CardDescription>
              </div>
              {!editMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={enableEditMode}
                  className="flex items-center gap-1"
                >
                  <Pencil size={16} /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <AcademicInfo
                  form={form}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  existingProfile={existingProfile}
                  collegeIdProofFileName={collegeIdProofFileName}
                  setCollegeIdProofFileName={setCollegeIdProofFileName}
                  userId={userId}
                  onProfileUpdate={onProfileUpdate}
                />
              </Form>
            </CardContent>
          </Card>
        );
        
      case 'professional':
        return (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                  {editMode ? 'Share your professional experiences and aspirations' : 'View your professional information'}
                </CardDescription>
              </div>
              {!editMode && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={enableEditMode}
                  className="flex items-center gap-1"
                >
                  <Pencil size={16} /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <ProfessionalInfo
                  form={form}
                  editMode={editMode}
                  setEditMode={setEditMode}
                  existingProfile={existingProfile}
                  userId={userId}
                  onProfileUpdate={onProfileUpdate}
                />
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