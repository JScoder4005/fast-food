import { updatePassword } from "@/lib/appwrite";
import {
  ChangePasswordFormData,
  parseChangePasswordForm,
  validateChangePasswordForm,
} from "@/lib/validation";
import { useCallback, useState } from "react";
import { Alert } from "react-native";

interface UseChangePasswordReturn {
  formData: ChangePasswordFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  updateField: (field: keyof ChangePasswordFormData, value: string) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
}

/**
 * Custom hook for managing change password form logic
 * Separates business logic from UI component for better reusability
 *
 * @returns Object with form state and handler functions
 */
export const useChangePassword = (): UseChangePasswordReturn => {
  const [formData, setFormData] = useState<ChangePasswordFormData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Update a specific field
  const updateField = useCallback(
    (field: keyof ChangePasswordFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate the entire form
  const validateForm = useCallback((): boolean => {
    const validation = validateChangePasswordForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
  }, []);

  // Submit the form
  const submitForm = useCallback(async (): Promise<boolean> => {
    // Validate form
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before saving.");
      return false;
    }

    setIsLoading(true);
    try {
      // Parse and validate with Zod for type safety
      let parsedData: ChangePasswordFormData;
      try {
        parsedData = parseChangePasswordForm(formData);
      } catch (parseError) {
        // If parse fails, re-validate to show errors
        const validation = validateChangePasswordForm(formData);
        setErrors(validation.errors);
        Alert.alert("Validation Error", "Please fix the errors before saving.");
        return false;
      }

      // Update password in Appwrite
      await updatePassword({
        oldPassword: parsedData.oldPassword,
        newPassword: parsedData.newPassword,
      });

      Alert.alert("Success", "Password updated successfully!");
      resetForm();
      return true;
    } catch (error: unknown) {
      console.log("submitForm error", error);

      // Handle specific error messages
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update password. Please try again.";

      // Check for common Appwrite errors
      if (
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("wrong password") ||
        errorMessage.includes("401")
      ) {
        Alert.alert(
          "Error",
          "Current password is incorrect. Please try again."
        );
        setErrors((prev) => ({ ...prev, oldPassword: "Incorrect password" }));
      } else {
        Alert.alert("Error", errorMessage);
      }

      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, resetForm]);

  return {
    formData,
    errors,
    isLoading,
    updateField,
    validateForm,
    submitForm,
    resetForm,
  };
};
