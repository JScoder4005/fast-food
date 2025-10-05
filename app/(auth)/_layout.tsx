import { Slot } from "expo-router";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Layout = () => {
  return (
    <SafeAreaView>
      <Text>Auth Layout</Text>
      <Slot />
    </SafeAreaView>
  );
};

export default Layout;
