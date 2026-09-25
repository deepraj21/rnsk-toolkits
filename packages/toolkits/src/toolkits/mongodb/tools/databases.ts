// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { getAdminDb, getCollection, getDatabase, missingCredentialsError, toJson } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const dbField = z.string().optional().describe('Database name (defaults to the one stored in MongoDB credentials)');

export const mongodbListDatabases = tool({
  description: 'List databases on the MongoDB server with sizes. Use to discover what data is available before querying.',
  inputSchema: z.object({ mongodbCredentials: authField }),
  execute: async ({ mongodbCredentials }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const admin = await getAdminDb(mongodbCredentials);
      const data = await admin.admin().listDatabases();
      const databases = (data.databases ?? []).map((d) => ({ name: d.name, sizeBytes: d.sizeOnDisk, empty: d.empty }));
      return { count: databases.length, databases };
    } catch (error) {
      return { error: 'Failed to list databases', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbPingServer = tool({
  description: 'Ping the MongoDB server to verify connectivity and get server hello metadata. Use to validate the connection.',
  inputSchema: z.object({ mongodbCredentials: authField }),
  execute: async ({ mongodbCredentials }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const admin = await getAdminDb(mongodbCredentials);
      const [ping, hello] = await Promise.all([admin.command({ ping: 1 }), admin.command({ hello: 1 })]);
      return toJson({ ok: ping?.ok === 1, maxWireVersion: hello?.maxWireVersion, setName: hello?.setName, hosts: hello?.hosts });
    } catch (error) {
      return { error: 'Failed to ping MongoDB server', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbListCollections = tool({
  description: 'List collections (and views) in a database with their types. Use to discover queryable collections.',
  inputSchema: z.object({ mongodbCredentials: authField, database: dbField }),
  execute: async ({ mongodbCredentials, database }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const db = await getDatabase(mongodbCredentials, database);
      const collections = await db.listCollections().toArray();
      const names = collections.map((c) => ({ name: c.name, type: c.type }));
      return { count: names.length, collections: names };
    } catch (error) {
      return { error: 'Failed to list collections', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbDatabaseStats = tool({
  description: 'Get database storage stats: data size, index size, collection and object counts. Use for capacity review.',
  inputSchema: z.object({ mongodbCredentials: authField, database: dbField }),
  execute: async ({ mongodbCredentials, database }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const db = await getDatabase(mongodbCredentials, database);
      return toJson(await db.stats());
    } catch (error) {
      return { error: 'Failed to get database stats', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbCollectionStats = tool({
  description: 'Get collection stats: document count, sizes, index details and shard info. Use to inspect a collection before heavy queries.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: z.string().describe('Collection name'),
  }),
  execute: async ({ mongodbCredentials, database, collection }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      return toJson(await coll.stats());
    } catch (error) {
      return { error: 'Failed to get collection stats', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbCreateCollection = tool({
  description: 'Create a new collection, optionally capped or with a JSON-schema validator. Use before inserting into a fresh namespace.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: z.string().describe('New collection name'),
    capped: z.boolean().optional().describe('Create as a fixed-size capped collection'),
    sizeBytes: z.number().int().positive().optional().describe('Max size in bytes (required when capped)'),
    maxDocuments: z.number().int().positive().optional().describe('Max document count for capped collections'),
    validator: z.record(z.any()).optional().describe('JSON-schema validator document, e.g. {$jsonSchema: {...}}'),
  }),
  execute: async ({ mongodbCredentials, database, collection, capped, sizeBytes, maxDocuments, validator }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const db = await getDatabase(mongodbCredentials, database);
      await db.createCollection(collection, {
        capped,
        size: sizeBytes,
        max: maxDocuments,
        validator: validator as never,
      });
      return { created: true, database: db.databaseName, collection };
    } catch (error) {
      return { error: 'Failed to create collection', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbDropCollection = tool({
  description: 'Drop a collection and all its documents and indexes. Irreversible — confirm with the user first.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: z.string().describe('Collection name to drop'),
  }),
  execute: async ({ mongodbCredentials, database, collection }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const dropped = await coll.drop();
      return { dropped, collection };
    } catch (error) {
      return { error: 'Failed to drop collection', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbRenameCollection = tool({
  description: 'Rename a collection within its database. Updates the namespace; indexes move with it.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: z.string().describe('Current collection name'),
    newName: z.string().describe('New collection name'),
    dropTarget: z.boolean().optional().describe('Drop the target collection first if it exists'),
  }),
  execute: async ({ mongodbCredentials, database, collection, newName, dropTarget }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const result = await coll.rename(newName, { dropTarget });
      return toJson({ renamed: true, from: collection, to: result.collectionName });
    } catch (error) {
      return { error: 'Failed to rename collection', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
