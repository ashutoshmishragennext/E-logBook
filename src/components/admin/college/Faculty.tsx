/* eslint-disable  @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { debounce } from "lodash";
import { Loader2, Search } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  designation: z.string().min(1, "Designation is required"),
  employeeId: z.string().min(1, "Employee ID is required"),
  mobileNo: z.string().min(10, "Invalid mobile number"),
  collegeId: z.string().min(1, "College is required"),
  branchId: z.string().min(1, "Branch is required"),
  courseId: z.string().min(1, "Course is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface College {
  id: string;
  name: string;
  code: string;
}

interface Branch {
  id: string;
  name: string;
  code: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  level: string;
}

interface Subject {
  id: string;
  name: string;
  code: string;
}

interface AcademicYear {
  id: string;
  name: string;
}

interface Phase {
  id: string;
  name: string;
}

interface Assignment {
  subjectId: string;
  academicYearId: string;
  phaseId: string;
  branchId: string;
  courseId: string;
}

const Faculty = ({ collegeId }: { collegeId: string }) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      collegeId: collegeId || "",
    },
  });

  const [isEditMode, setIsEditMode] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  
  // College state
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [collegeSearchTerm, setCollegeSearchTerm] = useState("");
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [isSearchingCollege, setIsSearchingCollege] = useState(false);
  
  // Branch state
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [branchSearchTerm, setBranchSearchTerm] = useState("");
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [isSearchingBranch, setIsSearchingBranch] = useState(false);
  
  // Course state
  const [courses, setCourses] = useState<Course[]>([]);
  const [isSearchingCourse, setIsSearchingCourse] = useState(false);
  
  // Subject state
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [filteredSubjects, setFilteredSubjects] = useState<Subject[]>([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [isSearchingSubject, setIsSearchingSubject] = useState(false);
  
  // Assignment state
  const [assignments, setAssignments] = useState<Assignment[]>([
    { subjectId: "", academicYearId: "", phaseId: "", branchId: "", courseId: "" },
  ]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [assignStatus, setAssignStatus] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [academicYearsRes] = await Promise.all([
          fetch("/api/academicYears"),
        ]);
        const [academicYearsData] = await Promise.all([
          academicYearsRes.json(),
        ]);
        setAcademicYears(academicYearsData);
      } catch (error) {
        console.error("Error loading initial data:", error);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch colleges
  const fetchColleges = async (searchTerm: string) => {
    setIsSearchingCollege(true);
    try {
      const response = await fetch(`/api/search/college?search=${searchTerm}`);
      const data = await response.json();
      setColleges(data);
      setFilteredColleges(data);
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setIsSearchingCollege(false);
    }
  };

  // Fetch branches
  const fetchBranches = async (collegeId: string, searchTerm: string) => {
    setIsSearchingBranch(true);
    try {
      const response = await fetch(
        `/api/search/branch?collegeId=${collegeId}&search=${searchTerm}`
      );
      const data = await response.json();
      setBranches(data);
      setFilteredBranches(data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    } finally {
      setIsSearchingBranch(false);
    }
  };

  // Fetch courses
  const fetchCourses = async (branchId: string) => {
    setIsSearchingCourse(true);
    try {
      const response = await fetch(`/api/search/course?branchId=${branchId}`);
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsSearchingCourse(false);
    }
  };

  // Fetch subjects
  const fetchSubjects = async (searchTerm: string) => {
    setIsSearchingSubject(true);
    try {
      const response = await fetch(`/api/search/subject?search=${searchTerm}`);
      const data = await response.json();
      setSubjects(data);
      setFilteredSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    } finally {
      setIsSearchingSubject(false);
    }
  };

  // Debounced searches
  const debouncedCollegeSearch = debounce((term: string) => {
    if (colleges.length > 0) {
      const filtered = colleges.filter(
        (college) =>
          college.name.toLowerCase().includes(term.toLowerCase()) ||
          college.code.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredColleges(filtered);
    } else {
      fetchColleges(term);
    }
  }, 300);

  const debouncedBranchSearch = debounce((collegeId: string, term: string) => {
    if (branches.length > 0) {
      const filtered = branches.filter(
        (branch) =>
          branch.name.toLowerCase().includes(term.toLowerCase()) ||
          branch.code.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredBranches(filtered);
    } else {
      fetchBranches(collegeId, term);
    }
  }, 300);

  const debouncedSubjectSearch = debounce((term: string) => {
    if (subjects.length > 0) {
      const filtered = subjects.filter(
        (subject) =>
          subject.name.toLowerCase().includes(term.toLowerCase()) ||
          subject.code.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredSubjects(filtered);
    } else {
      fetchSubjects(term);
    }
  }, 300);

  // Handle field changes
  const handleCollegeChange = (collegeId: string) => {
    form.setValue("collegeId", collegeId);
    form.setValue("branchId", "");
    form.setValue("courseId", "");
    setBranches([]);
    setCourses([]);
    fetchBranches(collegeId, "");
    setShowCollegeDropdown(false);
  };

  const handleBranchChange = (branchId: string) => {
    form.setValue("branchId", branchId);
    form.setValue("courseId", "");
    setCourses([]);
    fetchCourses(branchId);
    setShowBranchDropdown(false);
  };

  const handleAssignmentChange = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const updated = [...assignments];
    updated[index][name as keyof Assignment] = value;
    setAssignments(updated);

    if (name === "academicYearId" && value) fetchPhases(value);
  };

  const fetchPhases = async (academicYearId: string) => {
    try {
      const res = await fetch(`/api/phase?academicYears=${academicYearId}`);
      const data = await res.json();
      setPhases(data);
    } catch (err) {
      console.error("Error fetching phases:", err);
    }
  };

  // Get selected names for display
  const getSelectedCollegeName = () => {
    const collegeId = form.getValues("collegeId");
    const college = colleges.find((c) => c.id === collegeId);
    return college ? `${college.name} (${college.code})` : "No college selected";
  };

  const getSelectedBranchName = () => {
    const branchId = form.getValues("branchId");
    const branch = branches.find((b) => b.id === branchId);
    return branch ? `${branch.name} (${branch.code})` : "No branch selected";
  };

  const getSelectedCourseName = () => {
    const courseId = form.getValues("courseId");
    const course = courses.find((c) => c.id === courseId);
    return course ? `${course.name} (${course.code})` : "No course selected";
  };

  const getSelectedSubjectName = (subjectId: string) => {
    const subject = subjects.find((s) => s.id === subjectId);
    return subject ? `${subject.name} (${subject.code})` : "No subject selected";
  };

  // Assignment functions
  const addAssignmentRow = () => {
    setAssignments([
      ...assignments,
      { subjectId: "", academicYearId: "", phaseId: "", branchId: "", courseId: "" },
    ]);
  };

  const handleSubjectChange = (index: number, subjectId: string) => {
    const updated = [...assignments];
    updated[index].subjectId = subjectId;
    setAssignments(updated);
    setShowSubjectDropdown(false);
  };

  // Form submission
  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    setStatus("Submitting...");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_ADMIN_TOKEN",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          role: "TEACHER",
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
        setStatus(`✅ Teacher created: ${result.teacherId}`);
        form.reset();
      } else {
        setStatus(result.message || "❌ Failed to create teacher.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Request failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAssignStatus("Assigning...");

    try {
      const res = await fetch(`/api/teacher-profile/${teacherId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_ADMIN_TOKEN",
        },
        body: JSON.stringify({ assignments }),
      });

      const result = await res.json();

      if (res.ok) {
        setAssignStatus(`✅ ${result.assignedSubjects} subjects assigned.`);
        setAssignments([
          { subjectId: "", academicYearId: "", phaseId: "", branchId: "", courseId: "" },
        ]);
      } else {
        setAssignStatus(result.message || "❌ Failed to assign subjects.");
      }
    } catch (err) {
      console.error(err);
      setAssignStatus("❌ Request failed.");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow rounded-xl mt-8">
      <h2 className="text-2xl font-semibold mb-4">Create Teacher Profile</h2>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              {...form.register("name")}
              className="w-full px-4 py-2 border rounded-lg"
              required
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
              required
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
            <label className="block text-sm font-medium mb-1">Mobile No.</label>
            <input
              {...form.register("mobileNo")}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            {form.formState.errors.mobileNo && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.mobileNo.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Designation</label>
            <input
              {...form.register("designation")}
              className="w-full px-4 py-2 border rounded-lg"
              required
            />
            {form.formState.errors.designation && (
              <p className="text-red-500 text-xs mt-1">
                {form.formState.errors.designation.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <input
            {...form.register("employeeId")}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          {form.formState.errors.employeeId && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.employeeId.message}
            </p>
          )}
        </div>

        {/* College Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">College</label>
          {isEditMode ? (
            <div className="relative">
              <div className="flex items-center border rounded-md">
                <input
                  className="flex h-9 w-full rounded-md border-0 bg-background px-3 py-1 text-sm"
                  placeholder="Search colleges..."
                  value={collegeSearchTerm || getSelectedCollegeName()}
                  onChange={(e) => {
                    setCollegeSearchTerm(e.target.value);
                    debouncedCollegeSearch(e.target.value);
                  }}
                  onFocus={() => {
                    setShowCollegeDropdown(true);
                    setCollegeSearchTerm("");
                  }}
                />
                {isSearchingCollege ? (
                  <div className="px-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="px-2">
                    <Search className="h-4 w-4" />
                  </div>
                )}
              </div>
              {showCollegeDropdown && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover shadow-lg border">
                  {filteredColleges.map((college) => (
                    <div
                      key={college.id}
                      className={`relative cursor-default select-none px-3 py-2 text-sm hover:bg-accent ${
                        form.watch("collegeId") === college.id ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        handleCollegeChange(college.id);
                        setShowCollegeDropdown(false);
                        setCollegeSearchTerm("");
                      }}
                    >
                      <div className="flex justify-between">
                        <span className="truncate">{college.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {college.code}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredColleges.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      No colleges found
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <input
              value={getSelectedCollegeName()}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          )}
          {form.formState.errors.collegeId && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.collegeId.message}
            </p>
          )}
        </div>

        {/* Branch Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Branch/Department</label>
          {isEditMode ? (
            <div className="relative">
              <div className="flex items-center border rounded-md">
                <input
                  className="flex h-9 w-full rounded-md border-0 bg-background px-3 py-1 text-sm"
                  placeholder="Search branches..."
                  value={branchSearchTerm || getSelectedBranchName()}
                  onChange={(e) => {
                    setBranchSearchTerm(e.target.value);
                    debouncedBranchSearch(form.watch("collegeId"), e.target.value);
                  }}
                  onFocus={() => {
                    setShowBranchDropdown(true);
                    setBranchSearchTerm("");
                  }}
                  disabled={!form.watch("collegeId")}
                />
                {isSearchingBranch ? (
                  <div className="px-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="px-2">
                    <Search className="h-4 w-4" />
                  </div>
                )}
              </div>
              {showBranchDropdown && (
                <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover shadow-lg border">
                  {filteredBranches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`relative cursor-default select-none px-3 py-2 text-sm hover:bg-accent ${
                        form.watch("branchId") === branch.id ? "bg-accent" : ""
                      }`}
                      onClick={() => {
                        handleBranchChange(branch.id);
                        setShowBranchDropdown(false);
                        setBranchSearchTerm("");
                      }}
                    >
                      <div className="flex justify-between">
                        <span className="truncate">{branch.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {branch.code}
                        </span>
                      </div>
                    </div>
                  ))}
                  {filteredBranches.length === 0 && (
                    <div className="px-3 py-2 text-sm text-muted-foreground">
                      {form.watch("collegeId")
                        ? "No branches found"
                        : "Select college first"}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <input
              value={getSelectedBranchName()}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          )}
          {form.formState.errors.branchId && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.branchId.message}
            </p>
          )}
        </div>

        {/* Course Selection */}
        <div>
          <label className="block text-sm font-medium mb-1">Course</label>
          {isEditMode ? (
            <div className="relative">
              <select
                {...form.register("courseId")}
                className="w-full px-4 py-2 border rounded-lg"
                disabled={!form.watch("branchId") || isSearchingCourse}
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name} ({course.code}) - {course.level}
                  </option>
                ))}
              </select>
              {isSearchingCourse && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </div>
          ) : (
            <input
              value={getSelectedCourseName()}
              readOnly
              className="w-full px-4 py-2 border rounded-lg bg-gray-100"
            />
          )}
          {form.formState.errors.courseId && (
            <p className="text-red-500 text-xs mt-1">
              {form.formState.errors.courseId.message}
            </p>
          )}
        </div>

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

      {status && <p className="mt-4 text-center text-sm text-gray-700">{status}</p>}

      {/* Assignment Section */}
      {form.formState.isSubmitSuccessful && (
        <div className="mt-10">
          <h3 className="text-xl font-medium mb-4">Assign Subjects</h3>
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            {assignments.map((assignment, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <div className="relative">
                    <div className="flex items-center border rounded-md">
                      <input
                        className="flex h-9 w-full rounded-md border-0 bg-background px-3 py-1 text-sm"
                        placeholder="Search subjects..."
                        value={subjectSearchTerm || getSelectedSubjectName(assignment.subjectId)}
                        onChange={(e) => {
                          setSubjectSearchTerm(e.target.value);
                          debouncedSubjectSearch(e.target.value);
                        }}
                        onFocus={() => {
                          setShowSubjectDropdown(true);
                          setSubjectSearchTerm("");
                        }}
                      />
                      {isSearchingSubject ? (
                        <div className="px-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : (
                        <div className="px-2">
                          <Search className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                    {showSubjectDropdown && (
                      <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-popover shadow-lg border">
                        {filteredSubjects.map((subject) => (
                          <div
                            key={subject.id}
                            className={`relative cursor-default select-none px-3 py-2 text-sm hover:bg-accent ${
                              assignment.subjectId === subject.id ? "bg-accent" : ""
                            }`}
                            onClick={() => {
                              handleSubjectChange(index, subject.id);
                              setShowSubjectDropdown(false);
                              setSubjectSearchTerm("");
                            }}
                          >
                            <div className="flex justify-between">
                              <span className="truncate">{subject.name}</span>
                              <span className="text-xs text-muted-foreground ml-2">
                                {subject.code}
                              </span>
                            </div>
                          </div>
                        ))}
                        {filteredSubjects.length === 0 && (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            No subjects found
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Academic Year Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Academic Year</label>
                  <select
                    name="academicYearId"
                    value={assignment.academicYearId}
                    onChange={(e) => handleAssignmentChange(index, e)}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select academic year</option>
                    {academicYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phase Selection */}
                <div>
                  <label className="block text-sm font-medium mb-1">Phase</label>
                  <select
                    name="phaseId"
                    value={assignment.phaseId}
                    onChange={(e) => handleAssignmentChange(index, e)}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                    disabled={!assignment.academicYearId}
                  >
                    <option value="">Select phase</option>
                    {phases.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        {phase.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={addAssignmentRow}
                className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400"
              >
                + Add More
              </button>
              <button
                type="submit"
                className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition"
              >
                Assign
              </button>
            </div>
          </form>
          {assignStatus && <p className="mt-4 text-center text-sm text-gray-700">{assignStatus}</p>}
        </div>
      )}
    </div>
  );
};

export default Faculty;