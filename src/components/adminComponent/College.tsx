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
  X,
} from "lucide-react";
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
  }

  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<College | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isViewing, setIsViewing] = useState(false);
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
  const [profilePhotoFileName, setProfilePhotoFileName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // Close form when clicking outside
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
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, isLoading]);

  // Fetch colleges on initial load
  useEffect(() => {
    fetchColleges();
  }, []);

  // Filter colleges based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredColleges(colleges);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = colleges.filter(
        (college) =>
          college.name.toLowerCase().includes(query) ||
          college.code.toLowerCase().includes(query) ||
          college.city?.toLowerCase().includes(query) ||
          college.country?.toLowerCase().includes(query) ||
          college.state?.toLowerCase().includes(query)
      );
      setFilteredColleges(filtered);
    }
  }, [searchQuery, colleges]);

  const fetchColleges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/college");
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
        setFilteredColleges(data);
      } else {
        setError("Failed to fetch colleges");
      }
    } catch (err) {
      setError(
        "Error fetching colleges: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
              <img
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

  // Format the address for the compact table display
  const formatAddress = (college: College) => {
    const addressParts = [];
    if (college.address) addressParts.push(college.address);
    if (college.city) addressParts.push(college.city);
    if (college.state) addressParts.push(college.state);
    if (college.country) addressParts.push(college.country);

    return addressParts.join(", ") || "Not specified";
  };

  // Format the contact details for the compact table display
  const formatContactDetails = (college: College) => {
    if (college.email) return college.email;
    if (college.phone) return college.phone;
    if (college.website) return "Website available";
    return "Not specified";
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
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell w-28"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading colleges...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredColleges.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-sm text-gray-500"
                  >
                    {searchQuery ? (
                      "No colleges match your search criteria."
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Building className="h-8 w-8 text-gray-300" />
                        <span>
                          No colleges found. Add your first college to get
                          started.
                        </span>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredColleges.map((college) => (
                  <tr key={college.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-center">
                        {college.logo ? (
                          <img
                            src={college.logo}
                            alt={`${college.name} Logo`}
                            className="h-10 w-10 object-contain rounded-md border shadow-sm"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-100 flex items-center justify-center rounded-md border">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <div className="font-medium text-gray-900">
                          {college.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          <span className="font-medium">Code:</span>{" "}
                          {college.code || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-600">
                        {formatAddress(college)}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex flex-col gap-1 text-sm text-gray-600">
                        {college.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span className="truncate max-w-[180px]">
                              {college.email}
                            </span>
                          </div>
                        )}
                        {college.phone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            <span>{college.phone}</span>
                          </div>
                        )}
                        {college.website && (
                          <div className="flex items-center gap-1">
                            <Globe className="h-3.5 w-3.5 text-gray-400" />
                            <a
                              href={
                                college.website.startsWith("http")
                                  ? college.website
                                  : `https://${college.website}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline truncate max-w-[180px]"
                            >
                              {college.website.replace(/^https?:\/\//, "")}
                            </a>
                          </div>
                        )}
                        {!college.email &&
                          !college.phone &&
                          !college.website && (
                            <span className="text-gray-400">
                              No contact info
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                      <div className="text-xs text-gray-500">
                        {formatDate(college.createdAt)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex justify-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => handleEditCollege(college)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDeleteCollege(college.id)}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit Panel */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 right-0 w-full sm:w-2/3 md:w-1/2 lg:w-[40%] xl:w-1/3 bg-white shadow-2xl z-50 border-l"
            >
              <div className="flex flex-col h-full">
                <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white z-10">
                  <h2 className="text-lg font-semibold">
                    {selectedCollege ? "Edit College" : "Add New College"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form
                  onSubmit={handleSubmit}
                  ref={formRef}
                  className="flex-grow overflow-y-auto"
                >
                  <div className="p-4 md:p-6 space-y-4">
                    {/* Form fields would go here */}
                    {renderCollegeForm()}
                  </div>

                  <div className="p-4 border-t sticky bottom-0 bg-white">
                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="min-w-[80px]"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="min-w-[80px]"
                      >
                        {isLoading ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : selectedCollege ? (
                          "Update"
                        ) : (
                          "Create"
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>

            <div
              onClick={handleCancelEdit}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default College;
