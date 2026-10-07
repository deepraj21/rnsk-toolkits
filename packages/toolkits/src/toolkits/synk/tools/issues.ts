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

export const synkListOrgIssues = tool({
  description:
    'List issues in an org (open source, code, container, IaC) with created/updated date filters. Paginates via links.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    createdAfter: z.string().optional().describe('ISO datetime filter'),
    createdBefore: z.string().optional().describe('ISO datetime filter'),
    updatedAfter: z.string().optional().describe('ISO datetime filter'),
    updatedBefore: z.string().optional().describe('ISO datetime filter'),
    limit: z.number().int().min(1).optional().describe('Results per page'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version, ...f }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/issues`, {
        version,
        query: {
          created_after: f.createdAfter,
          created_before: f.createdBefore,
          updated_after: f.updatedAfter,
          updated_before: f.updatedBefore,
          limit: f.limit,
        },
      });
      if (!result.ok) return failedResult('Failed to list org issues', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing org issues');
    }
  },
});

export const synkGetOrgIssue = tool({
  description: 'Get one issue in an org with severity, fix info, and coordinates.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    issueId: z.string().describe('Issue ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, issueId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/issues/${issueId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get org issue', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting org issue');
    }
  },
});

export const synkListGroupIssues = tool({
  description: 'List issues across a group with date filters.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    createdAfter: z.string().optional().describe('ISO datetime filter'),
    createdBefore: z.string().optional().describe('ISO datetime filter'),
    updatedAfter: z.string().optional().describe('ISO datetime filter'),
    updatedBefore: z.string().optional().describe('ISO datetime filter'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, version, ...f }) => {
    try {
      const result = await synkRest(synkCredentials, `/groups/${groupId}/issues`, {
        version,
        query: {
          created_after: f.createdAfter,
          created_before: f.createdBefore,
          updated_after: f.updatedAfter,
          updated_before: f.updatedBefore,
        },
      });
      if (!result.ok) return failedResult('Failed to list group issues', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing group issues');
    }
  },
});

export const synkGetGroupIssue = tool({
  description: 'Get one issue in a group.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    groupId: z.string().describe('Group ID'),
    issueId: z.string().describe('Issue ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, groupId, issueId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/groups/${groupId}/issues/${issueId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get group issue', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting group issue');
    }
  },
});

export const synkListPackageIssues = tool({
  description:
    'List issues for one package by package URL (purl), e.g. pkg:npm/lodash@4.17.20. Use to check a dependency before upgrading.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    purl: z.string().describe('Package URL, e.g. pkg:npm/lodash@4.17.20'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, purl, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/packages/${encodeURIComponent(purl)}/issues`,
        { version },
      );
      if (!result.ok) return failedResult('Failed to list package issues', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing package issues');
    }
  },
});

export const synkListIssuesForPackages = tool({
  description: 'List issues for a batch of package URLs in one call.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    purls: z.array(z.string()).min(1).describe('Package URLs, e.g. ["pkg:npm/lodash@4.17.20"]'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, purls, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/packages/issues`, {
        method: 'POST',
        version,
        body: { data: purls.map((purl) => ({ type: 'package', attributes: { purl } })) },
      });
      if (!result.ok) return failedResult('Failed to list issues for packages', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing issues for packages');
    }
  },
});

export const synkGetProjectSbom = tool({
  description:
    'Generate a project SBOM document (CycloneDX 1.4-1.6 JSON/XML, SPDX 2.3 JSON) for open source and container projects. Enterprise plans.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    projectId: z.string().describe('Project ID (UUID)'),
    format: z
      .enum([
        'cyclonedx1.4+json',
        'cyclonedx1.4+xml',
        'cyclonedx1.5+json',
        'cyclonedx1.5+xml',
        'cyclonedx1.6+json',
        'cyclonedx1.6+xml',
        'spdx2.3+json',
      ])
      .describe('SBOM format (URL-encoded automatically)'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, projectId, format, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/projects/${projectId}/sbom`, {
        version,
        query: { format },
      });
      if (!result.ok) return failedResult('Failed to get project SBOM', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting project SBOM');
    }
  },
});

export const synkCreateSbomTest = tool({
  description:
    'Asynchronously test an SBOM document (CycloneDX/SPDX JSON) for vulnerabilities. Returns a job ID to poll. Beta endpoint.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    sbom: z
      .record(z.string(), z.any())
      .describe('SBOM document object (CycloneDX 1.4/1.5/1.6 or SPDX 2.3 JSON)'),
    version: z.string().optional().describe('API version (defaults to beta 2024-09-03~beta)'),
  }),
  execute: async ({ synkCredentials, orgId, sbom, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/sbom_tests`, {
        method: 'POST',
        version: version ?? '2024-09-03~beta',
        body: { data: { type: 'sbom_test', attributes: { sbom } } },
      });
      if (!result.ok) return failedResult('Failed to create SBOM test', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating SBOM test');
    }
  },
});

