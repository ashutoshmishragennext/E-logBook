"use client";

import {
  Book,
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LogOut,
  Menu,
  School,
  User
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SetStateAction, useEffect, useState } from "react";

// Import your components for each sidebar item
import College from "@/components/adminComponent/College";
import Course from "@/components/adminComponent/Course";
import Department from "@/components/adminComponent/Department";
import Subject from "@/components/adminComponent/Subject";

const sidebarItems = [
  { id: "college", label: "College", icon: <School size={20} />, component: <College /> },
  { id: "department", label: "Department", icon: <Building2 size={20} />, component: <Department /> },
  { id: "courses", label: "Courses", icon: <GraduationCap size={20} />, component: <Course /> },
  { id: "subject", label: "Subject", icon: <Book size={20} />, component: <Subject /> },
];

const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState("college");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Find the active component to render
  const activeItem = sidebarItems.find(item => item.id === activeComponent);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
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
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-600"
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
        />
      </div>

      {/* Sidebar - Mobile */}
      <div
        className={`lg:hidden fixed inset-0 z-20 transform ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="relative flex flex-col w-64 h-full bg-white border-r border-gray-200 shadow-xl">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="absolute top-4 right-4 text-gray-500"
          >
            <ChevronLeft size={24} />
          </button>
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
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg">
          <div className="flex items-center">
            {/* <h1 className="text-xl font-semibold text-gray-800">
              {activeItem?.label || "college"}
            </h1> */}
          </div>

          {/* Profile dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <User size={20} className="text-blue-600" />
              </div>
              <span className="hidden md:inline-block font-medium">
                {session?.user?.name || "Admin"}
              </span>
              <ChevronRight size={16} className={`transition-transform duration-200 ${profileDropdownOpen ? 'rotate-90' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <div className="flex items-center space-x-2">
                    <User size={16} />
                    <span>My Profile</span>
                  </div>
                </a>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  <div className="flex items-center space-x-2">
                    <LogOut size={16} />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          {/* Render the active component */}
          <div className="bg-white rounded-lg shadow p-3  min-h-[calc(100vh-10rem)]">
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
  session: { user?: { name?: string | null; email?: string | null } } | null;
  handleLogout: () => void;
}

const SidebarContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeComponent, 
  setActiveComponent,
  session,
  handleLogout
}: SidebarContentProps) => {
  return (
    <>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          {/* You can add your logo here */}
          {sidebarOpen && (
            <span className="text-lg font-bold text-blue-600">Admin Portal</span>
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