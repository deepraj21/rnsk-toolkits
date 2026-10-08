// @ts-nocheck
import { wizListIssues } from './issues.js';
import { wizGetIssue } from './issues.js';
import { wizListCloudResources } from './resources.js';
import { wizListCloudAccounts } from './resources.js';
import { wizListProjects } from './projects.js';
import { wizGraphqlQuery } from './projects.js';

export {
  wizListIssues,
  wizGetIssue,
  wizListCloudResources,
  wizListCloudAccounts,
  wizListProjects,
  wizGraphqlQuery,
};

const auth = 'wizCredentials' as const;
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

export const wizTools = [
  entry('wizListIssues', wizListIssues, 'read', []),
  entry('wizGetIssue', wizGetIssue, 'read', []),
  entry('wizListCloudResources', wizListCloudResources, 'read', []),
  entry('wizListCloudAccounts', wizListCloudAccounts, 'read', []),
  entry('wizListProjects', wizListProjects, 'read', []),
  entry('wizGraphqlQuery', wizGraphqlQuery, 'write', []),
];
