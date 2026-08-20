import { z } from "zod";

export const startupFormSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description cannot exceed 500 characters"),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .max(50, "Category cannot exceed 50 characters"),
  image: z
    .string()
    .url("Please provide a valid image or video URL"),
  pitch: z
    .string()
    .min(20, "Pitch breakdown must be at least 20 characters"),
});

export type StartupFormInput = z.infer<typeof startupFormSchema>;
