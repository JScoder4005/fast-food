import { Client, Databases } from "node-appwrite"; // 👈 important: node-appwrite, not react-native-appwrite

const endpoint = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const apiKey = process.env.API_KEY;

if (!endpoint || !projectId || !apiKey) {
  throw new Error(
    "Missing required environment variables for Appwrite configuration."
  );
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey); // you’ll need to create an API key from the Appwrite Console

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
    ``;
    console.error("❌ Error listing collections:", err);
  }
}

listAllCollections();
