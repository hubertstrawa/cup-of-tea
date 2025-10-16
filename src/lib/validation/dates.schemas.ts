import { z } from "zod";

// Base schemas for date/time validation
const timestampSchema = z.string().datetime({ message: "Invalid timestamp format" });
const uuidSchema = z.string().uuid({ message: "Invalid UUID format" });
const dateStatusSchema = z.enum(["available", "booked", "canceled", 'other'] as const);

// Pagination schemas
export const paginationParamsSchema = z.object({
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce.number().int().min(1, "Limit must be at least 1").max(100, "Limit cannot exceed 100").default(10),
});

// GET /api/dates query parameters
export const datesListQuerySchema = paginationParamsSchema.extend({
  teacherId: uuidSchema.optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .optional(),
  status: dateStatusSchema.optional(),
});

// POST /api/dates request body
export const createDateSchema = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
    start_time: timestampSchema,
    end_time: timestampSchema,
    status: dateStatusSchema.default("available"),
    additional_info: z.record(z.any()).optional(),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  });

// PUT /api/dates/{id} request body
export const updateDateSchema = z
  .object({
    start_time: timestampSchema.optional(),
    end_time: timestampSchema.optional(),
    status: dateStatusSchema.optional(),
    additional_info: z.record(z.any()).optional(),
  })
  .refine(
    (data) => {
      if (data.start_time && data.end_time) {
        return new Date(data.end_time) > new Date(data.start_time);
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["end_time"],
    }
  );

// URL parameter validation
export const dateIdParamSchema = z.object({
  id: uuidSchema,
});

// Type exports for use in services and endpoints
export type DatesListQuery = z.infer<typeof datesListQuerySchema>;
export type CreateDateRequest = z.infer<typeof createDateSchema>;
export type UpdateDateRequest = z.infer<typeof updateDateSchema>;
export type DateIdParam = z.infer<typeof dateIdParamSchema>;
