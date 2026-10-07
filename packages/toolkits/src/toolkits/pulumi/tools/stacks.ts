// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { pulumiRequest, failedResult, toPulumiError } from './client.js';

const tokenField = z.string().optional().describe('Injected by system; do not provide');
const orgField = z.string().describe('Organization name');
const projectField = z.string().describe('Project name');
const stackField = z.string().describe('Stack name');

function stackPath(org: string, project: string, stack: string, suffix = '') {
  return `/api/stacks/${org}/${project}/${stack}${suffix}`;
}

export const pulumiCreateStack = tool({
  description: 'Create a stack with optional config, tags, and teams.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    tags: z.record(z.string(), z.string()).optional().describe('Stack tags'),
    teams: z.array(z.string()).optional().describe('Teams to assign'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, tags, teams }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        `/api/stacks/${orgName}/${projectName}`,
        {
          method: 'POST',
          body: {
            stackName,
            ...(tags !== undefined ? { tags } : {}),
            ...(teams !== undefined ? { teams } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create stack', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error creating stack');
    }
  },
});

export const pulumiGetStack = tool({
  description: 'Get a stack with resources summary, tags, and teams.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName),
      );
      if (!result.ok) return failedResult('Failed to get stack', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting stack');
    }
  },
});

export const pulumiDeleteStack = tool({
  description: 'Delete a stack and its history. Resources must be destroyed first.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName),
        {
          method: 'DELETE',
        },
      );
      if (!result.ok) return failedResult('Failed to delete stack', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error deleting stack');
    }
  },
});

export const pulumiGetStackActivity = tool({
  description: 'Get recent stack activity (updates, deployments, changes).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/activity'),
      );
      if (!result.ok) return failedResult('Failed to get stack activity', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting stack activity');
    }
  },
});

export const pulumiListStackCollaborators = tool({
  description: 'List users with access to a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/collaborators'),
      );
      if (!result.ok) return failedResult('Failed to list stack collaborators', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing stack collaborators');
    }
  },
});

export const pulumiGetStackConfig = tool({
  description: 'Get stack configuration (ESC environment reference).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/config'),
      );
      if (!result.ok) return failedResult('Failed to get stack config', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting stack config');
    }
  },
});

export const pulumiSetStackConfig = tool({
  description: 'Set stack configuration (ESC environment reference).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    environment: z.string().describe('ESC environment reference, e.g. org/project/env'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, environment }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/config'),
        { method: 'PUT', body: { environment } },
      );
      if (!result.ok) return failedResult('Failed to set stack config', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error setting stack config');
    }
  },
});

export const pulumiDeleteStackConfig = tool({
  description: 'Delete stack configuration.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/config'),
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete stack config', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error deleting stack config');
    }
  },
});

export const pulumiGetStackOutputs = tool({
  description: 'Get stack outputs from the latest deployment.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/outputs'),
      );
      if (!result.ok) return failedResult('Failed to get stack outputs', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting stack outputs');
    }
  },
});

export const pulumiGetStackMetadata = tool({
  description: 'Get stack metadata (repo, branch, runtime).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/metadata'),
      );
      if (!result.ok) return failedResult('Failed to get stack metadata', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting stack metadata');
    }
  },
});

export const pulumiRenameStack = tool({
  description: 'Rename a stack and/or move it to another project.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    newName: z.string().describe('New stack name'),
    newProject: z.string().describe('New project name'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, newName, newProject }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/rename'),
        { method: 'POST', body: { newName, newProject } },
      );
      if (!result.ok) return failedResult('Failed to rename stack', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error renaming stack');
    }
  },
});

export const pulumiTransferStack = tool({
  description: 'Transfer a stack to another organization.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    toOrg: z.string().describe('Destination organization'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, toOrg }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/transfer'),
        { method: 'POST', body: { toOrg } },
      );
      if (!result.ok) return failedResult('Failed to transfer stack', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error transferring stack');
    }
  },
});

export const pulumiGetStackTags = tool({
  description: 'Get stack tags (key/value metadata) from the stack record.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName),
      );
      if (!result.ok) return failedResult('Failed to get stack tags', result);
      return (result.data as any)?.tags ?? result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting stack tags');
    }
  },
});

export const pulumiSetStackTags = tool({
  description:
    'Replace all stack tags with the provided map (wholesale replacement; omitted keys are removed).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    tags: z.record(z.string(), z.string()).describe('Tags to set'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, tags }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/tags'),
        { method: 'PATCH', body: tags },
      );
      if (!result.ok) return failedResult('Failed to set stack tags', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error setting stack tags');
    }
  },
});

export const pulumiDeleteStackTag = tool({
  description: 'Delete one stack tag.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    tagName: z.string().describe('Tag key to delete'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, tagName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/tags/${tagName}`),
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete stack tag', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error deleting stack tag');
    }
  },
});

