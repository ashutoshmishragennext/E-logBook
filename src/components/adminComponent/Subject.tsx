
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubjectStore } from "@/store/subject";
import { Edit, Plus, Save, Search, Trash2, X, Check, CheckCircle2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import DeleteConfirmation from "../common/DeleteComfirmation";

const Subject = () => {
  // Get state and methods from Zustand store
  const {
    subjects,
    isLoading,
    error,
    currentSubject,
    sidebarOpen,
    fetchSubjects,
    setError,
    setCurrentSubject,
    setSidebarOpen,
    removeSubjectById,
  } = useSubjectStore();

  // Keep local state for form and filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    approved: true,
  });
  const [approvedFilter, setApprovedFilter] = useState<
    "all" | "approved" | "pending"
  >("pending");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  // Fetch subjects on component mount
  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value, type, checked } = e.target;
  const updatedFormData = { 
    ...formData, 
    [name]: type === 'checkbox' ? checked : value 
  };

  if (name === 'name') {
    updatedFormData.code = generateSubjectCode(value);
  }

  setFormData(updatedFormData);
};

function generateSubjectCode(subjectName: string) {
  if (!subjectName) return '';
  
  // Take first 3 letters of subject name, uppercase and no spaces
  const namePart = subjectName.trim().toUpperCase().replace(/\s+/g, '').slice(0, 3);

  // Get last 3 digits of current timestamp for uniqueness
  const timestampPart = Date.now().toString().slice(-3);

  return `${namePart}${timestampPart}`; // Example: MAT451
}

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      approved: true,
    });
  };

  const openSidebar = (
    subject: {
      approved: boolean;
      id: string;
      name: string;
      code?: string;
    } | null = null
  ) => {
    if (subject) {
      setCurrentSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code || "",
        approved: subject.approved ?? true,
      });
    } else {
      setCurrentSubject(null);
      resetForm();
    }
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setCurrentSubject(null);
    resetForm();
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e?.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Subject Name is required");
      return;
    }

    if (!formData.code) {
      setError("Subject code is required");
      return;
    }

    try {
      const isEditing = !!currentSubject;
      let response;

      if (isEditing && currentSubject) {
        response = await fetch(`/api/subject?id=${currentSubject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/subject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        await fetchSubjects();
        closeSidebar();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save subject");
      }
    } catch (err) {
      setError(
        "Error saving subject: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  // Quick approval toggle function
  const handleQuickApproval = async (id: string, currentApprovalStatus: boolean) => {
    try {
      const response = await fetch(`/api/subject?id=${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ approved: !currentApprovalStatus }),
      });

      if (response.ok) {
        await fetchSubjects();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update approval status");
      }
    } catch (err) {
      setError(
        "Error updating approval status: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmText(`Are you sure you want to delete this Subject?`);

    setOnConfirmCallback(() => async () => {
      try {
        const response = await fetch(`/api/subject?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          // Update local store immediately for better UX
          removeSubjectById(id);

          // Refresh data from server
          await fetchSubjects();

          if (currentSubject?.id === id) {
            closeSidebar();
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to delete subject");
        }
      } catch (err) {
        setError(
          "Error deleting Subject: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      } finally {
        setIsDeleteModalOpen(false);
      }
    });
    setIsDeleteModalOpen(true);
  };

  const filteredSubjects = subjects.filter((subject) => {
    // Search filter
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.code ?? "").toLowerCase().includes(searchTerm.toLowerCase());

    // Approved status filter
    const matchesApprovedFilter =
      approvedFilter === "all" ||
      (approvedFilter === "approved" && subject.approved) ||
      (approvedFilter === "pending" && !subject.approved);

    return matchesSearch && matchesApprovedFilter;
  });

   const capitalizeFirstLetter = (str: string): string => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="relative space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3 p-2">
        <h2 className="text-xl font-semibold">Subject Management</h2>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <select
            value={approvedFilter}
            onChange={(e) =>
              setApprovedFilter(
                e.target.value as "all" | "approved" | "pending"
              )
            }
            className="border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved Only</option>
            <option value="pending">Pending Only</option>
          </select>
          <Button onClick={() => openSidebar()} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                >
                  #
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[140px]"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-500">Loading subjects...</p>
                  </td>
                </tr>
              ) : filteredSubjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm || approvedFilter !== "all"
                        ? "No subjects match your filters"
                        : "No subjects found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSubjects.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <Badge variant="outline" className="bg-blue-50 text-xs">
                        {subject.code || "—"}
                      </Badge>
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-sm font-medium">
                      {capitalizeFirstLetter(subject.name)}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-sm font-medium">
                      {subject.approved ? (
                        <Badge variant="default" className="text-xs">
                          Approved
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Pending
                        </Badge>
                      )}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        {/* Quick Approval Toggle Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 ${
                            subject.approved 
                              ? 'text-orange-500 hover:text-orange-600 hover:bg-orange-50' 
                              : 'text-green-500 hover:text-green-600 hover:bg-green-50'
                          }`}
                          onClick={() => handleQuickApproval(subject.id, subject.approved ?? false)}
                          title={subject.approved ? "Mark as Pending" : "Approve Subject"}
                        >
                          {subject.approved ? (
                            <CheckCircle2Icon className="h-4 w-4 text-green-700" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            openSidebar({
                              ...subject,
                              approved: subject.approved ?? false,
                            })
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(subject.id)}
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

      {/* Right Sidebar for Create/Edit */}
      <div
        className={`fixed inset-y-0 right-0 w-full md:w-1/3 lg:max-w-md bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">
              {currentSubject ? "Edit Subject" : "Add New Subject"}
            </h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 rounded-full"
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter subject name"
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  disabled={true}
                  onChange={handleInputChange}
                  placeholder="subject code"
                />
              </div>

              {/* Approval Status Control */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  id="approved"
                  name="approved"
                  checked={formData.approved}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="approved"
                  className="text-sm font-medium text-gray-700"
                >
                  Approve Subject
                </label>
              </div>

              {/* Approval Status Info */}
              <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                {formData.approved ? (
                  <span className="text-green-600">
                    ✓ This subject will be approved and available for use
                  </span>
                ) : (
                  <span className="text-orange-600">
                    ⏳ This subject will be pending approval
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeSidebar}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>
                      {currentSubject ? "Updating..." : "Creating..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{currentSubject ? "Update" : "Create"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={closeSidebar}
        />
      )}
      <DeleteConfirmation
        text={confirmText}
        onConfirm={onConfirmCallback ?? (() => {})}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen}
      />
    </div>
  );
};

export default Subject;