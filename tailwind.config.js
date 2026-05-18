/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // الألوان الأساسية
        primary: {
          DEFAULT: "#2E7D32", // الأخضر الرسمي
          dark: "#1B5E20", // من تدرج الخلفية، هنحتاجه في الـ Active states
        },
        secondary: "#FF6D00", // البرتقالي الحيوي (Action Orange)
        accent: "#FFD600", // الأصفر الذهبي

        // ألوان الواجهة والنصوص
        background: "#F5F5F5", // الخلفية الأساسية
        surface: "#FFFFFF", // الأبيض النقي للـ Cards والـ Buttons
        text: {
          main: "#212121", // النصوص الأساسية
          muted: "#757575", // النصوص الفرعية
          inverse: "#FFFFFF", // نصوص الأزرار (نفس الأبيض بس مسمى مختلف عشان الـ Readability)
        },

        // ألوان الحالة (Status)
        status: {
          ready: "#4CAF50", // حالة "جاهز"
          preparing: "#FB8C00", // حالة "قيد التحضير"
          canceled: "#D32F2F", // حالة "إلغاء"
        },
      },
      fontFamily: {
        // تم التعديل لخط تاجوال
        sans: ["Tajawal_400Regular"],
        medium: ["Tajawal_500Medium"],
        bold: ["Tajawal_700Bold"],
      },
    },
  },
  plugins: [],
};
