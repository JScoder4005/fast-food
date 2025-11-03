import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { images } from "@/constants";
import { useChangePassword } from "@/hooks/useChangePassword";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

interface ChangePasswordProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Reusable ChangePassword component
 * Handles password change with validation and error display
 *
 * Features:
 * - Real-time field validation
 * - Optimized with useChangePassword hook (separated logic)
 * - Reusable and testable
 * - Proper error handling
 * - Loading states
 * - Password strength requirements
 */
const ChangePassword: React.FC<ChangePasswordProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { formData, errors, isLoading, updateField, submitForm, resetForm } =
    useChangePassword();

  const handleSubmit = async () => {
    const success = await submitForm();
    if (success) {
      onSuccess?.();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancel?.();
  };

  return (
    <ScrollView
      className="flex-1 bg-white-100"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View className="px-5 pt-6 mt-14">
        <View className="gap-6 mt-10">
          {/* Header */}
          <View>
            <Text className="paragraph-semibold text-dark-100 border-b border-gray-200 pb-2">
              Change Password
            </Text>
            <Text className="text-sm text-gray-200 mt-2">
              Enter your current password and choose a new secure password.
            </Text>
          </View>

          {/* Current Password Input */}
          <View>
            <CustomInput
              placeholder="Enter your current password"
              label="Current Password"
              value={formData.oldPassword}
              onChangeText={(text) => updateField("oldPassword", text)}
              secureTextEntry={true}
            />
            {errors.oldPassword && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.oldPassword}
              </Text>
            )}
          </View>

          {/* New Password Input */}
          <View>
            <CustomInput
              placeholder="Enter your new password"
              label="New Password"
              value={formData.newPassword}
              onChangeText={(text) => updateField("newPassword", text)}
              secureTextEntry={true}
            />
            {errors.newPassword && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.newPassword}
              </Text>
            )}
            {!errors.newPassword && formData.newPassword && (
              <Text className="text-gray-200 text-xs mt-1">
                Must be at least 8 characters with uppercase, lowercase, and
                number
              </Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View>
            <CustomInput
              placeholder="Confirm your new password"
              label="Confirm New Password"
              value={formData.confirmPassword}
              onChangeText={(text) => updateField("confirmPassword", text)}
              secureTextEntry={true}
            />
            {errors.confirmPassword && (
              <Text className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Action Buttons */}
          <View className="gap-4 mt-4">
            <CustomButton
              title="Change Password"
              onPress={handleSubmit}
              isLoading={isLoading}
              leftIcon={
                <View className="mr-2">
                  <Image
                    source={images.pencil}
                    className="size-5"
                    resizeMode="contain"
                    tintColor="white"
                  />
                </View>
              }
            />

            {onCancel && (
              <CustomButton
                title="Cancel"
                onPress={handleCancel}
                style="bg-gray-300"
                textStyle="text-blue-500"
                isLoading={false}
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ChangePassword;
