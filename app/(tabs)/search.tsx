import { getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import React from "react";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Search = () => {
  const { data, refetch, loading } = useAppwrite({
    fn: getMenu,
    params: {
      category: "",
      query: "",
      limit: 8,
    },
  });
  console.log(data);
  return (
    <SafeAreaView>
      <Text>Search</Text>
    </SafeAreaView>
  );
};

export default Search;
