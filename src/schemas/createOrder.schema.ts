import { z } from "zod";

const coordinatesSchema = z.object({
  lat: z.number(),
  lng: z.number(),
});

const deliveryAddressSchema = z.object({
  city: z.string().min(1, "المدينة مطلوبة"),
  street: z.string().min(1, "الشارع مطلوب"),
  building: z.string().min(1, "رقم المبنى مطلوب"),
  floor: z.string().optional(),
  apartment: z.string().optional(),
  coordinates: coordinatesSchema,
});

const orderItemSchema = z.object({
  id: z.string().min(1),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  name: z.string().min(1),
});

export const createOrderSchema = z.object({
  vendor_id: z.string().min(1, "معرف المتجر مطلوب"),
  payment_method: z.enum(["cash", "visa"]),
  items: z.array(orderItemSchema).min(1, "يجب أن تحتوي السلة على منتج واحد على الأقل"),
  delivery_address: deliveryAddressSchema,
});

export type CreateOrderFormValues = z.infer<typeof createOrderSchema>;