export const synkGetSbomTest = tool({
  description: 'Get SBOM test run status (processing or finished).',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    jobId: z.string().describe('SBOM test job ID'),
    version: z.string().optional().describe('API version (defaults to beta 2024-09-03~beta)'),
  }),
  execute: async ({ synkCredentials, orgId, jobId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/sbom_tests/${jobId}`, {
        version: version ?? '2024-09-03~beta',
      });
      if (!result.ok) return failedResult('Failed to get SBOM test', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting SBOM test');
    }
  },
});

export const synkGetSbomTestResults = tool({
  description: 'Get finished SBOM test results with vulnerability summary and details.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    jobId: z.string().describe('SBOM test job ID'),
    version: z.string().optional().describe('API version (defaults to beta 2024-09-03~beta)'),
  }),
  execute: async ({ synkCredentials, orgId, jobId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/sbom_tests/${jobId}/results`, {
        version: version ?? '2024-09-03~beta',
      });
      if (!result.ok) return failedResult('Failed to get SBOM test results', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting SBOM test results');
    }
  },
});

export const synkListContainerImages = tool({
  description: 'List container image instances monitored in an org.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/container_images`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to list container images', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing container images');
    }
  },
});

export const synkGetContainerImage = tool({
  description: 'Get one container image instance.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    imageId: z.string().describe('Image instance ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, imageId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/container_images/${imageId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get container image', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting container image');
    }
  },
});

export const synkListImageTargetRefs = tool({
  description: 'List image target references (tags/digests) of a container image instance.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    imageId: z.string().describe('Image instance ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, imageId, version }) => {
    try {
      const result = await synkRest(
        synkCredentials,
        `/orgs/${orgId}/container_images/${imageId}/relationships/image_target_refs`,
        { version },
      );
      if (!result.ok) return failedResult('Failed to list image target refs', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing image target refs');
    }
  },
});

export const synkCreateTest = tool({
  description:
    'Start an async unmanaged test run (dep-graph upload flow): submit components, then poll the test and job endpoints.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    test: z
      .record(z.string(), z.any())
      .describe(
        'Test request: target, components/dep-graph, project name, org context per REST spec',
      ),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, test, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/tests`, {
        method: 'POST',
        version,
        body: test,
      });
      if (!result.ok) return failedResult('Failed to create test', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error creating test');
    }
  },
});

export const synkGetTest = tool({
  description: 'Get one async test with status.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    testId: z.string().describe('Test ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, testId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/tests/${testId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get test', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting test');
    }
  },
});

export const synkGetTestJob = tool({
  description: 'Get async test job status.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    jobId: z.string().describe('Test job ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, jobId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/test_jobs/${jobId}`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to get test job', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error getting test job');
    }
  },
});

export const synkListTestFindings = tool({
  description: 'List findings of a finished async test.',
  inputSchema: z.object({
    synkCredentials: credentialsField,
    orgId: orgIdField,
    testId: z.string().describe('Test ID'),
    version: versionField,
  }),
  execute: async ({ synkCredentials, orgId, testId, version }) => {
    try {
      const result = await synkRest(synkCredentials, `/orgs/${orgId}/tests/${testId}/findings`, {
        version,
      });
      if (!result.ok) return failedResult('Failed to list test findings', result);
      return result.data;
    } catch (error) {
      return toSynkError(error, 'Error listing test findings');
    }
  },
});
