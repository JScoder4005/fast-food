import { Category } from "@/types";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";

const Filter = ({ categories }: { categories: Category[] }) => {
  console.log("categories", categories);

  const searchParams = useLocalSearchParams();
  const [active, setActive] = useState(searchParams.category || "");

  const handlePress = (id: string) => {};
  return (
    <View>
      <Text>Filter</Text>
    </View>
  );
};

export default Filter;
