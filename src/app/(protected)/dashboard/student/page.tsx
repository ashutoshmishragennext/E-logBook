/* eslint-disable  react-hooks/exhaustive-deps*/
'use client';

import { StudentLogBookEntries } from '@/components/student/DisplayLogBookEntries';
import LogBookManagement from '@/components/student/LogBookManagement';
import StudentProfileForm from '@/components/student/profileForm';
import ProfileVerificationStatus from '@/components/student/ProfileVerificationStatus ';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from '@/hooks/auth';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  File,
  LogOut,
  Menu,
  Settings,
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
  const [activeComponent, setActiveComponent] = useState('profile');
  const [profileStatus, setProfileStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [profileExists, setProfileExists] = useState(false);

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

  // Determine if logbook entry should be accessible
  const canAccessLogBook = profileStatus === 'APPROVED';

  // Navigation items for sidebar
  const navItems = [
    { id: 'profile', label: 'Profile', icon: <File className="h-5 w-5" />, always: true },
  ];

  // Add verification status item if profile exists
  if (profileExists && profileStatus !== 'APPROVED') {
    navItems.push({ 
      id: 'verification', 
      label: 'Verification Status', 
      icon: <AlertCircle className="h-5 w-5" />, 
      always: true 
    });
  }

  // Add LogBook entries only if profile is approved
  if (canAccessLogBook) {
    navItems.push({ 
      id: 'LogBookEntries', 
      label: 'Log Book Entries', 
      icon: <Users className="h-5 w-5" />, 
      always: false 
    });
  }

  // Render the appropriate component based on sidebar selection
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'profile':
        return <StudentProfileForm onProfileUpdate={fetchProfileStatus} />;
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
              {navItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveComponent(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeComponent === item.id
                        ? 'bg-gray-100 text-blue-600 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {item.icon}
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </li>
              ))}
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