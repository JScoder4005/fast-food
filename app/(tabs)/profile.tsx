import ChangePassword from "@/components/ChangePassword";
import EditProfile from "@/components/EditProfile";
import ThemeToggle from "@/components/ThemeToggle";
import { images } from "@/constants";
import { account, updateUserAvatar, uploadAvatar } from "@/lib/appwrite";
import { ProfileFormData } from "@/lib/validation";
import useAuthStore from "@/store/auth.store";
import * as ImagePicker from "expo-image-picker";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const Profile = () => {
  const user = useAuthStore((s) => s.user);
  const isLoading = useAuthStore((s) => s.isLoading);
  const setIsAuthenticated = useAuthStore((s) => s.setIsAuthenticated);
  const setUser = useAuthStore((s) => s.setUser);

  const [loggingOut, setLoggingOut] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Fetching user centrally in Tabs layout to avoid tab remount/resets

  const avatarSource = useMemo(() => {
    const maybeAvatar =
      (user as unknown as { avatar?: string; avator?: string }) ?? {};
    const url = maybeAvatar.avatar || maybeAvatar.avator;
    return url ? { uri: url } : images.avatar;
  }, [user]);

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Required",
          "We need permission to access your photo library to change your avatar."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAndUpdateAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.log("pickImage error", error);
      Alert.alert("Error", "Failed to pick image. Please try again.");
    }
  };

  const uploadAndUpdateAvatar = async (imageUri: string) => {
    if (!user?.$id) {
      Alert.alert("Error", "User not found. Please try logging in again.");
      return;
    }

    try {
      setUploadingAvatar(true);

      const fileName = imageUri.split("/").pop() || `avatar-${Date.now()}.jpg`;
      const match = /\.(\w+)$/.exec(fileName);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      const file = {
        uri: imageUri,
        name: fileName,
        type,
      };

      const avatarUrl = await uploadAvatar({ file });
      console.log("Avatar uploaded, URL:", avatarUrl);

      const updatedUser = await updateUserAvatar({
        userId: user.$id,
        avatarUrl,
      });
      console.log("Avatar updated in database:", updatedUser);

      setUser(updatedUser as unknown as typeof user);
      Alert.alert("Success", "Avatar updated successfully!");
    } catch (error) {
      console.log("uploadAndUpdateAvatar error", error);
      Alert.alert("Error", "Failed to update avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const onLogout = async () => {
    try {
      setLoggingOut(true);
      await account.deleteSessions();
      setIsAuthenticated(false);
      setUser(null);
    } catch {
      // no-op: useAuthStore Tabs layout redirects on auth change
    } finally {
      setLoggingOut(false);
    }
  };

  // Prepare initial data for EditProfile component
  const editProfileInitialData: ProfileFormData = useMemo(() => {
    return {
      name: user?.name ?? "",
      email: user?.email ?? "",
    };
  }, [user]);

  const handleEditProfileSuccess = () => {
    setIsEditingProfile(false);
  };

  const handleCancelEditProfile = () => {
    setIsEditingProfile(false);
  };

  const handleChangePasswordSuccess = () => {
    setIsChangingPassword(false);
  };

  const handleCancelChangePassword = () => {
    setIsChangingPassword(false);
  };

  // Show ChangePassword component when changing password
  if (isChangingPassword) {
    return (
      <ChangePassword
        onSuccess={handleChangePasswordSuccess}
        onCancel={handleCancelChangePassword}
      />
    );
  }

  // Show EditProfile component when editing
  if (isEditingProfile) {
    return (
      <EditProfile
        initialData={editProfileInitialData}
        onSuccess={handleEditProfileSuccess}
        onCancel={handleCancelEditProfile}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white-100 dark:bg-dark-100"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View className="px-5 pt-6 mt-14">
        <View className="items-center">
          <View className="relative">
            <Image
              source={avatarSource}
              className="size-24 rounded-full"
              resizeMode="cover"
            />
            {uploadingAvatar && (
              <View className="absolute inset-0 items-center justify-center bg-black/50 rounded-full">
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
            <TouchableOpacity
              onPress={pickImage}
              disabled={uploadingAvatar || isLoading}
              className="absolute bottom-0 right-0 bg-primary rounded-full p-2 border-2 border-white"
            >
              <Image
                source={images.pencil}
                className="size-4"
                resizeMode="contain"
                tintColor="white"
              />
            </TouchableOpacity>
          </View>
          <Text className="h3-semibold text-dark-100 dark:text-white mt-4">
            {user?.name ?? "Guest"}
          </Text>
          <Text className="paragraph-medium text-gray-200 dark:text-gray-100 mt-1">
            {user?.email ?? "No email"}
          </Text>
        </View>

        <View className="mt-8 gap-4">
          <ThemeToggle />

          <View className="flex-row items-center justify-between bg-white dark:bg-dark-100 rounded-2xl px-4 py-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <Image
                source={images.user}
                className="size-5"
                resizeMode="contain"
              />
              <Text className="base-medium text-dark-100 dark:text-white">
                Name
              </Text>
            </View>
            <Text className="base-semibold text-gray-200 dark:text-gray-100">
              {user?.name ?? "-"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between bg-white dark:bg-dark-100 rounded-2xl px-4 py-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <Image
                source={images.envelope}
                className="size-5"
                resizeMode="contain"
              />
              <Text className="base-medium text-dark-100 dark:text-white">
                Email
              </Text>
            </View>
            <Text className="base-semibold text-gray-200 dark:text-gray-100">
              {user?.email ?? "-"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          className="bg-stone-600 mt-10 custom-btn rounded-full"
          onPress={() => setIsEditingProfile(true)}
          disabled={isLoading}
        >
          <View className="flex-row flex-center">
            <Image
              source={images.pencil}
              className="size-5 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white paragraph-semibold">Edit Profile</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-blue-600 mt-4 custom-btn rounded-full"
          onPress={() => setIsChangingPassword(true)}
          disabled={isLoading}
        >
          <View className="flex-row flex-center">
            <Image
              source={images.user}
              className="size-5 mr-2"
              resizeMode="contain"
            />
            <Text className="text-white paragraph-semibold">
              Change Password
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className="custom-btn bg-primary mt-10"
          onPress={onLogout}
          disabled={loggingOut || isLoading}
        >
          {loggingOut ? (
            <View className="flex-center flex-row">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white-100 paragraph-semibold ml-2">
                Logging out...
              </Text>
            </View>
          ) : (
            <View className="flex-center flex-row">
              <Image
                source={images.logout}
                className="size-5 mr-2"
                resizeMode="contain"
              />
              <Text className="text-white-100 paragraph-semibold">Logout</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default Profile;
