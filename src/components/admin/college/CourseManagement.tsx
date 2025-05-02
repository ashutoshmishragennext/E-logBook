"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Edit,
  Plus,
  Trash2,
  X,
  Clock,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface CourseManagementProps {
  branchId: string;
  branchName: string;
}

interface Course {
  id: string;
  name: string;
  duration: string;
  description?: string;
}

const CourseManagement = ({ branchId, branchName }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    branchId: branchId,
    duration: "",
    description: ""
  });

  // Fetch courses when branchId changes
  useEffect(() => {
    if (branchId) {
      fetchCourses();
      setFormData(prev => ({ ...prev, branchId }));
    }
  }, [branchId]);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/course?branchId=${branchId}`);
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
        setSelectedCourse(null);
      } else {
        setError("Failed to fetch courses");
      }
    } catch (err) {
      setError("Error fetching courses: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      branchId: branchId,
      duration: "",
      description: ""
    });
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setError("");
  
    if (!formData.name) {
      setError("Course name is required");
      return;
    }
  
    try {
      setIsLoading(true);
      let response;
  
      if (selectedCourse) {
        // Update existing course
        response = await fetch(`/api/course?id=${selectedCourse.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new course
        response = await fetch("/api/course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
  
      if (response.ok) {
        const updatedCourse = await response.json();
        
        // Instead of manually updating the state, refetch the courses
        await fetchCourses(); // Add this line to refresh the list
        
        setSelectedCourse(null);
        setIsDrawerOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save course");
      }
    } catch (err) {
      setError("Error saving course: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/course?id=${courseId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== courseId));
        if (selectedCourse?.id === courseId) {
          setSelectedCourse(null);
        }
        resetForm();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete course");
      }
    } catch (err) {
      setError("Error deleting course: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const openAddDrawer = () => {
    setSelectedCourse(null);
    resetForm();
    setIsDrawerOpen(true);
  };

  const openEditDrawer = (course: Course) => {
    setSelectedCourse(course);
    setFormData({
      name: course.name,
      branchId: branchId,
      duration: course.duration,
      description: course.description || ""
    });
    setIsDrawerOpen(true);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const renderCourseForm = () => (
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-xl font-semibold">
          {selectedCourse ? "Edit Course" : "Add New Course"}
        </h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={closeDrawer}
          className="rounded-full h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-5 flex-grow overflow-y-auto">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-gray-700">
            Course Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter course name"
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="duration" className="text-sm font-medium text-gray-700">
            Duration <span className="text-red-500">*</span>
          </label>
          <Input
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            placeholder="e.g., 2 years, 4 semesters"
            required
          />
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
            placeholder="Enter course description"
            rows={5}
          />
        </div>
      </div>

      <div className="border-t pt-4 mt-6 flex justify-end gap-3">
        <Button 
          type="button"
          variant="outline" 
          onClick={closeDrawer}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="px-8"
        >
          {isLoading ? "Saving..." : selectedCourse ? "Update Course" : "Add Course"}
        </Button>
      </div>
    </form>
  );

  const renderCourseList = () => {
    if (isLoading && courses.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-gray-200 rounded-full mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <BookOpen className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No courses yet</h3>
          <p className="text-gray-500 mb-6 text-center max-w-sm">
            Get started by adding your first course for the {branchName} branch
          </p>
          <Button onClick={openAddDrawer} className="animate-pulse">
            <Plus className="h-4 w-4 mr-2" />
            Add First Course
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">{branchName} Courses</h3>
            <p className="text-sm text-gray-500">
              {courses.length} {courses.length === 1 ? 'course' : 'courses'} available
            </p>
          </div>
          <Button onClick={openAddDrawer}>
            <Plus className="h-4 w-4 mr-2" />
            Add Course
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <Card 
              key={course.id} 
              className="overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <CardHeader className="py-3 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                <CardTitle className="text-base font-medium text-gray-800">{course.name}</CardTitle>
              </CardHeader>
              
              <CardContent className="py-4 px-4">
                <div className="flex items-center mb-3">
                  <Clock className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-700">{course.duration}</span>
                </div>
                
                {course.description && (
                  <div className="flex items-start mt-3">
                    <FileText className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  </div>
                )}

                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mt-4">
                  {branchName}
                </Badge>
              </CardContent>
              
              <CardFooter className="py-2 px-4 bg-gray-50 border-t flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  onClick={() => openEditDrawer(course)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteCourse(course.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {renderCourseList()}

      {/* Right side drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
            />
            
            {/* Side drawer */}
            <motion.div
              className="fixed top-0 right-0 h-full w-full sm:w-2/3 md:w-1/2 lg:w-1/3 bg-white shadow-xl z-50 overflow-hidden flex flex-col"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
            >
              <div className="p-6 h-full overflow-y-auto">
                {renderCourseForm()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseManagement;