import { create } from "zustand";

export interface College {
  id: string;
  userId: string;
  name: string;
  code: string;
  address: string;
  country: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  logo: string;
  collegeAdminId: string;

}

export interface CollegeState {
  college: College | null;
  fetchCollegeDetail: (userId: string) => Promise<void>;
  updateCollege: (college: College) => void;
}

export const useCollegeStore = create<CollegeState>((set) => ({
  college: null,

  fetchCollegeDetail: async (userId) => {
    try {
      const response = await fetch(`/api/college?collegeAdminId=${userId}`);
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      set({ college: data[0] });
    } catch (error) {
      console.error("Error fetching college details:", error);
    }
  },

  updateCollege: (college: College) => {
    set({ college });
  },
}));