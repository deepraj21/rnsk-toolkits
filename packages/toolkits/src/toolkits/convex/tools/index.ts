// @ts-nocheck
import {
    convexCreateProject,
    convexListProjects,
    convexGetProjectById,
    convexGetProjectBySlug,
    convexDeleteProject,
} from './projects.js';
import {
    convexCreateDeployment,
    convexListDeployments,
    convexGetDeployment,
    convexUpdateDeployment,
    convexDeleteDeployment,
} from './deployments.js';
import { convexCreateDeployKey, convexListDeployKeys } from './deploy-keys.js';
import { convexDeleteCustomDomain } from './domains.js';
import {
    convexGetTokenDetails,
    convexListDeploymentClasses,
    convexListDeploymentRegions,
} from './teams.js';
import { convexExecuteQueryBatch, convexGetQueryTimestamp } from './functions.js';
import { convexListLogStreams } from './logging.js';

export {
    convexCreateProject,
    convexListProjects,
    convexGetProjectById,
    convexGetProjectBySlug,
    convexDeleteProject,
    convexCreateDeployment,
    convexListDeployments,
    convexGetDeployment,
    convexUpdateDeployment,
    convexDeleteDeployment,
    convexCreateDeployKey,
    convexListDeployKeys,
    convexDeleteCustomDomain,
    convexGetTokenDetails,
    convexListDeploymentClasses,
    convexListDeploymentRegions,
    convexExecuteQueryBatch,
    convexGetQueryTimestamp,
    convexListLogStreams,
};

export const convexTools = [
    {
        name: 'convexCreateProject',
        description: convexCreateProject.description!,
        tool: convexCreateProject,
        requiredAuth: 'convexToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'convexListProjects',
        description: convexListProjects.description!,
        tool: convexListProjects,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexGetProjectById',
        description: convexGetProjectById.description!,
        tool: convexGetProjectById,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexGetProjectBySlug',
        description: convexGetProjectBySlug.description!,
        tool: convexGetProjectBySlug,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexDeleteProject',
        description: convexDeleteProject.description!,
        tool: convexDeleteProject,
        requiredAuth: 'convexToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'convexCreateDeployment',
        description: convexCreateDeployment.description!,
        tool: convexCreateDeployment,
        requiredAuth: 'convexToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'convexListDeployments',
        description: convexListDeployments.description!,
        tool: convexListDeployments,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexGetDeployment',
        description: convexGetDeployment.description!,
        tool: convexGetDeployment,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexUpdateDeployment',
        description: convexUpdateDeployment.description!,
        tool: convexUpdateDeployment,
        requiredAuth: 'convexToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'convexDeleteDeployment',
        description: convexDeleteDeployment.description!,
        tool: convexDeleteDeployment,
        requiredAuth: 'convexToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'convexCreateDeployKey',
        description: convexCreateDeployKey.description!,
        tool: convexCreateDeployKey,
        requiredAuth: 'convexToken' as const,
        scope: 'write' as const,
    },
    {
        name: 'convexListDeployKeys',
        description: convexListDeployKeys.description!,
        tool: convexListDeployKeys,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexDeleteCustomDomain',
        description: convexDeleteCustomDomain.description!,
        tool: convexDeleteCustomDomain,
        requiredAuth: 'convexToken' as const,
        scope: 'delete' as const,
    },
    {
        name: 'convexGetTokenDetails',
        description: convexGetTokenDetails.description!,
        tool: convexGetTokenDetails,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexListDeploymentClasses',
        description: convexListDeploymentClasses.description!,
        tool: convexListDeploymentClasses,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexListDeploymentRegions',
        description: convexListDeploymentRegions.description!,
        tool: convexListDeploymentRegions,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexExecuteQueryBatch',
        description: convexExecuteQueryBatch.description!,
        tool: convexExecuteQueryBatch,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexGetQueryTimestamp',
        description: convexGetQueryTimestamp.description!,
        tool: convexGetQueryTimestamp,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
    {
        name: 'convexListLogStreams',
        description: convexListLogStreams.description!,
        tool: convexListLogStreams,
        requiredAuth: 'convexToken' as const,
        scope: 'read' as const,
    },
];
