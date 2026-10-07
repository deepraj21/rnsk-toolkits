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

export const synkListProjects = tool({
  description:
    'List projects in an org with filters (name, type, target, tags, attributes) and issue/dependency counts. Use to discover project IDs.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    names: z.string().optional().describe('Filter by project names'),
    namesStartWith: z.string().optional().describe('Name prefix filter'),
    types: z.string().optional().describe('Project types filter'),
    targetReference: z
      .string()
      .optional()
      .describe('Target reference filter (URL-encode if needed)'),
    tags: z.string().optional().describe('Tags filter'),
    environment: z.string().optional().describe('Environment attribute filter'),
    lifecycle: z.string().optional().describe('Lifecycle attribute filter'),
    businessCriticality: z.string().optional().describe('Criticality attribute filter'),
    latestIssueCounts: z.boolean().optional().describe('Include latest issue counts'),
    latestDependencyTotal: z.boolean().optional().describe('Include dependency totals'),
    limit: z.number().int().min(1).optional().describe('Results per page'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version, ...filters }) => {
    try {
      const query: Record<string, unknown> = {
        names: filters.names,
        names_start_with: filters.namesStartWith,
        types: filters.types,
        target_reference: filters.targetReference,
        tags: filters.tags,
        environment: filters.environment,
        lifecycle: filters.lifecycle,
        business_criticality: filters.businessCriticality,
        'meta.latest_issue_counts': filters.latestIssueCounts,
        'meta.latest_dependency_total': filters.latestDependencyTotal,
        limit: filters.limit,
      };
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/projects`, {
        version,
        query,
      });
      if (!result.ok) return failedResult('Failed to list projects', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing projects');
    }
  },
});

export const synkGetProject = tool({
  description: 'Get one project with settings, target, and import metadata.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    projectId: z.string().describe('Project ID (UUID)'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, projectId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/projects/${projectId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get project', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting project');
    }
  },
});

export const synkUpdateProject = tool({
  description:
    'Patch project attributes (name, tags, business criticality, environment, lifecycle).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    projectId: z.string().describe('Project ID (UUID)'),
    attributes: z.record(z.string(), z.any()).describe('Attributes to update'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, projectId, attributes, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/projects/${projectId}`, {
        method: 'PATCH',
        version,
        body: { data: { type: 'project', id: projectId, attributes } },
      });
      if (!result.ok) return failedResult('Failed to update project', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating project');
    }
  },
});

export const synkDeleteProject = tool({
  description: 'Delete a project and its test history. Cannot be undone.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    projectId: z.string().describe('Project ID (UUID)'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, projectId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/projects/${projectId}`, {
        method: 'DELETE',
        version,
      });
      if (!result.ok) return failedResult('Failed to delete project', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting project');
    }
  },
});

export const synkBulkDeleteProjects = tool({
  description:
    'Delete up to 100 projects at once, optionally excluding their target files from future scans.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    projectIds: z.array(z.string()).min(1).max(100).describe('Project IDs to delete'),
    excludeFromFutureScans: z
      .boolean()
      .optional()
      .describe('Exclude single-file SCM targets from future scans'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, projectIds, excludeFromFutureScans, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/projects/bulk-delete`, {
        method: 'POST',
        version,
        body: {
          data: projectIds.map((id) => ({ type: 'project', id })),
          ...(excludeFromFutureScans !== undefined
            ? { meta: { exclude_from_future_scans: excludeFromFutureScans } }
            : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to bulk delete projects', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error bulk deleting projects');
    }
  },
});

export const synkListTargets = tool({
  description:
    'List scan targets (repos, images, IaC sources) with URL, source, and privacy filters.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    url: z.string().optional().describe('Filter by remote URL'),
    displayName: z.string().optional().describe('Display name prefix filter'),
    sourceTypes: z.string().optional().describe('Source types filter'),
    excludeEmpty: z.boolean().optional().describe('Only targets that have projects'),
    limit: z.number().int().min(1).optional().describe('Results per page'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version, ...f }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/targets`, {
        version,
        query: {
          url: f.url,
          display_name: f.displayName,
          source_types: f.sourceTypes,
          exclude_empty: f.excludeEmpty,
          limit: f.limit,
        },
      });
      if (!result.ok) return failedResult('Failed to list targets', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing targets');
    }
  },
});

