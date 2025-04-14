
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCurrentUser } from "@/hooks/auth";
import { Filter, Search } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

// Types
type StudentProfile = {
  id: string;
  profilePhoto: string;
  name: string;
  rollNo: string;
  admissionBatch: string;
  email: string;
  mobileNo: string;
  collegeIdProof: string;
  status: "PENDING" | "APPROVED" | "REJECTED"; // Changed from verification_status
  rejection_reason?: string;
  teacherId: string;
  // Add other fields as needed
};

type RejectionDialogData = {
  open: boolean;
  studentId: string | null;
  reason: string;
};

const StudentsApproval = () => {
  const user = useCurrentUser();
  const userUserId = user?.id || null; // Assuming user object contains the userId

  // States
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [batchFilter, setBatchFilter] = useState<string>("");
  const [availableBatches, setAvailableBatches] = useState<string[]>([]);
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [rejectionDialog, setRejectionDialog] = useState<RejectionDialogData>({
    open: false,
    studentId: null,
    reason: "",
  });
  console.log(currentPage)

  // First fetch the teacher profile to get teacherId
  useEffect(() => {
    const fetchTeacherProfile = async () => {
      if (!userUserId) return;

      try {
        const response = await fetch("/api/teacher-profile?id=" + userUserId);
        if (!response.ok) {
          throw new Error("Failed to fetch teacher profile");
        }
        const teacherData = await response.json();
        setTeacherId(teacherData[0].id); // Assuming the response is an array and we need the first item
        console.log("Fetched teacher data:", teacherData);
      } catch (error) {
        console.error("Error fetching teacher profile:", error);
        alert("Failed to load teacher profile. Please try again.");
      }
    };

    if (userUserId) {
      fetchTeacherProfile();
    }
  }, [userUserId]);

  // Then fetch student profiles after teacherId is set
  useEffect(() => {
    const fetchStudents = async () => {
      if (!teacherId) return;
      console.log("Fetching students for teacherId:", teacherId);
  
      try {
        setLoading(true);
        const response = await fetch(
          `/api/student-profile?teacherId=${teacherId}`
        );
  
        if (!response.ok) {
          throw new Error(`Failed to fetch student profiles: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Response type:", typeof data);
        console.log("Is array:", Array.isArray(data));
        console.log("Raw API response:", data);
  
        // Ensure we're working with an array
        const studentArray = Array.isArray(data) ? data : [data];
        console.log("Number of students received:", studentArray.length);
  
        // Check field names to handle both potential field naming conventions
        if (studentArray.length > 0) {
          console.log("Field names in first student:", Object.keys(studentArray[0]));
        }
  
        // Filter pending students - handle both field naming conventions
        const pendingStudents = studentArray.filter(
          (student) => {
            const status = student.status || student.verification_status;
            return status === "PENDING";
          }
        );
        console.log("Pending students:", pendingStudents);
  
        setStudents(pendingStudents);
  
        // Extract unique batches for filter - handle both field naming conventions
        const batches = [
          ...new Set(
            pendingStudents
              .map((s) => s.admissionBatch || s.admission_batch)
              .filter(Boolean)
          ),
        ] as string[];
        setAvailableBatches(batches);
      } catch (error) {
        console.error("Error fetching student profiles:", error);
        alert("Failed to load student profiles. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    if (teacherId) {
      fetchStudents();
    }
  }, [teacherId]);
  

  // Handle approve student
  const handleApprove = async (studentId: string) => {
    try {
      const response = await fetch(`/api/student-profile?id=${studentId}`, {
        method: "PUT", // Changed from PATCH to PUT
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "APPROVED", 
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to approve student profile");
      }

      // Update local state
      setStudents(students.filter((student) => student.id !== studentId));
      alert("Student profile has been approved successfully.");
    } catch (error) {
      console.error("Error approving student:", error);
      alert("Failed to approve student profile. Please try again.");
    }
  };

  // Open rejection dialog
  const openRejectionDialog = (studentId: string) => {
    setRejectionDialog({
      open: true,
      studentId,
      reason: "",
    });
  };

  // Handle rejection reason change
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRejectionDialog({
      ...rejectionDialog,
      reason: e.target.value,
    });
  };

  const handleReject = async () => {
    if (!rejectionDialog.studentId || !rejectionDialog.reason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      const response = await fetch(
        `/api/student-profile?id=${rejectionDialog.studentId}`,
        {
          method: "PUT", // Changed from PATCH to PUT
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "REJECTED", 
            rejection_reason: rejectionDialog.reason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to reject student profile");
      }

      // Update local state
      setStudents(
        students.filter((student) => student.id !== rejectionDialog.studentId)
      );

      // Close dialog
      setRejectionDialog({
        open: false,
        studentId: null,
        reason: "",
      });

      alert("Student profile has been rejected with reason provided.");
    } catch (error) {
      console.error("Error rejecting student:", error);
      alert("Failed to reject student profile. Please try again.");
    }
  };

  // Filter students
  const getFilteredStudents = () => {
    let filtered = [...students];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply batch filter - only if it's not the "All Batches" value
    if (batchFilter && batchFilter !== "batches") {
      filtered = filtered.filter(
        (student) => student.admissionBatch === batchFilter
      );
    }

    return filtered;
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setBatchFilter("");
    setCurrentPage(1);
  };

  const displayedStudents = getFilteredStudents();

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Student Profile Approval
          </CardTitle>
          <CardDescription>
            Review and approve student profiles pending verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name, roll number or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={batchFilter} onValueChange={setBatchFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="batches">All Batches</SelectItem>
                  {availableBatches.map((batch) => (
                    <SelectItem key={batch} value={batch}>
                      {batch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="whitespace-nowrap"
            >
              <Filter className="h-4 w-4 mr-2" />
              Reset Filters
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : displayedStudents.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500">
                No pending student profiles found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">S.No</TableHead>
                    <TableHead className="w-16">Photo</TableHead>
                    <TableHead>Student Name</TableHead>
                    <TableHead>Roll No</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead className="w-16">ID Proof</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedStudents.map((student, index) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                          {student.profilePhoto ? (
                            <Image
                              src={student.profilePhoto}
                              alt={student.name}
                              className="object-cover"
                              width={48}
                              height={48}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                              N/A
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.rollNo}</TableCell>
                      <TableCell>{student.admissionBatch}</TableCell>
                      <TableCell>
                        <div>
                          <div className="text-sm">{student.email}</div>
                          <div className="text-sm text-gray-500">
                            {student.mobileNo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.collegeIdProof ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(student.collegeIdProof, "_blank")
                            }
                          >
                            View ID
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500">
                            Not uploaded
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApprove(student.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => openRejectionDialog(student.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rejection Dialog */}
      <Dialog
        open={rejectionDialog.open}
        onOpenChange={(open) =>
          !open && setRejectionDialog((prev) => ({ ...prev, open: false }))
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Student Profile</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this student profile.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionDialog.reason}
              onChange={handleReasonChange}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRejectionDialog((prev) => ({ ...prev, open: false }))
              }
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsApproval;
