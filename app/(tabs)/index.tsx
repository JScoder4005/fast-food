import cn from "clsx";
import React, { Fragment } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CartButton from "@/components/cartButton";
import { images, offers } from "@/constants";
import "../global.css";

export default function Index() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* FlatList for offers */}
      <FlatList
        data={offers}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => {
          const isEven = index % 2 === 0;

          return (
            <Pressable
              className={cn(
                "offer-card",
                isEven ? "flex-row-reverse" : "flex-row"
              )}
              style={{ backgroundColor: item.color }}
              android_ripple={{ color: "#ffffff22" }}
            >
              {({ pressed }) => (
                <Fragment>
                  <View className="h-full w-1/2">
                    <Image
                      source={item.image}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </View>

                  <View
                    className={cn(
                      "offer-card__info",
                      isEven ? "pl-10" : "pr-10"
                    )}
                  >
                    <Text className="h1-bold text-white leading-tight">
                      {item.title}
                    </Text>
                    <Image
                      source={images.arrowRight}
                      className="w-10 h-10"
                      resizeMode="contain"
                      tintColor="#ffffff"
                    />
                  </View>
                </Fragment>
              )}
            </Pressable>
          );
        }}
        contentContainerClassName="pb-28 px-5"
        ListHeaderComponent={() => (
          <View className="flex-row justify-between items-center w-full my-5 ">
            <View>
              <Text className="small-bold text-primary">DELIVER TO</Text>
              <TouchableOpacity className="flex-row items-center mt-0.5 space-x-1">
                <Text className="paragraph-bold text-dark-100">India</Text>
                <Image
                  source={images.arrowDown}
                  className="w-3 h-3"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            <CartButton />
          </View>
        )}
        // ListFooterComponent={() => (
        //   <Button
        //     title="Try!"
        //     onPress={() => {
        //       Sentry.captureException(new Error("First error"));
        //     }}
        //   />
        // )}
      />
    </SafeAreaView>
  );
}