export const pulumiGetStackTeams = tool({
  description: 'List teams with access to a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/teams'),
      );
      if (!result.ok) return failedResult('Failed to get stack teams', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting stack teams');
    }
  },
});

export const pulumiTriggerUpdate = tool({
  description:
    'Create a stack update record for preview, update (pulumi up), destroy, or refresh. The update must be started separately by the Pulumi engine or Deployments.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    operation: z.enum(['update', 'preview', 'destroy', 'refresh']).describe('Operation to run'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, operation }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(
          orgName,
          projectName,
          stackName,
          operation === 'update' ? '/update' : `/${operation}`,
        ),
        { method: 'POST' },
      );
      if (!result.ok) return failedResult(`Failed to trigger ${operation}`, result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, `Error triggering ${operation}`);
    }
  },
});

export const pulumiListUpdates = tool({
  description: 'List update history of a stack (versions, kinds, results).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    page: z.number().int().optional().describe('Page index (0 returns all results)'),
    pageSize: z.number().int().optional().describe('Results per page when page > 0'),
    outputType: z.string().optional().describe('Set for paginated response format'),
  }),
  execute: async ({
    pulumiAccessToken,
    orgName,
    projectName,
    stackName,
    page,
    pageSize,
    outputType,
  }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/updates'),
        {
          query: {
            page,
            pageSize,
            'output-type': outputType,
          },
        },
      );
      if (!result.ok) return failedResult('Failed to list updates', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing updates');
    }
  },
});

export const pulumiGetLatestUpdate = tool({
  description: 'Get the latest update of a stack with status and result.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/updates/latest'),
      );
      if (!result.ok) return failedResult('Failed to get latest update', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting latest update');
    }
  },
});

export const pulumiGetUpdate = tool({
  description: 'Get one update by version with events summary.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    version: z.number().int().describe('Update version number'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, version }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/updates/${version}`),
      );
      if (!result.ok) return failedResult('Failed to get update', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting update');
    }
  },
});

export const pulumiCancelUpdate = tool({
  description: 'Cancel an in-progress preview/update/destroy/refresh operation.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    operation: z.enum(['update', 'preview', 'destroy', 'refresh']).describe('Operation type'),
    updateId: z.string().describe('Update ID to cancel'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, operation, updateId }) => {
    try {
      const suffix =
        operation === 'update' ? `/update/${updateId}/cancel` : `/${operation}/${updateId}/cancel`;
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, suffix),
        {
          method: 'POST',
        },
      );
      if (!result.ok) return failedResult('Failed to cancel update', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error canceling update');
    }
  },
});

export const pulumiGetResourceCount = tool({
  description: 'Count resources in the latest stack deployment by type.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/resources/count'),
      );
      if (!result.ok) return failedResult('Failed to count resources', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error counting resources');
    }
  },
});

export const pulumiGetLatestResources = tool({
  description: 'List resources in the latest stack deployment.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/resources/latest'),
      );
      if (!result.ok) return failedResult('Failed to get latest resources', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting latest resources');
    }
  },
});

export const pulumiGetResource = tool({
  description: 'Get one resource by URN from the latest deployment.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    urn: z.string().describe('Resource URN'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, urn }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/resources/latest/${encodeURIComponent(urn)}`),
      );
      if (!result.ok) return failedResult('Failed to get resource', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting resource');
    }
  },
});

export const pulumiExportStack = tool({
  description: 'Export the latest stack deployment (state JSON).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/export'),
      );
      if (!result.ok) return failedResult('Failed to export stack', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error exporting stack');
    }
  },
});

export const pulumiImportStack = tool({
  description: 'Import stack state from an export file (migration).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    deployment: z.record(z.string(), z.any()).describe('Deployment state object from Export Stack'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, deployment }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/import'),
        { method: 'POST', body: deployment },
      );
      if (!result.ok) return failedResult('Failed to import stack', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error importing stack');
    }
  },
});

export const pulumiGetDriftStatus = tool({
  description: 'Get drift detection status of a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/drift/status'),
      );
      if (!result.ok) return failedResult('Failed to get drift status', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting drift status');
    }
  },
});

export const pulumiListDriftRuns = tool({
  description: 'List drift detection runs of a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/drift/runs'),
      );
      if (!result.ok) return failedResult('Failed to list drift runs', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing drift runs');
    }
  },
});

export const pulumiListDeployments = tool({
  description: 'List Pulumi Deployments (CI-driven runs) of a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/deployments'),
      );
      if (!result.ok) return failedResult('Failed to list deployments', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing deployments');
    }
  },
});

