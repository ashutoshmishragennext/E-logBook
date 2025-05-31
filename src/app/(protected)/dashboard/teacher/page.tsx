"use client";
import DisplayLogBookEntries from "@/components/teacher/DisplayLogBookEntries";
import PendingStudents from "@/components/teacher/PendingStudents";
import { TeacherProfilePage } from "@/components/teacher/TeacherProfile";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Menu,
  School,
  User,
  X
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

  // Dynamically create sidebarItems with session data
  const sidebarItems = [
    { id: "Profile", label: "Profile", icon: <School size={20} />, component: <TeacherProfilePage/> },
    { id: "Students-Pending ", label: "Pending Students", icon: <User size={20} />, component: <PendingStudents/> },
    {id: "logbookReviews", label: "Logbook Reviews", icon: <User size={20} />, component: <DisplayLogBookEntries/> },
  ];

  // Find the active component to render
  const activeItem = sidebarItems.find(item => item.id === activeComponent);

  const handleLogout = async () => {
    try {
      setProfileDropdownOpen(false); // Close dropdown first
      await signOut({ redirectTo: "/auth/login" });
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
      if (profileDropdownOpen && !target.closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
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
                setActiveComponent(id);
                setMobileMenuOpen(false);
              }}
              session={session}
              handleLogout={handleLogout}
              sidebarItems={sidebarItems}
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
            {/* Optional header content can go here */}
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
                {session?.user?.name || "Admin"}
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-200 ${
                  profileDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu - fixed logout functionality */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                {/* <button
                  onClick={() => setActiveComponent("Profile")}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors flex items-center space-x-3"
                >
                  <User size={16} className="text-gray-500" />
                  <span>My Profile</span>
                </button>
                <hr className="my-1 border-gray-200" /> */}
                <button
                  onClick={handleLogout}
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
  session: { user?: { name?: string | null; email?: string | null; id?: string | null } } | null;
  handleLogout: () => void;
  sidebarItems: {
    id: string;
    label: string;
    icon: React.ReactElement;
    component: React.ReactElement;
  }[];
}

const SidebarContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeComponent, 
  setActiveComponent,
  session,
  handleLogout,
  sidebarItems
}: SidebarContentProps) => {
  return (
    <>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          {/* You can add your logo here */}
          {sidebarOpen && (
            <span className="text-lg font-bold text-blue-600">Teacher Portal</span>
          )}
          {!sidebarOpen && (
            <span className="text-lg font-bold text-blue-600">AP</span>
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
            <div>
              <p className="font-medium text-gray-800">{session?.user?.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{session?.user?.email || "admin@example.com"}</p>
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
              onClick={() => setActiveComponent(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                activeComponent === item.id
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8">
                {item.icon}
              </div>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
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