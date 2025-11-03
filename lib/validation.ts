/**
 * Validation schema for profile fields using Zod
 * Provides type-safe validation with proper error handling
 */

import { z } from "zod";

/**
 * Zod schema for profile form data
 * Validates name (min 2 chars, letters/spaces/hyphens/apostrophes)
 * and email (valid email format)
 */
export const profileFormSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .min(2, "Name must be at least 2 characters")
    .regex(
      /^[a-zA-Z\s'-]+$/,
      "Name can only contain letters, spaces, hyphens, and apostrophes"
    )
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .trim(),
});

/**
 * Type inferred from Zod schema for type-safe form data
 */
export type ProfileFormData = z.infer<typeof profileFormSchema>;

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validates profile form data using Zod schema
 * @param data - Profile form data to validate
 * @returns ValidationResult with isValid flag and errors object
 */
export const validateProfileForm = (
  data: ProfileFormData
): ValidationResult => {
  const result = profileFormSchema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      errors: {},
    };
  }

  // Transform Zod errors into a flat errors object
  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path[0] as string;
    if (path && !errors[path]) {
      errors[path] = error.message;
    }
  });

  return {
    isValid: false,
    errors,
  };
};

/**
 * Validates a single field using Zod schema
 * @param fieldName - Name of the field to validate
 * @param value - Value to validate
 * @returns Error message string or empty string if valid
 */
export const validateField = (
  fieldName: keyof ProfileFormData,
  value: string
): string => {
  // Create a partial schema for single field validation
  const fieldSchema = profileFormSchema.shape[fieldName];

  if (!fieldSchema) {
    return "";
  }

  const result = fieldSchema.safeParse(value);

  if (result.success) {
    return "";
  }

  // Return the first error message
  return result.error.errors[0]?.message || "";
};

/**
 * Parse and validate profile form data
 * @param data - Raw form data to parse
 * @returns Parsed and validated data if valid, throws ZodError if invalid
 */
export const parseProfileForm = (data: unknown): ProfileFormData => {
  return profileFormSchema.parse(data);
};

/**
 * Zod schema for password change form
 * Validates old password, new password, and confirmation
 */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

/**
 * Type inferred from Zod schema for password change form
 */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/**
 * Validates password change form data using Zod schema
 * @param data - Password change form data to validate
 * @returns ValidationResult with isValid flag and errors object
 */
export const validateChangePasswordForm = (
  data: ChangePasswordFormData
): ValidationResult => {
  const result = changePasswordSchema.safeParse(data);

  if (result.success) {
    return {
      isValid: true,
      errors: {},
    };
  }

  // Transform Zod errors into a flat errors object
  const errors: Record<string, string> = {};
  result.error.errors.forEach((error) => {
    const path = error.path[0] as string;
    if (path && !errors[path]) {
      errors[path] = error.message;
    }
  });

  return {
    isValid: false,
    errors,
  };
};

/**
 * Parse and validate password change form data
 * @param data - Raw form data to parse
 * @returns Parsed and validated data if valid, throws ZodError if invalid
 */
export const parseChangePasswordForm = (
  data: unknown
): ChangePasswordFormData => {
  return changePasswordSchema.parse(data);
};
