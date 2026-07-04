import { z } from "zod";

const email = z
  .string({ required_error: "Email is required" })
  .trim()
  .toLowerCase()
  .email("Please enter a valid email address")
  .max(255, "Email is too long");

const password = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long");

const name = z
  .string({ required_error: "Name is required" })
  .trim()
  .min(1, "Name is required")
  .max(50, "Name is too long");

const registerSchema = z.object({
  first_name: name,
  last_name: name,
  email,
  password,
});

const loginSchema = z.object({
  email,
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

export { registerSchema, loginSchema };
