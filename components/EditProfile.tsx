import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { images } from "@/constants";
import { useEditProfile } from "@/hooks/useEditProfile";
import { ProfileFormData } from "@/lib/validation";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";

interface EditProfileProps {
  initialData: ProfileFormData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * Reusable EditProfile component
 * Handles profile editing with validation and error display
 *
 * Features:
 * - Real-time field validation
 * - Optimized with useEditProfile hook (separated logic)
 * - Reusable and testable
 * - Proper error handling
 * - Loading states
 */
const EditProfile: React.FC<EditProfileProps> = ({
  initialData,
  onSuccess,
  onCancel,
}) => {
  const {
    formData,
    errors,
    isLoading,
    updateField,
    submitForm,
    resetForm,
    hasChanges,
  } = useEditProfile(initialData);

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
          {/* Name Input */}
          <View>
            <Text className="paragraph-semibold text-dark-100 border-b border-gray-200 pb-2">
              lets edit the profile here
            </Text>
          </View>
          <View>
            <CustomInput
              placeholder="Enter your full name"
              label="Full Name"
              value={formData.name}
              onChangeText={(text) => updateField("name", text)}
              keyboardType="default"
            />
            {errors.name && (
              <Text className="text-red-500 text-sm mt-1">{errors.name}</Text>
            )}
          </View>

          {/* Email Input */}
          <View>
            <CustomInput
              placeholder="Enter your email"
              label="Email"
              value={formData.email}
              onChangeText={(text) => updateField("email", text)}
              keyboardType="email-address"
            />
            {errors.email && (
              <Text className="text-red-500 text-sm mt-1">{errors.email}</Text>
            )}
          </View>

          {/* Info Message */}
          {!hasChanges && (
            <View className="bg-white-100 rounded-lg p-4">
              <Text className="text-red-600 base-regular">
                No changes made yet. Edit the fields above to update your
                profile.
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="gap-4 mt-4">
            <CustomButton
              title="Save Changes"
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

export default EditProfile;
