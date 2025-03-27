import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl,  
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useCurrentUser } from '@/hooks/auth';
import { Toaster } from "@/components/ui/sonner"
import { UploadButton } from '@/utils/uploadthing';



// Zod validation schema
const studentProfileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  rollNo: z.string().min(4, { message: "Roll Number must be at least 4 characters" }),
  mobileNo: z.string().regex(/^[0-9]{10}$/, { message: "Mobile number must be 10 digits" }),
  email: z.string().email({ message: "Invalid email address" }),
  location: z.string().optional(),
  admissionBatch: z.string().min(4, { message: "Admission Batch is required" }),
  course: z.string().min(2, { message: "Course is required" }),
  subject: z.string().min(2, { message: "Subject is required" }),
  profilePhoto: z.string().optional(),
  collegeIdProof: z.string().optional()
});

export default function StudentProfileForm() {
  const user = useCurrentUser();
  const [isLoading, setIsLoading] = useState(false);
  const [existingProfile, setExistingProfile] = useState(null);
  const [profilePhotoFileName, setProfilePhotoFileName] = useState<string | null>(null);
  const [collegeIdProofFileName, setCollegeIdProofFileName] = useState<string | null>(null);

  // Initialize form with react-hook-form and zod
  const form = useForm<z.infer<typeof studentProfileSchema>>({
    resolver: zodResolver(studentProfileSchema),
    defaultValues: {
      name: user?.name || '',
      rollNo: '',
      mobileNo: '',
      email: user?.email || '',
      location: '',
      admissionBatch: '',
      course: '',
      subject: '',
      profilePhoto: '',
      collegeIdProof: ''
    }
  });

  // Fetch existing profile on component mount
  useEffect(() => {
    async function fetchExistingProfile() {
      if (user?.id) {
        try {
          const response = await fetch(`/api/student-profile?id=${user.id}`);
          const data = await response.json();
          
          if (data.length > 0) {
            const profile = data[0];
            setExistingProfile(profile);
            form.reset({
              name: profile.name,
              rollNo: profile.rollNo,
              mobileNo: profile.mobileNo,
              email: profile.email,
              location: profile.location || '',
              admissionBatch: profile.admissionBatch,
              course: profile.course,
              subject: profile.subject,
              profilePhoto: profile.profilePhoto || '',
              collegeIdProof: profile.collegeIdProof || ''
            });

            // Set file names if URLs exist
            if (profile.profilePhoto) {
              setProfilePhotoFileName(profile.profilePhoto.split('/').pop() || null);
            }
            if (profile.collegeIdProof) {
              setCollegeIdProofFileName(profile.collegeIdProof.split('/').pop() || null);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // toast.error('Failed to fetch existing profile');
        }
      }
    }

    fetchExistingProfile();
  }, [user?.id]);

  // Handle form submission
  const onSubmit = async (values: z.infer<typeof studentProfileSchema>) => {
    setIsLoading(true);
    try {
      const endpoint = existingProfile 
        ? `/api/student-profile?id=${user?.id}` 
        : `/api/student-profile?id=${user?.id}`;
      
      const method = existingProfile ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();


      if (response.ok) {
        console.log("Profile saved successfully", data);
        // toast.success(existingProfile 
        //   ? "Profile Updated Successfully" 
        //   : "Profile Created Successfully", {
        //   description: `Your student profile has been ${existingProfile ? 'updated' : 'created'}.`
        // });
        setExistingProfile(data);
        console.log("Profile data:", data);
      } else {
        console.error("Error saving profile:", data);
        // toast.error("Error", {
        //   description: data.message || "Something went wrong"
        // });
      }
    } catch (error) {
      console.error("Network error:", error);
      // toast.error("Error", {
      //   description: "Network error. Please try again."
      // });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6">
        {existingProfile ? 'Edit Student Profile' : 'Create Student Profile'}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Roll Number */}
            <FormField
              control={form.control}
              name="rollNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roll Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your roll number" {...field} />
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

            {/* Location */}
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select admission batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {['2020', '2021', '2022', '2023', '2024'].map((batch) => (
                        <SelectItem key={batch} value={batch}>
                          {batch}
                        </SelectItem>
                      ))}
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
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MBBS">MBBS</SelectItem>
                      <SelectItem value="MD">MD</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
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
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your subject" {...field} />
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
                          // toast.success("Profile Photo Uploaded", {
                          //   description: `${res[0].name} uploaded successfully`
                          // });
                        }
                      }}
                      onUploadError={(error) => {
                        // toast.error("Upload Error", {
                        //   description: error.message
                        // });
                      }}
                    />
                    {profilePhotoFileName && (
                      <div className="mt-2 text-sm text-gray-600">
                        Uploaded: {profilePhotoFileName}
                      </div>
                    )}
                    {field.value && (
                      <div className="mt-2">
                        <img 
                          src={field.value} 
                          alt="Profile" 
                          className="h-24 w-24 rounded-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* College ID Proof Upload */}
          <FormField
            control={form.control}
            name="collegeIdProof"
            render={({ field }) => (
              <FormItem>
                <FormLabel>College ID Proof</FormLabel>
                <FormControl>
                  <div>
                    <UploadButton
                      endpoint="docUploader"
                      onClientUploadComplete={(res) => {
                        if (res.length > 0) {
                          const uploadedFileUrl = res[0].serverData.fileUrl;
                          form.setValue("collegeIdProof", uploadedFileUrl);
                          setCollegeIdProofFileName(res[0].name);
                          // toast.success("College ID Proof Uploaded", {
                          //   description: `${res[0].name} uploaded successfully`
                          // });
                        }
                      }}
                      onUploadError={(error) => {
                        // toast.error("Upload Error", {
                        //   description: error.message
                        // });
                      }}
                    />
                    {collegeIdProofFileName && (
                      <div className="mt-2 text-sm text-gray-600">
                        Uploaded: {collegeIdProofFileName}
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


          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading 
              ? (existingProfile ? "Updating..." : "Creating...") 
              : (existingProfile ? "Update Profile" : "Create Profile")
            }
          </Button>
        </form>
      </Form>
    </div>
  );
}