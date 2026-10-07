// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { databricksRequest, failedResult, toDatabricksError } from './client.js';

const credentialsField = z
  .string()
  .describe(
    'Databricks credentials JSON with workspaceUrl (e.g. https://my-workspace.cloud.databricks.com) and token (PAT or OAuth)',
  );
const jobIdField = z.number().int().describe('Job ID');
const runIdField = z.number().int().describe('Run ID');

export const databricksListJobs = tool({
  description: 'List jobs with optional name filter and task expansion. Use to discover job IDs.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    name: z.string().optional().describe('Exact (case-insensitive) job name filter'),
    expandTasks: z.boolean().optional().describe('Include task and cluster details'),
    limit: z.number().int().min(1).max(100).optional().describe('Jobs per page'),
    offset: z.number().int().min(0).optional().describe('Jobs to skip'),
  }),
  execute: async ({ databricksCredentials, name, expandTasks, limit, offset }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/list', {
        query: { name, expand_tasks: expandTasks, limit, offset },
      });
      if (!result.ok) return failedResult('Failed to list jobs', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing jobs');
    }
  },
});

export const databricksGetJob = tool({
  description: 'Get full settings, creator, and run history summary of one job.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    jobId: jobIdField,
  }),
  execute: async ({ databricksCredentials, jobId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/get', {
        query: { job_id: jobId },
      });
      if (!result.ok) return failedResult('Failed to get job', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting job');
    }
  },
});

const jobSettingsField = z
  .record(z.string(), z.any())
  .describe(
    'Job settings: name, tasks [{task_key, notebook_task/spark_jar_task/spark_python_task/sql_task/dbt_task, existing_cluster_id/job_cluster_key, depends_on}], job_clusters, schedule {quartz_cron_expression, timezone_id}, timeout_seconds, max_concurrent_runs, tags, queue, run_as',
  );

export const databricksCreateJob = tool({
  description:
    'Create a single- or multi-task job (notebooks, jars, SQL, dbt, pipelines). Returns the new job_id.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    job: jobSettingsField,
  }),
  execute: async ({ databricksCredentials, job }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/create', {
        method: 'POST',
        body: job,
      });
      if (!result.ok) return failedResult('Failed to create job', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error creating job');
    }
  },
});

export const databricksUpdateJob = tool({
  description:
    'Partially update job settings: top-level fields in new_settings are replaced; list fields_to_remove to delete settings.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    jobId: jobIdField,
    newSettings: z.record(z.string(), z.any()).describe('New top-level job settings'),
    fieldsToRemove: z.array(z.string()).optional().describe('Top-level fields to remove'),
  }),
  execute: async ({ databricksCredentials, jobId, newSettings, fieldsToRemove }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/update', {
        method: 'POST',
        body: {
          job_id: jobId,
          new_settings: newSettings,
          ...(fieldsToRemove !== undefined ? { fields_to_remove: fieldsToRemove } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to update job', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error updating job');
    }
  },
});

export const databricksResetJob = tool({
  description: 'Overwrite all settings of a job with a complete new definition.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    jobId: jobIdField,
    newSettings: jobSettingsField,
  }),
  execute: async ({ databricksCredentials, jobId, newSettings }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/reset', {
        method: 'POST',
        body: { job_id: jobId, new_settings: newSettings },
      });
      if (!result.ok) return failedResult('Failed to reset job', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error resetting job');
    }
  },
});

export const databricksDeleteJob = tool({
  description: 'Delete a job and terminate its active runs. Cannot be undone.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    jobId: jobIdField,
  }),
  execute: async ({ databricksCredentials, jobId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/delete', {
        method: 'POST',
        body: { job_id: jobId },
      });
      if (!result.ok) return failedResult('Failed to delete job', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting job');
    }
  },
});

export const databricksRunJobNow = tool({
  description:
    'Trigger an immediate run of an existing job with optional parameter overrides. Returns the run_id.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    jobId: jobIdField,
    notebookParams: z
      .record(z.string(), z.string())
      .optional()
      .describe('Notebook parameter overrides'),
    jarParams: z.array(z.string()).optional().describe('JAR parameter overrides'),
    pythonParams: z.array(z.string()).optional().describe('Python parameter overrides'),
    sparkSubmitParams: z.array(z.string()).optional().describe('spark-submit parameter overrides'),
    queue: z.boolean().optional().describe('Queue the run if the job is at max concurrency'),
  }),
  execute: async ({
    databricksCredentials,
    jobId,
    notebookParams,
    jarParams,
    pythonParams,
    sparkSubmitParams,
    queue,
  }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/run-now', {
        method: 'POST',
        body: {
          job_id: jobId,
          ...(notebookParams !== undefined ? { notebook_params: notebookParams } : {}),
          ...(jarParams !== undefined ? { jar_params: jarParams } : {}),
          ...(pythonParams !== undefined ? { python_params: pythonParams } : {}),
          ...(sparkSubmitParams !== undefined ? { spark_submit_params: sparkSubmitParams } : {}),
          ...(queue !== undefined ? { queue: { enabled: queue } } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to run job', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error running job');
    }
  },
});

