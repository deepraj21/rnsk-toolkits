// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { elasticRequest, failedResult, toElasticError } from './client.js';

const credentialsField = z
  .string()
  .describe('Elastic credentials JSON with baseUrl plus apiKey, username+password, or bearerToken');

export const elasticListSnapshotRepos = tool({
  description: 'List snapshot repositories with type and settings.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_snapshot');
      if (!result.ok) return failedResult('Failed to list snapshot repos', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing snapshot repos');
    }
  },
});

export const elasticGetSnapshotRepo = tool({
  description: 'Get one snapshot repository configuration.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
  }),
  execute: async ({ elasticCredentials, repository }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_snapshot/${repository}`);
      if (!result.ok) return failedResult('Failed to get snapshot repo', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting snapshot repo');
    }
  },
});

export const elasticCreateSnapshotRepo = tool({
  description:
    'Create a snapshot repository: fs, S3/GCS/Azure with bucket, region, credentials, compression.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
    type: z.string().describe('Type: fs, s3, gcs, azure, url'),
    settings: z
      .record(z.string(), z.any())
      .describe('Type settings: location/bucket/region/client/...'),
    verify: z.boolean().optional().describe('Verify the repository on creation'),
  }),
  execute: async ({ elasticCredentials, repository, type, settings, verify }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_snapshot/${repository}`, {
        method: 'PUT',
        query: { verify },
        body: { type, settings },
      });
      if (!result.ok) return failedResult('Failed to create snapshot repo', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating snapshot repo');
    }
  },
});

export const elasticDeleteSnapshotRepo = tool({
  description: 'Delete a snapshot repository definition (snapshots data stays in storage).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
  }),
  execute: async ({ elasticCredentials, repository }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_snapshot/${repository}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete snapshot repo', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting snapshot repo');
    }
  },
});

export const elasticVerifySnapshotRepo = tool({
  description: 'Verify repository nodes can access snapshot storage.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
  }),
  execute: async ({ elasticCredentials, repository }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_snapshot/${repository}/_verify`, {
        method: 'POST',
      });
      if (!result.ok) return failedResult('Failed to verify snapshot repo', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error verifying snapshot repo');
    }
  },
});

export const elasticListSnapshots = tool({
  description: 'List snapshots in a repository with state and timing.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
  }),
  execute: async ({ elasticCredentials, repository }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_snapshot/${repository}/_all`);
      if (!result.ok) return failedResult('Failed to list snapshots', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing snapshots');
    }
  },
});

export const elasticGetSnapshot = tool({
  description: 'Get one snapshot with indices, state, and failures.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
    snapshot: z.string().describe('Snapshot name'),
  }),
  execute: async ({ elasticCredentials, repository, snapshot }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `/_snapshot/${repository}/${snapshot}`,
      );
      if (!result.ok) return failedResult('Failed to get snapshot', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting snapshot');
    }
  },
});

export const elasticCreateSnapshot = tool({
  description:
    'Take a snapshot of indices (full or partial list), optionally without global state.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
    snapshot: z.string().describe('Snapshot name'),
    indices: z.string().optional().describe('Comma-separated indices (default all)'),
    includeGlobalState: z.boolean().optional().describe('Include cluster state'),
    waitForCompletion: z.boolean().optional().describe('Block until done'),
  }),
  execute: async ({
    elasticCredentials,
    repository,
    snapshot,
    indices,
    includeGlobalState,
    waitForCompletion,
  }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `/_snapshot/${repository}/${snapshot}`,
        {
          method: 'PUT',
          query: { wait_for_completion: waitForCompletion },
          body: {
            ...(indices !== undefined ? { indices } : {}),
            ...(includeGlobalState !== undefined
              ? { include_global_state: includeGlobalState }
              : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create snapshot', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating snapshot');
    }
  },
});

