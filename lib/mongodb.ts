import { MongoClient, Db, Collection, Document } from "mongodb";
 
const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DB_NAME || "";
 
if (!uri) {
  throw new Error("Missing MONGODB_URI in environment variables");
}
 
if (!dbName) {
  throw new Error("Missing MONGODB_DB_NAME in environment variables");
}
 
/**
 * ============================================
 * 2026 Optimized MongoDB Connection Layer
 * ============================================
 * ✅ Connection Pooling
 * ✅ Next.js App Router Safe
 * ✅ Hot Reload Safe
 * ✅ Production Ready
 * ✅ Type Safe Collection Access
 * ✅ Reusable Collection Helper
 * ✅ Unhandled Rejection Safe (initial connect failures won't crash the process)
 * ============================================
 */
 
const options = {
  maxPoolSize: 50,
  minPoolSize: 5,
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
  serverSelectionTimeoutMS: 10_000,
  retryWrites: true,
  retryReads: true,
};
 
let client: MongoClient;
let clientPromise: Promise<MongoClient>;
 
/**
 * ============================================
 * Global Cache (Dev Hot Reload Safe)
 * ============================================
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
 
/**
 * Attaches a silent .catch() logger to a connection promise so that an
 * initial connection failure is reported cleanly instead of surfacing as
 * an "unhandledRejection" that can crash the Node process before any
 * request is even served. The original promise's rejection behavior is
 * unchanged for anyone who later `await`s it (e.g. inside getDb()).
 */
function সংযোগ_নিরাপদ_করো(promise: Promise<MongoClient>): Promise<MongoClient> {
  promise.catch((error) => {
    console.error("MongoDB initial connection failed:", error);
  });
 
  return promise;
}
 
if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
 
    global._mongoClientPromise = সংযোগ_নিরাপদ_করো(client.connect());
  }
 
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
 
  clientPromise = সংযোগ_নিরাপদ_করো(client.connect());
}
 
/**
 * ============================================
 * Get Database Instance
 * ============================================
 */
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
 
  return client.db(dbName);
}
 
/**
 * ============================================
 * Get Collection Helper
 * ============================================
 * Usage:
 * const collection = await getCollection("employees");
 */
export async function getCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDb();
 
  return db.collection<T>(collectionName);
}
 
/**
 * ============================================
 * Get Raw Mongo Client
 * ============================================
 */
export async function getMongoClient(): Promise<MongoClient> {
  return await clientPromise;
}
 
/**
 * ============================================
 * MongoDB Health Checker
 * ============================================
 */
export async function checkMongoConnection(): Promise<boolean> {
  try {
    const client = await clientPromise;
 
    await client.db(dbName).command({ ping: 1 });
 
    return true;
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
 
    return false;
  }
}
 
/**
 * ============================================
 * Default Export
 * ============================================
 */
export default clientPromise;