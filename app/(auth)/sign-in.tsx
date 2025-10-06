import { router } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const SignIn = () => {
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <Text>SignIn</Text>
      <Button title="Sign Up" onPress={() => router.push("/sign-up")} />
    </View>
  );
};

export default SignIn;
