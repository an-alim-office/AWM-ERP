import {
  MongoClient,
  Db,
  MongoClientOptions,
  ServerApiVersion,
  Collection,
  Document,
} from "mongodb";
 
/**
 * ==========================================================
 * AWM ERP 2026 - ADVANCED MONGODB CONNECTION LAYER
 * ==========================================================
 * Features:
 * ✅ Singleton Safe Connection
 * ✅ Next.js Hot Reload Safe
 * ✅ Production Ready Pooling
 * ✅ Type Safe
 * ✅ Health Monitoring
 * ✅ Auto Reconnect Ready
 * ✅ MongoDB Stable API
 * ✅ Error Logging
 * ✅ Secure Environment Validation
 * ✅ Performance Optimized
 * ✅ Accurate "connected" logging (only after the connection actually resolves)
 * ✅ Unhandled Rejection Safe (initial connect failures won't crash the process)
 * ==========================================================
 */
 
/**
 * ----------------------------------------------------------
 * Environment Validation
 * ----------------------------------------------------------
 */
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || "awm_erp_2026";
 
if (!MONGODB_URI) {
  throw new Error("❌ MONGODB_URI is missing in environment variables");
}
 
if (!process.env.MONGODB_DB_NAME) {
  console.warn(
    "⚠️ MONGODB_DB_NAME is not set — falling back to default database name:",
    DB_NAME
  );
}
 
/**
 * ----------------------------------------------------------
 * MongoDB Client Options
 * ----------------------------------------------------------
 */
const options: MongoClientOptions = {
  maxPoolSize: 100,
  minPoolSize: 5,
 
  maxIdleTimeMS: 60_000,
 
  connectTimeoutMS: 10_000,
  socketTimeoutMS: 45_000,
 
  serverSelectionTimeoutMS: 10_000,
 
  retryWrites: true,
  retryReads: true,
 
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
};
 
/**
 * ----------------------------------------------------------
 * Global Cache Type
 * ----------------------------------------------------------
 */
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}
 
/**
 * Attaches accurate success/failure logging to a connection promise
 * without changing its resolve/reject behavior for later `await`ers.
 * Also prevents an "unhandledRejection" crash if the initial connect fails.
 */
function সংযোগ_পর্যবেক্ষণ(
  promise: Promise<MongoClient>,
  label: "development" | "production"
): Promise<MongoClient> {
  promise
    .then(() => {
      console.log(`✅ MongoDB connected (${label})`);
    })
    .catch((error) => {
      console.error(`❌ MongoDB initial connection failed (${label}):`, error);
    });
 
  return promise;
}
 
/**
 * ----------------------------------------------------------
 * MongoDB Client Initialization
 * ----------------------------------------------------------
 */
let client: MongoClient;
let clientPromise: Promise<MongoClient>;
 
if (process.env.NODE_ENV === "development") {
  /**
   * Prevent multiple connections during hot reload
   */
  if (!global._mongoClientPromise) {
    client = new MongoClient(MONGODB_URI, options);
 
    global._mongoClientPromise = সংযোগ_পর্যবেক্ষণ(
      client.connect(),
      "development"
    );
  }
 
  clientPromise = global._mongoClientPromise;
} else {
  /**
   * Production optimized connection
   */
  client = new MongoClient(MONGODB_URI, options);
 
  clientPromise = সংযোগ_পর্যবেক্ষণ(client.connect(), "production");
}
 
/**
 * ----------------------------------------------------------
 * Get Mongo Client
 * ----------------------------------------------------------
 */
export async function getMongoClient(): Promise<MongoClient> {
  try {
    return await clientPromise;
  } catch (error) {
    console.error("❌ Mongo Client Connection Error:", error);
 
    throw new Error("Failed to connect to MongoDB");
  }
}
 
/**
 * ----------------------------------------------------------
 * Get Database Instance
 * ----------------------------------------------------------
 */
export async function getDb(): Promise<Db> {
  try {
    const client = await getMongoClient();
 
    return client.db(DB_NAME);
  } catch (error) {
    console.error("❌ Database Access Error:", error);
 
    throw new Error("Failed to access database");
  }
}
 
/**
 * ----------------------------------------------------------
 * Health Check
 * ----------------------------------------------------------
 */
export async function checkMongoHealth(): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
}> {
  try {
    const client = await getMongoClient();
 
    await client.db(DB_NAME).command({
      ping: 1,
    });
 
    return {
      success: true,
      message: "MongoDB connection healthy",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("❌ Mongo Health Check Failed:", error);
 
    return {
      success: false,
      message: "MongoDB connection unhealthy",
      timestamp: new Date().toISOString(),
    };
  }
}
 
/**
 * ----------------------------------------------------------
 * Close MongoDB Connection
 * ----------------------------------------------------------
 * ⚠️ Caution: in serverless environments this closes the cached/shared
 * client. Only call this in contexts where you own the connection
 * lifecycle (e.g. a standalone script or graceful shutdown handler),
 * not from within a request handler that other invocations may reuse.
 */
export async function closeMongoConnection(): Promise<void> {
  try {
    const client = await getMongoClient();
 
    await client.close();
 
    console.log("🔌 MongoDB connection closed");
  } catch (error) {
    console.error("❌ Failed to close MongoDB connection:", error);
  }
}
 
/**
 * ----------------------------------------------------------
 * Collection Helper (type-safe)
 * ----------------------------------------------------------
 * Usage:
 * const collection = await getCollection<UserDoc>("users");
 */
export async function getCollection<T extends Document = Document>(
  collectionName: string
): Promise<Collection<T>> {
  const db = await getDb();
 
  return db.collection<T>(collectionName);
}
 
/**
 * ----------------------------------------------------------
 * Database Statistics
 * ----------------------------------------------------------
 */
export async function getDatabaseStats() {
  try {
    const db = await getDb();
 
    const stats = await db.stats();
 
    return {
      success: true,
      stats,
    };
  } catch (error) {
    console.error("❌ Failed to fetch database stats:", error);
 
    return {
      success: false,
      message: "Unable to retrieve database statistics",
    };
  }
}
 
/**
 * ----------------------------------------------------------
 * Default Export
 * ----------------------------------------------------------
 */
export default clientPromise;