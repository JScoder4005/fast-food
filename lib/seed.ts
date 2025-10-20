import { ID } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type: "topping" | "side" | "size" | "crust" | string; // extend as needed
}

interface MenuItem {
  name: string;
  description: string;
  image_url: string;
  price: number;
  rating: number;
  calories: number;
  protein: number;
  category_name: string;
  customizations: string[]; // list of customization names
}

interface DummyData {
  categories: Category[];
  customizations: Customization[];
  menu: MenuItem[];
}

// ensure dummyData has correct shape
const data = dummyData as DummyData;

// async function clearAll(collectionId: string): Promise<void> {
//   const list = await databases.listDocuments(
//     appwriteConfig.databaseId,
//     collectionId
//   );

//   await Promise.all(
//     list.documents.map((doc) =>
//       databases.deleteDocument(appwriteConfig.databaseId, collectionId, doc.$id)
//     )
//   );
// }

async function clearAll(collectionId: string) {
  try {
    console.log("🧹 Trying to clear collection:", collectionId);
    const docs = await databases.listDocuments(
      appwriteConfig.databaseId,
      collectionId
    );
    console.log("Found", docs.documents.length, "docs");
    for (const doc of docs.documents) {
      console.log("Deleting:", doc.$id);
      await databases.deleteDocument(
        appwriteConfig.databaseId,
        collectionId,
        doc.$id
      );
    }
  } catch (err) {
    console.error("❌ Failed clearing collection:", collectionId, err);
    throw err;
  }
}

async function clearStorage(): Promise<void> {
  const list = await storage.listFiles(appwriteConfig.bucketId);

  await Promise.all(
    list.files.map((file) =>
      storage.deleteFile(appwriteConfig.bucketId, file.$id)
    )
  );
}

async function uploadImageToStorage(imageUrl: string) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();

  const fileObj = {
    name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
    type: blob.type,
    size: blob.size,
    uri: imageUrl,
  };

  const file = await storage.createFile(
    appwriteConfig.bucketId,
    ID.unique(),
    fileObj
  );

  return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
}

// async function seed(): Promise<void> {
//     // 1. Clear all
//     console.log("🧹 Clearing old data...");
//   await clearAll(appwriteConfig.categoriesCollectionId);
//   await clearAll(appwriteConfig.customizationsCollectionId);
//   await clearAll(appwriteConfig.menuCollectionId);
//   await clearAll(appwriteConfig.menuCustomizationCollectionId);
//   await clearStorage();

//   // 2. Create Categories
//   console.log("📂 Creating categories...");
//   const categoryMap: Record<string, string> = {};
//   for (const cat of data.categories) {
//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.categoriesCollectionId,
//       ID.unique(),
//       cat
//     );
//     categoryMap[cat.name] = doc.$id;
//   }

//     // 3. Create Customizations
//     console.log("✨ Creating customizations...");
//   const customizationMap: Record<string, string> = {};
//   for (const cus of data.customizations) {
//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.customizationsCollectionId,
//       ID.unique(),
//       {
//         name: cus.name,
//         price: cus.price,
//         type: cus.type,
//       }
//     );
//     customizationMap[cus.name] = doc.$id;
//   }

//   // 4. Create Menu Items
//   const menuMap: Record<string, string> = {};
//   for (const item of data.menu) {
//     const uploadedImage = await uploadImageToStorage(item.image_url);

//     const doc = await databases.createDocument(
//       appwriteConfig.databaseId,
//       appwriteConfig.menuCollectionId,
//       ID.unique(),
//       {
//         name: item.name,
//         description: item.description,
//         image_url: uploadedImage,
//         price: item.price,
//         rating: item.rating,
//         calories: item.calories,
//         protein: item.protein,
//         categories: categoryMap[item.category_name],
//       }
//     );

//     menuMap[item.name] = doc.$id;

//     // 5. Create menu_customizations
//     for (const cusName of item.customizations) {
//       await databases.createDocument(
//         appwriteConfig.databaseId,
//         appwriteConfig.menuCustomizationCollectionId,
//         ID.unique(),
//         {
//           menu: doc.$id,
//           customizations: customizationMap[cusName],
//         }
//       );
//     }
//   }

//   console.log("✅ Seeding complete.");
// }

async function seed(): Promise<void> {
  try {
    console.log("🧹 Clearing old data...");
    await clearAll(appwriteConfig.categoriesCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.menuCustomizationCollectionId);
    await clearStorage();

    console.log("📂 Creating categories...");
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      const doc = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.categoriesCollectionId,
        ID.unique(),
        cat
      );
      categoryMap[cat.name] = doc.$id;
    }

    console.log("✨ Creating customizations...");
    const customizationMap: Record<string, string> = {};
    for (const cus of data.customizations) {
      try {
        const doc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.customizationsCollectionId,
          ID.unique(),
          {
            name: cus.name,
            price: cus.price,
            type: cus.type,
          }
        );
        customizationMap[cus.name] = doc.$id;
      } catch (err) {
        console.error("❌ Failed customization:", cus, err);
        throw err;
      }
    }

    console.log("🍔 Creating menu items...");
    for (const item of data.menu) {
      try {
        const uploadedImage = await uploadImageToStorage(item.image_url);
        const doc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.menuCollectionId,
          ID.unique(),
          {
            name: item.name,
            description: item.description,
            image_url: uploadedImage,
            price: item.price,
            rating: item.rating,
            calories: item.calories,
            protein: item.protein,
            categories: categoryMap[item.category_name],
          }
        );

        for (const cusName of item.customizations) {
          await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.menuCustomizationCollectionId,
            ID.unique(),
            {
              menu: doc.$id,
              customizations: customizationMap[cusName],
            }
          );
        }
      } catch (err) {
        console.error("❌ Failed menu item:", item.name, err);
        throw err;
      }
    }

    console.log("✅ Seeding complete.");
  } catch (err) {
    console.error("💥 SEED FAILED:", err);
  }
}

export default seed;
