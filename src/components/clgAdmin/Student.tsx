/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileExporter, FileImporter } from "@/components/common/FileHandler";
import { useCurrentUser } from "@/hooks/auth";
import { useCollegeStore } from "@/store/college";
import { useStudentProfileStore } from "@/store/student";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Form schema for student
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  rollNo: z.string().optional(),
  branchId: z.string().optional(),
  courseId: z.string().optional(),
  academicYearId: z.string().optional(),
  collegeId: z.string().min(1, "College is required"),
  mobileNo: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

// New component to handle branch name fetching and display
type BranchNameProps = {
  branchId?: string;
};

const BranchName = ({ branchId }: BranchNameProps) => {
  const [branchName, setBranchName] = useState("Loading...");

  useEffect(() => {
    const fetchBranchName = async () => {
      if (!branchId) {
        setBranchName("-");
        return;
      }

      try {
        const response = await fetch(`/api/branches?id=${branchId}`);
        const data = await response.json();
        console.log("Branch data:", data);
        if (data) {
          setBranchName(data.name);
        } else {
          setBranchName("Unknown");
        }
      } catch (error) {
        console.error("Error fetching branch name:", error);
        setBranchName("Error");
      }
    };

    fetchBranchName();
  }, [branchId]);

  return <>{branchName}</>;
};

const Students = () => {
  const user = useCurrentUser();
  const userId = user?.id;

  const { college, fetchCollegeDetail } = useCollegeStore();
  const {
    profiles: students,
    loading: isLoading,
    fetchProfile: fetchStudents,
  } = useStudentProfileStore();

  const [collegeId, setCollegeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [activeTab, setActiveTab] = useState("list");

  const exportHeaders = {
    name: "Name",
    email: "Email",
    rollNo: "Roll No",
    mobileNo: "Mobile Number",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeId: "", // set later dynamically
      branchId: "",
      courseId: "",
      academicYearId: "",
      rollNo: "",
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
      fetchStudents({ collegeId: college.id });
    }
  }, [college, form, fetchStudents]);

  // Form submission for adding a single student
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
          role: "STUDENT",
          phone: data.mobileNo,
          studentData: {
            collegeId: data.collegeId,
            branchId: data.branchId,
            courseId: data.courseId,
            academicYearId: data.academicYearId,
            rollNo: data.rollNo,
          },
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setStatus(`✅ Student created successfully!`);
        console.log("Student created:", result);
        form.reset();
        // Refresh the student list
        fetchStudents({ collegeId: collegeId });
      } else {
        setError(result.error || "Failed to create student");
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
    setUploadStatus(`Processing ${parsedData.length} students...`);

    try {
      // Validate and format the parsed data
      const formattedData = parsedData.map((item) => ({
        name: item.name || item.Name || "",
        email: item.email || item.Email || item["Email Id"] || "",
        role: "STUDENT",
        phone:
          item["Mobile Number"] ||
          item["Phone Number"] ||
          item.mobile ||
          item.Mobile ||
          item.mobileNo ||
          item.MobileNo ||
          item.phone ||
          item.Phone ||
          "",
        studentData: {
          collegeId: collegeId,
          branchId: item.branchId || item.BranchId || "",
          courseId: item.courseId || item.CourseId || "",
          academicYearId: item.academicYearId || item.AcademicYearId || "",
          rollNo:
            item.rollNo ||
            item.RollNo ||
            item["Roll Number"] ||
            item["ROLL NUMBER"] ||
            item["Roll No"] ||
            "",
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
            `Failed to import ${result.results.failed} students:`,
            result.results.errors
          );
          setUploadStatus(
            `✅ Imported ${result.results.successful} students with ${result.results.failed} failures.`
          );
        } else {
          setUploadStatus(
            `✅ Successfully imported all ${formattedData.length} students!`
          );
        }
        // Refresh the student list
        fetchStudents({ collegeId: collegeId });
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

  // Filter students based on search query
  const filteredStudents = students.filter(
    (student: {
      name: string;
      email: string;
      rollNo: string;
      mobileNo: string | string[];
    }) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        (student.name && student.name.toLowerCase().includes(searchLower)) ||
        (student.email && student.email.toLowerCase().includes(searchLower)) ||
        (student.rollNo &&
          student.rollNo.toLowerCase().includes(searchLower)) ||
        (student.mobileNo && student.mobileNo.includes(searchQuery))
      );
    }
  );

  // const handleDeleteStudent = (student: any) => {
  //   const confirmDelete = window.confirm(
  //     `Are you sure you want to delete ${student.name}?`
  //   );
  //   console.log("Student to delete:", student);
  //   if (confirmDelete) {
  //     fetch(`/api/student-profile?id=${student.id}`, {
  //       method: "DELETE",
  //     })
  //       .then((res) => res.json())
  //       .then((data) => {
  //         if (data.success) {
  //           setStatus(`✅ Student ${student.name} deleted successfully!`);
  //         } else {
  //           setError(data.error || "Failed to delete student");
  //         }
  //       })
  //       .catch((err) => {
  //         console.error("Error deleting student:", err);
  //         setError("❌ Error occurred while deleting student");
  //       });
  //   }
  // };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Student Management</h2>
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
            Add Student
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
                placeholder="Search students..."
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
                data={filteredStudents}
                fileName={`students_${
                  new Date().toISOString().split("T")[0]
                }.xlsx`}
                headers={exportHeaders}
                buttonText="Export"
                disabled={filteredStudents.length === 0}
              />
            </div>
          </div>

          {/* Students table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No students found. Import students or add them manually.
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
                      Roll No
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Mobile Number
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Branch
                    </th>
                    {/* <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b">
                      Actions
                    </th> */}
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(
                    (
                      student: {
                        name: string;
                        email: string;
                        rollNo: string;
                        mobileNo: string | string[];
                        branchId?: string;
                      },
                      index: number
                    ) => (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 text-sm text-gray-900 border-b">
                          {student.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b">
                          {student.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b">
                          {student.rollNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b">
                          {student.mobileNo}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 border-b">
                          <BranchName branchId={student.branchId} />
                        </td>
                        {/* <td className="px-4 py-3 text-sm text-gray-900 border-b">
                          <button className="text-blue-600 hover:underline mr-3">
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:underline"
                            onClick={() => handleDeleteStudent(student)}
                          >
                            Delete
                          </button>
                        </td> */}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Add Student Manually</h3>
            <p className="text-gray-600 text-sm">
              Fill in the form below to add a new student to the system.
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
                  {...form.register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email",
                    },
                  })}
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
                  Roll No.
                </label>
                <input
                  {...form.register("rollNo", {
                    required: "Roll number is required",
                    validate: (value) =>
                      !/\s/.test(value ?? "") ||
                      "Roll number must not contain spaces",
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/\s/g, ""); // Remove all spaces
                  }}
                />

                {form.formState.errors.rollNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.rollNo.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile No.
                </label>
                <input
                  {...form.register("mobileNo", {
                    required: "Mobile number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Mobile number must be exactly 10 digits",
                    },
                  })}
                  className="w-full px-4 py-2 border rounded-lg"
                  maxLength={10}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onInput={(e) => {
                    const input = e.target as HTMLInputElement;
                    input.value = input.value.replace(/[^0-9]/g, "");
                  }}
                />
                {form.formState.errors.mobileNo && (
                  <p className="text-red-500 text-xs mt-1">
                    {form.formState.errors.mobileNo.message}
                  </p>
                )}
              </div>
            </div>

            {/* Add additional dropdowns here if needed */}

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
                "Create Student"
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Students;
