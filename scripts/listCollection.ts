import { Client, Databases } from "node-appwrite"; // 👈 important: node-appwrite, not react-native-appwrite

const client = new Client()
  .setEndpoint("https://cloud.appwrite.io/v1") // or your endpoint
  .setProject("68e3d7d7003062ee4091") // your actual project ID
  .setKey("YOUR_APPWRITE_API_KEY"); // you’ll need to create an API key from the Appwrite Console

const databases = new Databases(client);

async function listAllCollections() {
  try {
    const dbList = await databases.list();
    console.log("📚 Databases found:\n");

    for (const db of dbList.databases) {
      console.log(`🗃 Database Name: ${db.name}`);
      console.log(`🆔 Database ID: ${db.$id}\n`);

      const collections = await databases.listCollections(db.$id);
      for (const col of collections.collections) {
        console.log(`   📦 Collection Name: ${col.name}`);
        console.log(`   🆔 Collection ID: ${col.$id}\n`);
      }
    }

    console.log("✅ Done!");
  } catch (err) {
    console.error("❌ Error listing collections:", err);
  }
}

listAllCollections();
