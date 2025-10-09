import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { Link } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

const SignIn = () => {
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your email"
        label="Email"
        keyboardType="email-address"
        onChangeText={(text) => console.log(text)}
        value=""
      />
      <CustomInput
        placeholder="Enter your password"
        label="Password"
        secureTextEntry={true}
        onChangeText={(text) => console.log(text)}
        value=""
      />
      <CustomButton title="Sign In" />

      <View>
        <Text className="base-regular text-gray-100">
          Dont have an account?
        </Text>
        <Link href="/sign-up" className="text-primary base-bold">
          Sign Up
        </Link>
      </View>
    </View>
  );
};

export default SignIn;
