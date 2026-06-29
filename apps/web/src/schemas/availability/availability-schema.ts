import { z } from "zod";


const slotSchema = z.object({ startTime: z.string(), endTime: z.string() });
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
