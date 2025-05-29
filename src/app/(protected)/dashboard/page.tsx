"use client";

import { useCurrentUser } from "@/hooks/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Dashboard() {
  const router = useRouter();
  const user = useCurrentUser();
  const userId = user?.id || "";
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);

  console.log("role", user?.role);
  
  // Removed the immediate window.location.reload() as it causes infinite loops

  useEffect(() => {
    if (!user?.role) {
      // Only redirect to login, don't reload the page
      router.push("/auth/login");
      return;
    }

    setIsRedirecting(true);

    // Fixed the userData function - it wasn't being called
    const fetchUserData = async (userId: string) => {
      try {
        const response = await fetch(`/api/user?userId=${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        const data = await response.json();
        
        if (data.error) {
          console.error("Error fetching user data:", data.error);
          return;
        }
        
        if (data.defaultpassword && data.defaultpassword !== null) {
          setIsDefaultPassword(true);
          router.push(`/auth/change-password?userId=${userId}&firstTime=true`);
          return; // Exit early if redirecting to change password
        }
        
        return data;
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    // Call the function if userId exists
    if (userId) {
      fetchUserData(userId).then(() => {
        // Only proceed with role-based routing if not redirecting to change password
        if (!isDefaultPassword) {
          redirectBasedOnRole();
        }
      });
    } else {
      redirectBasedOnRole();
    }

    function redirectBasedOnRole() {
      switch (user?.role) {
        case "COLLEGE_ADMIN":
          router.push("/dashboard/clg-admin");
          break;
        case "STUDENT":
          router.push("/dashboard/student");
          break;
        case "TEACHER":
          router.push("/dashboard/teacher");
          break;
        case "ADMIN":
          router.push("/dashboard/admin");
          break;
        default:
          setIsRedirecting(false);
          break;
      }
    }
  }, [router, user?.role, userId, isDefaultPassword]); // Fixed dependencies

  if (isRedirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="flex items-center">
          <svg 
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-4">
      {/* Your default dashboard content goes here */}
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </div>
  );
}