'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LogBookTemplateForm from '@/components/admin/LogFormTemplate';
import { default as StudentLogBookForm } from '@/components/elogbook/Elogbook';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useCurrentUser } from '@/hooks/auth';
import {
  ChevronLeft,
  ChevronRight,
  File,
  LogOut,
  Menu,
  Settings,
  Users
} from 'lucide-react';
import DisplayTemplates from '@/components/admin/DisplayTemplates';


export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const user = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeComponent, setActiveComponent] = useState('createlogTemplate');

  const handleLogout = async () => {
    await signOut({ redirectTo: "/auth/login" });
  };

  // Redirect if not authenticatedclear
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!session) {
    
    return null;
  }


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Navigation items for sidebar
  const navItems = [
    { id: 'createlogTemplate', label: 'Create Template', icon: <File className="h-5 w-5" /> },
    { id: 'templates', label: 'Templates', icon: <Users className="h-5 w-5" /> },
    // { id: 'folders', label: 'Folders', icon: <FolderOpen className="h-5 w-5" /> },
    // { id: 'activity', label: 'Activity', icon: <Activity className="h-5 w-5" /> },
  ];

  // Render the appropriate component based on sidebar selection
  const renderMainContent = () => {
    switch (activeComponent) {
      case 'createlogTemplate':
        return (
            <LogBookTemplateForm/>
        );
      case 'templates':
        return (
          <DisplayTemplates/>
        );
      case 'folders':
        return (
            <div>hii</div>
        );
      case 'activity':
        return (
          <div>
            <h1 className="text-2xl font-bold mb-6">Recent Activity</h1>
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Activity Log</h2>
              {/* Activity logs and timeline */}
            </div>
          </div>
        );
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
            <h1 className="text-2xl font-semibold text-gray-800"> Admin Portal</h1>
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-gray-50 rounded-lg p-2 transition-colors">
                {/* <Avatar className="h-8 w-8">
                  <AvatarImage src="/images/user_alt_icon.png" alt="User" />
                  
                </Avatar> */}
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