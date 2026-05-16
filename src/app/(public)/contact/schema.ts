import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Please enter your name").max(120),
  email: z.email("Please enter a valid email").max(200),
  subject: z.string().min(2, "Please add a subject").max(160),
  message: z.string().min(10, "Message is too short").max(5000),
  /** Honeypot — must be empty. Real users won't see this field. */
  website: z.string().max(0),
});

export type ContactInput = z.infer<typeof contactSchema>;
