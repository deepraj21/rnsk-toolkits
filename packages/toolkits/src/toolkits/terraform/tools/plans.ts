// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { failedResult, terraformRequest, toTerraformError } from './client.js';

const tokenField = z
  .string()
  .optional()
  .describe(
    'Injected Terraform API token (user, team, or organization token) — match manifest tokenField',
  );

export const getPlan = tool({
  description: 'Get a plan with resource change summary (add/change/destroy counts) and status.',
  inputSchema: z.object({
    terraformToken: tokenField,
    planId: z.string().describe('Plan ID, e.g. "plan-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, planId }) => {
    try {
      const result = await terraformRequest(terraformToken, `/plans/${encodeURIComponent(planId)}`);
      if (!result.ok) return failedResult(`Failed to get Terraform plan "${planId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform plan "${planId}"`);
    }
  },
});

export const getPlanJsonOutput = tool({
  description:
    'Download the machine-readable JSON output of a plan for programmatic diff analysis.',
  inputSchema: z.object({
    terraformToken: tokenField,
    planId: z.string().describe('Plan ID'),
  }),
  execute: async ({ terraformToken, planId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/plans/${encodeURIComponent(planId)}/json-output`,
      );
      if (!result.ok) return failedResult(`Failed to get JSON output of plan "${planId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting JSON output of plan "${planId}"`);
    }
  },
});

export const getApply = tool({
  description: 'Get an apply with status, timestamps, and log readout URL.',
  inputSchema: z.object({
    terraformToken: tokenField,
    applyId: z.string().describe('Apply ID, e.g. "apply-xxxxxxxxxxxx"'),
  }),
  execute: async ({ terraformToken, applyId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/applies/${encodeURIComponent(applyId)}`,
      );
      if (!result.ok) return failedResult(`Failed to get Terraform apply "${applyId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform apply "${applyId}"`);
    }
  },
});

export const getCostEstimate = tool({
  description: 'Get a run cost estimate with proposed monthly cost delta by resource.',
  inputSchema: z.object({
    terraformToken: tokenField,
    costEstimateId: z
      .string()
      .describe('Cost estimate ID, e.g. "ce-xxxxxxxxxxxx" (see run relationships)'),
  }),
  execute: async ({ terraformToken, costEstimateId }) => {
    try {
      const result = await terraformRequest(
        terraformToken,
        `/cost-estimates/${encodeURIComponent(costEstimateId)}`,
      );
      if (!result.ok)
        return failedResult(`Failed to get Terraform cost estimate "${costEstimateId}"`, result);
      return result.data;
    } catch (error) {
      return toTerraformError(error, `Error getting Terraform cost estimate "${costEstimateId}"`);
    }
  },
});
