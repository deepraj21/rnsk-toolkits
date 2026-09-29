// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { digitalOceanRequest, missingKey, toDigitalOceanError } from './client.js';

const authField = {
  digitalOceanApiKey: z.string().optional().describe('Injected by system; do not provide'),
};

const paginationFields = {
  page: z.number().int().min(1).optional().describe('Page of results to return (>= 1)'),
  perPage: z.number().int().min(1).max(200).optional().describe('Number of items per page (1-200)'),
};

export const digitalOceanCreateSshKey = tool({
  description:
    'Register an SSH public key (OpenSSH format) with the account so new Droplets can embed it for secure access. The key must not already exist on the account.',
  inputSchema: z.object({
    ...authField,
    name: z.string().describe("Key name for identification (e.g. 'laptop-key')"),
    publicKey: z
      .string()
      .describe('Full public key in OpenSSH format (ssh-rsa, ssh-ed25519, etc.) with key data'),
  }),
  execute: async ({ digitalOceanApiKey, name, publicKey }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'POST', '/account/keys', {
        body: { name, public_key: publicKey },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to create SSH key');
    }
  },
});

export const digitalOceanListSshKeys = tool({
  description:
    'List account SSH keys with IDs, names, key material, and fingerprints. Use to find a key ID for Droplet creation.',
  inputSchema: z.object({
    ...authField,
    ...paginationFields,
  }),
  execute: async ({ digitalOceanApiKey, page, perPage }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      return await digitalOceanRequest(digitalOceanApiKey, 'GET', '/account/keys', {
        query: { page, per_page: perPage },
      });
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to list SSH keys');
    }
  },
});

export const digitalOceanDeleteSshKey = tool({
  description:
    'Remove an SSH key from the account by numeric ID or fingerprint after confirming ownership. Existing Droplets keep their embedded keys.',
  inputSchema: z.object({
    ...authField,
    keyIdOrFingerprint: z.string().describe('Numeric key ID or key fingerprint to delete'),
  }),
  execute: async ({ digitalOceanApiKey, keyIdOrFingerprint }) => {
    try {
      if (!digitalOceanApiKey) return missingKey();
      await digitalOceanRequest(
        digitalOceanApiKey,
        'DELETE',
        `/account/keys/${encodeURIComponent(keyIdOrFingerprint)}`,
      );
      return { success: true, message: `SSH key ${keyIdOrFingerprint} deleted.` };
    } catch (error) {
      return toDigitalOceanError(error, 'Failed to delete SSH key');
    }
  },
});
