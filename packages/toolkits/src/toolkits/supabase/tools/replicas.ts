// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import {
  buildQuery,
  parseResponse,
  pickDefined,
  resolveApiKey,
  sbDelete,
  sbGet,
  sbHead,
  sbOptions,
  sbPatch,
  sbPost,
  sbPut,
  tusOptions,
} from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');

export const supabaseBetaCreateReadReplica = tool({
  description:
    'Provisions a read-only replica for a Supabase project in a specified, Supabase-supported AWS region to enhance read performance and reduce latency.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('Unique reference ID of the Supabase project.'),
    readReplicaRegion: z
      .enum([
        'ap-east-1',
        'ap-northeast-1',
        'ap-northeast-2',
        'ap-south-1',
        'ap-southeast-1',
        'ap-southeast-2',
        'ca-central-1',
        'eu-central-1',
        'eu-central-2',
        'eu-north-1',
        'eu-west-1',
        'eu-west-2',
        'eu-west-3',
        'sa-east-1',
        'us-east-1',
        'us-east-2',
        'us-west-1',
        'us-west-2',
      ])
      .describe(
        'AWS region for the read replica; selecting one closer to users improves performance and reduces latency.',
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, readReplicaRegion }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/read-replicas/setup`,
      { body: pickDefined({ read_replica_region: readReplicaRegion }) },
    );
  },
});

export const supabaseBetaEnableDatabaseWebhooks = tool({
  description:
    'Enables database webhooks for the Supabase project `ref`, triggering real-time notifications for INSERT, UPDATE, or DELETE events.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z.string().describe('The unique identifier for the Supabase project.'),
  }),
  execute: async ({ supabaseAccessToken, ref }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/database/webhooks/enable`,
    );
  },
});

export const supabaseBetaRemoveReadReplica = tool({
  description:
    'Remove a read replica from a Supabase project (Pro plan or higher required). This beta endpoint initiates the removal of a specified read replica database. The operation is irreversible. Before removal, ensure all application traffic is redirected from the replica to the primary database. Requirements: - Project must be on Pro plan or higher - Bearer token with infra_read_replicas_write permission (FGA) - Valid read replica database identifier Note: Returns 201 on success with an empty response body. Requires a Pro plan or higher; redirect traffic to primary first. Irreversible.',
  inputSchema: z.object({
    supabaseAccessToken: tokenField,
    ref: z
      .string()
      .describe(
        "The unique project reference ID (20 lowercase characters, e.g. 'abcdefghijklmnopqrst'). Found in project settings or URL.",
      ),
    databaseIdentifier: z
      .string()
      .describe(
        "The unique identifier of the read replica database to remove. Obtain from the project's database settings or read replica listing.",
      ),
  }),
  execute: async ({ supabaseAccessToken, ref, databaseIdentifier }) => {
    if (!supabaseAccessToken)
      return { error: 'Supabase access token is required. Connect Supabase first.' };
    return sbPost(
      supabaseAccessToken,
      `/v1/projects/${encodeURIComponent(String(ref))}/read-replicas/remove`,
      { body: pickDefined({ database_identifier: databaseIdentifier }) },
    );
  },
});
