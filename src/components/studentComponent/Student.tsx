import { useCurrentUser } from "@/hooks/auth";
import { useStudentProfileStore } from "@/store/student";
import { useStudentSubjectStore } from "@/store/studentSubjectStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";


// Form validation schema
const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" }),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .min(1, { message: "Email is required" }),
  mobileNo: z
    .string()
    .min(10, { message: "Mobile number must be at least 10 digits" }),
  dateOfBirth: z.date().optional(),
  address: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  city: z.string().optional(),
  adharNo: z.string().optional(),
  maritalStatus: z.string().optional(),
  rollNo: z.string().optional(),
  collegeId: z.string().optional(),
  branchId: z.string().optional(),
  courseId: z.string().optional(),
  academicYearId: z.string().optional(),
  yearOfPassing: z.string().optional(),
  collegeIdProof: z.string().optional(),
  profilePhoto: z.string().optional(),
  verificationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  rejectionReason: z.string().optional(),
  teacherId: z.string().optional(),
});

const Student = () => {
  const user = useCurrentUser();
  const userId = user?.id;
  const { profile, fetchProfile } = useStudentProfileStore();
  const {
    colleges,
    fetchcolleges,
    college,
    fetchCollege,
    branches,
    fetchBranches,
    academicYears,
    fetchAcademicYears,
    course,
    fetchCourses,
  } = useStudentSubjectStore();

  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      mobileNo: "",
      address: "",
      country: "",
      state: "",
      city: "",
      adharNo: "",
      maritalStatus: "",
      rollNo: "",
      collegeId: "",
      branchId: "",
      courseId: "",
      academicYearId: "",
      yearOfPassing: "",
      collegeIdProof: "",
      profilePhoto: "",
      verificationStatus: "PENDING",
      rejectionReason: "",
      teacherId: "",
    },
  });

  // Fetch student profile
  useEffect(() => {
    const fetchStudentProfile = async () => {
      setIsLoading(true);
      if (userId) {
        try {
          await fetchProfile({ byUserId: userId });
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      setIsLoading(false);
    };

    fetchStudentProfile();
  }, [userId, fetchProfile]);

  // Fetch necessary data based on profile
  useEffect(() => {
    const loadData = async () => {
      try {
        // Always fetch these resources
        await fetchcolleges();
        await fetchBranches();
        await fetchAcademicYears();
        await fetchCourses();

        // Fetch specific college if profile has collegeId
        if (profile?.collegeId) {
          await fetchCollege(profile.collegeId);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, [
    profile,
    fetchCollege,
    fetchBranches,
    fetchAcademicYears,
    fetchCourses,
    fetchcolleges,
  ]);

  // Update form when profile is loaded
  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name || user?.name || "",
        email: profile.email || user?.email || "",
        mobileNo: profile.mobileNo || "",
        address: profile.address || "", // Changed from Address to address
        country: profile.country || "",
        state: profile.state || "",
        city: profile.city || "",
        adharNo: profile.adharNo || "",
        maritalStatus: profile.maritalStatus || "",
        rollNo: profile.rollNo || "",
        collegeId: profile.collegeId || "",
        branchId: profile.branchId || "",
        courseId: profile.courseId || "",
        academicYearId: profile.academicYearId || "",
        yearOfPassing: profile.yearOfPassing?.toString() || "",
        collegeIdProof: profile.collegeIdProof || "", // Changed from CollegeIdProof to collegeIdProof
        verificationStatus: profile.verificationStatus || "PENDING",
        rejectionReason: profile.rejectionReason || "",
        teacherId: profile.teacherId || "",
      });
    }
  }, [profile, form, user]);

  const handleCollegeChange = async (collegeId: string) => {
    if (!collegeId) {
      form.setValue("teacherId", "");
      return;
    }

    try {
      await fetchCollege(collegeId);
      const selectedCollege = colleges.find((c) => c.id === collegeId);

      if (selectedCollege?.collegeAdminId) {
        form.setValue("teacherId", selectedCollege.collegeAdminId);
        console.log("Updated teacherId:", selectedCollege.collegeAdminId);
      } else {
        form.setValue("teacherId", "");
      }
    } catch (error) {
      console.error("Error fetching college details:", error);
      form.setValue("teacherId", "");
    }
  };

  console.log("Student Profile:", profile);
  console.log("Colleges:", colleges);
  console.log("College:", college);
  console.log("Branches:", branches);
  console.log("Academic Years:", academicYears);
  console.log("Courses:", course);
  console.log("Form Values:", form.getValues());

  if (isLoading) {
    return <div>Loading student profile...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Student Profile</h1>

      {/* Here you can build your form UI using the form data */}
      <form>
        {/* Basic information section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Name</label>
              <input
                type="text"
                {...form.register("name")}
                className="w-full p-2 border rounded"
              />
              {form.formState.errors.name && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1">Email</label>
              <input
                type="email"
                {...form.register("email")}
                className="w-full p-2 border rounded"
                disabled
              />
            </div>

            <div>
              <label className="block mb-1">Mobile Number</label>
              <input
                type="text"
                {...form.register("mobileNo")}
                className="w-full p-2 border rounded"
              />
              {form.formState.errors.mobileNo && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.mobileNo.message}
                </p>
              )}
            </div>

            {/* Add more fields as needed */}
          </div>
        </div>

        {/* Education section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Education Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">College</label>
              <select
                {...form.register("collegeId")}
                className="w-full p-2 border rounded"
                onChange={async (e) => {
                  const collegeId = e.target.value;
                  form.setValue("collegeId", collegeId);
                  await handleCollegeChange(collegeId);
                }}
              >
                <option value="">Select College</option>
                {colleges &&
                  colleges.length > 0 &&
                  colleges.map((college) => (
                    <option key={college.id} value={college.id}>
                      {college.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Branch</label>
              <select
                {...form.register("branchId")}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Branch</option>
                {branches &&
                  branches.length > 0 &&
                  branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Course</label>
              <select
                {...form.register("courseId")}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Course</option>
                {course &&
                  course.length > 0 &&
                  course.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Academic Year</label>
              <select
                {...form.register("academicYearId")}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Academic Year</option>
                {academicYears &&
                  academicYears.length > 0 &&
                  academicYears.map((year) => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block mb-1">Roll Number</label>
              <input
                type="text"
                {...form.register("rollNo")}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block mb-1">Year of Passing</label>
              <input
                type="number"
                {...form.register("yearOfPassing")}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Add more sections as needed */}

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Save Profile
        </button>
      </form>
    </div>
  );
};

export default Student;
