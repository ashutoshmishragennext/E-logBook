/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, Plus, Trash2, Edit, X, Save } from "lucide-react";
import DeleteConfirmation from "../common/DeleteComfirmation";

const Department = () => {
  const [branches, setBranches] = useState<
    { id: string; name: string; code?: string; description?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<{
    id: string;
    name: string;
    code?: string;
    description?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  // Fetch branches on component mount - adding empty dependency array to run only once
  useEffect(() => {
    fetchBranches();
  }, []); // This empty array is crucial - it tells React to run this effect only once

  const fetchBranches = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/branches`);
      if (response.ok) {
        const data = await response.json();
        setBranches(data);
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

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      description: "",
    });
  };

  const openSidebar = (
    branch: {
      id: string;
      name: string;
      code?: string;
      description?: string;
    } | null = null
  ) => {
    if (branch) {
      setCurrentBranch(branch);
      setFormData({
        name: branch.name,
        code: branch.code || "",
        description: branch.description || "",
      });
    } else {
      setCurrentBranch(null);
      resetForm();
    }
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setCurrentBranch(null);
    resetForm();
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e?.preventDefault();
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
      // Set loading state only for the form submission
      const isEditing = !!currentBranch;

      let response;

      if (isEditing) {
        // Update existing branch
        response = await fetch(`/api/branches?id=${currentBranch.id}`, {
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
        await fetchBranches();
        closeSidebar();
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
      // Not needed as fetchBranches will handle the loading state
      // and closeSidebar will reset the form
    }
  };

  const handleDelete = async (id: string | undefined) => {
    setConfirmText(`Are you sure you want to delete this branch?`);

    setOnConfirmCallback(() => async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/branches?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchBranches();
          if (currentBranch?.id === id) {
            closeSidebar();
          }
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
        setIsDeleteModalOpen(false); // Close the modal after operation completes
      }
    });

    // Open the delete confirmation modal
    setIsDeleteModalOpen(true);
  };

  const filteredBranches = branches.filter(
    (branch) =>
      branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.code ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (branch.description &&
        branch.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
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

      {/* Responsive Header */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
        <h2 className="text-xl font-semibold">Department Management</h2>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={() => openSidebar()} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        </div>
      </div>

      {/* Responsive Table */}
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
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]"
                >
                  Code
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[110px]"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && branches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-500">Loading Department...</p>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No Department match your search"
                        : "No Departments found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBranches.map((branch, index) => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                      {capitalizeFirstLetter(branch.name)}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap">
                      <Badge variant="outline" className="bg-blue-50 text-xs">
                        {branch.code}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {branch.description || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => openSidebar(branch)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(branch.id)}
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

      {/* Responsive Sidebar */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">
              {currentBranch ? "Edit Branch" : "Add New Branch"}
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
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="COM-SCI"
                />
              </div>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Computer Science"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter department description"
                  rows={2}
                />
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
                    <span>{currentBranch ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{currentBranch ? "Update" : "Create"}</span>
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

export default Department;
