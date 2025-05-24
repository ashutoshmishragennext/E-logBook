
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
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'

const StudentApproval = () => {
  const user = useCurrentUser()
  const userId = user?.id
  const { college, fetchCollegeDetail } = useCollegeStore()
  const { fetchProfile, updateProfile, profiles } = useStudentProfileStore()
  const { branches, fetchBranches, course, fetchCourses, academicYears, fetchAcademicYears } = useStudentSubjectStore()
  
  // States for managing table functionality
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("PENDING")
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  
  // Use refs to track initialization states
  const initializationRef = useRef({
    college: false,
    staticData: false,
    profiles: false
  })
  
  // Stable collegeId reference
  const collegeId = useMemo(() => college?.id || null, [college?.id])

  // Initialize college data only once
  useEffect(() => {
    const initializeCollege = async () => {
      if (userId && !initializationRef.current.college) {
        console.log("🏫 Initializing college details for userId:", userId)
        initializationRef.current.college = true
        try {
          await fetchCollegeDetail(userId)
        } catch (error) {
          console.error("❌ Error fetching college:", error)
          initializationRef.current.college = false // Reset on error
        }
      }
    }
    initializeCollege()
  }, [userId, fetchCollegeDetail])

  // Initialize static data only once
  useEffect(() => {
    const initializeStaticData = async () => {
      if (!initializationRef.current.staticData) {
        console.log("📚 Initializing static data (branches, courses, academic years)")
        initializationRef.current.staticData = true
        try {
          await Promise.all([
            fetchBranches(),
            fetchCourses(),
            fetchAcademicYears()
          ])
          console.log("📚 Static data initialized successfully")
        } catch (error) {
          console.error("❌ Error fetching static data:", error)
          initializationRef.current.staticData = false // Reset on error
        }
      }
    }
    initializeStaticData()
  }, [fetchBranches, fetchCourses, fetchAcademicYears])

  // Memoized function to fetch profiles - with proper caching
  const fetchProfilesForStatus = useCallback(async (status: string, forceRefresh: boolean = false) => {
    if (!collegeId) {
      console.log("⚠️ No collegeId available, skipping fetch")
      return []
    }

    // Create a unique key for this fetch operation
    // const fetchKey = `${collegeId}_${status.toUpperCase()}`
    
    console.log(`🔄 Fetching profiles for status: ${status}, collegeId: ${collegeId}, forceRefresh: ${forceRefresh}`)
    setIsLoading(true)
    
    try {
      await fetchProfile({ 
        collegeId: collegeId, 
        verificationStatus: status.toUpperCase() 
      });
      
      console.log(`✅ Profiles fetched successfully for status: ${status}`)
      return profiles || []
    } catch (error) {
      console.error(`❌ Error fetching profiles for status ${status}:`, error)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [collegeId, fetchProfile, profiles])

  // Filter profiles by status from store
  const currentProfiles = useMemo(() => {
    if (!profiles || !Array.isArray(profiles)) return []
    
    return profiles.filter(profile => 
      profile.verificationStatus?.toUpperCase() === filterStatus.toUpperCase()
    )
  }, [profiles, filterStatus])

  // Fetch profiles when collegeId becomes available or filter changes
  useEffect(() => {
    const fetchInitialProfiles = async () => {
      if (!collegeId || initializationRef.current.profiles) {
        return
      }

      console.log("🚀 Fetching initial profiles")
      initializationRef.current.profiles = true
      
      // Clear selections when changing filters
      setSelectedStudents([])
      setSelectAll(false)

      await fetchProfilesForStatus(filterStatus)
    }

    fetchInitialProfiles()
  }, [collegeId, fetchProfilesForStatus, filterStatus])

  // Reset profiles initialization flag when filter changes
  useEffect(() => {
    initializationRef.current.profiles = false
  }, [filterStatus])

  // Handle select all checkbox with proper dependency management
  const handleSelectAllChange = useCallback((checked: boolean) => {
    setSelectAll(checked)
    if (checked && currentProfiles.length > 0) {
      setSelectedStudents(currentProfiles.map(profile => profile.id))
    } else {
      setSelectedStudents([])
    }
  }, [currentProfiles])

  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => 
    currentProfiles.filter(profile => 
      profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      profile.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [currentProfiles, searchQuery]
  )

  // Helper functions to get names from IDs - memoized
  const getCourseName = useCallback((courseId: string) => {
    const foundCourse = course.find(c => c.id === courseId)
    return foundCourse ? foundCourse.name : 'Unknown Course'
  }, [course])
  
  const getBranchName = useCallback((branchId: string) => {
    const branch = branches.find(b => b.id === branchId)
    return branch ? branch.name : 'Unknown Branch'
  }, [branches])

  const getAcademicYearName = useCallback((academicYearId: string) => {
    const academicYear = academicYears.find(ay => ay.id === academicYearId)
    return academicYear ? academicYear.name : 'Unknown Academic Year'
  }, [academicYears])

  // Toggle single student selection
  const toggleStudentSelection = useCallback((id: string) => {
    setSelectedStudents(prev => {
      const newSelection = prev.includes(id) 
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
      
      // Update selectAll state based on new selection
      setSelectAll(newSelection.length === currentProfiles.length && currentProfiles.length > 0)
      
      return newSelection
    })
  }, [currentProfiles.length])

  // Handle filter status change
  const handleFilterChange = useCallback((newStatus: string) => {
    console.log("🔄 Filter changed from", filterStatus, "to", newStatus)
    setFilterStatus(newStatus)
    setSelectedStudents([])
    setSelectAll(false)
    setSearchQuery("")
    // Reset the profiles initialization flag to allow new fetch
    initializationRef.current.profiles = false
  }, [filterStatus])

  // Helper function to refresh current filter data
  const refreshCurrentFilter = useCallback(async () => {
    console.log("🔄 Refreshing current filter data for status:", filterStatus)
    await fetchProfilesForStatus(filterStatus, true) // Force refresh
    console.log("✅ Refresh completed")
  }, [filterStatus, fetchProfilesForStatus])

  // Handle bulk approval
  const handleBulkApprove = useCallback(async () => {
    if (selectedStudents.length === 0) return
    
    console.log("✅ Starting bulk approval for students:", selectedStudents)
    setIsLoading(true)
    
    try {
      const updatePromises = selectedStudents.map(studentId => 
        updateProfile(
          { id: studentId },
          { verificationStatus: VerificationStatus.APPROVED }
        )
      )
      
      await Promise.all(updatePromises)
      console.log("✅ Bulk approval completed successfully")
      
      // Refresh the current filter data
      await refreshCurrentFilter()
      
      // Clear selection
      setSelectedStudents([])
      setSelectAll(false)
    } catch (error) {
      console.error("❌ Error in bulk approval:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedStudents, updateProfile, refreshCurrentFilter])

  // Handle bulk rejection
  const handleBulkReject = useCallback(async () => {
    if (selectedStudents.length === 0) return
    
    console.log("❌ Starting bulk rejection for students:", selectedStudents, "with reason:", rejectionReason)
    setIsLoading(true)
    
    try {
      const updatePromises = selectedStudents.map(studentId => 
        updateProfile(
          { id: studentId },
          { 
            verificationStatus: VerificationStatus.REJECTED,
            rejectionReason: rejectionReason
          }
        )
      )
      
      await Promise.all(updatePromises)
      console.log("❌ Bulk rejection completed successfully")
      
      // Refresh the current filter data
      await refreshCurrentFilter()
      
      // Close dialog and reset states
      setRejectionDialogOpen(false)
      setRejectionReason("")
      setSelectedStudents([])
      setSelectAll(false)
    } catch (error) {
      console.error("❌ Error in bulk rejection:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedStudents, rejectionReason, updateProfile, refreshCurrentFilter])

  // Handle single student approval
  const handleSingleApprove = useCallback(async (studentId: string) => {
    console.log("✅ Starting single approval for student:", studentId)
    setIsLoading(true)
    
    try {
      await updateProfile(
        { id: studentId },
        { verificationStatus: VerificationStatus.APPROVED }
      )
      console.log("✅ Single approval completed successfully")
      
      // Refresh the current filter data
      await refreshCurrentFilter()
    } catch (error) {
      console.error("❌ Error in single approval:", error)
    } finally {
      setIsLoading(false)
    }
  }, [updateProfile, refreshCurrentFilter])

  // Calculate the number of columns based on the current filter
  const getColumnCount = useCallback(() => {
    const baseColumnCount = 9
    return filterStatus === "REJECTED" ? baseColumnCount + 1 : baseColumnCount
  }, [filterStatus])

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Student Verification</h1>
      
      {/* Filters and Actions */}
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center space-x-2">
          <Select
            value={filterStatus}
            onValueChange={handleFilterChange}
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
            disabled={selectedStudents.length === 0 || filterStatus !== "PENDING" || isLoading}
            className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          >
            Reject Selected ({selectedStudents.length})
          </Button>
          
          <Button
            onClick={handleBulkApprove}
            disabled={selectedStudents.length === 0 || filterStatus !== "PENDING" || isLoading}
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
                  onCheckedChange={handleSelectAllChange}
                  disabled={filterStatus !== "PENDING" || currentProfiles.length === 0 || isLoading}
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
                      disabled={filterStatus !== "PENDING" || isLoading}
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
                          onClick={() => handleSingleApprove(student.id)}
                          disabled={isLoading}
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
                          disabled={isLoading}
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
              disabled={!rejectionReason.trim() || isLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoading ? "Processing..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default StudentApproval