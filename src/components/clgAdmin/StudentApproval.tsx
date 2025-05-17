/* eslint-disable react-hooks/exhaustive-deps*/
/* eslint-disable @typescript-eslint/no-explicit-any*/
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCurrentUser } from '@/hooks/auth'
import { useCollegeStore } from '@/store/college'
import { useStudentProfileStore, VerificationStatus } from '@/store/student'
import { useStudentSubjectStore } from '@/store/studentSubjectStore'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'

const StudentApproval = () => {
  const user = useCurrentUser()
  const userId = user?.id
  const { college, fetchCollegeDetail } = useCollegeStore()
  const [collegeId, setCollegeId] = useState<string | null>(null)
  const { profiles, fetchProfile, updateProfile } = useStudentProfileStore()
  const { branches, fetchBranches, course, fetchCourses, academicYears, fetchAcademicYears } = useStudentSubjectStore()
  
  // States for managing table functionality
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("PENDING")
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentProfiles, setCurrentProfiles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Fetch college details when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (userId) {
        await fetchCollegeDetail(userId)
      }
    }
    fetchData()
  }, [userId, fetchCollegeDetail])

  // Update collegeId when college data changes
  useEffect(() => {
    if (college?.id) {
      setCollegeId(college.id)
    }
  }, [college])

  // Fetch student profiles when collegeId or filter changes
  useEffect(() => {
    const fetchData = async () => {
      if (collegeId) {
        setIsLoading(true)
        try {
          await fetchProfile({ 
            collegeId: collegeId, 
            verificationStatus: filterStatus.toUpperCase() 
          })
          
          // Debug
          console.log("Fetched profiles:", profiles)
          
          // Make sure to set current profiles AFTER the fetch operation completes
          setCurrentProfiles([...profiles])
        } catch (error) {
          console.error("Error fetching profiles:", error)
          setCurrentProfiles([])
        } finally {
          setIsLoading(false)
        }
      }
    }
    fetchData()
  }, [collegeId, filterStatus, fetchProfile])

  // Update currentProfiles whenever profiles changes
  useEffect(() => {
    setCurrentProfiles([...profiles])
  }, [profiles])

  // Fetch branches when collegeId is available
  useEffect(() => {
    const fetchCollegeBranches = async () => {
      await fetchBranches()
      await fetchCourses()
      await fetchAcademicYears()
    }
    fetchCollegeBranches()
  }, [fetchBranches, fetchCourses])

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll) {
      setSelectedStudents(currentProfiles.map(profile => profile.id))
    } else if (selectedStudents.length === currentProfiles.length && currentProfiles.length > 0) {
      setSelectedStudents([])
    }
  }, [selectAll, currentProfiles])

  // Filter profiles based on search query
  const filteredProfiles = currentProfiles.filter(profile => 
    profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    profile.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Helper function to get branch name from branchId
  const getCourseName = (courseId: string) => {
    const courseName = course.find(b => b.id === courseId)
    return courseName ? courseName.name : 'Unknown Course'
  }
  
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId)
    return branch ? branch.name : 'Unknown Branch'
  }

  const getAcademicYearName = (academicYearId: string) => {
    const academicYear = academicYears.find(b => b.id === academicYearId)
    return academicYear ? academicYear.name : 'Unknown Academic Year'
  }

  // Toggle single student selection
  const toggleStudentSelection = (id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    )
  }

  // Handle bulk approval
  const handleBulkApprove = async () => {
    if (selectedStudents.length === 0) return
    
    try {
      for (const studentId of selectedStudents) {
        await updateProfile(
          { id: studentId },
          { verificationStatus: VerificationStatus.APPROVED }
        )
      }
      
      // Refresh the list after bulk operation
      if (collegeId) {
        setIsLoading(true)
        try {
          await fetchProfile({ 
            collegeId: collegeId, 
            verificationStatus: filterStatus.toUpperCase() 
          })
        } catch (error) {
          console.error("Error refreshing profiles:", error)
          setCurrentProfiles([])
        } finally {
          setIsLoading(false)
        }
      }
      
      // Clear selection
      setSelectedStudents([])
      setSelectAll(false)
    } catch (error) {
      console.error("Error approving students:", error)
    }
  }

  // Handle bulk rejection
  const handleBulkReject = async () => {
    if (selectedStudents.length === 0) return
    
    try {
      for (const studentId of selectedStudents) {
        await updateProfile(
          { id: studentId },
          { 
            verificationStatus: VerificationStatus.REJECTED,
            rejectionReason: rejectionReason
          }
        )
      }
      
      // Refresh the list after bulk operation
      if (collegeId) {
        setIsLoading(true)
        try {
          await fetchProfile({ 
            collegeId: collegeId, 
            verificationStatus: filterStatus.toUpperCase() 
          })
        } catch (error) {
          console.error("Error refreshing profiles:", error)
          setCurrentProfiles([])
        } finally {
          setIsLoading(false)
        }
      }
      
      // Close dialog and reset states
      setRejectionDialogOpen(false)
      setRejectionReason("")
      setSelectedStudents([])
      setSelectAll(false)
    } catch (error) {
      console.error("Error rejecting students:", error)
    }
  }

  // Calculate the number of columns based on the current filter
  const getColumnCount = () => {
    // Base columns: checkbox, name, roll no, email, mobile, branch, course, year, actions
    const baseColumnCount = 9
    // Add one more column for rejection reason when viewing rejected profiles
    return filterStatus === "REJECTED" ? baseColumnCount + 1 : baseColumnCount
  }

  // Debug function to help troubleshoot
  const debugStateInfo = () => {
    console.log({
      collegeId,
      filterStatus,
      profilesFromStore: profiles.length,
      currentProfilesState: currentProfiles.length,
      filteredProfilesCount: filteredProfiles.length
    })
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Student Verification</h1>
      
      {/* Debug button - remove in production */}
      <Button 
        onClick={debugStateInfo} 
        variant="outline" 
        className="mb-2"
        size="sm"
      >
        Debug State
      </Button>
      
      {/* Filters and Actions */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Select
            value={filterStatus}
            onValueChange={(value) => {
              setFilterStatus(value)
              setSelectedStudents([])
              setSelectAll(false)
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setRejectionDialogOpen(true)}
            disabled={selectedStudents.length === 0 || filterStatus !== "PENDING"}
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          >
            Reject Selected ({selectedStudents.length})
          </Button>
          
          <Button
            onClick={handleBulkApprove}
            disabled={selectedStudents.length === 0 || filterStatus !== "PENDING"}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve Selected ({selectedStudents.length})
          </Button>
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">
                <Checkbox
                  checked={selectAll}
                  onCheckedChange={() => setSelectAll(!selectAll)}
                  disabled={filterStatus !== "PENDING" || currentProfiles.length === 0}
                />
              </th>
              <th className="p-4 text-left font-medium">Name</th>
              <th className="p-4 text-left font-medium">Roll No</th>
              <th className="p-4 text-left font-medium">Email</th>
              <th className="p-4 text-left font-medium">Mobile</th>
              <th className="p-4 text-left font-medium">Branch</th>
              <th className="p-4 text-left font-medium">Course</th>
              <th className="p-4 text-left font-medium">Year</th>
              {filterStatus === "REJECTED" && (
                <th className="p-4 text-left font-medium">Rejection Reason</th>
              )}
              <th className="p-4 text-left font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={getColumnCount()} className="p-4 text-center text-gray-500">
                  Loading student data...
                </td>
              </tr>
            ) : filteredProfiles && filteredProfiles.length > 0 ? (
              filteredProfiles.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <Checkbox
                      checked={selectedStudents.includes(student.id)}
                      onCheckedChange={() => toggleStudentSelection(student.id)}
                      disabled={filterStatus !== "PENDING"}
                    />
                  </td>
                  <td className="p-4">{student.name || 'N/A'}</td>
                  <td className="p-4">{student.rollNo || 'N/A'}</td>
                  <td className="p-4">{student.email || 'N/A'}</td>
                  <td className="p-4">{student.mobileNo || 'N/A'}</td>
                  <td className="p-4">{student.branchId ? getBranchName(student.branchId) : 'N/A'}</td>
                  <td className="p-4">{student.courseId ? getCourseName(student.courseId) : 'N/A'}</td>
                  <td className="p-4">{student.academicYearId ? getAcademicYearName(student.academicYearId) : 'N/A'}</td>
                  {filterStatus === "REJECTED" && (
                    <td className="p-4 text-red-600">{student.rejectionReason || "No reason provided"}</td>
                  )}
                  <td className="p-4">
                    {filterStatus === "PENDING" && (
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            try {
                              await updateProfile(
                                { id: student.id },
                                { verificationStatus: VerificationStatus.APPROVED }
                              )
                              
                              if (collegeId) {
                                setIsLoading(true)
                                try {
                                  await fetchProfile({
                                    collegeId: collegeId,
                                    verificationStatus: filterStatus.toUpperCase()
                                  })
                                } catch (error) {
                                  console.error("Error refreshing profiles:", error)
                                } finally {
                                  setIsLoading(false)
                                }
                              }
                            } catch (error) {
                              console.error("Error approving student:", error)
                            }
                          }}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedStudents([student.id])
                            setRejectionDialogOpen(true)
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                    {filterStatus === "APPROVED" && (
                      <span className="text-green-600 font-medium">Approved</span>
                    )}
                    {filterStatus === "REJECTED" && (
                      <span className="text-red-600 font-medium">Rejected</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={getColumnCount()} className="p-4 text-center text-gray-500">
                  {searchQuery 
                    ? `No students found matching "${searchQuery}"` 
                    : `No students found with ${filterStatus.toLowerCase()} status`}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Rejection Dialog */}
      <Dialog open={rejectionDialogOpen} onOpenChange={setRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Student Profile{selectedStudents.length > 1 ? 's' : ''}</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedStudents.length} student profile{selectedStudents.length > 1 ? 's' : ''}.
              This will be visible to the student.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectionReason">Rejection Reason</Label>
            <Input
              id="rejectionReason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason"
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleBulkReject}
              disabled={!rejectionReason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentApproval