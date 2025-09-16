// src/hooks/useDynamicStyles.ts

import { useThemeStore } from "@/store/themeStore";


export const useDynamicStyles = () => {
  const { collegeData } = useThemeStore();

  const getDynamicStyles = () => {
    if (!collegeData) return {};

    return {
      primaryBg: { backgroundColor: collegeData.primaryColor },
      secondaryBg: { backgroundColor: collegeData.secondaryColor },
      accentBg: { backgroundColor: collegeData.accentColor },
      surfaceBg: { backgroundColor: collegeData.surfaceColor },
      primaryText: { color: collegeData.textPrimary },
      secondaryText: { color: collegeData.textSecondary },
      mutedText: { color: collegeData.textMuted },
      border: { borderColor: collegeData.borderColor },
      primaryHover: { 
        backgroundColor: `${collegeData.primaryColor}15`,
        color: collegeData.primaryColor 
      },
      activeItem: {
        backgroundColor: `${collegeData.primaryColor}15`,
        color: collegeData.primaryColor,
        borderLeft: `3px solid ${collegeData.primaryColor}`
      }
    };
  };

  return getDynamicStyles();
};