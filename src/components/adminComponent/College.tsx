/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps*/
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { UploadButton } from "@/utils/uploadthing";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  Calendar,
  Edit,
  ExternalLink,
  Eye,
  Globe,
  Loader,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  UserPlus,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const College: React.FC = () => {
  const user = useCurrentUser();
  const userId = user?.id || null;
  interface College {
    id: string;
    name: string;
    code: string;
    address?: string;
    country?: string;
    city?: string;
    state?: string;
    phone?: string;
    email?: string;
    website?: string;
    description?: string;
    logo?: string;
    createdAt?: string;
    collegeAdminId?: string;
    collegeAdmin?: {
      id: string;
      name: string;
      email: string;
      phone: string;
    } | null;
  }

  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [formData, setFormData] = useState({
    userId: userId,
    name: "",
    code: "",
    address: "",
    country: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    description: "",
    logo: "",
  });

  const [adminFormData, setAdminFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    generatePassword: true,
    collegeId: "",
  });

  const [adminCreationSuccess, setAdminCreationSuccess] = useState("");
  const [adminCreationError, setAdminCreationError] = useState("");
  const [profilePhotoFileName, setProfilePhotoFileName] = useState("");
  const [loadingAdminIds, setLoadingAdminIds] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const adminFormRef = useRef<HTMLDivElement>(null);
  console.log(profilePhotoFileName)

  useEffect(() => {
    fetchColleges();
  }, []);

  // Add this state to track failed fetches
  const [failedAdminFetches, setFailedAdminFetches] = useState<
    Record<string, boolean>
  >({});

  // Modified fetch function
 // Add this console log in the component to track data
useEffect(() => {
  console.log("Current colleges state:", colleges);
  console.log("Failed admin fetches:", failedAdminFetches);
  console.log("Loading admin IDs:", loadingAdminIds);
}, [colleges, failedAdminFetches, loadingAdminIds]);

