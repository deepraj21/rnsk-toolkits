// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { rabbitmqRequest, seg, failedResult, toRabbitmqError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'RabbitMQ credentials JSON with baseUrl (management URL, e.g. http://localhost:15672), username, password',
  );
const vhostField = z.string().describe('Virtual host (default vhost is /)');

export const rabbitmqListVhosts = tool({
  description: 'List virtual hosts with message stats and metadata. Use to discover vhosts.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/vhosts');
      if (!result.ok) return failedResult('Failed to list vhosts', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing vhosts');
    }
  },
});

export const rabbitmqGetVhost = tool({
  description: 'Get one vhost with metadata, tags, and cluster state.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/vhosts/${seg(vhost)}`);
      if (!result.ok) return failedResult('Failed to get vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting vhost');
    }
  },
});

export const rabbitmqCreateVhost = tool({
  description: 'Create a virtual host with optional description and tags. Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: z.string().describe('New vhost name'),
    description: z.string().optional().describe('Vhost description'),
    tags: z.string().optional().describe('Comma-separated tags'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, description, tags }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/vhosts/${seg(vhost)}`, {
        method: 'PUT',
        body: {
          ...(description !== undefined ? { description } : {}),
          ...(tags !== undefined ? { tags } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error creating vhost');
    }
  },
});

export const rabbitmqDeleteVhost = tool({
  description: 'Delete a vhost and everything inside it. Requires admin. Cannot be undone.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/vhosts/${seg(vhost)}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete vhost', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting vhost');
    }
  },
});

export const rabbitmqListVhostPermissions = tool({
  description: 'List all user permissions granted on one vhost. Use to audit access.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
  }),
  execute: async ({ rabbitmqCredentials, vhost }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/vhosts/${seg(vhost)}/permissions`,
      );
      if (!result.ok) return failedResult('Failed to list vhost permissions', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing vhost permissions');
    }
  },
});

export const rabbitmqListUsers = tool({
  description: 'List users with tags and password hashing info. Requires admin (monitor tag).',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/users');
      if (!result.ok) return failedResult('Failed to list users', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing users');
    }
  },
});

export const rabbitmqGetUser = tool({
  description: 'Get one user with tags.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ rabbitmqCredentials, username }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/users/${seg(username)}`);
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting user');
    }
  },
});

export const rabbitmqCreateUser = tool({
  description:
    'Create or update a user: password and comma-separated tags (e.g. administrator, monitoring, management). Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    username: z.string().describe('Username'),
    password: z.string().describe('Password'),
    tags: z.string().optional().describe('Comma-separated tags, e.g. monitoring,management'),
  }),
  execute: async ({ rabbitmqCredentials, username, password, tags }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/users/${seg(username)}`, {
        method: 'PUT',
        body: {
          password,
          ...(tags !== undefined ? { tags } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create user', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error creating user');
    }
  },
});

export const rabbitmqDeleteUser = tool({
  description: 'Delete a user. Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ rabbitmqCredentials, username }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, `/users/${seg(username)}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete user', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting user');
    }
  },
});

export const rabbitmqListUserPermissions = tool({
  description: 'List all vhost permissions of one user.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ rabbitmqCredentials, username }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/users/${seg(username)}/permissions`,
      );
      if (!result.ok) return failedResult('Failed to list user permissions', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing user permissions');
    }
  },
});

export const rabbitmqListPermissions = tool({
  description: 'List all configure/write/read permissions across vhosts and users.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/permissions');
      if (!result.ok) return failedResult('Failed to list permissions', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing permissions');
    }
  },
});

export const rabbitmqGetPermission = tool({
  description: 'Get the permission of one user on one vhost.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, username }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/permissions/${seg(vhost)}/${seg(username)}`,
      );
      if (!result.ok) return failedResult('Failed to get permission', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting permission');
    }
  },
});

