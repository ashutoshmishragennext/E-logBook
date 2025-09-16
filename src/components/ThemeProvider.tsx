// src/components/ThemeProvider.tsx
"use client";

import { useThemeStore } from "@/store/themeStore";
import { useSession } from "next-auth/react";
import { useEffect } from "react";


const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const { setCollegeData, setLoading } = useThemeStore();

  useEffect(() => {
    const fetchCollegeData = async (collegeAdminId: string) => {
      try {
        setLoading(true);
        const response = await fetch(`/api/college?collegeAdminId=${collegeAdminId}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            const college = data[0];
            setCollegeData(college);
          }
        } else {
          console.error("Failed to fetch college data");
        }
      } catch (error) {
        console.error("Error fetching college data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user?.id && session?.user?.role === "COLLEGE_ADMIN") {
      fetchCollegeData(session.user.id);
    } else {
      // Set loading to false if user is not a college admin
      setLoading(false);
    }
  }, [session, setCollegeData, setLoading]);

  return <>{children}</>;
};

export default ThemeProvider;