// Fix the fetchCollegeAdminData function to properly update the state
const fetchCollegeAdminData = async (college: College) => {
  if (!college.collegeAdminId || failedAdminFetches[college.id]) return;

  try {
    setLoadingAdminIds((prev) => [...prev, college.id]);

    const response = await fetch(
      `/api/user?userId=${college.collegeAdminId}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const userData = await response.json();

    if (!userData?.id) {
      throw new Error("Invalid admin data received");
    }

    // Important fix: update both colleges and filteredColleges
    setColleges((prev) =>
      prev.map((c) =>
        c.id === college.id
          ? {
              ...c,
              collegeAdmin: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || "",
              },
            }
          : c
      )
    );

    // Also update filteredColleges to ensure UI reflects the change
    setFilteredColleges((prev) =>
      prev.map((c) =>
        c.id === college.id
          ? {
              ...c,
              collegeAdmin: {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || "",
              },
            }
          : c
      )
    );
    
  } catch (err) {
    console.error(`Error fetching admin for college ${college.id}:`, err);
    setFailedAdminFetches((prev) => ({ ...prev, [college.id]: true }));
  } finally {
    setLoadingAdminIds((prev) => prev.filter((id) => id !== college.id));
  }
};
  // Auto-fetch effect
  useEffect(() => {
    filteredColleges.forEach((college) => {
      if (
        college.collegeAdminId &&
        !college.collegeAdmin &&
        !loadingAdminIds.includes(college.id) &&
        !failedAdminFetches[college.id]
      ) {
        fetchCollegeAdminData(college);
      }
    });
  }, [filteredColleges, loadingAdminIds, failedAdminFetches]);

  // Filter colleges based on search query
  const fetchColleges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/college");
      if (!response.ok) throw new Error("Failed to fetch colleges");

      const data = await response.json();
      setColleges(data);
      setFilteredColleges(data);

      // Fetch admin data for colleges that have collegeAdminId but no collegeAdmin
      const collegesNeedingAdminData = data.filter(
        (college: College) => college.collegeAdminId && !college.collegeAdmin
      );

      // Fetch admin data in parallel
      await Promise.all(
        collegesNeedingAdminData.map((college: College) =>
          fetchCollegeAdminData(college)
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    function handleClickOutside(event: { target: any }) {
      if (
        formRef.current &&
        !formRef.current.contains(event.target) &&
        isEditing
      ) {
        // Only close if we're not in the middle of saving
        if (!isLoading) {
          handleCancelEdit();
        }
      }

      if (
        adminFormRef.current &&
        !adminFormRef.current.contains(event.target) &&
        isCreatingAdmin
      ) {
        // Only close if we're not in the middle of saving
        if (!isLoading) {
          handleCancelAdminCreation();
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, isCreatingAdmin, isLoading]);

  // Add this useEffect to handle search filtering
useEffect(() => {
  if (searchQuery.trim() === "") {
    setFilteredColleges(colleges);
  } else {
    const query = searchQuery.toLowerCase();
    const filtered = colleges.filter(
      (college) =>
        college.name.toLowerCase().includes(query) ||
        college.code.toLowerCase().includes(query) ||
        (college.email && college.email.toLowerCase().includes(query)) ||
        (college.city && college.city.toLowerCase().includes(query)) ||
        (college.state && college.state.toLowerCase().includes(query)) ||
        (college.country && college.country.toLowerCase().includes(query)) ||
        (college.collegeAdmin && college.collegeAdmin.name.toLowerCase().includes(query))
    );
    setFilteredColleges(filtered);
  }
}, [searchQuery, colleges]);

  const resetForm = () => {
    setFormData({
      userId: userId,
      name: "",
      code: "",
      address: "",
      country: "",
      city: "",
      state: "",
      phone: "",
      email: "",
      website: "",
      description: "",
      logo: "",
    });
    setProfilePhotoFileName("");
  };

  const resetAdminForm = () => {
    setAdminFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      generatePassword: true,
      collegeId: "",
    });
    setAdminCreationSuccess("");
    setAdminCreationError("");
  };

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "generatePassword") {
      setAdminFormData((prev) => ({
        ...prev,
        [name]: e.target.checked,
        password: e.target.checked ? "" : prev.password,
      }));
    } else {
      setAdminFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleCancelEdit = () => {
    if (selectedCollege) {
      // Reset form to current college data
      setFormData({
        userId: userId,
        name: selectedCollege.name || "",
        code: selectedCollege.code || "",
        address: selectedCollege.address || "",
        country: selectedCollege.country || "",
        city: selectedCollege.city || "",
        state: selectedCollege.state || "",
        phone: selectedCollege.phone || "",
        email: selectedCollege.email || "",
        website: selectedCollege.website || "",
        description: selectedCollege.description || "",
        logo: selectedCollege.logo || "",
      });
    } else {
      // Clear form for new college
      resetForm();
    }
    setIsEditing(false);
  };

  const handleCancelAdminCreation = () => {
    resetAdminForm();
    setIsCreatingAdmin(false);
    setSelectedCollege(null);
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.code) {
      setError("Name and code are required");
      return;
    }

    try {
      setIsLoading(true);
      let response;

      if (selectedCollege) {
        // Update existing college
        response = await fetch(`/api/college?id=${selectedCollege.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new college
        response = await fetch("/api/college", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const updatedCollege = await response.json();

        if (selectedCollege) {
          setColleges((prev) =>
            prev.map((c) => (c.id === updatedCollege.id ? updatedCollege : c))
          );
        } else {
          setColleges((prev) => [...prev, updatedCollege]);
        }

        setSelectedCollege(updatedCollege);
        setIsEditing(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save college");
      }
    } catch (err) {
      setError(
        "Error saving college: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAdmin = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setAdminCreationError("");
    setAdminCreationSuccess("");

    if (!adminFormData.name || !adminFormData.email) {
      setAdminCreationError("Name and email are required");
      return;
    }

    try {
      setIsLoading(true);

      // Prepare data for API
      const payload = {
        name: adminFormData.name,
        email: adminFormData.email,
        phone: adminFormData.phone || null,
        role: "COLLEGE_ADMIN", // Set role to COLLEGE_ADMIN
        password: adminFormData.generatePassword
          ? undefined
          : adminFormData.password,
        teacherData: {
          collegeId: selectedCollege?.id,
          employeeId: "CLG-ADMIN", // Default employee ID for college admins
          designation: "College Administrator",
        },
      };

      // Create user with teacher profile
      const userResponse = await fetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();

        // Update college with admin ID
        const collegeResponse = await fetch(
          `/api/college?id=${selectedCollege?.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              collegeAdminId: userData.userId,
            }),
          }
        );

        if (collegeResponse.ok) {
          // Update college in state
          const updatedCollege = await collegeResponse.json();
          setColleges((prev) =>
            prev.map((c) =>
              c.id === updatedCollege.id
                ? {
                    ...updatedCollege,
                    collegeAdmin: {
                      id: userData.userId,
                      name: userData.name,
                      email: userData.email,
                    },
                  }
                : c
            )
          );

          // Show success message
          setAdminCreationSuccess(
            `College admin created successfully${
              userData.tempPassword
                ? ` with temporary password: ${userData.tempPassword}`
                : ""
            }. An email has been sent to ${userData.email} with login details.`
          );

          // Close form after a delay
          setTimeout(() => {
            handleCancelAdminCreation();
          }, 5000);
        } else {
          const errorData = await collegeResponse.json();
          setAdminCreationError(
            errorData.message || "Failed to update college with admin info"
          );
        }
      } else {
        const errorData = await userResponse.json();
        setAdminCreationError(
          errorData.error || "Failed to create admin account"
        );
      }
    } catch (err) {
      setAdminCreationError(
        "Error creating admin: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollege = async (collegeId: string) => {
    const collegeToDelete = colleges.find((c) => c.id === collegeId);
    if (!collegeToDelete) return;

    if (!confirm(`Are you sure you want to delete ${collegeToDelete.name}?`))
      return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/college?id=${collegeId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setColleges((prev) => prev.filter((c) => c.id !== collegeId));
        if (selectedCollege && selectedCollege.id === collegeId) {
          setSelectedCollege(null);
          resetForm();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete college");
      }
    } catch (err) {
      setError(
        "Error deleting college: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCollege = (college: College) => {
    setSelectedCollege(college);
    setFormData({
      userId: userId,
      name: college.name || "",
      code: college.code || "",
      address: college.address || "",
      country: college.country || "",
      city: college.city || "",
      state: college.state || "",
      phone: college.phone || "",
      email: college.email || "",
      website: college.website || "",
      description: college.description || "",
      logo: college.logo || "",
    });
    setIsEditing(true);
  };

  const handleViewCollege = (college: College) => {
    setSelectedCollege(college);
    setFormData({
      userId: userId,
      name: college.name || "",
      code: college.code || "",
      address: college.address || "",
      country: college.country || "",
      city: college.city || "",
      state: college.state || "",
      phone: college.phone || "",
      email: college.email || "",
      website: college.website || "",
      description: college.description || "",
      logo: college.logo || "",
    });
    setIsViewing(true);
    setIsEditing(false);
  };

  const handleCreateCollegeAdmin = (college: College) => {
    setSelectedCollege(college);
    setAdminFormData({
      name: "",
      email: college.email || "", // Pre-fill with college email if available
      phone: college.phone || "",
      password: "",
      generatePassword: true,
      collegeId: college.id,
    });
    setIsCreatingAdmin(true);
  };

  const renderCollegeForm = () => (
    <div className="space-y-4 overflow-y-auto max-h-[80vh] p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            College Name*
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter college name"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium text-gray-700">
            College Code*
          </label>
          <Input
            id="code"
            name="code"
            value={formData.code}
            onChange={handleInputChange}
            placeholder="Enter college code"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="logo" className="text-sm font-medium text-gray-700">
          College Logo
        </label>
        <div className="flex flex-col space-y-2">
          {formData.logo && (
            <div className="flex items-center">
              <Image
                width={48}
                height={48}
                src={formData.logo}
                alt="College Logo"
                className="h-12 w-12 object-cover rounded-md"
              />
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 text-red-600 h-8"
                onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          )}

          <UploadButton
            endpoint="imageUploader"
            onClientUploadComplete={(res) => {
              if (res.length > 0) {
                const uploadedFileUrl = res[0].serverData.fileUrl;
                setFormData((prev) => ({
                  ...prev,
                  logo: uploadedFileUrl,
                }));
                setProfilePhotoFileName(res[0].name);
              }
            }}
            onUploadError={(error) => {
              console.error("Upload Error:", error);
              setError("Logo upload failed: " + error.message);
            }}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Enter college description"
          rows={3}
        />
      </div>

      <Separator className="my-4" />
      <h3 className="font-medium">Contact Information</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="college@example.com"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="website" className="text-sm font-medium text-gray-700">
          Website
        </label>
        <Input
          id="website"
          name="website"
          value={formData.website}
          onChange={handleInputChange}
          placeholder="https://www.example.edu"
        />
      </div>

      <Separator className="my-4" />
      <h3 className="font-medium">Address Information</h3>

      <div className="space-y-2">
        <label htmlFor="address" className="text-sm font-medium text-gray-700">
          Street Address
        </label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          placeholder="Enter street address"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="city" className="text-sm font-medium text-gray-700">
            City
          </label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            placeholder="Enter city"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="state" className="text-sm font-medium text-gray-700">
            State/Province
          </label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            placeholder="Enter state"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="country"
            className="text-sm font-medium text-gray-700"
          >
            Country
          </label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Enter country"
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={handleCancelEdit}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-24">
          {isLoading
            ? "Saving..."
            : selectedCollege
            ? "Update College"
            : "Add College"}
        </Button>
      </div>
    </div>
  );

  const renderAdminForm = () => (
    <div className="space-y-4 overflow-y-auto max-h-[80vh] p-4">
      {adminCreationSuccess && (
        <Alert className="mb-4 bg-green-50 border-green-200">
          <AlertDescription className="text-green-700">
            {adminCreationSuccess}
          </AlertDescription>
        </Alert>
      )}

      {adminCreationError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{adminCreationError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Building className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-sm text-gray-500">College</h3>
            <p className="font-medium">{selectedCollege?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <label
            htmlFor="admin-name"
            className="text-sm font-medium text-gray-700"
          >
            Admin Name*
          </label>
          <Input
            id="admin-name"
            name="name"
            value={adminFormData.name}
            onChange={handleAdminInputChange}
            placeholder="Enter admin name"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="admin-email"
            className="text-sm font-medium text-gray-700"
          >
            Admin Email*
          </label>
          <Input
            id="admin-email"
            name="email"
            type="email"
            value={adminFormData.email}
            onChange={handleAdminInputChange}
            placeholder="admin@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="admin-phone"
            className="text-sm font-medium text-gray-700"
          >
            Phone Number
          </label>
          <Input
            id="admin-phone"
            name="phone"
            value={adminFormData.phone}
            onChange={handleAdminInputChange}
            placeholder="Enter phone number"
          />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="generate-password"
            name="generatePassword"
            checked={adminFormData.generatePassword}
            onChange={(e) => handleAdminInputChange(e)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="generate-password"
            className="text-sm font-medium text-gray-700"
          >
            Auto-generate secure password
          </label>
        </div>

        {!adminFormData.generatePassword && (
          <div className="mt-2">
            <label
              htmlFor="admin-password"
              className="text-sm font-medium text-gray-700"
            >
              Password*
            </label>
            <Input
              id="admin-password"
              name="password"
              type="password"
              value={adminFormData.password}
              onChange={handleAdminInputChange}
              placeholder="Enter password"
              required={!adminFormData.generatePassword}
            />
          </div>
        )}
      </div>

      <div className="pt-6 flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={handleCancelAdminCreation}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-24">
          {isLoading ? (
            <Loader className="h-4 w-4 animate-spin mr-2" />
          ) : adminFormData.generatePassword ? (
            "Create & Send Credentials"
          ) : (
            "Create Admin"
          )}
        </Button>
      </div>
    </div>
  );

  // Format the address for the compact table display
  const formatAddress = (college: College) => {
    const addressParts = [];
    if (college.address) addressParts.push(college.address);
    if (college.city) addressParts.push(college.city);
    if (college.state) addressParts.push(college.state);
    if (college.country) addressParts.push(college.country);

    return addressParts.join(", ") || "Not specified";
  };

  // Format the date for display
  const formatDate = (dateString: string | number | Date | undefined) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  console.log("Colleges:", colleges);

  return (
    <div className="relative min-h-screen ">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="bg-white rounded-lg shadow-sm md:p-6 mb-4">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              College Management
            </h1>
            {searchQuery && (
              <p className="text-sm text-gray-500 mt-1">
                Showing {filteredColleges.length}{" "}
                {filteredColleges.length === 1 ? "college" : "colleges"}
                {filteredColleges.length !== colleges.length &&
                  ` (filtered from ${colleges.length})`}
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-3">
            <div className="relative flex-grow max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search colleges..."
                  className="pl-9 h-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                setSelectedCollege(null);
                resetForm();
                setIsEditing(true);
              }}
              className="h-10 whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add College
            </Button>
          </div>
        </div>

        {/* Colleges Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-14"
                >
                  Logo
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[180px]"
                >
                  College Details
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell min-w-[160px]"
                >
                  Location
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[200px]"
                >
                  Contact Info
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell min-w-[200px]"
                >
                  College Admin
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center w-28"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && colleges.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <Loader2 className="h-8 w-8 mx-auto animate-spin text-blue-500 mb-2" />
                    <p>Loading colleges...</p>
                  </td>
                </tr>
              ) : filteredColleges.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    {searchQuery ? (
                      <>
                        <Search className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p>No colleges found matching {searchQuery}</p>
                        <Button
                          variant="link"
                          onClick={() => setSearchQuery("")}
                          className="mt-1"
                        >
                          Clear search
                        </Button>
                      </>
                    ) : (
                      <>
                        <Building className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p>No colleges added yet</p>
                        <Button
                          variant="link"
                          onClick={() => {
                            setSelectedCollege(null);
                            resetForm();
                            setIsEditing(true);
                          }}
                          className="mt-1"
                        >
                          Add your first college
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
                  <tr
                    key={college.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => handleViewCollege(college)}
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      {college.logo ? (
                        <Image
                          width={40}
                          height={40}
                          src={college.logo}
                          alt={`${college.name} logo`}
                          className="h-10 w-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Building className="h-5 w-5 text-blue-600" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {college.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          Code: {college.code}
                        </span>
                        {college.createdAt && (
                          <span className="text-xs text-gray-500 flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1" />
                            Added {formatDate(college.createdAt)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-900 line-clamp-2">
                        {formatAddress(college)}
                      </div>
                    </td>
                    <td className="px-4 py-3 lg:table-cell">
                      <div className="text-sm">
                        {college.email && (
                          <div className="flex items-center text-gray-600 mb-1">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[230px]">
                              {college.email}
                            </span>
                          </div>
                        )}
                        {college.phone && (
                          <div className="flex items-center text-gray-600 mb-1">
                            <Phone className="h-3 w-3 mr-1" />
                            {college.phone}
                          </div>
                        )}
                        {college.website && (
                          <div className="flex items-center text-gray-600">
                            <Globe className="h-3 w-3 mr-1" />
                            <span className="truncate max-w-[230px]">
                              {college.website}
                            </span>
                          </div>
                        )}
                        {!college.email &&
                          !college.phone &&
                          !college.website && (
                            <span className="text-gray-500 text-sm italic">
                              No contact info
                            </span>
                          )}
                      </div>
                    </td>
                    {/* College Admin column fix */}
                   {/* Fixed College Admin column */}
<td className="px-4 py-2 text-sm text-gray-700">
  {college.collegeAdmin ? (
    // Admin data is available
    <div>
      <div className="font-semibold">{college.collegeAdmin.name}</div>
      <div className="text-gray-500 text-xs">{college.collegeAdmin.email}</div>
      {college.collegeAdmin.phone && (
        <div className="text-gray-500 text-xs">{college.collegeAdmin.phone}</div>
      )}
    </div>
  ) : college.collegeAdminId ? (
    // Admin ID exists but data isn't loaded yet
    loadingAdminIds.includes(college.id) ? (
      <div className="flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
        <span className="text-gray-400 text-sm">Loading admin...</span>
      </div>
    ) : (
      <div className="text-sm">
        <div className="text-gray-500">Admin assigned</div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Reset failed state and retry fetching
            setFailedAdminFetches((prev) => ({
              ...prev,
              [college.id]: false,
            }));
            fetchCollegeAdminData(college);
          }}
          className="text-blue-600 hover:underline text-xs"
        >
          Load admin info
        </button>
      </div>
    )
  ) : (
    // No admin assigned
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleCreateCollegeAdmin(college);
      }}
      className="flex items-center text-blue-600 hover:underline text-sm"
    >
      <UserPlus className="h-3 w-3 mr-1" />
      Add Admin
    </button>
  )}
</td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div
                        className="flex items-center space-x-1 justify-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewCollege(college);
                          }}
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                          <span className="sr-only">View</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCollege(college);
                          }}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCollege(college.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail View Modal */}
      <AnimatePresence>
        {isViewing && selectedCollege && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsViewing(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-xl font-semibold">College Details</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsViewing(false);
                      handleEditCollege(selectedCollege);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsViewing(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* College Logo and Basic Info */}
                  <div className="md:w-1/3">
                    <div className="flex flex-col items-center mb-6">
                      {formData.logo ? (
                        <Image

                          width={128}
                          height={128}
                          src={formData.logo}
                          alt={`${formData.name} logo`}
                          className="h-32 w-32 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building className="h-16 w-16 text-blue-600" />
                        </div>
                      )}
                      <h3 className="text-xl font-semibold mt-4">
                        {formData.name}
                      </h3>
                      <p className="text-gray-500">Code: {formData.code}</p>
                    </div>

                    {selectedCollege.collegeAdmin ? (
                      <div className="border rounded-lg p-4 mb-6">
                        <h4 className="font-medium mb-2 flex items-center">
                          <User className="h-4 w-4 mr-2 text-blue-600" />
                          College Administrator
                        </h4>
                        <div className="space-y-2">
                          <p className="text-sm">
                            <span className="font-medium">Name:</span>{" "}
                            {selectedCollege.collegeAdmin.name}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">Email:</span>{" "}
                            {selectedCollege.collegeAdmin.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="border rounded-lg p-4 mb-6 border-dashed">
                        <div className="text-center">
                          <UserPlus className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            No administrator assigned
                          </p>
                          <Button
                            size="sm"
                            onClick={() => {
                              setIsViewing(false);
                              handleCreateCollegeAdmin(selectedCollege);
                            }}
                          >
                            Add Admin
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* College Details */}
                  <div className="md:w-2/3 space-y-6">
                    {formData.description && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">
                          Description
                        </h4>
                        <p className="text-gray-700">{formData.description}</p>
                      </div>
                    )}

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Contact Information
                      </h4>
                      <div className="space-y-2">
                        {formData.email && (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{formData.email}</span>
                          </div>
                        )}
                        {formData.phone && (
                          <div className="flex items-center">
                            <Phone className="h-4 w-4 text-gray-500 mr-2" />
                            <span>{formData.phone}</span>
                          </div>
                        )}
                        {formData.website && (
                          <div className="flex items-center">
                            <Globe className="h-4 w-4 text-gray-500 mr-2" />
                            <a
                              href={formData.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              {formData.website}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          </div>
                        )}
                        {!formData.email &&
                          !formData.phone &&
                          !formData.website && (
                            <p className="text-gray-500 italic">
                              No contact information provided
                            </p>
                          )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">
                        Address
                      </h4>
                      {formData.address ||
                      formData.city ||
                      formData.state ||
                      formData.country ? (
                        <div className="space-y-1">
                          {formData.address && <p>{formData.address}</p>}
                          <p>
                            {[formData.city, formData.state, formData.country]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 italic">
                          No address provided
                        </p>
                      )}
                    </div>

                    {selectedCollege.createdAt && (
                      <div className="text-sm text-gray-500 flex items-center mt-8 pt-4 border-t">
                        <Calendar className="h-4 w-4 mr-2" />
                        College added on {formatDate(selectedCollege.createdAt)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit College Modal */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
              ref={formRef as unknown as React.RefObject<HTMLDivElement>}
            >
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-xl font-semibold">
                  {selectedCollege ? "Edit College" : "Add New College"}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleSubmit}>{renderCollegeForm()}</form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Admin Modal */}
      <AnimatePresence>
        {isCreatingAdmin && selectedCollege && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
              ref={adminFormRef as React.RefObject<HTMLDivElement>}
            >
              <div className="flex justify-between items-center border-b p-4">
                <h2 className="text-xl font-semibold">Create College Admin</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelAdminCreation}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <form onSubmit={handleCreateAdmin}>{renderAdminForm()}</form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default College;
