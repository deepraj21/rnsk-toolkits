// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { getCollection, missingCredentialsError, toJson } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const dbField = z.string().optional().describe('Database name (defaults to the one stored in MongoDB credentials)');
const collField = z.string().describe('Collection name');

export const mongodbCreateIndex = tool({
  description: 'Create an index (single, compound, text, geospatial, TTL) to speed queries and enforce uniqueness. Use for slow queries and unique constraints.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    keys: z.record(z.any()).describe('Index keys, e.g. {"email": 1}, {"location": "2dsphere"}, {"title": "text"}.'),
    name: z.string().optional().describe('Custom index name.'),
    unique: z.boolean().optional().describe('Enforce unique values.'),
    sparse: z.boolean().optional().describe('Skip documents missing the field.'),
    expireAfterSeconds: z.number().int().min(0).optional().describe('TTL in seconds for time-based expiry.'),
    background: z.boolean().optional().describe('Build in the background (default true on modern servers).'),
  }),
  execute: async ({ mongodbCredentials, database, collection, keys, name, unique, sparse, expireAfterSeconds, background }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const indexName = await coll.createIndex(keys, { name, unique, sparse, expireAfterSeconds, background });
      return { created: true, indexName };
    } catch (error) {
      return { error: 'Failed to create index', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbListIndexes = tool({
  description: 'List indexes on a collection with keys, uniqueness and sizes. Use to review query coverage.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
  }),
  execute: async ({ mongodbCredentials, database, collection }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      const indexes = await coll.listIndexes().toArray();
      const out = toJson(indexes);
      return { count: Array.isArray(out) ? out.length : 0, indexes: out };
    } catch (error) {
      return { error: 'Failed to list indexes', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const mongodbDropIndex = tool({
  description: 'Drop an index by name (use "*" for all non-_id indexes). Use to remove unused or blocking indexes.',
  inputSchema: z.object({
    mongodbCredentials: authField,
    database: dbField,
    collection: collField,
    indexName: z.string().describe('Index name from list-indexes, or "*" for all custom indexes.'),
  }),
  execute: async ({ mongodbCredentials, database, collection, indexName }) => {
    if (!mongodbCredentials) return missingCredentialsError();
    try {
      const coll = await getCollection(mongodbCredentials, database, collection);
      await coll.dropIndex(indexName);
      return { dropped: true, indexName };
    } catch (error) {
      return { error: 'Failed to drop index', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
