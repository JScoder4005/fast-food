import { images } from "@/constants";
import { account } from "@/lib/appwrite";
import useAuthStore from "@/store/auth.store";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
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

  // Fetching user centrally in Tabs layout to avoid tab remount/resets

  const avatarSource = useMemo(() => {
    const maybeAvatar =
      (user as unknown as { avatar?: string; avator?: string }) ?? {};
    const url = maybeAvatar.avatar || maybeAvatar.avator;
    return url ? { uri: url } : images.avatar;
  }, [user]);

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

  return (
    <ScrollView
      className="flex-1 bg-white-100"
      contentContainerStyle={{ paddingBottom: 120 }}
    >
      <View className="px-5 pt-6 mt-14">
        <View className="items-center">
          <Image
            source={avatarSource}
            className="size-24 rounded-full"
            resizeMode="cover"
          />
          <Text className="h3-semibold text-dark-100 mt-4">
            {user?.name ?? "Guest"}
          </Text>
          <Text className="paragraph-medium text-gray-200 mt-1">
            {user?.email ?? "No email"}
          </Text>
        </View>

        <View className="mt-8 gap-4">
          <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <Image
                source={images.user}
                className="size-5"
                resizeMode="contain"
              />
              <Text className="base-medium text-dark-100">Name</Text>
            </View>
            <Text className="base-semibold text-gray-200">
              {user?.name ?? "-"}
            </Text>
          </View>

          <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 shadow-sm">
            <View className="flex-row items-center gap-3">
              <Image
                source={images.envelope}
                className="size-5"
                resizeMode="contain"
              />
              <Text className="base-medium text-dark-100">Email</Text>
            </View>
            <Text className="base-semibold text-gray-200">
              {user?.email ?? "-"}
            </Text>
          </View>
        </View>

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
