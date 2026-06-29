import { z } from "zod";


const slotSchema = z
  .object({
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
  })
  .refine(({ startTime, endTime }) => endTime > startTime, {
    path: ["endTime"],
    message: "End time must be after start time",
  });
export const schema = z.object({
  timezone: z.string(),
  monday: z.array(slotSchema),
  tuesday: z.array(slotSchema),
  wednesday: z.array(slotSchema),
  thursday: z.array(slotSchema),
  friday: z.array(slotSchema),
  saturday: z.array(slotSchema),
  sunday: z.array(slotSchema),
});

export type FormValues = z.infer<typeof schema>;