export const elasticDeleteSnapshot = tool({
  description: 'Delete snapshots from a repository.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
    snapshot: z.string().describe('Comma-separated snapshot names'),
  }),
  execute: async ({ elasticCredentials, repository, snapshot }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `/_snapshot/${repository}/${snapshot}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete snapshot', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting snapshot');
    }
  },
});

export const elasticRestoreSnapshot = tool({
  description: 'Restore indices from a snapshot with rename patterns and settings overrides.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().describe('Repository name'),
    snapshot: z.string().describe('Snapshot name'),
    indices: z.string().optional().describe('Comma-separated indices to restore'),
    renamePattern: z.string().optional().describe('Rename regex, e.g. index_(.+)'),
    renameReplacement: z.string().optional().describe('Rename replacement, e.g. restored_index_$1'),
    indexSettings: z.record(z.string(), z.any()).optional().describe('Index settings overrides'),
  }),
  execute: async ({
    elasticCredentials,
    repository,
    snapshot,
    indices,
    renamePattern,
    renameReplacement,
    indexSettings,
  }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `/_snapshot/${repository}/${snapshot}/_restore`,
        {
          method: 'POST',
          body: {
            ...(indices !== undefined ? { indices } : {}),
            ...(renamePattern !== undefined ? { rename_pattern: renamePattern } : {}),
            ...(renameReplacement !== undefined ? { rename_replacement: renameReplacement } : {}),
            ...(indexSettings !== undefined ? { index_settings: indexSettings } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to restore snapshot', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error restoring snapshot');
    }
  },
});

export const elasticGetSnapshotStatus = tool({
  description: 'Get snapshot/restore progress (shards, bytes, timing).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    repository: z.string().optional().describe('Repository name (omit for all)'),
    snapshot: z.string().optional().describe('Snapshot name (omit for all)'),
  }),
  execute: async ({ elasticCredentials, repository, snapshot }) => {
    try {
      const path =
        repository && snapshot
          ? `/_snapshot/${repository}/${snapshot}/_status`
          : repository
            ? `/_snapshot/${repository}/_status`
            : '/_snapshot/_status';
      const result = await elasticRequest(elasticCredentials, path);
      if (!result.ok) return failedResult('Failed to get snapshot status', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting snapshot status');
    }
  },
});

export const elasticCreateApiKey = tool({
  description:
    'Create an API key with role descriptors and expiry. Returns the encoded key once — store it immediately.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    name: z.string().describe('Key name'),
    roleDescriptors: z
      .record(z.string(), z.any())
      .optional()
      .describe('Inline roles {role: {cluster, indices, applications}}'),
    expiration: z.string().optional().describe('Expiry, e.g. 30d'),
  }),
  execute: async ({ elasticCredentials, name, roleDescriptors, expiration }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/api_key', {
        method: 'POST',
        body: {
          name,
          ...(roleDescriptors !== undefined ? { role_descriptors: roleDescriptors } : {}),
          ...(expiration !== undefined ? { expiration } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create API key', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating API key');
    }
  },
});

export const elasticGetApiKey = tool({
  description: 'Get API key metadata (name, creation, expiry, owner). Never returns secrets.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    name: z.string().optional().describe('Key name filter'),
    username: z.string().optional().describe('Owner username filter'),
  }),
  execute: async ({ elasticCredentials, name, username }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/api_key', {
        query: { name, username },
      });
      if (!result.ok) return failedResult('Failed to get API key', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting API key');
    }
  },
});

export const elasticQueryApiKeys = tool({
  description: 'Query API keys with Query DSL filters (expired, owner, name).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    query: z.record(z.string(), z.any()).optional().describe('Query DSL'),
    size: z.number().int().min(1).optional().describe('Results to return'),
  }),
  execute: async ({ elasticCredentials, query, size }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/api_key/query', {
        method: 'POST',
        body: {
          ...(query !== undefined ? { query } : {}),
          ...(size !== undefined ? { size } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to query API keys', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error querying API keys');
    }
  },
});

export const elasticUpdateApiKey = tool({
  description: 'Update API key role descriptors and metadata by ID.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    keyId: z.string().describe('API key ID'),
    roleDescriptors: z.record(z.string(), z.any()).optional().describe('New inline roles'),
    metadata: z.record(z.string(), z.any()).optional().describe('New metadata'),
  }),
  execute: async ({ elasticCredentials, keyId, roleDescriptors, metadata }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_security/api_key/${keyId}`, {
        method: 'PUT',
        body: {
          ...(roleDescriptors !== undefined ? { role_descriptors: roleDescriptors } : {}),
          ...(metadata !== undefined ? { metadata } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update API key', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error updating API key');
    }
  },
});

export const elasticInvalidateApiKeys = tool({
  description: 'Invalidate API keys by ID, name, owner, or realm. Keys stop working immediately.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    ids: z.array(z.string()).optional().describe('Key IDs'),
    name: z.string().optional().describe('Key name'),
    owner: z.boolean().optional().describe('Invalidate keys of the current user'),
    realmName: z.string().optional().describe('Realm name filter'),
    username: z.string().optional().describe('Owner username filter'),
  }),
  execute: async ({ elasticCredentials, ids, name, owner, realmName, username }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/api_key', {
        method: 'DELETE',
        body: {
          ...(ids !== undefined ? { ids } : {}),
          ...(name !== undefined ? { name } : {}),
          ...(owner !== undefined ? { owner } : {}),
          ...(realmName !== undefined ? { realm_name: realmName } : {}),
          ...(username !== undefined ? { username } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to invalidate API keys', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error invalidating API keys');
    }
  },
});

