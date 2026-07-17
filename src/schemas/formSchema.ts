import { z } from "zod";

export const loginSchema = z.object({
    email: z.email({
        message: "Please enter a valid email",
    }),

    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
            "Password must contain number and special character"
        ),
});

export const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.email("Please enter a valid email"),
  password: z.string()
        .min(6, "Password must be at least 6 characters")
        .regex(
            /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/,
            "Password must contain number and special character"
        ),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
