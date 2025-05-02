"use client";

import AcademicYear from "@/components/admin/Academic year";
import Batch from "@/components/admin/Batch";
import CollegeManagement from "@/components/admin/college/CollegeManagement";
import DisplayTemplates from "@/components/admin/DisplayTemplates";
import LogBookTemplateForm from "@/components/admin/LogFormTemplate";
import Subject from "@/components/admin/Subject";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from "@/hooks/auth";
import { toUpper } from "lodash";
import {
  Activity,
  BookOpen,
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  File,
  FolderOpen,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activeComponent, setActiveComponent] = useState("college");
  const [colleges, setColleges] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedCollegeSection, setExpandedCollegeSection] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState<string | null>(null);

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  // Fetch colleges on initial load
  useEffect(() => {
    if (activeComponent === "college") {
      fetchColleges();
    }
  }, [activeComponent]);

  const fetchColleges = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/college");
      if (response.ok) {
        const data = await response.json();
        setColleges(data);
        
        // Set the first college as selected if colleges exist, otherwise set to null
        if (data.length > 0) {
          setSelectedCollegeId(data[0].id);
        } else {
          setSelectedCollegeId(null);
        }
      } else {
        console.error("Failed to fetch colleges");
      }
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-100 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-blue-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const toggleCollegeSection = () => setExpandedCollegeSection(!expandedCollegeSection);

  const navItems = [
    {
      id: "college",
      label: "College",
      icon: <Building className="h-5 w-5" />,
      hasSubMenu: true,
    },
    {
      id: "createlogTemplate",
      label: "Create Template",
      icon: <File className="h-5 w-5" />,
    },
    {
      id: "templates",
      label: "Templates",
      icon: <Users className="h-5 w-5" />,
    },
    {
      id: "academicYear",
      label: "Academic Year",
      icon: <FolderOpen className="h-5 w-5" />,
    },
    {
      id: "batch",
      label: "Batch",
      icon: <Activity className="h-5 w-5" />,
    },
    {
      id: "subject",
      label: "Subject",
      icon: <BookOpen className="h-5 w-5" />,
    },
  ];

  const renderMainContent = () => {
    switch (activeComponent) {
      case "college":
        return <CollegeManagement selectedCollegeId={selectedCollegeId} onCollegeChange={fetchColleges} />;
      case "createlogTemplate":
        return <LogBookTemplateForm />;
      case "templates":
        return <DisplayTemplates />;
      case "academicYear":
        return <AcademicYear />;
      case "batch":
        return <Batch />;
      case "subject":
        return <Subject />;
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
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleMobileSidebar}
        ></div>
      )}

      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h1 className="text-xl font-semibold text-gray-800">Admin Portal</h1>
            <button
              onClick={toggleMobileSidebar}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  {item.id === "college" ? (
                    <div>
                      <button
                        onClick={() => {
                          setActiveComponent(item.id);
                          toggleCollegeSection();
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeComponent === item.id
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            expandedCollegeSection ? "transform rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedCollegeSection && (
                        <div className="ml-6 mt-2 space-y-2">
                          {loading ? (
                            <div className="text-xs text-gray-500 px-4 py-2">Loading colleges...</div>
                          ) : colleges.length > 0 ? (
                            colleges.map((college) => (
                              <button
                                key={college.id}
                                onClick={() => {
                                  setSelectedCollegeId(college.id);
                                  setActiveComponent("college");
                                  toggleMobileSidebar();
                                }}
                                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                                  selectedCollegeId === college.id
                                    ? "bg-blue-100 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="truncate">{college.name}</span>
                              </button>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 px-4 py-2">No colleges found</div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCollegeId(null);
                              setActiveComponent("college");
                              toggleMobileSidebar();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <span className="text-xs">+ Add New College</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setActiveComponent(item.id);
                        toggleMobileSidebar();
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeComponent === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Desktop navigation */}
      <nav className="bg-white shadow-sm border-b px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden lg:block"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
              Admin Portal
            </h1>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-700">
                    {toUpper(user?.name ?? "") || "Admin"}
                  </span>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                  {user?.name?.charAt(0) ?? "A"}
                </div>
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
        {/* Desktop Sidebar */}
        <div
          className={`${
            sidebarOpen ? "w-64" : "w-20"
          } bg-white border-r transition-all duration-300 ease-in-out h-[calc(100vh-64px)] hidden lg:flex flex-col justify-between overflow-y-auto`}
        >
          <div>
            <div className="flex justify-end p-2">
              <button
                onClick={toggleSidebar}
                className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"
              >
                {sidebarOpen ? (
                  <ChevronLeft size={18} />
                ) : (
                  <ChevronRight size={18} />
                )}
              </button>
            </div>
            <ul className="space-y-2 px-2 py-2">
              {navItems.map((item) => (
                <li key={item.id}>
                  {item.id === "college" ? (
                    <div>
                      <button
                        onClick={() => {
                          setActiveComponent(item.id);
                          if (sidebarOpen) {
                            toggleCollegeSection();
                          }
                        }}
                        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg transition-colors ${
                          activeComponent === item.id
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {item.icon}
                          {sidebarOpen && <span>{item.label}</span>}
                        </div>
                        {sidebarOpen && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedCollegeSection ? "transform rotate-180" : ""
                            }`}
                          />
                        )}
                      </button>
                      {sidebarOpen && expandedCollegeSection && (
                        <div className="ml-6 mt-2 space-y-2">
                          {loading ? (
                            <div className="text-xs text-gray-500 px-4 py-2">Loading colleges...</div>
                          ) : colleges.length > 0 ? (
                            colleges.map((college) => (
                              <button
                                key={college.id}
                                onClick={() => {
                                  setSelectedCollegeId(college.id);
                                  setActiveComponent("college");
                                }}
                                className={`w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors ${
                                  selectedCollegeId === college.id
                                    ? "bg-blue-100 text-blue-600 font-medium"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                              >
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="truncate">{college.name}</span>
                              </button>
                            ))
                          ) : (
                            <div className="text-xs text-gray-500 px-4 py-2">No colleges found</div>
                          )}
                          <button
                            onClick={() => {
                              setSelectedCollegeId(null);
                              setActiveComponent("college");
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <span className="text-xs">+ Add New College</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveComponent(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeComponent === item.id
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {item.icon}
                      {sidebarOpen && <span>{item.label}</span>}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm border min-h-[calc(100vh-112px)]">
            {renderMainContent()}
          </div>
        </div>
      </div>
    </div>
  );
}