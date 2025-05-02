"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  ChevronRight,
  Edit,
  Info,
  Plus,
  Search,
  Trash2,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import CourseManagement from "./CourseManagement";
// import { useUploadThing } from "@/lib/uploadthing";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";

const BranchManagement = ({ collegeId }: { collegeId: string }) => {
  const [branches, setBranches] = useState<{
    id: string;
    name: string;
    code: string;
    description?: string;
  }[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<{
    id: string;
    name: string;
    code?: string;
    description?: string;
    
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    collegeId: collegeId,
    code: "",
    description: "",
  });
  const [showCourses, setShowCourses] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // const { startUpload, permittedFileInfo } = useUploadThing("branchLogo", {
  //   onClientUploadComplete: (res) => {
  //     if (res && res[0]) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         logo: res[0].url,
  //       }));
  //       setIsUploading(false);
  //       setUploadProgress(100);
  //       setTimeout(() => setUploadProgress(0), 1000);
  //     }
  //   },
  //   onUploadProgress: (progress) => {
  //     setUploadProgress(progress);
  //   },
  //   onUploadError: (error) => {
  //     setError(`Upload error: ${error.message}`);
  //     setIsUploading(false);
  //     setUploadProgress(0);
  //   },
  // });

  // Fetch branches when collegeId changes
  useEffect(() => {
    if (collegeId) {
      fetchBranches();
      setFormData((prev) => ({ ...prev, collegeId }));
    }
  }, [collegeId]);

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/branches?collegeId=${collegeId}`);
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
        setSelectedBranch(null);
        setShowCourses(false);
      } else {
        setError("Failed to fetch branches");
      }
    } catch (err) {
      setError(
        "Error fetching branches: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      collegeId: collegeId,
      code: "",
      description: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      // startUpload([file]);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Branch name is required");
      return;
    }

    if (!formData.code) {
      setError("Branch code is required");
      return;
    }

    try {
      setIsLoading(true);
      let response;

      if (selectedBranch) {
        // Update existing branch
        response = await fetch(`/api/branches?id=${selectedBranch.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new branch
        response = await fetch("/api/branches", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        const updatedBranch = await response.json();

        if (selectedBranch) {
          setBranches((prev) =>
            prev.map((b) => (b.id === updatedBranch.id ? updatedBranch : b))
          );
        } else {
          setBranches((prev) => [...prev, updatedBranch]);
        }

        setSelectedBranch(updatedBranch);
        closeForm();
        fetchBranches(); // Refresh branches list
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save branch");
      }
    } catch (err) {
      setError(
        "Error saving branch: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId: string | undefined) => {
    if (!confirm("Are you sure you want to delete this branch?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/branches?id=${branchId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBranches((prev) => prev.filter((b) => b.id !== branchId));
        if (selectedBranch?.id === branchId) {
          setSelectedBranch(null);
          setShowCourses(false);
        }
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete branch");
      }
    } catch (err) {
      setError(
        "Error deleting branch: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const openForm = (branch?: {
    id: string;
    name: string;
    code?: string;
    description?: string;
    logo?: string;
  }) => {
    if (branch) {
      setSelectedBranch(branch);
      setFormData({
        name: branch.name,
        collegeId: collegeId,
        code: branch.code || "",
        description: branch.description || "",
      });
    } else {
      setSelectedBranch(null);
      resetForm();
    }
    setIsFormOpen(true);
    setShowCourses(false);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  const filteredBranches = branches.filter(
    (branch) =>
      (branch.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (branch.code?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const renderBranchForm = () => (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 500 }}
      className="fixed inset-y-0 right-0 z-50 w-full sm:w-4/5 md:w-2/3 lg:w-1/2 xl:w-1/3 bg-white shadow-2xl overflow-y-auto"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            {selectedBranch ? "Edit Branch" : "Add New Branch"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeForm}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter branch name"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="code" className="text-sm font-medium text-gray-700">
                Branch Code <span className="text-red-500">*</span>
              </label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Enter branch code"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter branch description"
                rows={4}
              />
            </div>

          </form>
        </div>

        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={closeForm}
              className="w-24"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading || isUploading}
              className="w-24"
            >
              {isLoading ? "Saving..." : selectedBranch ? "Update" : "Create"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderBranchCard = (branch: {
    id: string;
    name: string;
    code: string;
    description?: string;
    logo?: string;
  }) => (
    <Card key={branch.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <CardHeader className="py-3 px-4 bg-gray-50 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* <div className="h-8 w-8 rounded-md bg-white border flex items-center justify-center overflow-hidden">
              {branch.logo ? (
                <img
                  src={branch.logo}
                  alt={branch.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <BookOpen className="h-4 w-4 text-gray-400" />
              )}
            </div> */}
            <CardTitle className="text-base font-medium truncate">
              {branch.name}
            </CardTitle>
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openForm(branch)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit Branch</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteBranch(branch.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete Branch</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-3 px-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs bg-blue-50">
              {branch.code}
            </Badge>
            {branch.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{branch.description}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {branch.description && (
            <p className="text-sm text-gray-500 line-clamp-2">
              {branch.description}
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="py-3 px-4 flex justify-between border-t bg-gray-50">
        <Button
          variant="link"
          size="sm"
          className="text-blue-600 p-0"
          onClick={() => {
            setSelectedBranch(branch);
            setShowCourses(true);
            setIsFormOpen(false);
          }}
        >
          Manage Courses
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderBranchList = () => {
    if (isLoading && branches.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="flex justify-center mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
          <p>Loading branches...</p>
        </div>
      );
    }

    if (branches.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="bg-gray-50 p-8 rounded-lg border-2 border-dashed border-gray-300 mb-4">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No branches found for this college</p>
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Branch
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <h3 className="text-lg font-medium">Branches</h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full sm:w-64"
              />
            </div>
            <Button onClick={() => openForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Branch
            </Button>
          </div>
        </div>

        {filteredBranches.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No branches match your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBranches.map((branch) => renderBranchCard(branch))}
          </div>
        )}
      </div>
    );
  };

  // Overlay for the sliding panel
  const renderOverlay = () => (
    <AnimatePresence>
      {isFormOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={closeForm}
        />
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {renderOverlay()}

      <AnimatePresence>
        {isFormOpen && renderBranchForm()}
      </AnimatePresence>

      {showCourses && selectedBranch ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowCourses(false);
                setSelectedBranch(null);
              }}
            >
              Back to Branches
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm text-gray-500">
              Managing courses for {selectedBranch.name}
            </span>
          </div>
          <CourseManagement branchId={selectedBranch.id} branchName={selectedBranch.name} />
        </div>
      ) : (
        renderBranchList()
      )}
    </div>
  );
};

export default BranchManagement;