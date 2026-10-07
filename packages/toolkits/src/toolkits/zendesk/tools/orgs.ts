// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { zendeskRequest, failedResult, toZendeskError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Zendesk credentials JSON with subdomain, plus email+apiToken (API token) or accessToken (OAuth)',
  );

const orgField = z
  .record(z.string(), z.any())
  .describe('Organization object: name, domain_names, details, notes, tags, organization_fields');

export const zendeskListOrganizations = tool({
  description: 'List customer organizations.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/organizations.json');
      if (!result.ok) return failedResult('Failed to list organizations', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing organizations');
    }
  },
});

export const zendeskGetOrganization = tool({
  description: 'Get one organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
  }),
  execute: async ({ zendeskCredentials, organizationId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}.json`,
      );
      if (!result.ok) return failedResult('Failed to get organization', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting organization');
    }
  },
});

export const zendeskCreateOrganization = tool({
  description: 'Create a customer organization with domains and tags.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organization: orgField,
  }),
  execute: async ({ zendeskCredentials, organization }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/organizations.json', {
        method: 'POST',
        body: { organization },
      });
      if (!result.ok) return failedResult('Failed to create organization', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating organization');
    }
  },
});

export const zendeskUpdateOrganization = tool({
  description: 'Update an organization (domains, notes, tags).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
    organization: orgField,
  }),
  execute: async ({ zendeskCredentials, organizationId, organization }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}.json`,
        {
          method: 'PUT',
          body: { organization },
        },
      );
      if (!result.ok) return failedResult('Failed to update organization', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating organization');
    }
  },
});

export const zendeskDeleteOrganization = tool({
  description: 'Delete an organization (users are kept, unassigned).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
  }),
  execute: async ({ zendeskCredentials, organizationId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}.json`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete organization', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting organization');
    }
  },
});

export const zendeskCreateManyOrganizations = tool({
  description: 'Create up to 100 organizations in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizations: z.array(orgField).min(1).max(100).describe('Organizations to create'),
  }),
  execute: async ({ zendeskCredentials, organizations }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/organizations/create_many.json', {
        method: 'POST',
        body: { organizations },
      });
      if (!result.ok) return failedResult('Failed to create organizations', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating organizations');
    }
  },
});

export const zendeskUpdateManyOrganizations = tool({
  description: 'Update up to 100 organizations by ID in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ids: z.array(z.number().int()).min(1).max(100).describe('Organization IDs'),
    organization: orgField,
  }),
  execute: async ({ zendeskCredentials, ids, organization }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/organizations/update_many.json', {
        method: 'PUT',
        query: { ids },
        body: { organization },
      });
      if (!result.ok) return failedResult('Failed to update organizations', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating organizations');
    }
  },
});

export const zendeskDeleteManyOrganizations = tool({
  description: 'Delete up to 100 organizations by ID in one call.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    ids: z.array(z.number().int()).min(1).max(100).describe('Organization IDs'),
  }),
  execute: async ({ zendeskCredentials, ids }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/organizations/destroy_many.json', {
        method: 'DELETE',
        query: { ids },
      });
      if (!result.ok) return failedResult('Failed to delete organizations', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting organizations');
    }
  },
});

export const zendeskListOrganizationMemberships = tool({
  description: 'List user memberships of an organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
  }),
  execute: async ({ zendeskCredentials, organizationId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}/memberships.json`,
      );
      if (!result.ok) return failedResult('Failed to list organization memberships', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing organization memberships');
    }
  },
});

export const zendeskCreateOrganizationMembership = tool({
  description: 'Add a user to an organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    userId: z.number().int().describe('User ID'),
    organizationId: z.number().int().describe('Organization ID'),
    default: z.boolean().optional().describe('Make it the default organization'),
  }),
  execute: async ({ zendeskCredentials, userId, organizationId, default: isDefault }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/organization_memberships.json', {
        method: 'POST',
        body: {
          organization_membership: {
            user_id: userId,
            organization_id: organizationId,
            ...(isDefault !== undefined ? { default: isDefault } : {}),
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create organization membership', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating organization membership');
    }
  },
});

