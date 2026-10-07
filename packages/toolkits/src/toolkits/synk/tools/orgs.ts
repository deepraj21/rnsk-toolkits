// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { synkRest, failedResult, toSynkError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Synk credentials JSON with apiKey (Snyk API token) and optional baseUrl for the region (default https://api.snyk.io)',
  );
const orgIdField = z.string().describe('Organization ID (UUID from Organization Settings)');
const versionField = z
  .string()
  .optional()
  .describe('REST API version date, e.g. 2024-10-15 (defaults to 2024-10-15)');

export const synkListOrgs = tool({
  description: 'List organizations accessible to the token. Use to discover org IDs.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, version }) => {
    try {
      const result = await synkRest(synkCredentials, '/orgs', { version });
      if (!result.ok) return failedResult('Failed to list organizations', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing organizations');
    }
  },
});

export const synkGetOrg = tool({
  description: 'Get one organization (beta endpoint).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}`, { version });
      if (!result.ok) return failedResult('Failed to get organization', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting organization');
    }
  },
});

export const synkUpdateOrg = tool({
  description: 'Update organization attributes (name, slug).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    org: z.record(z.string(), z.any()).describe('JSON:API attributes to update, e.g. {name, slug}'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, org, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}`, {
        method: 'PATCH',
        version,
        body: { data: { type: 'org', id: orgId, attributes: org } },
      });
      if (!result.ok) return failedResult('Failed to update organization', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating organization');
    }
  },
});

export const synkCreateOrgMembership = tool({
  description: 'Create an org membership for a user with a role (admin, collaborator, viewer).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    userId: z.string().describe('User public ID'),
    role: z.string().describe('Role, e.g. admin'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, userId, role, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/memberships`, {
        method: 'POST',
        version,
        body: {
          data: {
            type: 'membership',
            attributes: { role },
            relationships: { user: { data: { type: 'user', id: userId } } },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create org membership', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating org membership');
    }
  },
});

export const synkListOrgMemberships = tool({
  description: 'List memberships of an organization with roles.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    sortBy: z.string().optional().describe('Sort column'),
    sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, sortBy, sortOrder, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/memberships`, {
        version,
        query: { sort_by: sortBy, sort_order: sortOrder },
      });
      if (!result.ok) return failedResult('Failed to list org memberships', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing org memberships');
    }
  },
});

export const synkUpdateOrgMembership = tool({
  description: 'Update a role of an org membership.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    membershipId: z.string().describe('Membership ID'),
    role: z.string().describe('New role'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, membershipId, role, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/memberships/${membershipId}`, {
        method: 'PATCH',
        version,
        body: { data: { type: 'membership', id: membershipId, attributes: { role } } },
      });
      if (!result.ok) return failedResult('Failed to update org membership', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating org membership');
    }
  },
});

export const synkDeleteOrgMembership = tool({
  description: 'Delete (remove) an org membership.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    membershipId: z.string().describe('Membership ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, membershipId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/memberships/${membershipId}`, {
        method: 'DELETE',
        version,
      });
      if (!result.ok) return failedResult('Failed to delete org membership', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting org membership');
    }
  },
});

export const synkListGroups = tool({
  description: 'List groups accessible to the token.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, version }) => {
    try {
      const result = await synkRest(synkCredentials, '/groups', { version });
      if (!result.ok) return failedResult('Failed to list groups', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing groups');
    }
  },
});

export const synkGetGroup = tool({
  description: 'Get one group.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/groups/${groupId}`, { version });
      if (!result.ok) return failedResult('Failed to get group', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting group');
    }
  },
});

export const synkListGroupOrgs = tool({
  description: 'List organizations inside a group. Use for org discovery at scale.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/groups/${groupId}/orgs`, { version });
      if (!result.ok) return failedResult('Failed to list group organizations', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing group organizations');
    }
  },
});

export const synkCreateGroupMembership = tool({
  description: 'Create a group membership for a user with a role.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    userId: z.string().describe('User public ID'),
    role: z.string().describe('Role, e.g. admin'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, userId, role, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/groups/${groupId}/memberships`, {
        method: 'POST',
        version,
        body: {
          data: {
            type: 'membership',
            attributes: { role },
            relationships: { user: { data: { type: 'user', id: userId } } },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create group membership', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating group membership');
    }
  },
});

export const synkListGroupMemberships = tool({
  description: 'List memberships of a group.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/groups/${groupId}/memberships`, { version });
      if (!result.ok) return failedResult('Failed to list group memberships', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing group memberships');
    }
  },
});

export const synkUpdateGroupMembership = tool({
  description: 'Update a role of a group membership.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    membershipId: z.string().describe('Membership ID'),
    role: z.string().describe('New role'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, membershipId, role, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/groups/${groupId}/memberships/${membershipId}`,
        {
          method: 'PATCH',
          version,
          body: { data: { type: 'membership', id: membershipId, attributes: { role } } },
        },
      );
      if (!result.ok) return failedResult('Failed to update group membership', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating group membership');
    }
  },
});

export const synkDeleteGroupMembership = tool({
  description: 'Delete (remove) a group membership.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    membershipId: z.string().describe('Membership ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, membershipId, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/groups/${groupId}/memberships/${membershipId}`,
        {
          method: 'DELETE',
          version,
        },
      );
      if (!result.ok) return failedResult('Failed to delete group membership', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting group membership');
    }
  },
});

export const synkGetOrgUser = tool({
  description: 'Get one user in an organization.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    userId: z.string().describe('User ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, userId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/users/${userId}`, { version });
      if (!result.ok) return failedResult('Failed to get org user', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting org user');
    }
  },
});
