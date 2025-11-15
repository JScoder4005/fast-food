import CartButton from "@/components/cartButton";
import MenuCard from "@/components/MenuCard";
import { getMenu } from "@/lib/appwrite";
import useAppwrite from "@/lib/useAppwrite";
import { useFavoritesStore } from "@/store/favorites.store";
import { MenuItem } from "@/types";
import cn from "clsx";
import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Favorites = () => {
  const { favoriteIds } = useFavoritesStore();

  const { data, loading } = useAppwrite({
    fn: getMenu,
    params: { category: undefined as any, query: undefined as any, limit: 100 },
  });

  const favorites = useMemo(
    () => (data || []).filter((item) => favoriteIds.includes(item.$id)),
    [data, favoriteIds]
  );

  return (
    <SafeAreaView className="bg-white dark:bg-dark-100 h-full">
      <FlatList
        data={favorites as MenuItem[]}
        renderItem={({ item, index }) => {
          const isFirstRightColItem = index % 2 === 0;
          return (
            <View
              className={cn(
                "flex-1 max-w-[48%]",
                !isFirstRightColItem ? "mt-10" : "mt-0"
              )}
            >
              <MenuCard item={item as MenuItem} />
            </View>
          );
        }}
        keyExtractor={(item) => item.$id}
        numColumns={2}
        columnWrapperClassName="gap-7"
        contentContainerClassName="gap-7 px-5 pb-32"
        ListHeaderComponent={() => (
          <View className="my-5 flex-row items-center justify-between">
            <View>
              <Text className="small-bold uppercase text-primary">
                Favorites
              </Text>
              <Text className="paragraph-semibold text-dark-100 dark:text-white mt-0.5">
                Your saved items
              </Text>
            </View>
            <CartButton />
          </View>
        )}
        ListEmptyComponent={() =>
          !loading && (
            <View className="items-center mt-20">
              <Text className="body-medium text-gray-200 dark:text-gray-100">
                No favorites yet
              </Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

export default Favorites;