export const synkGetTarget = tool({
  description: 'Get one target with remote URL and source details.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    targetId: z.string().describe('Target ID (UUID)'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, targetId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/targets/${targetId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get target', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting target');
    }
  },
});

export const synkDeleteTarget = tool({
  description: 'Delete a target and automatically all its projects.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    targetId: z.string().describe('Target ID (UUID)'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, targetId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/targets/${targetId}`, {
        method: 'DELETE',
        version,
      });
      if (!result.ok) return failedResult('Failed to delete target', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting target');
    }
  },
});

export const synkCreateCollection = tool({
  description: 'Create a project collection for grouping (insights association).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    name: z.string().describe('Collection name'),
    description: z.string().optional().describe('Collection description'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, name, description, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/collections`, {
        method: 'POST',
        version,
        body: {
          data: {
            type: 'collection',
            attributes: {
              name,
              ...(description !== undefined ? { description } : {}),
            },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to create collection', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating collection');
    }
  },
});

export const synkListCollections = tool({
  description: 'List project collections with optional name filter and sorting.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    name: z.string().optional().describe('Name substring filter'),
    sort: z.string().optional().describe('Sort attributes'),
    direction: z.enum(['asc', 'desc']).optional().describe('Sort direction'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, name, sort, direction, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/collections`, {
        version,
        query: { name, sort, direction },
      });
      if (!result.ok) return failedResult('Failed to list collections', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing collections');
    }
  },
});

export const synkGetCollection = tool({
  description: 'Get one collection.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    collectionId: z.string().describe('Collection ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, collectionId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/collections/${collectionId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get collection', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting collection');
    }
  },
});

export const synkUpdateCollection = tool({
  description: 'Edit a collection name or description.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    collectionId: z.string().describe('Collection ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, collectionId, name, description, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/collections/${collectionId}`, {
        method: 'PATCH',
        version,
        body: {
          data: {
            type: 'collection',
            id: collectionId,
            attributes: {
              ...(name !== undefined ? { name } : {}),
              ...(description !== undefined ? { description } : {}),
            },
          },
        },
      });
      if (!result.ok) return failedResult('Failed to update collection', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error updating collection');
    }
  },
});

export const synkDeleteCollection = tool({
  description: 'Delete a collection (projects themselves are kept).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    collectionId: z.string().describe('Collection ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, collectionId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/collections/${collectionId}`, {
        method: 'DELETE',
        version,
      });
      if (!result.ok) return failedResult('Failed to delete collection', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error deleting collection');
    }
  },
});

export const synkAddProjectsToCollection = tool({
  description: 'Add projects to a collection for insights grouping.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    collectionId: z.string().describe('Collection ID'),
    projectIds: z.array(z.string()).min(1).describe('Project IDs to add'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, collectionId, projectIds, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/collections/${collectionId}/relationships/projects`,
        {
          method: 'POST',
          version,
          body: { data: projectIds.map((id) => ({ type: 'project', id })) },
        },
      );
      if (!result.ok) return failedResult('Failed to add projects to collection', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error adding projects to collection');
    }
  },
});

export const synkListCollectionProjects = tool({
  description: 'List projects inside a collection.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    collectionId: z.string().describe('Collection ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, collectionId, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/collections/${collectionId}/relationships/projects`,
        { version },
      );
      if (!result.ok) return failedResult('Failed to list collection projects', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing collection projects');
    }
  },
});

export const synkRemoveProjectsFromCollection = tool({
  description: 'Remove projects from a collection (projects themselves are kept).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    collectionId: z.string().describe('Collection ID'),
    projectIds: z.array(z.string()).min(1).describe('Project IDs to remove'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, collectionId, projectIds, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/collections/${collectionId}/relationships/projects`,
        {
          method: 'DELETE',
          version,
          body: { data: projectIds.map((id) => ({ type: 'project', id })) },
        },
      );
      if (!result.ok) return failedResult('Failed to remove projects from collection', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error removing projects from collection');
    }
  },
});
