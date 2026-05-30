import { colors } from "@/constants/theme";
import { OrderStatus } from "@/types/schema.types";

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "driver_accepted",
  "preparing",
  "picked_at",
  "delivering",
];

export const PAST_ORDER_STATUSES: OrderStatus[] = ["completed", "cancelled"];

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد الانتظار",
  driver_accepted: "قبول السائق",
  preparing: "جاري التحضير",
  picked_at: "تم الاستلام",
  delivering: "في الطريق",
  completed: "مكتمل",
  cancelled: "ملغي",
};

export const getOrderStatusLabel = (status: OrderStatus): string =>
  STATUS_LABELS[status];

export const getOrderStatusColors = (
  status: OrderStatus,
): { background: string; text: string } => {
  switch (status) {
    case "pending":
      return { background: `${colors.warning}20`, text: colors.warning };
    case "driver_accepted":
    case "preparing":
      return {
        background: `${colors.primary.default}18`,
        text: colors.primary.default,
      };
    case "picked_at":
    case "delivering":
      return {
        background: `${colors.secondary.default}18`,
        text: colors.secondary.default,
      };
    case "completed":
      return { background: `${colors.success}20`, text: colors.success };
    case "cancelled":
      return { background: `${colors.error}18`, text: colors.error };
  }
};

export const formatOrderId = (orderId: string): string =>
  `#${orderId.slice(-6).toUpperCase()}`;

export const formatOrderDate = (dateString?: string): string => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ar-EG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
