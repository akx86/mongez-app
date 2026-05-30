import { colors } from "@/constants/theme";
import { OrderStatus } from "@/types/schema.types";
import { Check } from "lucide-react-native";
import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

const TRACKING_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "pending", label: "تم استلام الطلب" },
  { status: "driver_accepted", label: "قبول السائق" },
  { status: "preparing", label: "جاري التحضير" },
  { status: "picked_at", label: "استلام من المطعم" },
  { status: "delivering", label: "في الطريق إليك" },
  { status: "completed", label: "تم التسليم" },
];

const STATUS_SEQUENCE = TRACKING_STEPS.map((step) => step.status);

type StepVisualState = "completed" | "active" | "pending" | "cancelled";

const getCurrentStepIndex = (status: OrderStatus): number => {
  if (status === "cancelled") return -1;
  if (status === "completed") return STATUS_SEQUENCE.length;
  return STATUS_SEQUENCE.indexOf(status);
};

const resolveStepState = (
  stepIndex: number,
  currentIndex: number,
  isCancelled: boolean,
): StepVisualState => {
  if (isCancelled) return "cancelled";
  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "active";
  return "pending";
};

interface StepIndicatorProps {
  state: StepVisualState;
}

const StepIndicator = ({ state }: StepIndicatorProps) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state !== "active") return;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [state, pulse]);

  const backgroundColor =
    state === "completed"
      ? colors.primary.default
      : state === "active"
        ? colors.primary.light
        : state === "cancelled"
          ? colors.gray[200]
          : colors.gray[200];

  const borderColor =
    state === "active" ? colors.primary.default : backgroundColor;

  const content =
    state === "completed" ? (
      <Check size={14} color={colors.text.inverse} strokeWidth={3} />
    ) : (
      <View
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor:
            state === "active" ? colors.primary.default : colors.gray[400],
        }}
      />
    );

  if (state === "active") {
    return (
      <Animated.View
        style={{
          transform: [{ scale: pulse }],
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor,
          borderWidth: 2,
          borderColor,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {content}
      </Animated.View>
    );
  }

  return (
    <View
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor,
        borderWidth: state === "pending" ? 1 : 0,
        borderColor: colors.gray[300],
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {content}
    </View>
  );
};

interface OrderProgressTrackerProps {
  status: OrderStatus;
}

export const OrderProgressTracker = ({ status }: OrderProgressTrackerProps) => {
  const isCancelled = status === "cancelled";
  const currentIndex = getCurrentStepIndex(status);

  return (
    <View
      className="mx-4 mb-4 rounded-2xl border border-gray-100 p-4"
      style={{ backgroundColor: colors.surface }}
    >
      <Text className="text-text-main font-bold text-lg text-right mb-4">
        حالة الطلب
      </Text>

      {isCancelled ? (
        <View
          className="mb-4 px-3 py-2 rounded-xl"
          style={{ backgroundColor: `${colors.error}15` }}
        >
          <Text
            className="text-right font-bold text-sm"
            style={{ color: colors.error }}
          >
            تم إلغاء هذا الطلب
          </Text>
        </View>
      ) : null}

      {TRACKING_STEPS.map((step, index) => {
        const stepState = resolveStepState(index, currentIndex, isCancelled);
        const isLast = index === TRACKING_STEPS.length - 1;
        const lineColor =
          stepState === "completed" ? colors.primary.default : colors.gray[200];

        return (
          <View key={step.status} className="flex-row-reverse">
            <View className="items-center mr-3">
              <StepIndicator state={stepState} />
              {!isLast ? (
                <View
                  style={{
                    width: 2,
                    flex: 1,
                    minHeight: 28,
                    backgroundColor: lineColor,
                    marginVertical: 4,
                  }}
                />
              ) : null}
            </View>

            <View className="flex-1 pb-5">
              <Text
                className="text-right font-bold text-base"
                style={{
                  color:
                    stepState === "active"
                      ? colors.primary.default
                      : stepState === "completed"
                        ? colors.text.main
                        : colors.text.muted,
                }}
              >
                {step.label}
              </Text>
              {stepState === "active" && !isCancelled ? (
                <Text
                  className="text-right text-sm mt-0.5"
                  style={{ color: colors.primary.dark }}
                >
                  جاري الآن...
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};
