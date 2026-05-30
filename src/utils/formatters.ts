// src/utils/formatters.ts
import { config } from "@constants/config";

export const formatPrice = (price: number): string =>
  `${price.toLocaleString("ar-EG")} ${config.currency}`;

export const formatRating = (rating: number): string => rating.toFixed(1);

export const formatDeliveryFee = (fee: number): string =>
  fee === 0 ? "توصيل مجاني" : formatPrice(fee);
