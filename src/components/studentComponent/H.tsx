import { useCurrentUser } from '@/hooks/auth';
import { useStudentProfileStore } from '@/store/student';
import { useStudentSubjectStore } from '@/store/studentSubjectStore';
import React, { useEffect, useState } from 'react';

const H = () => {
  const user = useCurrentUser();
  const userId = user?.id;

  const { profile, loading: profileLoading, fetchProfile } = useStudentProfileStore();
  const { 
    college, 
    fetchCollege,
    branches,
    fetchBranches, 
    academicYears,
    fetchAcademicYears,
    fetchCourses,
    course,
    phases,
    fetchPhases
  } = useStudentSubjectStore();

  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | null>(null);

  // Fetch profile when userId is available
  useEffect(() => {
    if (userId) {
      fetchProfile({ byUserId: userId });
    }
  }, [userId, fetchProfile]);

  // Set collegeId when profile is fetched
  useEffect(() => {
    if (profile?.collegeId) {
      setCollegeId(profile.collegeId);
    }
  }, [profile]);

  // Fetch college, branches, academic years and courses when collegeId is set
  useEffect(() => {
    if (collegeId) {
      fetchCollege(collegeId);
      fetchBranches();
      fetchAcademicYears();
      fetchCourses();
    }
  }, [collegeId, fetchCollege, fetchBranches, fetchAcademicYears, fetchCourses]);

  // Fetch phases when collegeId and academicYearId are available
  useEffect(() => {
    if (collegeId && selectedAcademicYearId) {
      fetchPhases({ 
        collegeId, 
        academicYears: selectedAcademicYearId 
      });
    }
  }, [collegeId, selectedAcademicYearId, fetchPhases]);

  console.log('Profile Data:', profile?.collegeId);
  console.log('College Data:', college?.name);
  console.log('Branches Data:', branches);
  console.log('Academic Years Data:', academicYears);
  console.log('Courses Data:', course);
  console.log('Phases Data:', phases);
  console.log('Selected Academic Year:', selectedAcademicYearId);

  const handleAcademicYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedAcademicYearId(e.target.value);
  };

  return (
    <div>
      <h1>H Component</h1>
      <p>This is the H component.</p>
      
      {academicYears.length > 0 && (
        <div>
          <label htmlFor="academicYear">Select Academic Year:</label>
          <select 
            id="academicYear"
            onChange={handleAcademicYearChange}
            value={selectedAcademicYearId || ''}
          >
            <option value="">Select an academic year</option>
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {phases.length > 0 && (
        <div>
          <h3>Available Phases:</h3>
          <ul>
            {phases.map((phase) => (
              <li key={phase.id}>{phase.name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default H;