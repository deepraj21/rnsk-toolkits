// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pineconeControl, failedResult, toPineconeError } from './client.js';

const apiKeyField = z.string().optional().describe('Injected by system; do not provide');

export const pineconeEmbed = tool({
  description:
    'Generate embeddings for texts with a hosted model (e.g. multilingual-e5-large). Returns values plus token usage.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    model: z.string().describe('Embedding model, e.g. multilingual-e5-large'),
    inputs: z
      .union([z.string(), z.array(z.string()), z.array(z.record(z.string(), z.any()))])
      .describe('Text(s) to embed, or objects for multimodal inputs'),
    parameters: z
      .record(z.string(), z.any())
      .optional()
      .describe('Model params, e.g. {input_type:"passage"|"query", truncate:"END"}'),
  }),
  execute: async ({ pineconeApiKey, model, inputs, parameters }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/embed', {
        method: 'POST',
        body: {
          model,
          inputs,
          ...(parameters !== undefined ? { parameters } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to embed', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error embedding');
    }
  },
});

export const pineconeRerank = tool({
  description:
    'Rerank documents against a query (two-stage retrieval). Returns scored, ordered documents.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    model: z.string().describe('Rerank model, e.g. bge-reranker-v2-m3'),
    query: z.string().describe('Query to rank against'),
    documents: z
      .array(z.union([z.string(), z.record(z.string(), z.any())]))
      .min(1)
      .describe('Documents as strings or objects (default text field scored)'),
    topN: z.number().int().min(1).optional().describe('Top results to return'),
    rankFields: z.array(z.string()).optional().describe('Fields to score, e.g. ["text"]'),
    returnDocuments: z.boolean().optional().describe('Return document bodies'),
    parameters: z
      .record(z.string(), z.any())
      .optional()
      .describe('Model params, e.g. {truncate:"END"}'),
  }),
  execute: async ({
    pineconeApiKey,
    model,
    query,
    documents,
    topN,
    rankFields,
    returnDocuments,
    parameters,
  }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/rerank', {
        method: 'POST',
        body: {
          model,
          query,
          documents,
          ...(topN !== undefined ? { top_n: topN } : {}),
          ...(rankFields !== undefined ? { rank_fields: rankFields } : {}),
          ...(returnDocuments !== undefined ? { return_documents: returnDocuments } : {}),
          ...(parameters !== undefined ? { parameters } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to rerank', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error reranking');
    }
  },
});

export const pineconeListModels = tool({
  description: 'List hosted embedding and rerank models.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
  }),
  execute: async ({ pineconeApiKey }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/models');
      if (!result.ok) return failedResult('Failed to list models', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing models');
    }
  },
});

export const pineconeGetModel = tool({
  description: 'Get one model with supported parameters and vector types.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    modelName: z.string().describe('Model name, e.g. multilingual-e5-large'),
  }),
  execute: async ({ pineconeApiKey, modelName }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/models/${modelName}`);
      if (!result.ok) return failedResult('Failed to get model', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error getting model');
    }
  },
});

export const pineconeListProjects = tool({
  description: 'List projects in the organization.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
  }),
  execute: async ({ pineconeApiKey }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/admin/projects');
      if (!result.ok) return failedResult('Failed to list projects', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing projects');
    }
  },
});

export const pineconeCreateProject = tool({
  description: 'Create a project under an organization.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    name: z.string().describe('Project name'),
    organizationId: z.string().optional().describe('Organization ID'),
  }),
  execute: async ({ pineconeApiKey, name, organizationId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/admin/projects', {
        method: 'POST',
        body: {
          name,
          ...(organizationId !== undefined ? { organization_id: organizationId } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to create project', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error creating project');
    }
  },
});

export const pineconeGetProject = tool({
  description: 'Get one project.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ pineconeApiKey, projectId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/admin/projects/${projectId}`);
      if (!result.ok) return failedResult('Failed to get project', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error getting project');
    }
  },
});

