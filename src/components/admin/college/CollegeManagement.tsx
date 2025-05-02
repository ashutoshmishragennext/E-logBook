"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { UploadButton } from "@/utils/uploadthing";
import { AnimatePresence, motion } from "framer-motion";
import {
  Building,
  Edit,
  Globe,
  Info,
  Mail,
  MapPin,
  Plus,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import BranchManagement from "./BranchManegement";

interface CollegeManagementProps {
  selectedCollegeId: string | null;
  onCollegeChange: () => void;
}

const CollegeManagement = ({ selectedCollegeId, onCollegeChange }: CollegeManagementProps) => {
  const user = useCurrentUser()
  const userId = user?.id || null
  const [colleges, setColleges] = useState<{ 
    id: string; 
    userId : string;
    name: string; 
    code: string; 
    address: string;
    country: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    logo: string;
  }[]>([]);
  
  const [selectedCollege, setSelectedCollege] = useState<{ 
    userId: string;
    id: string; 
    name: string; 
    code: string; 
    address: string;
    country: string;
    city: string;
    state: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    logo: string;
  } | null>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
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
  const [activeTab, setActiveTab] = useState("profile");
  const [profilePhotoFileName, setProfilePhotoFileName] = useState("");
  const formRef = useRef<HTMLFormElement | null>(null);
  

  // Close form when clicking outside
  useEffect(() => {
    function handleClickOutside(event: { target: any; }) {
      if (formRef.current && !formRef.current.contains(event.target) && isEditing) {
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

  // Set selected college when selectedCollegeId changes
  useEffect(() => {
    if (selectedCollegeId && colleges.length > 0) {
      const college = colleges.find((c) => c.id === selectedCollegeId);
      setSelectedCollege(college || null);
      if (college) {
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
      }
      setIsEditing(false);
    } else if (selectedCollegeId === null) {
      setSelectedCollege(null);
      resetForm();
    }
  }, [selectedCollegeId, colleges]);

  const fetchColleges = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/college");
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
      } else {
        setError("Failed to fetch colleges");
      }
    } catch (err) {
      setError("Error fetching colleges: " + (err instanceof Error ? err.message : "Unknown error"));
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

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
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

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
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
        onCollegeChange(); // Notify parent component
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save college");
      }
    } catch (err) {
      setError("Error saving college: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCollege = async () => {
    if (!selectedCollege) return;
    
    if (!confirm("Are you sure you want to delete this college?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/college?id=${selectedCollege.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setColleges((prev) => prev.filter((c) => c.id !== selectedCollege.id));
        setSelectedCollege(null);
        resetForm();
        onCollegeChange(); // Notify parent component
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete college");
      }
    } catch (err) {
      setError("Error deleting college: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
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
                onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
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
                setFormData(prev => ({
                  ...prev,
                  logo: uploadedFileUrl
                }));
                setProfilePhotoFileName(res[0].name);
              }
            }}
            onUploadError={(error) => {
              console.error("Upload Error:", error);
              setError("Logo upload failed: " + error.message);
            }}
          />
          
          {profilePhotoFileName && (
            <p className="text-xs text-gray-500">
              Uploaded: {profilePhotoFileName}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
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
          <label htmlFor="country" className="text-sm font-medium text-gray-700">
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
        <Button
          type="submit"
          disabled={isLoading}
          className="min-w-24"
        >
          {isLoading ? "Saving..." : selectedCollege ? "Update College" : "Add College"}
        </Button>
      </div>
    </div>
  );

  const renderCollegeDetails = () => {
    if (!selectedCollege) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-6">
          <Building className="h-16 w-16 text-gray-300 mb-4" />
          <h3 className="text-xl font-medium text-gray-700">No College Selected</h3>
          <p className="text-sm text-gray-500 mt-2 max-w-md">
            Please select a college from the sidebar or create a new one
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setSelectedCollege(null);
              resetForm();
              setIsEditing(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New College
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {selectedCollege.logo ? (
              <img 
                src={selectedCollege.logo} 
                alt={selectedCollege.name}
                className="h-16 w-16 object-cover rounded-md border shadow-sm"
              />
            ) : (
              <div className="h-16 w-16 bg-gray-100 flex items-center justify-center rounded-md border">
                <Building className="h-8 w-8 text-gray-400" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedCollege.name}</h2>
              <p className="text-sm text-gray-500">Code: {selectedCollege.code}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Update
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleDeleteCollege}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full md:w-64">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="branches">Branches</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    College Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">College Name</h3>
                      <p className="mt-1 text-gray-900">{selectedCollege.name}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">College Code</h3>
                      <p className="mt-1 text-gray-900">{selectedCollege.code}</p>
                    </div>
                    {selectedCollege.description && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Description</h3>
                        <p className="mt-1 text-gray-900">{selectedCollege.description}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCollege.address && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Street Address</h3>
                        <p className="mt-1 text-gray-900">{selectedCollege.address}</p>
                      </div>
                    )}
                    {(selectedCollege.city || selectedCollege.state || selectedCollege.country) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="mt-1 text-gray-900">
                          {[
                            selectedCollege.city, 
                            selectedCollege.state, 
                            selectedCollege.country
                          ].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedCollege.email && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p className="mt-1 text-gray-900">{selectedCollege.email}</p>
                      </div>
                    )}
                    {selectedCollege.phone && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                        <p className="mt-1 text-gray-900">{selectedCollege.phone}</p>
                      </div>
                    )}
                    {selectedCollege.website && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Website</h3>
                        <p className="mt-1 text-gray-900">
                          <a 
                            href={selectedCollege.website} 
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            {selectedCollege.website}
                            <Globe className="h-3 w-3" />
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="branches" className="pt-4">
            <BranchManagement collegeId={selectedCollege.id} />
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen p-4 md:p-6">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isEditing && (
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => {
              setSelectedCollege(null);
              resetForm();
              setIsEditing(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New College
          </Button>
        </div>
      )}

      <AnimatePresence>
        {isEditing && (
          <motion.div 
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-2/3 md:w-1/2 lg:w-2/5 bg-white shadow-2xl z-50"
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
              
              <form onSubmit={handleSubmit} ref={formRef} className="flex-grow">
                {renderCollegeForm()}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div onClick={() => isEditing && handleCancelEdit()} className={`${isEditing ? "fixed inset-0 bg-black/20 z-40" : ""}`} />
      
      {!isEditing && renderCollegeDetails()}
    </div>
  );
};

export default CollegeManagement;