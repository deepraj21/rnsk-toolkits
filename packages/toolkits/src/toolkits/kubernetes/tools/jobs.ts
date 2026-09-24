// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { collectionPath, itemPath, k8sRequest, missingCredentialsError, resolveNamespace } from './client.js';

const authField = z.string().optional().describe('Injected by system; do not provide');
const nsField = z.string().optional().describe('Namespace (omit to list across all namespaces)');

interface JobItem {
  metadata?: { name?: string; namespace?: string };
  status?: { active?: number; succeeded?: number; failed?: number; completionTime?: string };
}

function summarizeJob(kind: string, item: JobItem) {
  return {
    kind,
    name: item.metadata?.name,
    namespace: item.metadata?.namespace,
    active: item.status?.active,
    succeeded: item.status?.succeeded,
    failed: item.status?.failed,
    completionTime: item.status?.completionTime,
  };
}

export const kubernetesListJobs = tool({
  description: 'List batch jobs with active/succeeded/failed counts. Use to check one-off task and migration outcomes.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('batch', 'v1', 'jobs', namespace))) as {
        items?: JobItem[];
      };
      const jobs = (data.items ?? []).map((item) => summarizeJob('Job', item));
      return { count: jobs.length, jobs };
    } catch (error) {
      return { error: 'Failed to list jobs', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesListCronJobs = tool({
  description: 'List CronJobs with schedules, suspend state and last schedule time. Use to audit recurring workloads.',
  inputSchema: z.object({ kubernetesCredentials: authField, namespace: nsField }),
  execute: async ({ kubernetesCredentials, namespace }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const data = (await k8sRequest(kubernetesCredentials, collectionPath('batch', 'v1', 'cronjobs', namespace))) as {
        items?: Array<{
          metadata?: { name?: string; namespace?: string };
          spec?: { schedule?: string; suspend?: boolean };
          status?: { lastScheduleTime?: string };
        }>;
      };
      const cronJobs = (data.items ?? []).map((c) => ({
        name: c.metadata?.name,
        namespace: c.metadata?.namespace,
        schedule: c.spec?.schedule,
        suspended: c.spec?.suspend ?? false,
        lastScheduleTime: c.status?.lastScheduleTime,
      }));
      return { count: cronJobs.length, cronJobs };
    } catch (error) {
      return { error: 'Failed to list CronJobs', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesCreateJob = tool({
  description: 'Create a one-off batch job from a container image and command. Use for migrations, scripts and manual triggers of cron work.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    jobName: z.string().describe('Job name'),
    image: z.string().describe('Container image'),
    command: z.array(z.string()).optional().describe('Command to run, e.g. ["python", "migrate.py"]'),
    args: z.array(z.string()).optional().describe('Arguments to the container entrypoint'),
    backoffLimit: z.number().int().min(0).max(10).optional().describe('Retries before marking failed (default 2)'),
    ttlSecondsAfterFinished: z.number().int().min(1).optional().describe('Auto-clean finished jobs after N seconds'),
  }),
  execute: async ({ kubernetesCredentials, namespace, jobName, image, command, args, backoffLimit, ttlSecondsAfterFinished }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, collectionPath('batch', 'v1', 'jobs', ns), {
        method: 'POST',
        body: {
          apiVersion: 'batch/v1',
          kind: 'Job',
          metadata: { name: jobName, namespace: ns },
          spec: {
            backoffLimit: backoffLimit ?? 2,
            ttlSecondsAfterFinished,
            template: {
              spec: {
                containers: [{ name: jobName, image, command, args }],
                restartPolicy: 'Never',
              },
            },
          },
        },
      });
    } catch (error) {
      return { error: 'Failed to create job', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});

export const kubernetesDeleteJob = tool({
  description: 'Delete a batch job and its pods. Use to clean up finished or stuck jobs.',
  inputSchema: z.object({
    kubernetesCredentials: authField,
    namespace: z.string().optional().describe('Namespace (defaults to stored default or "default")'),
    jobName: z.string().describe('Job name to delete'),
  }),
  execute: async ({ kubernetesCredentials, namespace, jobName }) => {
    if (!kubernetesCredentials) return missingCredentialsError();
    try {
      const ns = resolveNamespace(kubernetesCredentials, namespace);
      return await k8sRequest(kubernetesCredentials, itemPath('batch', 'v1', 'jobs', jobName, ns), {
        method: 'DELETE',
      });
    } catch (error) {
      return { error: 'Failed to delete job', message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },
});
