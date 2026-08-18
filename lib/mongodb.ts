/**
 * lib/mongodb.ts
 *
 * AWM-ERP — MongoDB Connection Layer
 *
 * Production-grade MongoDB connection manager for Next.js App Router.
 *
 * Features:
 * - Lazy MongoDB connection
 * - Connection pooling
 * - Next.js development hot-reload safe
 * - Production singleton behavior
 * - Shared MongoClient across application modules
 * - Type-safe collection helper
 * - MongoDB health check
 * - Connection reset support
 * - Graceful shutdown support
 * - Compatible with TenantConfig
 * - Compatible with DatabaseProvisioner
 *
 * IMPORTANT:
 * - This file does NOT implement tenant isolation.
 * - Tenant isolation is handled by the tenant layer.
 * - MongoDB credentials must remain server-side only.
 */

import {
  MongoClient,
  Db,
  Collection,
  Document,
  MongoClientOptions,
} from 'mongodb';

import {
  getMongoTenantConfig,
} from '@/lib/tenant/TenantConfig';

// ============================================================================
// 1. Environment Configuration
// ============================================================================

const uri =
  process.env.MONGODB_URI?.trim() ?? '';

const dbName =
  process.env.MONGODB_DB_NAME?.trim() ?? '';

if (!uri) {
  throw new Error(
    'Missing MONGODB_URI in environment variables.',
  );
}

if (!dbName) {
  throw new Error(
    'Missing MONGODB_DB_NAME in environment variables.',
  );
}

// ============================================================================
// 2. MongoDB Configuration
// ============================================================================

const mongoConfig =
  getMongoTenantConfig();

/**
 * MongoDB client options.
 *
 * Values come from TenantConfig so the application
 * has one central configuration source.
 */
const options: MongoClientOptions = {
  maxPoolSize:
    mongoConfig.maxPoolSize,

  minPoolSize:
    mongoConfig.minPoolSize,

  connectTimeoutMS:
    mongoConfig.connectTimeoutMS,

  socketTimeoutMS:
    mongoConfig.socketTimeoutMS,

  serverSelectionTimeoutMS:
    mongoConfig.serverSelectionTimeoutMS,

  retryWrites:
    mongoConfig.retryWrites,

  retryReads:
    mongoConfig.retryReads,
};

// ============================================================================
// 3. Global Development Cache
// ============================================================================

declare global {
  // eslint-disable-next-line no-var
  var _awmMongoClient:
    MongoClient | undefined;

  // eslint-disable-next-line no-var
  var _awmMongoClientPromise:
    Promise<MongoClient> | undefined;
}

// ============================================================================
// 4. Connection State
// ============================================================================

let client:
  MongoClient | undefined;

let clientPromise:
  Promise<MongoClient> | undefined;

// ============================================================================
// 5. MongoDB Client Factory
// ============================================================================

function createMongoClient(): MongoClient {
  return new MongoClient(
    uri,
    options,
  );
}

// ============================================================================
// 6. MongoDB Client Connection
// ============================================================================

/**
 * Creates and connects a MongoDB client.
 *
 * Connection is intentionally lazy.
 *
 * This prevents importing this module from immediately
 * opening a network connection during module evaluation.
 */
async function connectMongoClient(): Promise<MongoClient> {
  const newClient =
    createMongoClient();

  try {
    await newClient.connect();

    /*
     * Store the successfully connected client.
     */
    client = newClient;

    return newClient;
  } catch (error) {
    /*
     * Ensure failed clients are cleaned up.
     */
    try {
      await newClient.close();
    } catch {
      // Ignore cleanup failure.
    }

    throw error;
  }
}

// ============================================================================
// 7. Get MongoDB Client
// ============================================================================

/**
 * Returns the shared MongoDB client.
 *
 * Development:
 * - Uses global cache to survive Next.js hot reload.
 *
 * Production:
 * - Uses module-level singleton.
 */
export async function getMongoClient(): Promise<MongoClient> {
  /*
   * Development hot-reload safe path.
   */
  if (
    process.env.NODE_ENV === 'development'
  ) {
    if (
      global._awmMongoClient
    ) {
      return global._awmMongoClient;
    }

    if (
      global._awmMongoClientPromise
    ) {
      const connectedClient =
        await global._awmMongoClientPromise;

      global._awmMongoClient =
        connectedClient;

      return connectedClient;
    }

    const promise =
      connectMongoClient();

    global._awmMongoClientPromise =
      promise;

    try {
      const connectedClient =
        await promise;

      global._awmMongoClient =
        connectedClient;

      return connectedClient;
    } catch (error) {
      /*
       * Failed promises must not remain cached.
       *
       * This allows a later request to retry
       * the connection.
       */
      global._awmMongoClientPromise =
        undefined;

      global._awmMongoClient =
        undefined;

      throw error;
    }
  }

  /*
   * Production path.
   */
  if (client) {
    return client;
  }

  if (clientPromise) {
    return clientPromise;
  }

  clientPromise =
    connectMongoClient();

  try {
    client =
      await clientPromise;

    return client;
  } catch (error) {
    /*
     * Allow future requests to retry
     * after a failed connection.
     */
    clientPromise =
      undefined;

    client =
      undefined;

    throw error;
  }
}

