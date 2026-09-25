import { MongoClient, ObjectId, type Collection, type Document } from 'mongodb';
import { EJSON } from 'bson';

export interface MongodbCredentials {
  connectionString: string;
  defaultDatabase?: string;
}

const clients = new Map<string, MongoClient>();

/** mongodbCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseMongodbCredentials(mongodbCredentials: string): MongodbCredentials {
  let parsed: Partial<MongodbCredentials>;
  try {
    parsed = JSON.parse(mongodbCredentials) as Partial<MongodbCredentials>;
  } catch {
    throw new Error('MongoDB credentials must be a JSON object with connectionString and optional defaultDatabase');
  }
  if (!parsed.connectionString) {
    throw new Error('MongoDB credentials must include connectionString');
  }
  return { connectionString: parsed.connectionString, defaultDatabase: parsed.defaultDatabase };
}

export function resolveDatabaseName(mongodbCredentials: string, database?: string): string {
  if (database) return database;
  const creds = parseMongodbCredentials(mongodbCredentials);
  if (!creds.defaultDatabase) {
    throw new Error('A database name is required. Provide database or store defaultDatabase in MongoDB credentials.');
  }
  return creds.defaultDatabase;
}

async function getClient(mongodbCredentials: string): Promise<MongoClient> {
  const { connectionString } = parseMongodbCredentials(mongodbCredentials);
  let client = clients.get(connectionString);
  if (!client) {
    client = new MongoClient(connectionString, { serverSelectionTimeoutMS: 15000 });
    clients.set(connectionString, client);
  }
  await client.connect();
  return client;
}

export async function getCollection(
  mongodbCredentials: string,
  database: string | undefined,
  collectionName: string,
): Promise<Collection<Document>> {
  const client = await getClient(mongodbCredentials);
  return client.db(resolveDatabaseName(mongodbCredentials, database)).collection(collectionName);
}

export async function getDatabase(mongodbCredentials: string, database?: string) {
  const client = await getClient(mongodbCredentials);
  return client.db(resolveDatabaseName(mongodbCredentials, database));
}

export async function getAdminDb(mongodbCredentials: string) {
  const client = await getClient(mongodbCredentials);
  return client.db('admin');
}

const OBJECT_ID_HEX = /^[0-9a-fA-F]{24}$/;

/** Deep-convert 24-hex strings under `_id` (or listed fields) to ObjectId so filters match stored documents. */
export function reviveIds<T>(value: T, objectIdFields: string[] = []): T {
  if (Array.isArray(value)) return value.map((v) => reviveIds(v, objectIdFields)) as unknown as T;
  if (value !== null && typeof value === 'object' && !(value instanceof ObjectId) && !(value instanceof Date)) {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (typeof val === 'string' && (key === '_id' || objectIdFields.includes(key)) && OBJECT_ID_HEX.test(val)) {
        out[key] = new ObjectId(val);
      } else {
        out[key] = reviveIds(val, objectIdFields);
      }
    }
    return out as unknown as T;
  }
  return value;
}

/** Convert driver results (ObjectId, Date, Long, …) to plain JSON via relaxed Extended JSON. */
export function toJson(value: unknown): unknown {
  return JSON.parse(EJSON.stringify(value ?? null));
}

export function missingCredentialsError() {
  return { error: 'MongoDB credentials are required. Connect MongoDB first.' };
}