export const elasticListUsers = tool({
  description: 'List native/file users (built-in and created).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/user');
      if (!result.ok) return failedResult('Failed to list users', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing users');
    }
  },
});

export const elasticGetUser = tool({
  description: 'Get one user with roles and metadata.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ elasticCredentials, username }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_security/user/${username}`);
      if (!result.ok) return failedResult('Failed to get user', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting user');
    }
  },
});

export const elasticCreateUser = tool({
  description: 'Create or update a native user (password, roles, full name, email).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    username: z.string().describe('Username'),
    password: z.string().optional().describe('Password (required for new users)'),
    roles: z.array(z.string()).optional().describe('Roles'),
    fullName: z.string().optional().describe('Full name'),
    email: z.string().optional().describe('Email'),
  }),
  execute: async ({ elasticCredentials, username, password, roles, fullName, email }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_security/user/${username}`, {
        method: 'POST',
        body: {
          ...(password !== undefined ? { password } : {}),
          ...(roles !== undefined ? { roles } : {}),
          ...(fullName !== undefined ? { full_name: fullName } : {}),
          ...(email !== undefined ? { email } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create user', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating user');
    }
  },
});

export const elasticDeleteUser = tool({
  description: 'Delete a native user.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    username: z.string().describe('Username'),
  }),
  execute: async ({ elasticCredentials, username }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_security/user/${username}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete user', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting user');
    }
  },
});

export const elasticAuthenticate = tool({
  description: 'Authenticate the current credentials and return username, roles, and realms.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/_authenticate');
      if (!result.ok) return failedResult('Failed to authenticate', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error authenticating');
    }
  },
});

export const elasticListRoles = tool({
  description: 'List roles with cluster/indices/application privileges.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/role');
      if (!result.ok) return failedResult('Failed to list roles', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing roles');
    }
  },
});

export const elasticGetRole = tool({
  description: 'Get one role definition.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    roleName: z.string().describe('Role name'),
  }),
  execute: async ({ elasticCredentials, roleName }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_security/role/${roleName}`);
      if (!result.ok) return failedResult('Failed to get role', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting role');
    }
  },
});

export const elasticCreateRole = tool({
  description: 'Create or update a role (cluster/index/application privileges, metadata).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    roleName: z.string().describe('Role name'),
    role: z
      .record(z.string(), z.any())
      .describe(
        'Role: cluster [], indices [{names, privileges}], applications [{application, privileges, resources}], run_as, metadata',
      ),
  }),
  execute: async ({ elasticCredentials, roleName, role }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_security/role/${roleName}`, {
        method: 'POST',
        body: role,
      });
      if (!result.ok) return failedResult('Failed to create role', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating role');
    }
  },
});

export const elasticDeleteRole = tool({
  description: 'Delete a role.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    roleName: z.string().describe('Role name'),
  }),
  execute: async ({ elasticCredentials, roleName }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_security/role/${roleName}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete role', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting role');
    }
  },
});

export const elasticListRoleMappings = tool({
  description: 'List role mappings (external groups/users to roles).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/role_mapping');
      if (!result.ok) return failedResult('Failed to list role mappings', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing role mappings');
    }
  },
});

export const elasticCreateRoleMapping = tool({
  description: 'Create or update a role mapping (roles + rules for DN/groups/realm).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    mappingName: z.string().describe('Mapping name'),
    roles: z.array(z.string()).describe('Roles to grant'),
    rules: z
      .record(z.string(), z.any())
      .describe('Rules {field: {username, dn, groups, metadata, realm_name}}'),
    enabled: z.boolean().optional().describe('Enable the mapping'),
  }),
  execute: async ({ elasticCredentials, mappingName, roles, rules, enabled }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `/_security/role_mapping/${mappingName}`,
        {
          method: 'POST',
          body: {
            roles,
            rules,
            ...(enabled !== undefined ? { enabled } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create role mapping', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error creating role mapping');
    }
  },
});

export const elasticDeleteRoleMapping = tool({
  description: 'Delete a role mapping.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    mappingName: z.string().describe('Mapping name'),
  }),
  execute: async ({ elasticCredentials, mappingName }) => {
    try {
      const result = await elasticRequest(
        elasticCredentials,
        `/_security/role_mapping/${mappingName}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete role mapping', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting role mapping');
    }
  },
});

