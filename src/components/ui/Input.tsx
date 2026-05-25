// src/components/ui/Input.tsx
import { colors } from "@constants/theme";
import { Ionicons } from "@expo/vector-icons"; // هنستخدم الأيقونات اللي سطبناها
import { forwardRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  isPassword?: boolean;
  inputClassName?: string;
  inputContainerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  (
    {
      label,
      error,
      leftIcon,
      isPassword,
      className = "",
      inputClassName = "",
      inputContainerClassName = "",
      ...props
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    return (
      <View className={`w-full mb-4 ${className}`}>
        {/* الـ Label */}
        {label && (
          <Text className="text-text-main font-medium text-sm mb-2 text-right">
            {label}
          </Text>
        )}

        {/* حاوية الـ Input عشان نقدر نحط أيقونات ونتحكم في الـ Border */}
        <View
          className={`flex-row items-center bg-surface border rounded-xl px-4 h-14 ${
            error
              ? "border-error"
              : isFocused
                ? "border-primary"
                : "border-gray-200"
          } ${inputContainerClassName}`}
        >
          {/* أيقونة يمين/شمال حسب تصميمك */}
          {leftIcon && <View className="mr-3">{leftIcon}</View>}

          <TextInput
            ref={ref}
            className={`flex-1 text-text-main font-regular text-base ${
              inputClassName.includes("text-center") ? "" : "text-right"
            } ${inputClassName}`}
            placeholderTextColor={colors.text.muted}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            // لو هو باسورد والمستخدم مش دايس إظهار، اخفي النص
            secureTextEntry={isPassword && !showPassword}
            {...props}
          />

          {/* زرار إظهار/إخفاء الباسورد */}
          {isPassword && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              className="ml-3"
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.text.muted}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* رسالة الخطأ */}
        {error && (
          <Text className="text-error text-xs mt-1.5 font-medium text-right">
            {error}
          </Text>
        )}
      </View>
    );
  },
);

// لازم نحدد الـ displayName عشان بنستخدم forwardRef (عشان الـ Debugging)
Input.displayName = "Input";
