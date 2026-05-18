// src/components/ui/Button.tsx
import { colors } from "@constants/theme";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  isLoading,
  disabled,
  className,
}: ButtonProps) {
  const variants = {
    primary: "bg-primary py-4 rounded-xl items-center",
    secondary: "bg-secondary py-4 rounded-xl items-center",
    outline: "border-2 border-primary py-4 rounded-xl items-center",
    ghost: "py-4 items-center",
  };

  const textVariants = {
    primary: "text-white font-bold text-base",
    secondary: "text-white font-bold text-base",
    outline: "text-primary font-bold text-base",
    ghost: "text-primary font-bold text-base",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      className={`${variants[variant]} ${disabled ? "opacity-50" : ""} ${className}`}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === "outline" ? colors.primary.default : "#fff"}
        />
      ) : (
        <Text className={textVariants[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}