// ============================================================================
// 8. Get Database
// ============================================================================

/**
 * Returns the configured MongoDB database.
 */
export async function getDb(): Promise<Db> {
  const mongoClient =
    await getMongoClient();

  return mongoClient.db(dbName);
}

// ============================================================================
// 9. Get Collection
// ============================================================================

/**
 * Type-safe MongoDB collection helper.
 *
 * Example:
 *
 * interface EmployeeDocument extends Document {
 *   tenantId: string;
 *   name: string;
 * }
 *
 * const employees =
 *   await getCollection<EmployeeDocument>(
 *     'employees'
 *   );
 */
export async function getCollection<
  T extends Document = Document,
>(
  collectionName: string,
): Promise<Collection<T>> {
  if (
    !collectionName ||
    !collectionName.trim()
  ) {
    throw new Error(
      'MongoDB collection name is required.',
    );
  }

  const db =
    await getDb();

  return db.collection<T>(
    collectionName.trim(),
  );
}

// ============================================================================
// 10. MongoDB Health Check
// ============================================================================

/**
 * Performs a lightweight MongoDB ping.
 *
 * Returns:
 * - true  -> MongoDB reachable
 * - false -> MongoDB unavailable
 */
export async function checkMongoConnection(): Promise<boolean> {
  try {
    const mongoClient =
      await getMongoClient();

    await mongoClient
      .db(dbName)
      .command({
        ping: 1,
      });

    return true;
  } catch (error) {
    console.error(
      'MongoDB health check failed:',
      error,
    );

    return false;
  }
}

// ============================================================================
// 11. Detailed MongoDB Health Check
// ============================================================================

export interface MongoHealthResult {
  healthy: boolean;

  database: string;

  latencyMs: number;

  checkedAt: Date;

  error?: string;
}

/**
 * Detailed MongoDB health information.
 *
 * Useful for:
 * - Admin health dashboard
 * - /api/health
 * - Monitoring
 * - Tenant infrastructure diagnostics
 */
export async function getMongoHealth(): Promise<MongoHealthResult> {
  const startedAt =
    Date.now();

  try {
    const mongoClient =
      await getMongoClient();

    await mongoClient
      .db(dbName)
      .command({
        ping: 1,
      });

    return {
      healthy: true,

      database: dbName,

      latencyMs:
        Date.now() -
        startedAt,

      checkedAt:
        new Date(),
    };
  } catch (error) {
    return {
      healthy: false,

      database: dbName,

      latencyMs:
        Date.now() -
        startedAt,

      checkedAt:
        new Date(),

      error:
        error instanceof Error
          ? error.message
          : 'Unknown MongoDB error',
    };
  }
}

// ============================================================================
// 12. Reset MongoDB Connection
// ============================================================================

/**
 * Clears the current connection state.
 *
 * Useful after a fatal connection problem
 * or during controlled infrastructure recovery.
 */
export async function resetMongoConnection(): Promise<void> {
  const currentClient =
    client ??
    global._awmMongoClient;

  /*
   * Clear state first so a concurrent
   * request can establish a new connection.
   */
  client =
    undefined;

  clientPromise =
    undefined;

  if (
    process.env.NODE_ENV ===
    'development'
  ) {
    global._awmMongoClient =
      undefined;

    global._awmMongoClientPromise =
      undefined;
  }

  if (currentClient) {
    try {
      await currentClient.close();
    } catch (error) {
      console.error(
        'MongoDB connection close failed:',
        error,
      );
    }
  }
}

// ============================================================================
// 13. Graceful Shutdown
// ============================================================================

/**
 * Closes the MongoDB connection.
 *
 * Intended for:
 * - tests
 * - scripts
 * - controlled process shutdown
 */
export async function closeMongoConnection(): Promise<void> {
  const currentClient =
    client ??
    global._awmMongoClient;

  if (!currentClient) {
    return;
  }

  try {
    await currentClient.close();
  } finally {
    client =
      undefined;

    clientPromise =
      undefined;

    if (
      process.env.NODE_ENV ===
      'development'
    ) {
      global._awmMongoClient =
        undefined;

      global._awmMongoClientPromise =
        undefined;
    }
  }
}

// ============================================================================
// 14. MongoDB Configuration Info
// ============================================================================

/**
 * Returns safe, non-secret MongoDB
 * configuration information.
 *
 * NEVER returns:
 * - URI
 * - username
 * - password
 */
export function getMongoConfigInfo() {
  return {
    databaseName: dbName,

    maxPoolSize:
      mongoConfig.maxPoolSize,

    minPoolSize:
      mongoConfig.minPoolSize,

    connectTimeoutMS:
      mongoConfig.connectTimeoutMS,

    socketTimeoutMS:
      mongoConfig.socketTimeoutMS,

    serverSelectionTimeoutMS:
      mongoConfig.serverSelectionTimeoutMS,

    retryWrites:
      mongoConfig.retryWrites,

    retryReads:
      mongoConfig.retryReads,
  } as const;
}

// ============================================================================
// 15. Default Export
// ============================================================================

/**
 * Default export intentionally resolves the shared
 * MongoDB client lazily.
 *
 * Usage:
 *
 * const client = await mongoClientPromise;
 */
const mongoClientPromise =
  getMongoClient();

export default mongoClientPromise;