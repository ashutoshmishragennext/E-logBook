// Faculty.tsx - Updated with Subject Assignment functionality
/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileExporter, FileImporter } from "@/components/common/FileHandler";
import { useCurrentUser } from "@/hooks/auth";
import { useCollegeStore } from "@/store/college";
import { useTeacherStore } from "@/store/teacherProfile";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import SubjectAssignment from "./subjectAsignment";

// Form schema remains the same
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  designation: z.string().min(1, "Designation is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  mobileNo: z.string().min(10, "Invalid mobile number"),
  collegeId: z.string().min(1, "College is required"),
});
type FormValues = z.infer<typeof formSchema>;

const Faculty = () => {
  const user = useCurrentUser();
  const userId = user?.id;

  const { college, fetchCollegeDetail } = useCollegeStore();
  const { teachers, isLoading, fetchTeachers } = useTeacherStore();

  const [collegeId, setCollegeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [showAssignSubjects, setShowAssignSubjects] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  
  const exportHeaders = {
    name: "Name",
    email: "Email",
    designation: "Designation",
    employeeId: "Employee ID",
    mobileNo: "Mobile Number"
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeId: "", // set later dynamically
    },
  });

  useEffect(() => {
    if (userId) {
      fetchCollegeDetail(userId);
    }
  }, [userId, fetchCollegeDetail]);

  useEffect(() => {
    if (college?.id) {
      setCollegeId(college.id);
      form.setValue("collegeId", college.id);
      fetchTeachers(college.id);
    }
  }, [college, form, fetchTeachers]);

  // Form submission for adding a single teacher
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setStatus("Submitting...");
    setError("");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: "TEACHER",
          phone: data.mobileNo,
          teacherData: {
            collegeId: data.collegeId,
            designation: data.designation,
            employeeId: data.employeeId,
            mobileNo: data.mobileNo,
          },
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus(`✅ Teacher created successfully!`);
        console.log("Teacher created:", result);
        form.reset();
        // Refresh the teacher list
        fetchTeachers(collegeId);
      } else {
        setError(result.error || "Failed to create teacher");
        setStatus("❌ Error occurred");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("Request failed. Please try again.");
      setStatus("❌ Error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for file import completion
  const handleImportComplete = async (parsedData: any[]) => {
    setUploadStatus(`Processing ${parsedData.length} teachers...`);

    try {
      // Validate and format the parsed data
      const formattedData = parsedData.map((item) => ({
        name: item.name || item.Name || "",
        email: item.email || item.Email || "",
        role: "TEACHER",
        phone:
          item.mobile ||
          item.Mobile ||
          item.mobileNo ||
          item.MobileNo ||
          item.phone ||
          item.Phone ||
          "",
        teacherData: {
          collegeId: collegeId,
          designation: item.designation || item.Designation || "",
          employeeId:
            item.employeeId || item.EmployeeId || item["Employee ID"] || "",
          mobileNo:
            item.mobile ||
            item.Mobile ||
            item.mobileNo ||
            item.MobileNo ||
            item.phone ||
            item.Phone ||
            "",
        },
      }));

      // Check if data is valid
      if (formattedData.length === 0) {
        setUploadStatus("❌ No valid data found in the file.");
        return;
      }

      // Send to API
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      });

      const result = await res.json();

      if (res.ok) {
        if (result.results.failed > 0) {
          console.warn(
            `Failed to import ${result.results.failed} teachers:`,
            result.results.errors
          );
          setUploadStatus(
            `✅ Imported ${result.results.successful} teachers with ${result.results.failed} failures.`
          );
        } else {
          setUploadStatus(
            `✅ Successfully imported all ${formattedData.length} teachers!`
          );
        }
        // Refresh the teacher list
        fetchTeachers(collegeId);
      } else {
        setUploadStatus(`❌ Import failed: ${result.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Error processing import:", err);
      setUploadStatus(
        "❌ Error processing file. Please check format and try again."
      );
    }
  };

  // Filter teachers based on search query
  const filteredTeachers = teachers.filter((teacher) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (teacher.name && teacher.name.toLowerCase().includes(searchLower)) ||
      (teacher.email && teacher.email.toLowerCase().includes(searchLower)) ||
      (teacher.designation &&
        teacher.designation.toLowerCase().includes(searchLower)) ||
      (teacher.employeeId &&
        teacher.employeeId.toLowerCase().includes(searchLower)) ||
      (teacher.mobileNo && teacher.mobileNo.includes(searchQuery))
    );
  });

  // Handle Assign Subject click
  const handleAssignSubject = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowAssignSubjects(true);
  };

  // Close assignment modal
  const handleCloseAssignment = () => {
    setShowAssignSubjects(false);
    setSelectedTeacher(null);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Teacher Management</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "list" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setActiveTab("add")}
            className={`px-4 py-2 rounded-lg ${
              activeTab === "add" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Add Teacher
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {status.includes("✅") && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4">
          {status}
        </div>
      )}

      {uploadStatus && (
        <div
          className={`border px-4 py-3 rounded mb-4 ${
            uploadStatus.includes("✅")
              ? "bg-green-50 border-green-200 text-green-800"
              : uploadStatus.includes("❌")
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          {uploadStatus}
        </div>
      )}

      {activeTab === "list" ? (
        <div>
          {/* Search and actions bar */}
          <div className="flex flex-wrap gap-4 mb-6 items-center">
            <div className="flex-grow relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg"
              />
            </div>

            <div className="flex gap-3">
              {/* Using the reusable FileImporter component */}
              <FileImporter 
                onImport={handleImportComplete}
                acceptedFileTypes=".xlsx,.xls,.csv"
                buttonText="Import"
              />

              {/* Using the reusable FileExporter component */}
              <FileExporter 
                data={filteredTeachers}
                fileName={`teachers_${new Date().toISOString().split("T")[0]}.xlsx`}
                headers={exportHeaders}
                buttonText="Export"
                disabled={filteredTeachers.length === 0}
              />
            </div>
          </div>

          {/* Teachers table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No teachers found. Import teachers or add them manually.
              </div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Designation
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Employee ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Mobile Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Actions 
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {teacher.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {teacher.email}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {teacher.designation}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {teacher.employeeId}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        {teacher.mobileNo}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 border-b">
                        <button 
                          onClick={() => handleAssignSubject(teacher)} 
                          className="text-blue-600 hover:underline"
                        >
                          Assign Subject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination could be added here if needed */}
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Teacher Manually</h3>
            <p className="text-gray-600 text-sm">
              Fill in the form below to add a new teacher to the system.
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Full Name
                </label>
                <input
                  {...form.register("name")}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  {...form.register("email")}
                  type="email"
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {form.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile No.
                </label>
                <input
                  {...form.register("mobileNo")}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                {form.formState.errors.mobileNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.mobileNo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Designation
                </label>
                <input
                  {...form.register("designation")}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="e.g., Professor, Assistant Professor"
                />
                {form.formState.errors.designation && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.designation.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Employee ID
              </label>
              <input
                {...form.register("employeeId")}
                className="w-full px-4 py-2 border rounded-lg"
              />
              {form.formState.errors.employeeId && (
                <p className="text-red-500 text-xs mt-1">
                  {form.formState.errors.employeeId.message}
                </p>
              )}
            </div>

            <input
              type="hidden"
              {...form.register("collegeId")}
              value={collegeId || ""}
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </span>
              ) : (
                "Create Teacher"
              )}
            </button>
          </form>
        </div>
      )}

      {/* Subject Assignment Modal */}
      {showAssignSubjects && selectedTeacher && (
        <SubjectAssignment
          teacherId={selectedTeacher.id}
          teacherName={selectedTeacher.name}
          teacherDesignation={selectedTeacher.designation}
          teacherEmail={selectedTeacher.email}
          onClose={handleCloseAssignment}
        />
      )}
    </div>
  );
};

export default Faculty;