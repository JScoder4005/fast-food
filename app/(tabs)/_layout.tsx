import useAuthStore from "@/store/auth.store";
import { Redirect, Tabs } from "expo-router";
import React from "react";

export default function TabLayout() {
  const { isAuthenticated } = useAuthStore();
  // const isAuthenticated = false;

  if (!isAuthenticated) return <Redirect href="/sign-in" />;
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
    </Tabs>
  );
}
