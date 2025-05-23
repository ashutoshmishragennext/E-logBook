/* eslint-disable react-hooks/exhaustive-deps*/
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
import { useEffect, useState, useCallback, useMemo } from 'react'

const StudentApproval = () => {
  const user = useCurrentUser()
  const userId = user?.id
  const { college, fetchCollegeDetail } = useCollegeStore()
  const { fetchProfile, updateProfile, profiles } = useStudentProfileStore() // Add profiles from store
  const { branches, fetchBranches, course, fetchCourses, academicYears, fetchAcademicYears } = useStudentSubjectStore()
  
  // States for managing table functionality
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [filterStatus, setFilterStatus] = useState<string>("PENDING")
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [collegeFetched, setCollegeFetched] = useState(false)
  
  // Memoize collegeId to prevent unnecessary re-renders
  const collegeId = useMemo(() => college?.id || null, [college?.id])

  // Fetch college details when component mounts - only once
  useEffect(() => {
    const fetchData = async () => {
      if (userId && !collegeFetched) {
        console.log("🏫 Fetching college details for userId:", userId)
        setCollegeFetched(true)
        await fetchCollegeDetail(userId)
      }
    }
    fetchData()
  }, [userId, collegeFetched, fetchCollegeDetail])

  // Fetch initial data (branches, courses, academic years) - only once
  useEffect(() => {
    const fetchInitialData = async () => {
      console.log("📚 Fetching initial data (branches, courses, academic years)")
      try {
        await Promise.all([
          fetchBranches(),
          fetchCourses(),
          fetchAcademicYears()
        ])
        console.log("📚 Initial data fetched successfully")
      } catch (error) {
        console.error("❌ Error fetching initial data:", error)
      }
    }
    fetchInitialData()
  }, []) // Empty dependency array - only run once

  // Memoized function to fetch profiles
  const fetchProfilesForStatus = useCallback(async (status: string, logPrefix: string = "") => {
    if (!collegeId) {
      console.log(`${logPrefix}⚠️ No collegeId available, skipping fetch`)
      return []
    }

    console.log(`${logPrefix}🔄 Starting fetch for status: ${status}, collegeId: ${collegeId}`)
    setIsLoading(true)
    
    try {
      const startTime = Date.now()
      
      // Fetch profiles and ensure we get the return value
      await fetchProfile({ 
        collegeId: collegeId, 
        verificationStatus: status.toUpperCase() 
      });
      
      // Get profiles from store after fetch
      const fetchedProfiles = profiles || [];
      
      const endTime = Date.now()
      const duration = endTime - startTime
      
      console.log(`${logPrefix}✅ Fetch completed for status: ${status}`)
      console.log(`${logPrefix}⏱️ Fetch duration: ${duration}ms`)
      console.log(`${logPrefix}📊 Number of profiles fetched: ${fetchedProfiles.length}`)
      console.log(`${logPrefix}📋 Fetched profiles data:`, fetchedProfiles)
      
      return fetchedProfiles
    } catch (error) {
      console.error(`${logPrefix}❌ Error fetching profiles for status ${status}:`, error)
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

  // Main effect to fetch profiles when collegeId or filterStatus changes
  useEffect(() => {
    const fetchData = async () => {
      if (!collegeId) {
        console.log("⚠️ CollegeId not available, skipping profile fetch")
        return
      }

      console.log("🚀 === STARTING PROFILE FETCH ===")
      console.log("📊 Current state:", {
        collegeId,
        filterStatus,
        timestamp: new Date().toISOString()
      })

      // Clear selections
      setSelectedStudents([])
      setSelectAll(false)

      await fetchProfilesForStatus(filterStatus, "[MAIN_FETCH] ")
      
      console.log("✅ === PROFILE FETCH COMPLETED ===")
    }

    fetchData()
  }, [collegeId, filterStatus, fetchProfilesForStatus])

  // Handle select all checkbox
  useEffect(() => {
    if (selectAll && currentProfiles.length > 0) {
      console.log("☑️ Selecting all students:", currentProfiles.length)
      setSelectedStudents(currentProfiles.map(profile => profile.id))
    } else if (!selectAll) {
      // Only clear if we're explicitly unsetting selectAll, not on initial load
      if (selectedStudents.length > 0) {
        console.log("☐ Clearing all selections")
        setSelectedStudents([])
      }
    }
  }, [selectAll, currentProfiles.length])

  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => 
    currentProfiles.filter(profile => 
      profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      profile.rollNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ), [currentProfiles, searchQuery]
  )

  // Helper functions to get names from IDs
  const getCourseName = useCallback((courseId: string) => {
    const courseName = course.find(b => b.id === courseId)
    return courseName ? courseName.name : 'Unknown Course'
  }, [course])
  
  const getBranchName = useCallback((branchId: string) => {
    const branch = branches.find(b => b.id === branchId)
    return branch ? branch.name : 'Unknown Branch'
  }, [branches])

  const getAcademicYearName = useCallback((academicYearId: string) => {
    const academicYear = academicYears.find(b => b.id === academicYearId)
    return academicYear ? academicYear.name : 'Unknown Academic Year'
  }, [academicYears])

  // Toggle single student selection
  const toggleStudentSelection = useCallback((id: string) => {
    setSelectedStudents(prev => 
      prev.includes(id) 
        ? prev.filter(studentId => studentId !== id)
        : [...prev, id]
    )
  }, [])

  // Handle filter status change
  const handleFilterChange = useCallback((newStatus: string) => {
    console.log("🔄 Filter changed from", filterStatus, "to", newStatus)
    setFilterStatus(newStatus)
    setSelectedStudents([])
    setSelectAll(false)
    setSearchQuery("") // Clear search when changing filters
  }, [filterStatus])

  // Helper function to refresh current filter data
  const refreshCurrentFilter = useCallback(async () => {
    console.log("🔄 Refreshing current filter data for status:", filterStatus)
    await fetchProfilesForStatus(filterStatus, "[REFRESH] ")
    console.log("✅ Refresh completed")
  }, [filterStatus, fetchProfilesForStatus])

  // Handle bulk approval
  const handleBulkApprove = useCallback(async () => {
    if (selectedStudents.length === 0) return
    
    console.log("✅ Starting bulk approval for students:", selectedStudents)
    
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
    }
  }, [selectedStudents, updateProfile, refreshCurrentFilter])

  // Handle bulk rejection
  const handleBulkReject = useCallback(async () => {
    if (selectedStudents.length === 0) return
    
    console.log("❌ Starting bulk rejection for students:", selectedStudents, "with reason:", rejectionReason)
    
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
    }
  }, [selectedStudents, rejectionReason, updateProfile, refreshCurrentFilter])

  // Handle single student approval
  const handleSingleApprove = useCallback(async (studentId: string) => {
    console.log("✅ Starting single approval for student:", studentId)
    
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
    }
  }, [updateProfile, refreshCurrentFilter])

  // Calculate the number of columns based on the current filter
  const getColumnCount = useCallback(() => {
    // Base columns: checkbox, name, roll no, email, mobile, branch, course, year, actions
    const baseColumnCount = 9
    // Add one more column for rejection reason when viewing rejected profiles
    return filterStatus === "REJECTED" ? baseColumnCount + 1 : baseColumnCount
  }, [filterStatus])

  // Debug function to help troubleshoot
  const debugStateInfo = useCallback(() => {
    const debugInfo = {
      collegeId,
      filterStatus,
      currentProfilesCount: currentProfiles.length,
      filteredProfilesCount: filteredProfiles.length,
      selectedStudentsCount: selectedStudents.length,
      isLoading,
      searchQuery,
      selectAll,
      timestamp: new Date().toISOString()
    }
    
    console.log("🐞 === DEBUG STATE INFO ===")
    console.table(debugInfo)
    console.log("📊 Current Profiles Full Data:", currentProfiles)
    console.log("🔍 Filtered Profiles:", filteredProfiles)
    console.log("☑️ Selected Students:", selectedStudents)
    console.log("🏪 Store Profiles:", profiles)
    console.log("🐞 === END DEBUG INFO ===")
  }, [collegeId, filterStatus, currentProfiles, filteredProfiles, selectedStudents, isLoading, searchQuery, selectAll, profiles])

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
                          onClick={() => handleSingleApprove(student.id)}
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