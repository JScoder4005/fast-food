import { images } from "@/constants";
import { appwriteConfig } from "@/lib/appwrite";
import { useCartStore } from "@/store/cart.store";
import { useFavoritesStore } from "@/store/favorites.store";
import { MenuItem } from "@/types";
import { Image, Platform, Text, TouchableOpacity, View } from "react-native";

const MenuCard = ({
  item: { $id, image_url, name, price },
}: {
  item: MenuItem;
}) => {
  const imageUrl = `${image_url}?project=${appwriteConfig.projectId}`;
  //   console.log("image", imageUrl);
  const { addItem } = useCartStore();

  const { toggleFavorite, isFavorite, getMyRating, setRating } =
    useFavoritesStore();

  const myRating = getMyRating($id);
  const fav = isFavorite($id);

  const handleStarPress = (r: number) => setRating($id, r);

  return (
    <TouchableOpacity
      className="menu-card"
      style={
        Platform.OS === "android"
          ? { elevation: 10, shadowColor: "#878787" }
          : {}
      }
    >
      {/* Favorite toggle */}
      <TouchableOpacity
        className="absolute right-3 top-3 z-10"
        onPress={() => toggleFavorite($id)}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text
          className="text-xl"
          style={{ color: fav ? "#EF4444" : "#D1D5DB" }}
        >
          ♥
        </Text>
      </TouchableOpacity>

      <Image
        source={{ uri: image_url }}
        className="size-32 absolute -top-10"
        resizeMode="contain"
      />
      <Text
        className="text-center base-bold text-dark-100 dark:text-white mb-2"
        numberOfLines={1}
      >
        {name}
      </Text>
      <Text className="body-regular text-gray-200 dark:text-gray-100 mb-2">
        From ${price}
      </Text>

      {/* Rating row */}
      <View className="flex-row items-center justify-center mb-3">
        {[1, 2, 3, 4, 5].map((r) => (
          <TouchableOpacity key={r} onPress={() => handleStarPress(r)}>
            <Image
              source={images.star}
              className="w-4 h-4 mx-0.5"
              resizeMode="contain"
              tintColor={r <= (myRating || 0) ? "#F59E0B" : "#D1D5DB"}
            />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={() =>
          addItem({
            id: $id,
            name,
            price,
            image_url: imageUrl,
            customizations: [],
          })
        }
      >
        <Text className="paragraph-bold text-primary">Add to Cart +</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};
export default MenuCard;
