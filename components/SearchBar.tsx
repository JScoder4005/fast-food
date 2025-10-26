import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { TextInput, View } from "react-native";

const SearchBar = () => {
  const params = useLocalSearchParams<{ query?: string }>();
  console.log("par", params);
  const [query, setQuery] = useState(params.query);
  return (
    <View className="searchbar">
      <TextInput
        className="flex-1 p-5"
        placeholder="Search for burgers, pizza..."
      />
    </View>
  );
};

export default SearchBar;
