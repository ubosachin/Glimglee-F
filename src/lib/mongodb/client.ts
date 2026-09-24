import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "glimglee";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

export const isMongoConfigured = Boolean(uri && uri.trim().length > 0);

if (isMongoConfigured) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxIdleTimeMS: 30000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!clientPromise) {
    throw new Error(
      "MongoDB is not configured. Please define MONGODB_URI in your .env.local file."
    );
  }
  return clientPromise;
}

export async function getDb(): Promise<Db> {
  const c = await getMongoClient();
  return c.db(dbName);
}
