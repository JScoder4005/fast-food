import { ID, Query } from "react-native-appwrite";
import { appwriteConfig, databases, storage } from "./appwrite";
import dummyData from "./data";

interface Category {
  name: string;
  description: string;
}

interface Customization {
  name: string;
  price: number;
  type:
    | "toping"
    | "side"
    | "size"
    | "crust"
    | "bread"
    | "spice"
    | "base"
    | "sauce";
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

async function verifyCollectionsAndBucket(): Promise<void> {
  try {
    console.log("🔍 Verifying database collections and storage bucket...");

    // Check collections
    const collections = [
      appwriteConfig.categoriesCollectionId,
      appwriteConfig.customizationsCollectionId,
      appwriteConfig.menuCollectionId,
      appwriteConfig.menuCustomizationCollectionId,
    ];

    for (const collectionId of collections) {
      try {
        // Try to list documents with limit 0 to verify collection exists and is accessible
        await databases.listDocuments(appwriteConfig.databaseId, collectionId, [
          Query.limit(1),
        ]);
      } catch (error: any) {
        throw new Error(
          `Collection "${collectionId}" not found or insufficient permissions: ${error.message}`
        );
      }
    }

    // Check bucket by trying to list files
    try {
      await storage.listFiles(appwriteConfig.bucketId, [Query.limit(1)]);
    } catch (error: any) {
      throw new Error(
        `Bucket "${appwriteConfig.bucketId}" not found or insufficient permissions: ${error.message}`
      );
    }

    console.log("✅ Database collections and storage bucket verified");
  } catch (error: any) {
    console.error("❌ Verification failed:", error.message);
    throw error;
  }
}

async function clearAll(collectionId: string): Promise<void> {
  try {
    console.log(`Clearing collection: ${collectionId}`);
    const list = await databases.listDocuments(
      appwriteConfig.databaseId,
      collectionId,
      [Query.limit(100)] // Limit to 100 documents at a time
    );

    if (list.documents.length > 0) {
      // Delete documents sequentially to avoid race conditions
      for (const doc of list.documents) {
        try {
          await databases.deleteDocument(
            appwriteConfig.databaseId,
            collectionId,
            doc.$id
          );
          // Add a small delay between deletions
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error: any) {
          console.warn(
            `Warning: Could not delete document ${doc.$id} from ${collectionId}: ${error.message}`
          );
          // Continue with other documents instead of throwing
        }
      }
    }
    console.log(
      `✅ Cleared ${list.documents.length} documents from ${collectionId}`
    );
  } catch (error: any) {
    throw new Error(
      `Failed to clear collection ${collectionId}: ${error.message}`
    );
  }
}

async function clearStorage(): Promise<void> {
  try {
    console.log("Clearing storage bucket...");
    const list = await storage.listFiles(appwriteConfig.bucketId);

    if (list.files.length > 0) {
      await Promise.all(
        list.files.map(async (file) => {
          try {
            await storage.deleteFile(appwriteConfig.bucketId, file.$id);
          } catch (error: any) {
            throw new Error(
              `Failed to delete file ${file.$id}: ${error.message}`
            );
          }
        })
      );
    }
    console.log(`✅ Cleared ${list.files.length} files from storage`);
  } catch (error: any) {
    throw new Error(`Failed to clear storage bucket: ${error.message}`);
  }
}

async function uploadImageToStorage(imageUrl: string) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error("Invalid image blob");
    }

    const fileObj = {
      name: imageUrl.split("/").pop() || `file-${Date.now()}.jpg`,
      type: blob.type || "image/jpeg",
      size: blob.size,
      uri: imageUrl,
    };

    const file = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      fileObj
    );

    return storage.getFileViewURL(appwriteConfig.bucketId, file.$id);
  } catch (error: any) {
    console.error(`Error uploading image ${imageUrl}:`, error);
    // Return a fallback image URL or throw error based on your needs
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

async function seed(): Promise<void> {
  try {
    console.log("🔄 Starting database seeding...");

    // Verify collections and bucket before proceeding
    await verifyCollectionsAndBucket();

    // 1. Clear all (in reverse order of dependencies)
    console.log("🗑️  Clearing existing data...");
    // First clear junction table (menu_customizations)
    await clearAll(appwriteConfig.menuCustomizationCollectionId);
    // Then clear main tables
    await clearAll(appwriteConfig.menuCollectionId);
    await clearAll(appwriteConfig.customizationsCollectionId);
    await clearAll(appwriteConfig.categoriesCollectionId);
    // Finally clear storage
    await clearStorage();
    console.log("✅ Cleared existing data");

    // 2. Create Categories
    console.log("📝 Creating categories...");
    const categoryMap: Record<string, string> = {};
    for (const cat of data.categories) {
      try {
        const doc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.categoriesCollectionId,
          ID.unique(),
          cat
        );
        categoryMap[cat.name] = doc.$id;
      } catch (error: any) {
        console.error(`Failed to create category ${cat.name}:`, error.message);
        throw error;
      }
    }
    console.log("✅ Created categories");

    // 3. Create Customizations
    console.log("📝 Creating customizations...");
    const customizationMap: Record<string, string> = {};

    // First, get existing customizations
    try {
      const existingCustomizations = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.customizationsCollectionId
      );

      console.log(
        `Found ${existingCustomizations.documents.length} existing customizations`
      );

      // Create a map of existing customizations
      for (const doc of existingCustomizations.documents) {
        if (doc.name) {
          customizationMap[doc.name] = doc.$id;
          console.log(
            `Existing customization mapped: ${doc.name} -> ${doc.$id}`
          );
        }
      }
    } catch (error: any) {
      console.error("Error fetching existing customizations:", error);
      // Continue with creation even if we can't fetch existing ones
    }

    // Create new customizations
    for (const cus of data.customizations) {
      try {
        // Skip if we already have this customization
        if (customizationMap[cus.name]) {
          console.log(`Skipping existing customization: ${cus.name}`);
          continue;
        }

        console.log(`Creating customization: ${JSON.stringify(cus, null, 2)}`);

        // Validate data before sending
        if (!cus.name || typeof cus.name !== "string") {
          throw new Error(`Invalid name: ${cus.name}`);
        }
        if (typeof cus.price !== "number" || cus.price < 0) {
          throw new Error(`Invalid price: ${cus.price}`);
        }
        if (!cus.type || typeof cus.type !== "string") {
          throw new Error(`Invalid type: ${cus.type}`);
        }

        const customizationData = {
          name: cus.name,
          price: cus.price,
          type: cus.type,
        };

        try {
          const doc = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsCollectionId,
            ID.unique(),
            customizationData
          );

          console.log(`Successfully created customization: ${cus.name}`);
          customizationMap[cus.name] = doc.$id;
        } catch (createError: any) {
          // If creation fails, try to find if it was actually created
          console.warn(`Error creating ${cus.name}, checking if it exists...`);
          const checkExisting = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.customizationsCollectionId,
            [Query.equal("name", cus.name)]
          );

          if (checkExisting.documents.length > 0) {
            console.log(
              `Found existing document for ${cus.name}, using that instead`
            );
            customizationMap[cus.name] = checkExisting.documents[0].$id;
          } else {
            throw createError; // Re-throw if we truly couldn't create or find it
          }
        }
      } catch (error: any) {
        console.error(
          `Failed to process customization ${cus.name}:`,
          error.message,
          error.response
            ? JSON.stringify(error.response, null, 2)
            : "No response details"
        );
        // Continue with other customizations instead of throwing
        console.log(`Continuing with remaining customizations...`);
      }
    }

    if (Object.keys(customizationMap).length === 0) {
      throw new Error("Failed to create or find any customizations");
    }

    console.log(
      `✅ Created/Found ${Object.keys(customizationMap).length} customizations`
    );

    // 4. Create Menu Items
    console.log("📝 Creating menu items...");
    const menuMap: Record<string, string> = {};
    for (const item of data.menu) {
      try {
        console.log(`Processing menu item: ${item.name}`);
        let uploadedImage;
        try {
          uploadedImage = await uploadImageToStorage(item.image_url);
          console.log(`Successfully uploaded image for ${item.name}`);
        } catch (imageError: any) {
          console.warn(
            `Failed to upload image for ${item.name}:`,
            imageError.message
          );
          // Use a fallback image URL or skip the item
          uploadedImage = item.image_url; // For now, use the original URL
        }

        // Create menu item
        const menuItemData = {
          name: item.name,
          description: item.description,
          image_url: uploadedImage,
          price: item.price,
          rating: item.rating,
          calories: item.calories,
          protein: item.protein,
          categories: categoryMap[item.category_name], // Field name must match Appwrite schema
        };

        console.log(
          `Creating menu item with data:`,
          JSON.stringify(menuItemData, null, 2)
        );

        const doc = await databases.createDocument(
          appwriteConfig.databaseId,
          appwriteConfig.menuCollectionId,
          ID.unique(),
          menuItemData
        );

        menuMap[item.name] = doc.$id;
        console.log(
          `Successfully created menu item: ${item.name} with ID: ${doc.$id}`
        );

        // 5. Create menu_customizations
        console.log(`Creating customizations for: ${item.name}`);
        for (const cusName of item.customizations) {
          if (!customizationMap[cusName]) {
            console.warn(
              `Warning: Customization "${cusName}" not found in map, skipping...`
            );
            continue;
          }

          try {
            await databases.createDocument(
              appwriteConfig.databaseId,
              appwriteConfig.menuCustomizationCollectionId,
              ID.unique(),
              {
                menu: doc.$id, // Make sure these field names match
                customizations: customizationMap[cusName], // your Appwrite schema
              }
            );
            console.log(`Added customization ${cusName} to ${item.name}`);
          } catch (cusError: any) {
            console.warn(
              `Warning: Failed to add customization ${cusName} to ${item.name}:`,
              cusError.message
            );
            // Continue with other customizations
          }
        }
      } catch (error: any) {
        console.error(
          `Failed to process menu item ${item.name}:`,
          error.message,
          error.response
            ? JSON.stringify(error.response, null, 2)
            : "No response details"
        );
        // Continue with other menu items instead of throwing
        console.log(`Continuing with remaining menu items...`);
      }
    }

    if (Object.keys(menuMap).length === 0) {
      throw new Error("Failed to create any menu items");
    }

    console.log(`✅ Created ${Object.keys(menuMap).length} menu items`);

    console.log("✅ Database seeding completed successfully!");
  } catch (error: any) {
    console.error("❌ Database seeding failed:", error.message);
    throw new Error(`Seeding failed: ${error.message}`);
  }
}

export default seed;
