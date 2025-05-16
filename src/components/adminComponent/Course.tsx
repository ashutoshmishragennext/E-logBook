/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import DeleteConfirmation from "../common/DeleteComfirmation";
const Course = () => {
  const [courses, setCourses] = useState<
    { id: string; name: string; duration?: string; description?: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<{
    id: string;
    name: string;
    duration?: string;
    description?: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    duration: "",
    description: "",
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    fetchCourses();
  }, []); // This empty array is crucial - it tells React to run this effect only once

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/course`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        setError("Failed to fetch courses");
      }
    } catch (err) {
      setError(
        "Error fetching courses: " +
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
      duration: "",
      description: "",
    });
  };

  const openSidebar = (
    course: {
      id: string;
      name: string;
      duration: string;
      description?: string;
    } | null = null
  ) => {
    if (course) {
      setCurrentCourse(course);
      setFormData({
        name: course.name,
        duration: course.duration || "",
        description: course.description || "",
      });
    } else {
      setCurrentCourse(null);
      resetForm();
    }
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setCurrentCourse(null);
    resetForm();
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e?.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Course name is required");
      return;
    }

    if (!formData.duration) {
      setError("Course Duration is required");
      return;
    }

    try {
      // Set loading state only for the form submission
      const isEditing = !!currentCourse;

      let response;

      if (isEditing) {
        response = await fetch(`/api/course?id=${currentCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        await fetchCourses();
        closeSidebar();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save course");
      }
    } catch (err) {
      setError(
        "Error saving course: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    } finally {
      // Reset loading state after submission
      setIsLoading(false);
      // Reset submit button loading state
    }
  };

  const handleDelete = async (id: string | undefined) => {
    setConfirmText(`Are you sure you want to delete this Course?`);

    setOnConfirmCallback(() => async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/course?id=${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchCourses();
          if (currentCourse?.id === id) {
            closeSidebar();
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || "Failed to delete Course");
        }
      } catch (err) {
        setError(
          "Error deleting Course: " +
            (err instanceof Error ? err.message : "Unknown error")
        );
      } finally {
        setIsLoading(false);
        setIsDeleteModalOpen(false);
      }
    });
    setIsDeleteModalOpen(true);
  };

  const filteredCoures = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (course.duration ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (course.description &&
        course.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header Section - Now responsive */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
        {/* Title - takes full width on mobile, auto width on desktop */}
        <h2 className="text-xl font-semibold md:mr-4">Course Management</h2>

        {/* Search and Button container - stacks on mobile, row on desktop */}
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search input - full width on mobile, fixed width on desktop */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>

          {/* Button - full width on mobile, auto width on desktop */}
          <Button onClick={() => openSidebar()} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Courses Table - Now scrollable on mobile */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12"
                >
                  S.No
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
                  Duration
                </th>
                <th
                  scope="col"
                  className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
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
              {isLoading && courses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-500">Loading courses...</p>
                  </td>
                </tr>
              ) : filteredCoures.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm
                        ? "No courses match your search"
                        : "No courses found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoures.map((course, index) => (
                  <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-sm font-medium">
                      {course.name}
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <Badge variant="outline" className="bg-blue-50 text-xs">
                        {course.duration || "—"}
                      </Badge>
                    </td>
                    <td className="px-3 py-1 hidden sm:table-cell">
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {course.description || "—"}
                      </p>
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() =>
                            openSidebar({
                              ...course,
                              duration: course.duration || "",
                            })
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(course.id)}
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

      {/* Right Sidebar - Now responsive */}
      <div
        className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${
          sidebarOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">
              {currentCourse ? "Edit Course" : "Add New Course"}
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
                  Course Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter course name"
                />
              </div>

              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Course Duration <span className="text-red-500">*</span>
                </label>
                <Input
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="Enter course duration"
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
                  placeholder="Enter course description"
                  rows={4}
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
                    <span>{currentCourse ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{currentCourse ? "Update" : "Create"}</span>
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

export default Course;
