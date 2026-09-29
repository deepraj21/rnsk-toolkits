// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { decodeDocument, encodeValue, fbRequest, getProjectId } from './client.js';

const BASE = 'https://firestore.googleapis.com/v1';
const cred = () => z.string().describe('Firebase credentials JSON (projectId, serviceAccountKey)');
const dbField = z.string().optional().describe('Database ID (default "(default)")');

function err(label: string, error: unknown) {
  if ((error as any)?.details !== undefined) return error;
  return { error: label, message: error instanceof Error ? error.message : 'Unknown error' };
}

function docsPath(firebaseCredentials: string, databaseId?: string): string {
  const pid = getProjectId(firebaseCredentials);
  return `${BASE}/projects/${pid}/databases/${databaseId ?? '(default)'}/documents`;
}

function toFields(data: unknown): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries((data ?? {}) as Record<string, any>)) out[k] = encodeValue(v);
  return out;
}

export const firebaseListDatabases = tool({
  description: 'List Firestore databases in the project.',
  inputSchema: z.object({ firebaseCredentials: cred() }),
  execute: async ({ firebaseCredentials }) => {
    try {
      const pid = getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/databases`);
    } catch (error) {
      return err('Failed to list Firestore databases', error);
    }
  },
});

export const firebaseGetDocument = tool({
  description: 'Get a Firestore document by path with plain-JSON fields.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    documentPath: z.string().describe('Document path, e.g. users/alice or coll/doc/subcoll/doc'),
    databaseId: dbField,
  }),
  execute: async ({ firebaseCredentials, documentPath, databaseId }) => {
    try {
      const doc = await fbRequest(
        firebaseCredentials,
        `${docsPath(firebaseCredentials, databaseId)}/${documentPath}`,
      );
      return decodeDocument(doc);
    } catch (error) {
      return err('Failed to get Firestore document', error);
    }
  },
});

export const firebaseCreateDocument = tool({
  description:
    'Create a Firestore document in a collection with plain-JSON data. Omit documentId for an auto ID.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    collectionPath: z.string().describe('Collection path, e.g. users or users/alice/orders'),
    data: z.record(z.any()).describe('Document fields as plain JSON'),
    documentId: z.string().optional().describe('Custom document ID (auto-generated when omitted)'),
    databaseId: dbField,
  }),
  execute: async ({ firebaseCredentials, collectionPath, data, documentId, databaseId }) => {
    try {
      const doc = await fbRequest(
        firebaseCredentials,
        `${docsPath(firebaseCredentials, databaseId)}/${collectionPath}`,
        {
          method: 'POST',
          query: documentId ? { documentId } : undefined,
          body: { fields: toFields(data) },
        },
      );
      return decodeDocument(doc);
    } catch (error) {
      return err('Failed to create Firestore document', error);
    }
  },
});

export const firebaseUpdateDocument = tool({
  description:
    'Update (or set) fields on a Firestore document. List updateMask field paths to patch specific fields.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    documentPath: z.string().describe('Document path, e.g. users/alice'),
    data: z.record(z.any()).describe('Fields to write as plain JSON'),
    updateMask: z
      .array(z.string())
      .optional()
      .describe('Field paths to update, e.g. ["name","address.city"] (omit to replace all fields)'),
    databaseId: dbField,
  }),
  execute: async ({ firebaseCredentials, documentPath, data, updateMask, databaseId }) => {
    try {
      const u = new URL(`${docsPath(firebaseCredentials, databaseId)}/${documentPath}`);
      if (updateMask) for (const f of updateMask) u.searchParams.append('updateMask.fieldPaths', f);
      const doc = await fbRequest(firebaseCredentials, u.toString(), {
        method: 'PATCH',
        body: { fields: toFields(data) },
      });
      return decodeDocument(doc);
    } catch (error) {
      return err('Failed to update Firestore document', error);
    }
  },
});

export const firebaseDeleteDocument = tool({
  description: 'Delete a Firestore document by path.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    documentPath: z.string().describe('Document path, e.g. users/alice'),
    databaseId: dbField,
  }),
  execute: async ({ firebaseCredentials, documentPath, databaseId }) => {
    try {
      return await fbRequest(
        firebaseCredentials,
        `${docsPath(firebaseCredentials, databaseId)}/${documentPath}`,
        {
          method: 'DELETE',
        },
      );
    } catch (error) {
      return err('Failed to delete Firestore document', error);
    }
  },
});

export const firebaseListDocuments = tool({
  description: 'List documents in a Firestore collection with plain-JSON fields.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    collectionPath: z.string().describe('Collection path, e.g. users'),
    pageSize: z.number().optional().describe('Max documents to return'),
    pageToken: z.string().optional().describe('nextPageToken from a previous response'),
    orderBy: z.string().optional().describe('Field to order by, e.g. name'),
    databaseId: dbField,
  }),
  execute: async ({
    firebaseCredentials,
    collectionPath,
    pageSize,
    pageToken,
    orderBy,
    databaseId,
  }) => {
    try {
      const res = await fbRequest(
        firebaseCredentials,
        `${docsPath(firebaseCredentials, databaseId)}/${collectionPath}`,
        {
          query: { pageSize, pageToken, orderBy },
        },
      );
      if (res?.error) return res;
      return { ...res, documents: (res.documents ?? []).map(decodeDocument) };
    } catch (error) {
      return err('Failed to list Firestore documents', error);
    }
  },
});

export const firebaseRunQuery = tool({
  description: 'Run a Firestore structured query (filters, ordering, limit) against a collection.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    collectionPath: z.string().describe('Collection path relative to the database, e.g. users'),
    structuredQuery: z
      .record(z.any())
      .describe(
        'Full structuredQuery object (where, orderBy, limit); collection is set automatically',
      ),
    databaseId: dbField,
  }),
  execute: async ({ firebaseCredentials, collectionPath, structuredQuery, databaseId }) => {
    try {
      const pid = getProjectId(firebaseCredentials);
      const db = databaseId ?? '(default)';
      const res = await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pid}/databases/${db}/documents:runQuery`,
        {
          method: 'POST',
          body: {
            parent: `${BASE}/projects/${pid}/databases/${db}/documents`,
            structuredQuery: {
              ...structuredQuery,
              from: [{ collectionId: collectionPath.split('/').pop() }],
            },
          },
        },
      );
      if ((res as any)?.error) return res;
      const rows = Array.isArray(res) ? res : [];
      return rows.map((r: any) =>
        r.document ? { ...decodeDocument(r.document), readTime: r.readTime } : r,
      );
    } catch (error) {
      return err('Failed to run Firestore query', error);
    }
  },
});
