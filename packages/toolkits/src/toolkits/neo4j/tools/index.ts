// @ts-nocheck
import {
    neo4jCreateInstanceBeta,
    neo4jGetInstanceBeta,
    neo4jListInstancesBeta,
    neo4jUpdateInstance,
    neo4jUpdateInstanceBeta,
    neo4jPauseInstanceBeta,
} from './instances.js';
import { neo4jCreateSnapshot, neo4jGetSnapshot, neo4jListSnapshots, neo4jRestoreSnapshot } from './snapshots.js';
import {
    neo4jGetProject,
    neo4jGetProjectBeta,
    neo4jListProjects,
    neo4jListProjectUsers,
    neo4jGetOrganizationUser,
    neo4jListIpFilters,
    neo4jUpdateIpFilter,
    neo4jListAgents,
} from './projects.js';
import { neo4jEstimateGdsSessionSize, neo4jListGdsSessions, neo4jAggregateDirectors } from './analytics.js';

export {
    neo4jCreateInstanceBeta,
    neo4jGetInstanceBeta,
    neo4jListInstancesBeta,
    neo4jUpdateInstance,
    neo4jUpdateInstanceBeta,
    neo4jPauseInstanceBeta,
    neo4jCreateSnapshot,
    neo4jGetSnapshot,
    neo4jListSnapshots,
    neo4jRestoreSnapshot,
    neo4jGetProject,
    neo4jGetProjectBeta,
    neo4jListProjects,
    neo4jListProjectUsers,
    neo4jGetOrganizationUser,
    neo4jListIpFilters,
    neo4jUpdateIpFilter,
    neo4jListAgents,
    neo4jEstimateGdsSessionSize,
    neo4jListGdsSessions,
    neo4jAggregateDirectors,
};

export const neo4jTools = [
    { name: 'Neo4jCreateInstanceBeta', description: neo4jCreateInstanceBeta.description!, tool: neo4jCreateInstanceBeta, requiredAuth: 'neo4jCredentials' as const, scope: 'write' as const },
    { name: 'Neo4jGetInstanceBeta', description: neo4jGetInstanceBeta.description!, tool: neo4jGetInstanceBeta, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jListInstancesBeta', description: neo4jListInstancesBeta.description!, tool: neo4jListInstancesBeta, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jUpdateInstance', description: neo4jUpdateInstance.description!, tool: neo4jUpdateInstance, requiredAuth: 'neo4jCredentials' as const, scope: 'write' as const },
    { name: 'Neo4jUpdateInstanceBeta', description: neo4jUpdateInstanceBeta.description!, tool: neo4jUpdateInstanceBeta, requiredAuth: 'neo4jCredentials' as const, scope: 'write' as const },
    { name: 'Neo4jPauseInstanceBeta', description: neo4jPauseInstanceBeta.description!, tool: neo4jPauseInstanceBeta, requiredAuth: 'neo4jCredentials' as const, scope: 'write' as const },
    { name: 'Neo4jCreateSnapshot', description: neo4jCreateSnapshot.description!, tool: neo4jCreateSnapshot, requiredAuth: 'neo4jCredentials' as const, scope: 'write' as const },
    { name: 'Neo4jGetSnapshot', description: neo4jGetSnapshot.description!, tool: neo4jGetSnapshot, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jListSnapshots', description: neo4jListSnapshots.description!, tool: neo4jListSnapshots, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jRestoreSnapshot', description: neo4jRestoreSnapshot.description!, tool: neo4jRestoreSnapshot, requiredAuth: 'neo4jCredentials' as const, scope: 'write' as const },
    { name: 'Neo4jGetProject', description: neo4jGetProject.description!, tool: neo4jGetProject, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jGetProjectBeta', description: neo4jGetProjectBeta.description!, tool: neo4jGetProjectBeta, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jListProjects', description: neo4jListProjects.description!, tool: neo4jListProjects, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jListProjectUsers', description: neo4jListProjectUsers.description!, tool: neo4jListProjectUsers, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jGetOrganizationUser', description: neo4jGetOrganizationUser.description!, tool: neo4jGetOrganizationUser, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jListIpFilters', description: neo4jListIpFilters.description!, tool: neo4jListIpFilters, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jUpdateIpFilter', description: neo4jUpdateIpFilter.description!, tool: neo4jUpdateIpFilter, requiredAuth: 'neo4jCredentials' as const, scope: 'write' as const },
    { name: 'Neo4jListAgents', description: neo4jListAgents.description!, tool: neo4jListAgents, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jEstimateGdsSessionSize', description: neo4jEstimateGdsSessionSize.description!, tool: neo4jEstimateGdsSessionSize, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jListGdsSessions', description: neo4jListGdsSessions.description!, tool: neo4jListGdsSessions, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
    { name: 'Neo4jAggregateDirectors', description: neo4jAggregateDirectors.description!, tool: neo4jAggregateDirectors, requiredAuth: 'neo4jCredentials' as const, scope: 'read' as const },
];
