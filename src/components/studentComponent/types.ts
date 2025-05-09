export interface StudentProfile {
  id?: string;
  userId: string;
  name: string;
  rollNo?: string;
  mobileNo: string;
  email: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  adharNo?: string;
  maritalStatus?: string;
  collegeId?: string;
  branchId?: string;
  courseId?: string;
  academicYearId?: string;
  collegeIdProof?: string;
  yearOfPassing?: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  teacherId?: string;
  rejectionReason?: string;
}

export interface SubjectAllocation {
  subjectId: string;
  teacherSubjectId: string;
  academicYearId: string;
  phaseId: string;
  verificationStatus?: "PENDING" | "APPROVED" | "REJECTED";
  rejectionReason?: string;
}
