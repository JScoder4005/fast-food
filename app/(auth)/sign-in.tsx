import CustomButton from "@/components/customButton";
import CustomInput from "@/components/customInput";
import { signIn } from "@/lib/appwrite";
import { Link, router } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";

const SignIn = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onSubmit = async () => {
    const { email, password } = form;
    if (!email || !password)
      return Alert.alert("Error", "Please fill all the fields");

    setIsSubmitting(true);
    try {
      //Call Appwrite Sign In function here
      await signIn({ email, password });
      router.replace("/");
      Alert.alert("Success", "Signed In Successfully");
      router.replace("/");
    } catch (error: unknown) {
      console.log(error);
      Alert.alert("Error", "Something went wrong, please try again.");
      setIsSubmitting(false);
    }
  };
  return (
    <View className="gap-10 bg-white rounded-lg p-5 mt-5">
      <CustomInput
        placeholder="Enter your email"
        label="Email"
        keyboardType="email-address"
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
        value={form.email}
      />
      <CustomInput
        placeholder="Enter your password"
        label="Password"
        secureTextEntry={true}
        onChangeText={(text) =>
          setForm((prev) => ({ ...prev, password: text }))
        }
        value={form.password}
      />
      <CustomButton
        title="Sign In"
        isLoading={isSubmitting}
        onPress={onSubmit}
      />

      <View className="flex flex-row justify-center mt-5 gap-2">
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