export const zendeskMakeOrganizationMembershipDefault = tool({
  description: 'Make an organization membership the default of a user.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    membershipId: z.number().int().describe('Organization membership ID'),
  }),
  execute: async ({ zendeskCredentials, membershipId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organization_memberships/${membershipId}/make_default.json`,
        { method: 'PUT' },
      );
      if (!result.ok) return failedResult('Failed to make organization membership default', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error making organization membership default');
    }
  },
});

export const zendeskDeleteOrganizationMembership = tool({
  description: 'Remove a user from an organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    membershipId: z.number().int().describe('Organization membership ID'),
  }),
  execute: async ({ zendeskCredentials, membershipId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organization_memberships/${membershipId}.json`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete organization membership', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting organization membership');
    }
  },
});

export const zendeskListOrganizationTags = tool({
  description: 'List tags used on an organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
  }),
  execute: async ({ zendeskCredentials, organizationId }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}/tags.json`,
      );
      if (!result.ok) return failedResult('Failed to list organization tags', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing organization tags');
    }
  },
});

export const zendeskSetOrganizationTags = tool({
  description: 'Replace all tags on an organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
    tags: z.array(z.string()).describe('Full tag list'),
  }),
  execute: async ({ zendeskCredentials, organizationId, tags }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}/tags.json`,
        {
          method: 'PUT',
          body: { tags },
        },
      );
      if (!result.ok) return failedResult('Failed to set organization tags', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error setting organization tags');
    }
  },
});

export const zendeskAddOrganizationTags = tool({
  description: 'Add tags to an organization without removing existing ones.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
    tags: z.array(z.string()).min(1).describe('Tags to add'),
  }),
  execute: async ({ zendeskCredentials, organizationId, tags }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}/tags.json`,
        {
          method: 'POST',
          body: { tags },
        },
      );
      if (!result.ok) return failedResult('Failed to add organization tags', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error adding organization tags');
    }
  },
});

export const zendeskRemoveOrganizationTags = tool({
  description: 'Remove tags from an organization.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    organizationId: z.number().int().describe('Organization ID'),
    tags: z.array(z.string()).min(1).describe('Tags to remove'),
  }),
  execute: async ({ zendeskCredentials, organizationId, tags }) => {
    try {
      const result = await zendeskRequest(
        zendeskCredentials,
        `/organizations/${organizationId}/tags.json`,
        {
          method: 'DELETE',
          body: { tags },
        },
      );
      if (!result.ok) return failedResult('Failed to remove organization tags', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error removing organization tags');
    }
  },
});

export const zendeskListGroups = tool({
  description: 'List agent groups. Use to discover group IDs for assignment.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/groups.json');
      if (!result.ok) return failedResult('Failed to list groups', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing groups');
    }
  },
});

export const zendeskListAssignableGroups = tool({
  description: 'List groups the current user can assign tickets to.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
  }),
  execute: async ({ zendeskCredentials }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/groups/assignable.json');
      if (!result.ok) return failedResult('Failed to list assignable groups', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error listing assignable groups');
    }
  },
});

export const zendeskGetGroup = tool({
  description: 'Get one agent group.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    groupId: z.number().int().describe('Group ID'),
  }),
  execute: async ({ zendeskCredentials, groupId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/groups/${groupId}.json`);
      if (!result.ok) return failedResult('Failed to get group', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error getting group');
    }
  },
});

export const zendeskCreateGroup = tool({
  description: 'Create an agent group.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    name: z.string().describe('Group name'),
  }),
  execute: async ({ zendeskCredentials, name }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, '/groups.json', {
        method: 'POST',
        body: { group: { name } },
      });
      if (!result.ok) return failedResult('Failed to create group', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error creating group');
    }
  },
});

export const zendeskUpdateGroup = tool({
  description: 'Rename an agent group.',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    groupId: z.number().int().describe('Group ID'),
    name: z.string().describe('New group name'),
  }),
  execute: async ({ zendeskCredentials, groupId, name }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/groups/${groupId}.json`, {
        method: 'PUT',
        body: { group: { name } },
      });
      if (!result.ok) return failedResult('Failed to update group', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error updating group');
    }
  },
});

export const zendeskDeleteGroup = tool({
  description: 'Delete an agent group (tickets stay, unassigned from the group).',
  inputSchema: z.object({
    zendeskCredentials: credentialsField,
    groupId: z.number().int().describe('Group ID'),
  }),
  execute: async ({ zendeskCredentials, groupId }) => {
    try {
      const result = await zendeskRequest(zendeskCredentials, `/groups/${groupId}.json`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete group', result);
      return result.data;
    } catch (error) {
      return toZendeskError(error, 'Error deleting group');
    }
  },
});
