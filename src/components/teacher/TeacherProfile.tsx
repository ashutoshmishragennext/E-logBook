/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { UploadButton } from "@/utils/uploadthing";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from '@/hooks/auth';
import Image from 'next/image';

// Zod schema for teacher profile validation
const teacherProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  mobileNo: z.string().regex(/^\d{10}$/, { message: "Mobile number must be 10 digits" }),
  location: z.string().optional(),
  profilePhoto: z.string().optional(),
  teacherIdProof: z.string().optional(),
});

type TeacherProfileFormData = z.infer<typeof teacherProfileSchema>;

export function TeacherProfilePage() {
  const user = useCurrentUser();
  const [profilePhotoFileName, setProfilePhotoFileName] = useState<string | null>(null);
  const [teacherIdProofFileName, setTeacherIdProofFileName] = useState<string | null>(null);
  const [existingProfile, setExistingProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const userId = user?.id || null;
  console.log("userId", userId);

  const form = useForm<TeacherProfileFormData>({
    resolver: zodResolver(teacherProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      mobileNo: '',
      location: '',
      profilePhoto: '',
      teacherIdProof: '',
    }
  });

  useEffect(() => {
    async function fetchExistingProfile() {
      if (user?.id) {
        try {
          const response = await fetch(`/api/teacher-profile?id=${user.id}`);
          const data = await response.json();
          
          if (data.length > 0) {
            const profile = data[0];
            setExistingProfile(profile);
            form.reset({
              name: profile.name,
              mobileNo: profile.mobileNo,
              email: profile.email,
              location: profile.location || '',
              profilePhoto: profile.profilePhoto || '',
              teacherIdProof: profile.teacherIdProof || profile.collegeIdProof || ''
            });

            // Set file names if URLs exist
            if (profile.profilePhoto) {
              setProfilePhotoFileName(profile.profilePhoto.split('/').pop() || null);
            }
            if (profile.teacherIdProof || profile.collegeIdProof) {
              setTeacherIdProofFileName((profile.teacherIdProof || profile.collegeIdProof).split('/').pop() || null);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Uncomment and replace with your preferred toast notification
          // toast.error('Failed to fetch existing profile');
        }
      }
    }

    fetchExistingProfile();
  }, [user?.id, form.reset]);

  // Handle form submission
  const onSubmit = async (values: TeacherProfileFormData) => {
    setIsLoading(true);
    try {
      const endpoint = existingProfile 
        ? `/api/teacher-profile?id=${userId}` 
        : `/api/teacher-profile?id=${userId}`;
      
      const method = existingProfile ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          userId: user?.id
        })
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Profile saved successfully", data);
        // Uncomment and replace with your preferred toast notification
        // toast.success(existingProfile 
        //   ? "Profile Updated Successfully" 
        //   : "Profile Created Successfully", {
        //   description: `Your teacher profile has been ${existingProfile ? 'updated' : 'created'}.`
        // });
        setExistingProfile(data);
      } else {
        console.error("Error saving profile:", data);
        // Uncomment and replace with your preferred toast notification
        // toast.error("Error", {
        //   description: data.message || "Something went wrong"
        // });
      }
    } catch (error) {
      console.error("Network error:", error);
      // Uncomment and replace with your preferred toast notification
      // toast.error("Error", {
      //   description: "Network error. Please try again."
      // });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Teacher Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Name Field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field}  readOnly 
                        className="bg-gray-100 cursor-not-allowed"/>
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
                        className="bg-gray-100 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                      <Input placeholder="Enter your location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Profile Photo Upload */}
            <FormField
              control={form.control}
              name="profilePhoto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Photo</FormLabel>
                  <FormControl>
                    <div>
                      <UploadButton
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res.length > 0) {
                            const uploadedFileUrl = res[0].serverData.fileUrl;
                            form.setValue("profilePhoto", uploadedFileUrl);
                            setProfilePhotoFileName(res[0].name);
                          }
                        }}
                        onUploadError={(error) => {
                          console.error('Upload Error:', error);
                        }}
                      />
                      {profilePhotoFileName && (
                        <div className="mt-2 text-sm text-gray-600">
                          Uploaded: {profilePhotoFileName}
                        </div>
                      )}
                      {field.value && (
                        <div className="mt-2">
                          <Image
                            src={field.value} 
                            alt="Profile" 
                            className="h-24 w-24 rounded-full object-cover"
                            width={96}
                            height={96}
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Teacher ID Proof Upload */}
            <FormField
              control={form.control}
              name="teacherIdProof"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teacher ID Proof</FormLabel>
                  <FormControl>
                    <div>
                      <UploadButton
                        endpoint="docUploader"
                        onClientUploadComplete={(res) => {
                          if (res.length > 0) {
                            const uploadedFileUrl = res[0].serverData.fileUrl;
                            form.setValue("teacherIdProof", uploadedFileUrl);
                            setTeacherIdProofFileName(res[0].name);
                          }
                        }}
                        onUploadError={(error) => {
                          console.error('Upload Error:', error);
                        }}
                      />
                      {teacherIdProofFileName && (
                        <div className="mt-2 text-sm text-gray-600">
                          Uploaded: {teacherIdProofFileName}
                        </div>
                      )}
                      {field.value && (
                        <div className="mt-2">
                          <a 
                            href={field.value} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline"
                          >
                            View Uploaded Document
                          </a>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="mt-4">
                {isLoading ? 'Saving...' : 'Update Profile'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default TeacherProfilePage;