export const databricksSubmitRun = tool({
  description:
    'Submit a one-time run without creating a job. Useful for ad-hoc notebooks or jars; the run is hidden from the Jobs UI.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    run: z
      .record(z.string(), z.any())
      .describe(
        'Run definition: run_name, tasks [{task_key, notebook_task/spark_jar_task/..., existing_cluster_id or new_cluster}], timeout_seconds, tags',
      ),
  }),
  execute: async ({ databricksCredentials, run }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/runs/submit', {
        method: 'POST',
        body: run,
      });
      if (!result.ok) return failedResult('Failed to submit run', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error submitting run');
    }
  },
});

export const databricksListJobRuns = tool({
  description: 'List job runs newest-first with optional job, active-only, and status filters.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    jobId: jobIdField.optional().describe('Filter to one job; omit for all runs'),
    activeOnly: z.boolean().optional().describe('Only queued, running, or terminating runs'),
    completedOnly: z.boolean().optional().describe('Only finished runs'),
    limit: z.number().int().min(1).optional().describe('Runs per page'),
    offset: z.number().int().min(0).optional().describe('Runs to skip'),
  }),
  execute: async ({ databricksCredentials, jobId, activeOnly, completedOnly, limit, offset }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/runs/list', {
        query: {
          job_id: jobId,
          active_only: activeOnly,
          completed_only: completedOnly,
          limit,
          offset,
        },
      });
      if (!result.ok) return failedResult('Failed to list job runs', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error listing job runs');
    }
  },
});

export const databricksGetJobRun = tool({
  description: 'Get full details and state of one job run including task runs.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    runId: runIdField,
  }),
  execute: async ({ databricksCredentials, runId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/runs/get', {
        query: { run_id: runId },
      });
      if (!result.ok) return failedResult('Failed to get job run', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting job run');
    }
  },
});

export const databricksGetRunOutput = tool({
  description:
    'Get notebook output (result, truncated) or error of a finished run. Use to read task results.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    runId: runIdField,
  }),
  execute: async ({ databricksCredentials, runId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/runs/get-output', {
        query: { run_id: runId },
      });
      if (!result.ok) return failedResult('Failed to get run output', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error getting run output');
    }
  },
});

export const databricksCancelJobRun = tool({
  description: 'Cancel an active job run (kills all its tasks).',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    runId: runIdField,
  }),
  execute: async ({ databricksCredentials, runId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/runs/cancel', {
        method: 'POST',
        body: { run_id: runId },
      });
      if (!result.ok) return failedResult('Failed to cancel job run', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error canceling job run');
    }
  },
});

export const databricksRepairJobRun = tool({
  description: 'Re-run failed tasks of a job run, optionally selecting specific tasks.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    runId: runIdField,
    rerunTasks: z
      .array(z.string())
      .optional()
      .describe('Task keys to re-run; omit for all failed tasks'),
  }),
  execute: async ({ databricksCredentials, runId, rerunTasks }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/runs/repair', {
        method: 'POST',
        body: {
          run_id: runId,
          ...(rerunTasks !== undefined ? { rerun_tasks: rerunTasks } : {}),
        },
      });
      if (!result.ok) return failedResult('Failed to repair job run', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error repairing job run');
    }
  },
});

export const databricksDeleteJobRun = tool({
  description: 'Delete a finished job run and its history.',
  inputSchema: z.object({
    databricksCredentials: credentialsField,
    runId: runIdField,
  }),
  execute: async ({ databricksCredentials, runId }) => {
    try {
      const result = await databricksRequest(databricksCredentials, '/2.1/jobs/runs/delete', {
        method: 'POST',
        body: { run_id: runId },
      });
      if (!result.ok) return failedResult('Failed to delete job run', result);
      return result.data;
    } catch (error) {
      return toDatabricksError(error, 'Error deleting job run');
    }
  },
});
