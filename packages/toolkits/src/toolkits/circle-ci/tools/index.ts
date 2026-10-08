// @ts-nocheck
import { circleCiGetMe } from './projects.js';
import { circleCiListFollowedProjects } from './projects.js';
import { circleCiGetProject } from './projects.js';
import { circleCiGetProjectSettings } from './projects.js';
import { circleCiListPipelines } from './pipelines.js';
import { circleCiGetPipeline } from './pipelines.js';
import { circleCiGetPipelineConfig } from './pipelines.js';
import { circleCiTriggerPipeline } from './pipelines.js';
import { circleCiListWorkflows } from './workflows.js';
import { circleCiGetWorkflow } from './workflows.js';
import { circleCiListWorkflowJobs } from './workflows.js';
import { circleCiCancelWorkflow } from './workflows.js';
import { circleCiRerunWorkflow } from './workflows.js';
import { circleCiGetJob } from './workflows.js';
import { circleCiCancelJob } from './workflows.js';
import { circleCiGetJobArtifacts } from './workflows.js';

export {
  circleCiGetMe,
  circleCiListFollowedProjects,
  circleCiGetProject,
  circleCiGetProjectSettings,
  circleCiListPipelines,
  circleCiGetPipeline,
  circleCiGetPipelineConfig,
  circleCiTriggerPipeline,
  circleCiListWorkflows,
  circleCiGetWorkflow,
  circleCiListWorkflowJobs,
  circleCiCancelWorkflow,
  circleCiRerunWorkflow,
  circleCiGetJob,
  circleCiCancelJob,
  circleCiGetJobArtifacts,
};

const auth = 'circleCiCredentials' as const;
type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[] = []) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const circleCiTools = [
  entry('circleCiGetMe', circleCiGetMe, 'read', []),
  entry('circleCiListFollowedProjects', circleCiListFollowedProjects, 'read', []),
  entry('circleCiGetProject', circleCiGetProject, 'read', []),
  entry('circleCiGetProjectSettings', circleCiGetProjectSettings, 'write', []),
  entry('circleCiListPipelines', circleCiListPipelines, 'read', []),
  entry('circleCiGetPipeline', circleCiGetPipeline, 'read', []),
  entry('circleCiGetPipelineConfig', circleCiGetPipelineConfig, 'read', []),
  entry('circleCiTriggerPipeline', circleCiTriggerPipeline, 'write', []),
  entry('circleCiListWorkflows', circleCiListWorkflows, 'read', []),
  entry('circleCiGetWorkflow', circleCiGetWorkflow, 'read', []),
  entry('circleCiListWorkflowJobs', circleCiListWorkflowJobs, 'read', []),
  entry('circleCiCancelWorkflow', circleCiCancelWorkflow, 'delete', []),
  entry('circleCiRerunWorkflow', circleCiRerunWorkflow, 'write', []),
  entry('circleCiGetJob', circleCiGetJob, 'read', []),
  entry('circleCiCancelJob', circleCiCancelJob, 'delete', []),
  entry('circleCiGetJobArtifacts', circleCiGetJobArtifacts, 'read', []),
];