export const pulumiGetDeployment = tool({
  description: 'Get one deployment with status and logs link.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    deploymentId: z.string().describe('Deployment ID'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, deploymentId }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/deployments/${deploymentId}`),
      );
      if (!result.ok) return failedResult('Failed to get deployment', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting deployment');
    }
  },
});

export const pulumiCancelDeployment = tool({
  description: 'Cancel a running deployment.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    deploymentId: z.string().describe('Deployment ID'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, deploymentId }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/deployments/${deploymentId}/cancel`),
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to cancel deployment', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error canceling deployment');
    }
  },
});

export const pulumiGetDeploymentLogs = tool({
  description: 'Get logs of a deployment.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    deploymentId: z.string().describe('Deployment ID'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, deploymentId }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/deployments/${deploymentId}/logs`),
      );
      if (!result.ok) return failedResult('Failed to get deployment logs', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting deployment logs');
    }
  },
});

export const pulumiGetDeploymentSettings = tool({
  description: 'Get deployment settings (git source, operation, schedules) of a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/deployments/settings'),
      );
      if (!result.ok) return failedResult('Failed to get deployment settings', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error getting deployment settings');
    }
  },
});

export const pulumiSetDeploymentSettings = tool({
  description:
    'Configure deployment settings: git source, operation (update/preview/destroy), schedules, TTL.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    settings: z
      .record(z.string(), z.any())
      .describe('DeploymentSettingsRequest: sourceContext {git}, operationContext, schedules, ttl'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, settings }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/deployments/settings'),
        { method: 'POST', body: settings },
      );
      if (!result.ok) return failedResult('Failed to set deployment settings', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error setting deployment settings');
    }
  },
});

export const pulumiPauseDeployments = tool({
  description: 'Pause scheduled deployments of a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/deployments/pause'),
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to pause deployments', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error pausing deployments');
    }
  },
});

export const pulumiResumeDeployments = tool({
  description: 'Resume scheduled deployments of a stack.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/deployments/resume'),
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to resume deployments', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error resuming deployments');
    }
  },
});

export const pulumiListWebhooks = tool({
  description: 'List stack webhooks (payload URLs notified on updates).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/hooks'),
      );
      if (!result.ok) return failedResult('Failed to list webhooks', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error listing webhooks');
    }
  },
});

export const pulumiCreateWebhook = tool({
  description: 'Create a stack webhook (payload URL, secret, active).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    payloadUrl: z.string().describe('HTTPS endpoint receiving events'),
    secret: z.string().optional().describe('Signing secret'),
    active: z.boolean().optional().describe('Activate immediately'),
  }),
  execute: async ({
    pulumiAccessToken,
    orgName,
    projectName,
    stackName,
    payloadUrl,
    secret,
    active,
  }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/hooks'),
        {
          method: 'POST',
          body: {
            payloadUrl,
            ...(secret !== undefined ? { secret } : {}),
            ...(active !== undefined ? { active } : {}),
          },
        },
      );
      if (!result.ok) return failedResult('Failed to create webhook', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error creating webhook');
    }
  },
});

export const pulumiDeleteWebhook = tool({
  description: 'Delete a stack webhook.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    hookName: z.string().describe('Webhook name'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, hookName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/hooks/${hookName}`),
        { method: 'DELETE' },
      );
      if (!result.ok) return failedResult('Failed to delete webhook', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error deleting webhook');
    }
  },
});

export const pulumiPingWebhook = tool({
  description: 'Send a test ping to a stack webhook.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    hookName: z.string().describe('Webhook name'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, hookName }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, `/hooks/${hookName}/ping`),
        { method: 'POST' },
      );
      if (!result.ok) return failedResult('Failed to ping webhook', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error pinging webhook');
    }
  },
});

export const pulumiEncryptValue = tool({
  description: 'Encrypt a plaintext value with the stack key (for secrets in config).',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    plaintext: z.string().describe('Plaintext to encrypt'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, plaintext }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/encrypt'),
        { method: 'POST', body: { plaintext } },
      );
      if (!result.ok) return failedResult('Failed to encrypt value', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error encrypting value');
    }
  },
});

export const pulumiDecryptValue = tool({
  description: 'Decrypt a ciphertext value with the stack key.',
  inputSchema: z.object({
    pulumiAccessToken: tokenField,
    orgName: orgField,
    projectName: projectField,
    stackName: stackField,
    ciphertext: z.string().describe('Ciphertext to decrypt'),
  }),
  execute: async ({ pulumiAccessToken, orgName, projectName, stackName, ciphertext }) => {
    try {
      const result = await pulumiRequest(
        pulumiAccessToken,
        stackPath(orgName, projectName, stackName, '/decrypt'),
        { method: 'POST', body: { ciphertext } },
      );
      if (!result.ok) return failedResult('Failed to decrypt value', result);
      return result.data;
    } catch (error) {
      return toPulumiError(error, 'Error decrypting value');
    }
  },
});
