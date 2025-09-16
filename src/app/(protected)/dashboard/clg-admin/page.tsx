/* eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import { SubjectTemplateForm } from "@/components/adminComponent/SubjectTemplate";
import Batch from "@/components/clgAdmin/Batch";
import Faculty from "@/components/clgAdmin/Faculty";
import Profile from "@/components/clgAdmin/Profile";
import Students from "@/components/clgAdmin/Student";
import StudentApproval from "@/components/clgAdmin/StudentApproval";
import { useThemeStore } from "@/store/themeStore";

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
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const sidebarItems = [
  { id: "Profile", label: "Profile", icon: <School size={20} />, component: <Profile /> },
  { id: "Batch", label: "Batch", icon: <Building2 size={20} />, component: <Batch /> },
  { id: "Faculty", label: "Faculty", icon: <Building2 size={20} />, component: <Faculty /> },
  { id: "Students", label: "Students", icon: <User size={20} />, component: <Students /> },
  { id: "StudentApproval", label: "Student Approval", icon: <User size={20} />, component: <StudentApproval /> },
  { id: "Templates", label: "Subject Templates", icon: <User size={20} />, component: <SubjectTemplateForm /> }
];

const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { collegeData, isLoading: isLoadingTheme, } = useThemeStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("Profile");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const activeItem = sidebarItems.find((item) => item.id === activeComponent);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
      if (isDesktop) {
        setMobileMenuOpen(false); // Close mobile menu on desktop
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch college data


  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsLoggingOut(true);
    try {
      await signOut({ callbackUrl: "/auth/login" });
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  const handleMenuItemClick = (id: string) => {
    setActiveComponent(id);
    setMobileMenuOpen(false); // Close mobile menu when item is selected
  };


  useEffect(() => {
    if (status === "unauthenticated" || session?.user?.role !== "COLLEGE_ADMIN") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (profileDropdownOpen && !target.closest(".profile-dropdown")) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileDropdownOpen]);

  if (isLoadingTheme) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Menu Button - Only show on mobile when menu is closed */}
      {!mobileMenuOpen && (
        <div className="lg:hidden fixed top-2 left-4 z-50">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-3 rounded-md shadow-md hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-primary border border-color"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className={`hidden lg:flex flex-col ${sidebarOpen ? "w-64" : "w-20"} transition-all duration-300 border-r border-color shadow-sm `}>
        <SidebarContent
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
          session={session}
          handleLogout={handleLogout}
          collegeData={collegeData}
          isLoggingOut={isLoggingOut}
          isMobile={false}
          onClose={() => {}}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
          <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out">
            <div className="flex flex-col h-full border-r border-color shadow-xl bg-white">
              <SidebarContent
                sidebarOpen={true}
                setSidebarOpen={() => {}}
                activeComponent={activeComponent}
                setActiveComponent={handleMenuItemClick}
                session={session}
                handleLogout={handleLogout}
                collegeData={collegeData}
                isLoggingOut={isLoggingOut}
                isMobile={true}
                onClose={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="shadow-sm border-b border-color h-16 flex items-center justify-between px-4 lg:px-6 ">
          <div className="flex items-center space-x-3">
            {collegeData?.logo && (
              <img src={collegeData.logo} alt={collegeData.name} className="h-8 w-8 rounded-full object-cover" />
            )}
            <span className="font-semibold text-lg hidden md:block text-primary">
              {collegeData?.name || "College Portal"}
            </span>
          </div>
          
          {/* Profile Dropdown */}
          <div className="relative profile-dropdown">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center space-x-2 hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary rounded-full p-2 text-primary"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center  text-primary">
                <User size={20} />
              </div>
              <span className="hidden md:inline-block font-medium text-sm text-primary">
                {session?.user?.name || "College Admin"}
              </span>
              <ChevronDown size={16} className={`transition-transform duration-200 text-secondary ${profileDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {profileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-theme shadow-lg py-1 border border-color z-10 bg-background">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-error/10 transition-colors flex items-center space-x-3 text-error"
                >
                  <LogOut size={16} />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto  ">
          <div className="h-full overflow-auto rounded-theme bg-background p-2 bg-white  border border-color">
            {activeItem?.component}
          </div>
        </main>
      </div>
    </div>
  );
};

// Simplified Sidebar Content Component
type SidebarContentProps = {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeComponent: string;
  setActiveComponent: React.Dispatch<React.SetStateAction<string>> | ((id: string) => void);
  session: any;
  handleLogout: (e: React.MouseEvent<HTMLButtonElement>) => void;
  collegeData: any;
  isLoggingOut: boolean;
  isMobile: boolean;
  onClose: () => void;
};

const SidebarContent = ({
  sidebarOpen,
  setSidebarOpen,
  activeComponent,
  setActiveComponent,
  session,
  handleLogout,
  collegeData,
  isLoggingOut,
  isMobile,
  onClose,
}: SidebarContentProps) => {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-color">
        <div className="flex items-center space-x-2">
          {collegeData?.logo && sidebarOpen && (
            <img src={collegeData.logo} alt={collegeData.name} className="h-8 w-8 rounded-full object-cover" />
          )}
          {sidebarOpen && (
            <div>
              <span className="text-lg font-bold block text-primary">
                {collegeData?.name || "College Portal"}
              </span>
              <span className="text-xs text-secondary">
                {collegeData?.code || "CP"}
              </span>
            </div>
          )}
        </div>
        
        {/* Toggle/Close Button */}
        {isMobile ? (
          <button onClick={onClose} className="p-1 rounded-full hover:bg-primary/10 text-primary">
            <X size={20} />
          </button>
        ) : (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded-full hover:bg-primary/10 text-primary">
            {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        )}
      </div>

      {/* User Profile */}
      {sidebarOpen && (
        <div className="p-4 border-b border-color">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center  text-primary">
              <User size={20} />
            </div>
            <div>
              <p className="font-medium text-primary">{session?.user?.name || "College Admin"}</p>
              <p className="text-xs text-secondary">{session?.user?.email || "admin@example.com"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveComponent(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-theme transition-colors text-sm md:text-base ${
                activeComponent === item.id
                  ? "bg-primary/10  text-primary font-medium"
                  : "text-secondary bg-white hover:text-primary"
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

      {/* Logout Button */}
      <div className="p-4 border-t border-color">
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className={`w-full flex items-center gap-3 px-3 py-3 rounded-theme transition-colors text-error hover:bg-error/10 ${
            !sidebarOpen && "justify-center"
          }`}
        >
          <LogOut size={20} />
          {sidebarOpen && <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>
    </>
  );
};

export default Sidebar;