export const pineconeUpdateProject = tool({
  description: 'Update a project name.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    projectId: z.string().describe('Project ID'),
    name: z.string().describe('New project name'),
  }),
  execute: async ({ pineconeApiKey, projectId, name }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/admin/projects/${projectId}`, {
        method: 'PATCH',
        body: { name },
      });
      if (!result.ok) return failedResult('Failed to update project', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error updating project');
    }
  },
});

export const pineconeDeleteProject = tool({
  description: 'Delete a project and its indexes.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ pineconeApiKey, projectId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/admin/projects/${projectId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete project', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error deleting project');
    }
  },
});

export const pineconeListOrganizations = tool({
  description: 'List organizations of the account.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
  }),
  execute: async ({ pineconeApiKey }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, '/admin/organizations');
      if (!result.ok) return failedResult('Failed to list organizations', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing organizations');
    }
  },
});

export const pineconeGetOrganization = tool({
  description: 'Get one organization.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    organizationId: z.string().describe('Organization ID'),
  }),
  execute: async ({ pineconeApiKey, organizationId }) => {
    try {
      const result = await pineconeControl(
        pineconeApiKey,
        `/admin/organizations/${organizationId}`,
      );
      if (!result.ok) return failedResult('Failed to get organization', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error getting organization');
    }
  },
});

export const pineconeUpdateOrganization = tool({
  description: 'Update an organization name.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    organizationId: z.string().describe('Organization ID'),
    name: z.string().describe('New organization name'),
  }),
  execute: async ({ pineconeApiKey, organizationId, name }) => {
    try {
      const result = await pineconeControl(
        pineconeApiKey,
        `/admin/organizations/${organizationId}`,
        {
          method: 'PATCH',
          body: { name },
        },
      );
      if (!result.ok) return failedResult('Failed to update organization', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error updating organization');
    }
  },
});

export const pineconeDeleteOrganization = tool({
  description: 'Delete an organization.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    organizationId: z.string().describe('Organization ID'),
  }),
  execute: async ({ pineconeApiKey, organizationId }) => {
    try {
      const result = await pineconeControl(
        pineconeApiKey,
        `/admin/organizations/${organizationId}`,
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete organization', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error deleting organization');
    }
  },
});

export const pineconeListProjectApiKeys = tool({
  description: 'List API keys of a project (metadata only).',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    projectId: z.string().describe('Project ID'),
  }),
  execute: async ({ pineconeApiKey, projectId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/admin/projects/${projectId}/api-keys`);
      if (!result.ok) return failedResult('Failed to list project API keys', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error listing project API keys');
    }
  },
});

export const pineconeCreateApiKey = tool({
  description: 'Create a project API key. The secret is returned once — store it immediately.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    projectId: z.string().describe('Project ID'),
    name: z.string().optional().describe('Key name'),
    roles: z.array(z.string()).optional().describe('Roles for the key'),
  }),
  execute: async ({ pineconeApiKey, projectId, name, roles }) => {
    try {
      const result = await pineconeControl(
        pineconeApiKey,
        `/admin/projects/${projectId}/api-keys`,
        {
          method: 'POST',
          body: {
            ...(name !== undefined ? { name } : {}),
            ...(roles !== undefined ? { roles } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create API key', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error creating API key');
    }
  },
});

export const pineconeGetApiKey = tool({
  description: 'Get one API key metadata (never the secret).',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    keyId: z.string().describe('API key ID'),
  }),
  execute: async ({ pineconeApiKey, keyId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/admin/api-keys/${keyId}`);
      if (!result.ok) return failedResult('Failed to get API key', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error getting API key');
    }
  },
});

export const pineconeUpdateApiKey = tool({
  description: 'Update an API key name or roles.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    keyId: z.string().describe('API key ID'),
    name: z.string().optional().describe('New key name'),
    roles: z.array(z.string()).optional().describe('New roles'),
  }),
  execute: async ({ pineconeApiKey, keyId, name, roles }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/admin/api-keys/${keyId}`, {
        method: 'PATCH',
        body: {
          ...(name !== undefined ? { name } : {}),
          ...(roles !== undefined ? { roles } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update API key', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error updating API key');
    }
  },
});

export const pineconeDeleteApiKey = tool({
  description: 'Delete (revoke) an API key.',
  inputSchema: z.object({
    pineconeApiKey: apiKeyField,
    keyId: z.string().describe('API key ID'),
  }),
  execute: async ({ pineconeApiKey, keyId }) => {
    try {
      const result = await pineconeControl(pineconeApiKey, `/admin/api-keys/${keyId}`, {
        method: 'DELETE',
      });
      if (!result.ok) return failedResult('Failed to delete API key', result);
      return result.data;
    } catch (error) {
      return toPineconeError(error, 'Error deleting API key');
    }
  },
});
