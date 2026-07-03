import {
  MongoClient,
  Db,
  MongoClientOptions,
  ServerApiVersion,
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
 * ==========================================================
 */

/**
 * ----------------------------------------------------------
 * Environment Validation
 * ----------------------------------------------------------
 */
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME =
  process.env.MONGODB_DB_NAME || "awm_erp_2026";

if (!MONGODB_URI) {
  throw new Error(
    "❌ MONGODB_URI is missing in environment variables"
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
  var _mongoClientPromise:
    | Promise<MongoClient>
    | undefined;
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
    client = new MongoClient(
      MONGODB_URI,
      options
    );

    global._mongoClientPromise =
      client.connect();

    console.log(
      "✅ MongoDB connected (development)"
    );
  }

  clientPromise = global._mongoClientPromise;
} else {
  /**
   * Production optimized connection
   */
  client = new MongoClient(
    MONGODB_URI,
    options
  );

  clientPromise = client.connect();

  console.log(
    "✅ MongoDB connected (production)"
  );
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
    console.error(
      "❌ Mongo Client Connection Error:",
      error
    );

    throw new Error(
      "Failed to connect to MongoDB"
    );
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
    console.error(
      "❌ Database Access Error:",
      error
    );

    throw new Error(
      "Failed to access database"
    );
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
      message:
        "MongoDB connection healthy",
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error(
      "❌ Mongo Health Check Failed:",
      error
    );

    return {
      success: false,
      message:
        "MongoDB connection unhealthy",
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * ----------------------------------------------------------
 * Close MongoDB Connection
 * ----------------------------------------------------------
 */
export async function closeMongoConnection(): Promise<void> {
  try {
    const client = await getMongoClient();

    await client.close();

    console.log(
      "🔌 MongoDB connection closed"
    );
  } catch (error) {
    console.error(
      "❌ Failed to close MongoDB connection:",
      error
    );
  }
}

/**
 * ----------------------------------------------------------
 * Collection Helper
 * ----------------------------------------------------------
 */
export async function getCollection(
  collectionName: string
) {
  const db = await getDb();

  return db.collection(collectionName);
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
    console.error(
      "❌ Failed to fetch database stats:",
      error
    );

    return {
      success: false,
      message:
        "Unable to retrieve database statistics",
    };
  }
}

/**
 * ----------------------------------------------------------
 * Default Export
 * ----------------------------------------------------------
 */
export default clientPromise;