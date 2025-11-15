import useThemeStore from "@/store/theme.store";
import { Text, TouchableOpacity, View } from "react-native";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <TouchableOpacity
      onPress={toggleTheme}
      className="flex-row items-center justify-between bg-white dark:bg-dark-100 rounded-2xl px-4 py-4 shadow-sm"
    >
      <View className="flex-row items-center gap-3">
        <View className="size-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          {theme === "dark" ? (
            <Text className="text-2xl">🌙</Text>
          ) : (
            <Text className="text-2xl">☀️</Text>
          )}
        </View>

        <View>
          <Text className="base-medium text-dark-100 dark:text-white">
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </Text>

          <Text className="body-regular text-gray-200 dark:text-gray-100 mt-0.5">
            {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        <View
          className={`w-12 h-6 rounded-full p-1 ${
            theme === "dark" ? "bg-primary" : "bg-gray-200"
          }`}
        >
          {/* Removed transition-all (causing crash) */}
          <View
            className={`w-4 h-4 rounded-full bg-white ${
              theme === "dark" ? "ml-6" : "ml-0"
            }`}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ThemeToggle;
