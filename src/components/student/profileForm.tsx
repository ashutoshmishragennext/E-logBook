"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Import tab components
import AcademicInfoComponent from "./AcademicInfoTab";
import PersonalInfoComponent from "./PersonalInfoTab";
import ProfessionalInfoComponent from "./ProfessionalInfoTab";

interface Profile {
  id?: string;
  name?: string;
  rollNo?: string;
  mobileNo?: string;
  email?: string;
  dateOfBirth?: string;
  localAddress?: string;
  permanentAddress?: string;
  guardianName?: string;
  guardianContact?: string;
  profilePhoto?: string;
  // Add any other fields expected by the child components
}

export default function StudentProfile({
  activeTab = "personal",
  userId,
}: {
  activeTab?: string;
  userId: string;
}) {
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [profile, setProfile] = useState<Profile>({});

  // Fetch profile data when component mounts or userId changes
  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) return;

      setLoading(true);
      try {
        // Replace with your actual API call
        const response = await fetch(`/api/profiles/${userId}`);
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        } else {
          toast.error("Failed to load profile data");
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Error loading profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handleProfileUpdate = async (updatedData: Partial<Profile>) => {
    setLoading(true);
    try {
      // Replace with your actual API call
      const response = await fetch(`/api/student-profile?byUserId=${userId}`, {
        method: profile.id ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          ...updatedData,
        }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile");
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return (
          <PersonalInfoComponent
            userId={userId}
            existingProfile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "academic":
        return (
          <AcademicInfoComponent
            userId={userId}
            existingProfile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      case "professional":
        return (
          <ProfessionalInfoComponent
            userId={userId}
            existingProfile={profile}
            onProfileUpdate={handleProfileUpdate}
          />
        );
      default:
        return (
          <div className="flex items-center justify-center p-8">
            <p className="text-gray-500">
              Select a tab to view profile information
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="mr-2 h-8 w-8 animate-spin" />
        <span>Loading profile data...</span>
      </div>
    );
  }

  const profileExists = !!profile?.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">
          {activeTab === "personal" && "Personal Information"}
          {activeTab === "academic" && "Academic Information"}
          {activeTab === "professional" && "Professional Information"}
        </h2>
      </div>

      {renderActiveTabContent()}
    </div>
  );
}
