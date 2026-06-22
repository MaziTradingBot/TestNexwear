import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().min(2, "Enter your name").max(80),
  email: z.string().email("Enter a valid email"),
  subject: z.string().min(2, "Enter a subject").max(120),
  message: z.string().min(10, "Message is too short").max(2000),
});

export const newsletterSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export type ContactInput = z.infer<typeof contactSchema>;
