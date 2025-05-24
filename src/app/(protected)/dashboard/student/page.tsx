/*eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import LogBookEntriesPage from "@/components/studentComponent/LogBookEntries";

import StudentProfileCompact from "@/components/studentComponent/StudentProfile";
import StudentSubjectSelection from "@/components/studentComponent/TeacherAllocation";
import { useStudentProfileStore } from "@/store/student";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  School,
  User,
  X,
  Lock,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Profile");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { profile, fetchProfile } = useStudentProfileStore();

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile({ byUserId: session.user.id });
    }
  }, [session?.user?.id, fetchProfile]);

  console.log("Profile data:", profile);

  // Check if profile is approved
  const isProfileApproved = profile?.verificationStatus === "APPROVED";

  // Dynamically create sidebarItems with session data
  const sidebarItems = [
    {
      id: "Profile",
      label: "Profile",
      icon: <School size={20} />,
      component: <StudentProfileCompact />,
      isLocked: false, // Profile is always accessible
    },
    {
      id: "SubjectSelection",
      label: "Subject",
      icon: <Building2 size={20} />,
      component: <StudentSubjectSelection studentId={profile?.id || ""} />,
      isLocked: !isProfileApproved,
    },
    {
      id: "logBookentries",
      label: "Log Book Entries",
      icon: <School size={20} />,
      component: <LogBookEntriesPage />,
      isLocked: !isProfileApproved,
    },
  ];

  // Find the active component to render
  const activeItem = sidebarItems.find((item) => item.id === activeComponent);

  const handleLogout = async () => {
    try {
      await signOut({ redirectTo: "/auth/login" });
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: redirect manually if signOut fails
      router.push("/auth/login");
    }
  };

  // Handle navigation item click
  const handleNavItemClick = (itemId: string, isLocked: boolean) => {
    if (isLocked) {
      // Show a message or prevent navigation for locked items
      alert("Please wait for your profile to be approved to access this feature.");
      return;
    }
    setActiveComponent(itemId);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (profileDropdownOpen && !target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu button - higher z-index and better styling */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Sidebar - Desktop */}
      <div
        className={`hidden lg:flex flex-col ${
          sidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 bg-white border-r border-gray-200 shadow-sm`}
      >
        <SidebarContent
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
          session={session}
          handleLogout={handleLogout}
          sidebarItems={sidebarItems}
          handleNavItemClick={handleNavItemClick}
          profile={profile}
        />
      </div>

      {/* Sidebar - Mobile - improved overlay behavior */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="relative flex flex-col h-full bg-white border-r border-gray-200 shadow-xl">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <span className="font-medium text-gray-700">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-label="Close menu"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarContent
              sidebarOpen={true}
              setSidebarOpen={() => {}}
              activeComponent={activeComponent}
              setActiveComponent={(id: SetStateAction<string>) => {
                if (typeof id === 'string') {
                  const item = sidebarItems.find(item => item.id === id);
                  if (item && !item.isLocked) {
                    setActiveComponent(id);
                    setMobileMenuOpen(false);
                  } else if (item?.isLocked) {
                    alert("Please wait for your profile to be approved to access this feature.");
                  }
                }
              }}
              session={session}
              handleLogout={handleLogout}
              sidebarItems={sidebarItems}
              handleNavItemClick={handleNavItemClick}
              profile={profile}
            />
          </div>
        </div>
      </div>

      {/* Main content - adjusted for mobile menu */}
      <div
        className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
          mobileMenuOpen ? "ml-64" : "ml-0"
        } lg:ml-0`}
      >
        {/* Top navigation bar - improved styling */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            {/* Profile status indicator */}
            {profile && (
              <div className="flex items-center space-x-2">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    profile.verificationStatus === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : profile.verificationStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {profile.verificationStatus}
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown - enhanced */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full p-1"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <span className="hidden md:inline-block font-medium text-sm">
                {session?.user?.name || "Student"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu - polished */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                <button
                  onClick={() => {
                    setActiveComponent("Profile");
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                >
                  <User size={16} className="text-gray-500" />
                  <span>My Profile</span>
                </button>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                >
                  <LogOut size={16} className="text-red-500" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content area - fixed height issue */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4">
          <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 h-full overflow-auto">
            {activeItem?.component}
          </div>
        </main>
      </div>
    </div>
  );
};

// Extracted sidebar content component for reuse
interface SidebarContentProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  activeComponent: string;
  setActiveComponent: (id: string) => void;
  session: {
    user?: { name?: string | null; email?: string | null; id?: string | null };
  } | null;
  handleLogout: () => void;
  sidebarItems: {
    id: string;
    label: string;
    icon: React.ReactElement;
    component: React.ReactElement;
    isLocked: boolean;
  }[];
  handleNavItemClick: (itemId: string, isLocked: boolean) => void;
  profile: any;
}

const SidebarContent = ({
  sidebarOpen,
  setSidebarOpen,
  activeComponent,
  // setActiveComponent,
  session,
  handleLogout,
  sidebarItems,
  handleNavItemClick,
  profile,
}: SidebarContentProps) => {
  return (
    <>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          {/* You can add your logo here */}
          {sidebarOpen && (
            <span className="text-lg font-bold text-blue-600">
              Student Portal
            </span>
          )}
          {!sidebarOpen && (
            <span className="text-lg font-bold text-blue-600">SP</span>
          )}
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 hover:bg-gray-100 p-1 rounded-full focus:outline-none"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      {/* User profile in sidebar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          {sidebarOpen && (
            <div className="flex-1">
              <p className="font-medium text-gray-800">
                {session?.user?.name || "Student"}
              </p>
              <p className="text-xs text-gray-500">
                {session?.user?.email || "student@example.com"}
              </p>
              {profile && (
                <div
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
                    profile.verificationStatus === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : profile.verificationStatus === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {profile.verificationStatus}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavItemClick(item.id, item.isLocked)}
              disabled={item.isLocked}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
                activeComponent === item.id
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : item.isLocked
                  ? "text-gray-400 bg-gray-50 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8">
                {item.isLocked ? <Lock size={16} /> : item.icon}
              </div>
              {sidebarOpen && (
                <span className="flex-1 text-left">{item.label}</span>
              )}
              {item.isLocked && sidebarOpen && (
                <Lock size={14} className="text-gray-400" />
              )}
            </button>
          ))}
        </nav>
        
        {/* Profile approval notice */}
        {profile?.verificationStatus !== "APPROVED" && sidebarOpen && (
          <div className="mx-3 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Profile Pending:</strong> Some features are locked until your profile is approved.
            </p>
          </div>
        )}
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors ${
            !sidebarOpen && "justify-center"
          }`}
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </>
  );
};

export default Sidebar;