export const rabbitmqSetPermission = tool({
  description:
    'Grant a user configure/write/read regex permissions on a vhost (".*" for full access). Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    username: z.string().describe('Username'),
    configure: z.string().describe('Configure regex, e.g. .*'),
    write: z.string().describe('Write regex, e.g. .*'),
    read: z.string().describe('Read regex, e.g. .*'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, username, configure, write, read }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/permissions/${seg(vhost)}/${seg(username)}`,
        { method: 'PUT', body: { configure, write, read } },
      );
      if (!result.ok) return failedResult('Failed to set permission', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting permission');
    }
  },
});

export const rabbitmqDeletePermission = tool({
  description: 'Remove a user permission on a vhost. Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, username }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/permissions/${seg(vhost)}/${seg(username)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete permission', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting permission');
    }
  },
});

export const rabbitmqListTopicPermissions = tool({
  description: 'List topic (exchange routing-key) permissions across vhosts and users.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/topic-permissions');
      if (!result.ok) return failedResult('Failed to list topic permissions', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing topic permissions');
    }
  },
});

export const rabbitmqGetTopicPermission = tool({
  description: 'Get the topic permission of one user on one vhost.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, username }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/topic-permissions/${seg(vhost)}/${seg(username)}`,
      );
      if (!result.ok) return failedResult('Failed to get topic permission', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting topic permission');
    }
  },
});

export const rabbitmqSetTopicPermission = tool({
  description:
    'Grant a user topic permission (exchange + read/write routing-key regexes) on a vhost. Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    username: z.string().describe('Username'),
    exchange: z.string().describe('Exchange name regex, e.g. .*'),
    write: z.string().describe('Write routing-key regex'),
    read: z.string().describe('Read routing-key regex'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, username, exchange, write, read }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/topic-permissions/${seg(vhost)}/${seg(username)}`,
        { method: 'PUT', body: { exchange, write, read } },
      );
      if (!result.ok) return failedResult('Failed to set topic permission', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting topic permission');
    }
  },
});

export const rabbitmqDeleteTopicPermission = tool({
  description: 'Remove a user topic permission on a vhost. Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    vhost: vhostField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ rabbitmqCredentials, vhost, username }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/topic-permissions/${seg(vhost)}/${seg(username)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete topic permission', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting topic permission');
    }
  },
});

export const rabbitmqListUserLimits = tool({
  description: 'List configured per-user connection/channel limits.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
  }),
  execute: async ({ rabbitmqCredentials }) => {
    try {
      const result = await rabbitmqRequest(rabbitmqCredentials, '/user-limits');
      if (!result.ok) return failedResult('Failed to list user limits', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error listing user limits');
    }
  },
});

export const rabbitmqGetUserLimit = tool({
  description: 'Get one user limit (max-connections or max-channels) value.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    username: z.string().describe('Username'),
    limitName: z.enum(['max-connections', 'max-channels']).describe('Limit name'),
  }),
  execute: async ({ rabbitmqCredentials, username, limitName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/user-limits/${seg(username)}/${seg(limitName)}`,
      );
      if (!result.ok) return failedResult('Failed to get user limit', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error getting user limit');
    }
  },
});

export const rabbitmqSetUserLimit = tool({
  description:
    'Set a per-user connection or channel limit. Use -1 or 0 semantics per broker docs to clear; requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    username: z.string().describe('Username'),
    limitName: z.enum(['max-connections', 'max-channels']).describe('Limit name'),
    value: z.number().int().describe('Limit value'),
  }),
  execute: async ({ rabbitmqCredentials, username, limitName, value }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/user-limits/${seg(username)}/${seg(limitName)}`,
        { method: 'PUT', body: { value } },
      );
      if (!result.ok) return failedResult('Failed to set user limit', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error setting user limit');
    }
  },
});

export const rabbitmqDeleteUserLimit = tool({
  description: 'Delete (clear) a per-user limit. Requires admin.',
  inputSchema: z.object({
    rabbitmqCredentials: credentialsField,
    username: z.string().describe('Username'),
    limitName: z.enum(['max-connections', 'max-channels']).describe('Limit name'),
  }),
  execute: async ({ rabbitmqCredentials, username, limitName }) => {
    try {
      const result = await rabbitmqRequest(
        rabbitmqCredentials,
        `/user-limits/${seg(username)}/${seg(limitName)}`,
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete user limit', result);
      return result.data;
    } catch (error) {
      return toRabbitmqError(error, 'Error deleting user limit');
    }
  },
});
