"use client";
import React, { useEffect, useState } from "react";
import AsyncSelect from "react-select/async";

interface Subject { id: string; name: string; }
interface AcademicYear { id: string; name: string; }
interface Phase { id: string; name: string; }

interface Assignment {
  subjectId: string;
  academicYearId: string;
  phaseId: string;
  branchId: string;
  courseId: string;
}

interface OptionType {
  value: string;
  label: string;
}

const Faculty = ({ collegeId }: { collegeId: string }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    designation: "",
    employeeId: "",
    mobileNo: "",
    collegeId: collegeId,
  });

  const [teacherId, setTeacherId] = useState("");
  const [status, setStatus] = useState("");
  const [assignStatus, setAssignStatus] = useState("");

  const [assignments, setAssignments] = useState<Assignment[]>([
    { subjectId: "", academicYearId: "", phaseId: "", branchId: "", courseId: "" },
  ]);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [phases, setPhases] = useState<Phase[]>([]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const academicYearsRes = await fetch("/api/academicYears");
        const academicYearsData = await academicYearsRes.json();
        setAcademicYears(academicYearsData);
      } catch (error) {
        console.error("❌ Error loading academic years:", error);
      }
    };

    fetchInitialData();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
      console.error("❌ Error fetching phases:", err);
    }
  };

  const fetchBranches = (inputValue: string) => {
    return new Promise<OptionType[]>(async (resolve) => {
      if (!inputValue.trim()) {
        resolve([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/search/branch?query=${encodeURIComponent(inputValue)}&collegeId=${collegeId}`
        );
        const data = await res.json();
        resolve(
          data.map((b: { id: string; name: string }) => ({
            value: b.id,
            label: b.name,
          }))
        );
      } catch (err) {
        console.error("Error fetching branches:", err);
        resolve([]);
      }
    });
  };

  const fetchCourses = (inputValue: string) => {
    return new Promise<OptionType[]>(async (resolve) => {
      if (!inputValue.trim()) {
        resolve([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/search/course?query=${encodeURIComponent(inputValue)}`
        );
        const data = await res.json();
        resolve(
          data.map((c: { id: string; name: string }) => ({
            value: c.id,
            label: c.name,
          }))
        );
      } catch (err) {
        console.error("Error fetching courses:", err);
        resolve([]);
      }
    });
  };

  const fetchSubjects = (inputValue: string) => {
    return new Promise<OptionType[]>(async (resolve) => {
      if (!inputValue.trim()) {
        resolve([]);
        return;
      }
      try {
        const res = await fetch(
          `/api/search/subject?query=${encodeURIComponent(inputValue)}`
        );
        const data = await res.json();
        resolve(
          data.map((s: { id: string; name: string }) => ({
            value: s.id,
            label: s.name,
          }))
        );
      } catch (err) {
        console.error("Error fetching subjects:", err);
        resolve([]);
      }
    });
  };

  const handleBranchChange = (index: number, selected: OptionType | null) => {
    const updated = [...assignments];
    updated[index].branchId = selected?.value || "";
    updated[index].courseId = ""; // reset course
    setAssignments(updated);
  };

  const handleCourseChange = (index: number, selected: OptionType | null) => {
    const updated = [...assignments];
    updated[index].courseId = selected?.value || "";
    setAssignments(updated);
  };

  const handleSubjectChange = (index: number, selected: OptionType | null) => {
    const updated = [...assignments];
    updated[index].subjectId = selected?.value || "";
    setAssignments(updated);
  };

  const addAssignmentRow = () => {
    setAssignments([
      ...assignments,
      { subjectId: "", academicYearId: "", phaseId: "", branchId: "", courseId: "" },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Submitting...");

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer YOUR_ADMIN_TOKEN",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: "TEACHER",
          teacherData: {
            collegeId: formData.collegeId,
            designation: formData.designation,
            employeeId: formData.employeeId,
            mobileNo: formData.mobileNo,
          },
        }),
      });

      const result = await res.json();

      if (res.ok) {
        setTeacherId(result.teacherId);
        setStatus(`✅ Teacher created: ${result.teacherId}`);
        setFormData({
          name: "",
          email: "",
          designation: "",
          employeeId: "",
          collegeId: collegeId,
          mobileNo: "",
        });
      } else {
        setStatus(result.message || "❌ Failed to create teacher.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Request failed.");
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" value={formData.name} onChange={handleFormChange} placeholder="Full Name" className="w-full px-4 py-2 border rounded-lg" required />
        <input name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="Email" className="w-full px-4 py-2 border rounded-lg" required />
        <input name="mobileNo" value={formData.mobileNo} onChange={handleFormChange} placeholder="Mobile No." className="w-full px-4 py-2 border rounded-lg" required />
        <input name="designation" value={formData.designation} onChange={handleFormChange} placeholder="Designation" className="w-full px-4 py-2 border rounded-lg" required />
        <input name="employeeId" value={formData.employeeId} onChange={handleFormChange} placeholder="Employee ID" className="w-full px-4 py-2 border rounded-lg" required />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Create Teacher
        </button>
      </form>
      {status && <p className="mt-4 text-center text-sm text-gray-700">{status}</p>}

      {teacherId && (
        <div className="mt-10">
          <h3 className="text-xl font-medium mb-4">Assign Subjects</h3>
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            {assignments.map((assignment, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={fetchSubjects}
                  onChange={(selected) => handleSubjectChange(index, selected)}
                  className="text-black"
                  value={assignment.subjectId ? {
                    value: assignment.subjectId,
                    label: "Selected Subject"
                  } : null}
                  placeholder="Search Subject"
                  required
                />

                <select 
                  name="academicYearId" 
                  value={assignment.academicYearId} 
                  onChange={(e) => handleAssignmentChange(index, e)} 
                  className="px-2 py-2 border rounded-lg" 
                  required
                >
                  <option value="">Academic Year</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>{y.name}</option>
                  ))}
                </select>

                <select 
                  name="phaseId" 
                  value={assignment.phaseId} 
                  onChange={(e) => handleAssignmentChange(index, e)} 
                  className="px-2 py-2 border rounded-lg" 
                  required
                >
                  <option value="">Phase</option>
                  {phases.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>

                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={fetchBranches}
                  onChange={(selected) => handleBranchChange(index, selected)}
                  className="text-black"
                  value={assignment.branchId ? { 
                    value: assignment.branchId, 
                    label: "Selected Branch" 
                  } : null}
                  placeholder="Search Branch"
                />

                <AsyncSelect
                  cacheOptions
                  defaultOptions
                  loadOptions={fetchCourses}
                  onChange={(selected) => handleCourseChange(index, selected)}
                  className="text-black"
                  value={assignment.courseId ? { 
                    value: assignment.courseId, 
                    label: "Selected Course" 
                  } : null}
                  placeholder="Search Course"
                />
              </div>
            ))}

            <div className="flex justify-between items-center">
              <button type="button" onClick={addAssignmentRow} className="bg-gray-300 px-4 py-1 rounded hover:bg-gray-400">
                + Add More
              </button>
              <button type="submit" className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 transition">
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