export const elasticGetToken = tool({
  description:
    'Get an OAuth2 bearer token via password, client_credentials, or refresh_token grant (for token-based flows).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    grantType: z.enum(['password', 'client_credentials', 'refresh_token']).describe('Grant type'),
    username: z.string().optional().describe('Username (password grant)'),
    password: z.string().optional().describe('Password (password grant)'),
    scope: z.string().optional().describe('Scope'),
    refreshToken: z.string().optional().describe('Refresh token (refresh_token grant)'),
  }),
  execute: async ({ elasticCredentials, grantType, username, password, scope, refreshToken }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/oauth2/token', {
        method: 'POST',
        body: {
          grant_type: grantType,
          ...(username !== undefined ? { username } : {}),
          ...(password !== undefined ? { password } : {}),
          ...(scope !== undefined ? { scope } : {}),
          ...(refreshToken !== undefined ? { refresh_token: refreshToken } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to get token', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting token');
    }
  },
});

export const elasticInvalidateToken = tool({
  description: 'Invalidate OAuth2 access/refresh tokens by token string or owner.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    token: z.string().optional().describe('Access token string to invalidate'),
    refreshToken: z.string().optional().describe('Refresh token string to invalidate'),
    realmName: z.string().optional().describe('Realm filter'),
    username: z.string().optional().describe('Owner username filter'),
  }),
  execute: async ({ elasticCredentials, token, refreshToken, realmName, username }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_security/oauth2/token', {
        method: 'DELETE',
        body: {
          ...(token !== undefined ? { token } : {}),
          ...(refreshToken !== undefined ? { refresh_token: refreshToken } : {}),
          ...(realmName !== undefined ? { realm_name: realmName } : {}),
          ...(username !== undefined ? { username } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to invalidate token', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error invalidating token');
    }
  },
});

export const elasticListIngestPipelines = tool({
  description: 'List ingest pipelines with processors.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
  }),
  execute: async ({ elasticCredentials }) => {
    try {
      const result = await elasticRequest(elasticCredentials, '/_ingest/pipeline');
      if (!result.ok) return failedResult('Failed to list ingest pipelines', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error listing ingest pipelines');
    }
  },
});

export const elasticGetIngestPipeline = tool({
  description: 'Get one ingest pipeline definition.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
  }),
  execute: async ({ elasticCredentials, pipelineId }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_ingest/pipeline/${pipelineId}`);
      if (!result.ok) return failedResult('Failed to get ingest pipeline', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error getting ingest pipeline');
    }
  },
});

export const elasticPutIngestPipeline = tool({
  description: 'Create or update an ingest pipeline (processors: set, grok, date, geoip, ...).',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
    pipeline: z
      .record(z.string(), z.any())
      .describe('Pipeline: description, processors [{set/grok/date/...}], on_failure'),
  }),
  execute: async ({ elasticCredentials, pipelineId, pipeline }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_ingest/pipeline/${pipelineId}`, {
        method: 'PUT',
        body: pipeline,
      });
      if (!result.ok) return failedResult('Failed to put ingest pipeline', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error putting ingest pipeline');
    }
  },
});

export const elasticDeleteIngestPipeline = tool({
  description: 'Delete an ingest pipeline.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pipelineId: z.string().describe('Pipeline ID'),
  }),
  execute: async ({ elasticCredentials, pipelineId }) => {
    try {
      const result = await elasticRequest(elasticCredentials, `/_ingest/pipeline/${pipelineId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete ingest pipeline', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error deleting ingest pipeline');
    }
  },
});

export const elasticSimulatePipeline = tool({
  description: 'Simulate a pipeline against sample docs without indexing. Use to debug processors.',
  inputSchema: z.object({
    elasticCredentials: credentialsField,
    pipelineId: z.string().optional().describe('Pipeline ID (omit to pass pipeline inline)'),
    pipeline: z.record(z.string(), z.any()).optional().describe('Inline pipeline definition'),
    docs: z.array(z.record(z.string(), z.any())).min(1).describe('Sample docs [{_source: {...}}]'),
  }),
  execute: async ({ elasticCredentials, pipelineId, pipeline, docs }) => {
    try {
      const path = pipelineId
        ? `/_ingest/pipeline/${pipelineId}/_simulate`
        : '/_ingest/pipeline/_simulate';
      const result = await elasticRequest(elasticCredentials, path, {
        method: 'POST',
        body: {
          ...(pipeline !== undefined ? { pipeline } : {}),
          docs,
        },
      });
      if (!result.ok) return failedResult('Failed to simulate pipeline', result);
      return result.data;
    } catch (error) {
      return toElasticError(error, 'Error simulating pipeline');
    }
  },
});
