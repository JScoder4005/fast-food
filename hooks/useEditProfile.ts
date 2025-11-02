import {
  ProfileFormData,
  validateProfileForm,
  parseProfileForm,
} from "@/lib/validation";
import { updateUser } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import { useState, useCallback } from "react";
import { Alert } from "react-native";

interface UseEditProfileReturn {
  formData: ProfileFormData;
  errors: Record<string, string>;
  isLoading: boolean;
  updateField: (field: keyof ProfileFormData, value: string) => void;
  validateForm: () => boolean;
  submitForm: () => Promise<boolean>;
  resetForm: () => void;
  hasChanges: boolean;
}

/**
 * Custom hook for managing edit profile form logic
 * Separates business logic from UI component for better reusability
 * 
 * @param initialData - Initial form data (usually from current user)
 * @returns Object with form state and handler functions
 */
export const useEditProfile = (
  initialData: ProfileFormData
): UseEditProfileReturn => {
  const [formData, setFormData] = useState<ProfileFormData>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const fetchAuthenticatedUser = useAuthStore((s) => s.fetchAuthenticatedUser);

  // Check if form has changes from initial data
  const hasChanges = useCallback(() => {
    return (
      formData.name.trim() !== initialData.name.trim() ||
      formData.email.trim() !== initialData.email.trim()
    );
  }, [formData, initialData]);

  // Update a specific field
  const updateField = useCallback(
    (field: keyof ProfileFormData, value: string) => {
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
    const validation = validateProfileForm(formData);
    setErrors(validation.errors);
    return validation.isValid;
  }, [formData]);

  // Reset form to initial data
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setErrors({});
  }, [initialData]);

  // Submit the form
  const submitForm = useCallback(async (): Promise<boolean> => {
    // Check if there are any changes
    if (!hasChanges()) {
      Alert.alert("No Changes", "No changes were made to your profile.");
      return false;
    }

    // Validate form
    if (!validateForm()) {
      Alert.alert("Validation Error", "Please fix the errors before saving.");
      return false;
    }

    if (!user?.$id) {
      Alert.alert("Error", "User not found. Please try logging in again.");
      return false;
    }

    setIsLoading(true);
    try {
      // Parse and validate with Zod for type safety
      // This should not throw since validateForm was called, but we parse for type narrowing
      let parsedData: ProfileFormData;
      try {
        parsedData = parseProfileForm(formData);
      } catch (parseError) {
        // If parse fails (shouldn't happen if validateForm passed), re-validate to show errors
        const validation = validateProfileForm(formData);
        setErrors(validation.errors);
        Alert.alert("Validation Error", "Please fix the errors before saving.");
        return false;
      }

      // Get accountId from user if available (some user documents might have it)
      const accountId = (user as unknown as { accountId?: string })?.accountId;

      // Update user in database
      const updatedUser = await updateUser({
        userId: user.$id,
        name: parsedData.name,
        email: parsedData.email,
        accountId,
      });

      // Update auth store with new user data
      setUser(updatedUser as unknown as typeof user);

      // Refresh user data to ensure consistency
      await fetchAuthenticatedUser();

      Alert.alert("Success", "Profile updated successfully!");
      return true;
    } catch (error) {
      console.log("submitForm error", error);
      Alert.alert(
        "Error",
        "Failed to update profile. Please try again."
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [formData, user, setUser, fetchAuthenticatedUser, hasChanges, validateForm]);

  return {
    formData,
    errors,
    isLoading,
    updateField,
    validateForm,
    submitForm,
    resetForm,
    hasChanges: hasChanges(),
  };
};

