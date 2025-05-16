"use client";

import {
  Book,
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
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
import Academicyear from "@/components/adminComponent/Academicyear";
import College from "@/components/adminComponent/College";
import Course from "@/components/adminComponent/Course";
import Department from "@/components/adminComponent/Department";
import { GeneralTemplateForm } from "@/components/adminComponent/General";
import Subject from "@/components/adminComponent/Subject";
import { SubjectTemplateForm } from "@/components/adminComponent/SubjectTemplate";

const sidebarItems = [
  { id: "college", label: "College", icon: <School size={20} />, component: <College /> },
  { id: "department", label: "Department", icon: <Building2 size={20} />, component: <Department /> },
  { id: "courses", label: "Courses", icon: <GraduationCap size={20} />, component: <Course /> },
  { id: "subject", label: "Subject", icon: <Book size={20} />, component: <Subject /> },
  { id: "AcademicYear", label: "Academic Year", icon: <Book size={20} />, component: <Academicyear /> },
  { 
    id: "Templates", 
    label: "Templates", 
    icon: <Book size={20} />, 
    component: <div>Templates</div>,
    subItems: [
      { id: "general-templates", label: "General", component: <GeneralTemplateForm/> },
      { id: "specified-templates", label: "Specified", component: <SubjectTemplateForm/> }
    ]
  },
];

const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState("college");
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);

  // Set "general-templates" as default when Templates is selected
  useEffect(() => {
    if (activeComponent === "Templates") {
      setActiveComponent("general-templates");
    }
  }, [activeComponent]);

  // Find the active component to render
  const findActiveComponent = () => {
    // First check main items
    const mainItem = sidebarItems.find(item => item.id === activeComponent);
    if (mainItem) return mainItem.component;
    
    // Then check sub-items
    for (const item of sidebarItems) {
      if (item.subItems) {
        const subItem = item.subItems.find(sub => sub.id === activeComponent);
        if (subItem) return subItem.component;
      }
    }
    
    return <College />;
  };

  const activeComponentToRender = findActiveComponent();

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
  {/* Mobile menu button - positioned properly */}
  <div className="lg:hidden fixed top-4 left-4 z-30">
    <button
      onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      className="p-2 rounded-md bg-white shadow-md text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
      templatesOpen={templatesOpen}
      setTemplatesOpen={setTemplatesOpen}
    />
  </div>

  {/* Sidebar - Mobile - Improved positioning */}
  <div
    className={`lg:hidden fixed inset-0 z-20 transform ${
      mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
    } transition-transform duration-300 ease-in-out`}
  >
    <div className="relative flex flex-col w-64 h-full bg-white border-r border-gray-200 shadow-xl">
      <div className="h-16 flex-shrink-0 flex items-center justify-end px-4">
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          aria-label="Close menu"
        >
          <ChevronLeft size={24} />
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
          templatesOpen={templatesOpen}
          setTemplatesOpen={setTemplatesOpen}
        />
      </div>
    </div>
  </div>

  {/* Main content */}
  <div className={`flex-1 flex flex-col overflow-hidden ${
    mobileMenuOpen ? "ml-64" : "ml-0"
  } transition-all duration-300 lg:ml-0`}>
    {/* Top navigation bar */}
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center">
        {/* Optional header content */}
      </div>

      {/* Profile dropdown - Enhanced styling */}
      <div className="relative">
        <button
          onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-full p-1"
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
              profileDropdownOpen ? 'rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown menu - Improved styling */}
        {profileDropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-10"
            onMouseLeave={() => setProfileDropdownOpen(false)}
          >
            {/* <a 
              href="#" 
              className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <User size={16} className="text-gray-500" />
                <span>My Profile</span>
              </div>
            </a>
            <hr className="my-1 border-gray-200" /> */}
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-100 transition-colors duration-150"
            >
              <div className="flex items-center space-x-3">
                <LogOut size={16} className="text-red-500" />
                <span>Logout</span>
              </div>
            </button>
          </div>
        )}
      </div>
    </header>

    {/* Content area - Improved padding */}
    <main className="flex-1 overflow-auto bg-gray-50 p-4">
      <div className="bg-white  h-full overflow-auto">
        {activeComponentToRender}
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
  templatesOpen?: boolean;
  setTemplatesOpen?: (open: boolean) => void;
}

const SidebarContent = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeComponent, 
  setActiveComponent,
  session,
  handleLogout,
  templatesOpen = false,
  setTemplatesOpen = () => {}
}: SidebarContentProps) => {
  return (
    <>
      {/* Logo and toggle button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
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
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.subItems) {
                    setTemplatesOpen(!templatesOpen);
                    if (!templatesOpen && item.subItems.length > 0) {
                      setActiveComponent(item.subItems[0].id);
                    }
                  } else {
                    setActiveComponent(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors ${
                  (activeComponent === item.id || 
                   (item.subItems && item.subItems.some(sub => sub.id === activeComponent))
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
          )}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8">
                    {item.icon}
                  </div>
                  {sidebarOpen && <span>{item.label}</span>}
                </div>
                {sidebarOpen && item.subItems && (
                  item.subItems.some(sub => sub.id === activeComponent) || templatesOpen ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )
                )}
              </button>

              {/* Sub-items for Templates */}
              {sidebarOpen && templatesOpen && item.subItems && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => setActiveComponent(subItem.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
                        activeComponent === subItem.id
                          ? "bg-blue-100 text-blue-600 font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
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