export const colors = {
  // الهوية الأساسية من الصورة الرسمية
  primary: {
    default: "#2E7D32", // الأخضر الرسمي
    dark: "#1B5E20",
    light: "#4CAF50",
  },
  secondary: {
    default: "#FF6D00", // البرتقالي الحيوي
    dark: "#D97706",
    light: "#FFB74D",
  },
  accent: "#FFD600", // الأصفر الذهبي

  // ألوان الواجهة والنصوص
  background: "#F5F5F5",
  surface: "#FFFFFF",
  text: {
    main: "#212121",
    muted: "#757575",
    inverse: "#FFFFFF",
  },

  // ألوان الحالة
  success: "#4CAF50",
  error: "#D32F2F",
  warning: "#FB8C00",

  gray: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    400: "#9CA3AF",
    600: "#4B5563",
    900: "#111827",
  },
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const fontSize = {
  "xs": 12,
  "sm": 14,
  "base": 16,
  "lg": 18,
  "xl": 20,
  "2xl": 24,
  "3xl": 30,
} as const;

export const fontFamily = {
  // تم التعديل لخط تاجوال اللي اخترناه
  regular: "Tajawal_400Regular",
  medium: "Tajawal_500Medium",
  bold: "Tajawal_700Bold",
} as const;
