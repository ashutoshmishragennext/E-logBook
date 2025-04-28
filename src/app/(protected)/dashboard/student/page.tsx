/* eslint-disable  react-hooks/exhaustive-deps*/
'use client';

import { StudentLogBookEntries } from '@/components/student/DisplayLogBookEntries';
import LogBookManagement from '@/components/student/LogBookManagement';
import StudentProfileTabs from '@/components/student/profileForm';
import ProfileVerificationStatus from '@/components/student/ProfileVerificationStatus ';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from '@/hooks/auth';
import {
  AlertCircle,
  Book,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  File,
  GraduationCap,
  LogOut,
  Menu,
  Briefcase,
  Settings,
  User,
  Users
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const { status } = useSession();
  const router = useRouter();
  const user = useCurrentUser();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState('personal');
  const [profileStatus, setProfileStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [profileExists, setProfileExists] = useState(false);
  const [isProfileExpanded, setIsProfileExpanded] = useState(true);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  // Fetch profile verification status
  useEffect(() => {
    if (user?.id) {
      fetchProfileStatus();
    }
  }, [user?.id]);

  const fetchProfileStatus = async () => {
    try {
      const response = await fetch(`/api/student-profile?byUserId=${user?.id}`);
      const data = await response.json();
      
      if (response.ok && data) {
        if (data.message !== "Student not found") {
          setProfileExists(true);
          setProfileStatus(data.status || 'PENDING');
        } else {
          setProfileExists(false);
          setProfileStatus('PENDING');
        }
      }
    } catch (error) {
      console.error("Error fetching profile status:", error);
    }
  };

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleProfileExpansion = () => {
    setIsProfileExpanded(!isProfileExpanded);
  };

  // Determine if logbook entry should be accessible
  const canAccessLogBook = profileStatus === 'APPROVED';

  // Render the appropriate component based on sidebar selection
  const renderMainContent = () => {
    // Profile related components
    if (['personal', 'academic', 'professional'].includes(activeComponent)) {
      return <StudentProfileTabs 
              onProfileUpdate={fetchProfileStatus} 
              activeTab={activeComponent === 'personal' ? 0 : activeComponent === 'academic' ? 1 : 2} 
             />;
    }
    
    switch (activeComponent) {
      case 'verification':
        return <ProfileVerificationStatus status={profileStatus} />;
      case 'LogBookEntries':
        if (!canAccessLogBook) {
          return (
            <div className="text-center p-8 text-red-500">
              Your profile is pending verification. You cannot access the logbook entries until your profile is approved.
            </div>
          );
        }
        return <LogBookManagement />;
      case 'EnteredlogBook':
        if (!canAccessLogBook) {
          return (
            <div className="text-center p-8 text-red-500">
              Your profile is pending verification. You cannot access the logbook entries until your profile is approved.
            </div>
          );
        }
        return <StudentLogBookEntries />;
      default:
        return (
          <div className="text-center p-8 text-gray-500">
            Select an option from the sidebar
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Student Portal</h1>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56" align="end">
              <div className="space-y-1">
                <button className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                  <Settings className="h-4 w-4" />
                  Profile Settings
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'w-64' : 'w-20'
          } bg-white border-r transition-all duration-300 ease-in-out h-[calc(100vh-64px)] flex flex-col justify-between`}
        >
          <div>
            <div className="flex justify-end p-2">
              <button 
                onClick={toggleSidebar} 
                className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            </div>
            <ul className="space-y-2 px-3 py-4">
              {/* Profile section with collapsible options */}
              <li>
                <button
                  onClick={toggleProfileExpansion}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    ['personal', 'academic', 'professional'].includes(activeComponent)
                      ? 'bg-gray-100 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    {sidebarOpen && <span>Profile</span>}
                  </div>
                  {sidebarOpen && (isProfileExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />)}
                </button>

                {/* Profile sub-options */}
                {isProfileExpanded && sidebarOpen && (
                  <div className="ml-6 mt-1 space-y-1">
                    <button
                      onClick={() => setActiveComponent('personal')}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        activeComponent === 'personal'
                          ? 'bg-gray-100 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      <span>Personal</span>
                    </button>
                    <button
                      onClick={() => setActiveComponent('academic')}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        activeComponent === 'academic'
                          ? 'bg-gray-100 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <GraduationCap className="h-4 w-4" />
                      <span>Academic</span>
                    </button>
                    <button
                      onClick={() => setActiveComponent('professional')}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                        activeComponent === 'professional'
                          ? 'bg-gray-100 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Briefcase className="h-4 w-4" />
                      <span>Professional</span>
                    </button>
                  </div>
                )}
              </li>

              {/* Verification status item */}
              {profileExists && profileStatus !== 'APPROVED' && (
                <li>
                  <button
                    onClick={() => setActiveComponent('verification')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeComponent === 'verification'
                        ? 'bg-gray-100 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <AlertCircle className="h-5 w-5" />
                    {sidebarOpen && <span>Verification Status</span>}
                  </button>
                </li>
              )}

              {/* LogBook entries options - only if profile is approved */}
              {canAccessLogBook && (
                <>
                  <li>
                    <button
                      onClick={() => setActiveComponent('LogBookEntries')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeComponent === 'LogBookEntries'
                          ? 'bg-gray-100 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Book className="h-5 w-5" />
                      {sidebarOpen && <span>Log Book Entries</span>}
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => setActiveComponent('EnteredlogBook')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeComponent === 'EnteredlogBook'
                          ? 'bg-gray-100 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <File className="h-5 w-5" />
                      {sidebarOpen && <span>All Entries</span>}
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
}