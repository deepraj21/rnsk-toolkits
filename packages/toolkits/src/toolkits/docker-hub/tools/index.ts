// @ts-nocheck
import { addOrgMember } from './add-org-member.js';
import { createOrganization } from './create-organization.js';
import { createRepository } from './create-repository.js';
import { deleteImage } from './delete-image.js';
import { deleteOrganization } from './delete-organization.js';
import { deleteRepository } from './delete-repository.js';
import { deleteTag } from './delete-tag.js';
import { deleteTeam } from './delete-team.js';
import { getImage } from './get-image.js';
import { getRepository } from './get-repository.js';
import { getTag } from './get-tag.js';
import { getTeam } from './get-team.js';
import { listOrgAccessTokens } from './list-org-access-tokens.js';
import { listOrganizations } from './list-organizations.js';
import { listOrgMembers } from './list-org-members.js';
import { listRepositories } from './list-repositories.js';
import { listTeamMembers } from './list-team-members.js';
import { listTeams } from './list-teams.js';
import { removeOrgMember } from './remove-org-member.js';
import { removeTeamMember } from './remove-team-member.js';

export {
    addOrgMember,
    createOrganization,
    createRepository,
    deleteImage,
    deleteOrganization,
    deleteRepository,
    deleteTag,
    deleteTeam,
    getImage,
    getRepository,
    getTag,
    getTeam,
    listOrgAccessTokens,
    listOrganizations,
    listOrgMembers,
    listRepositories,
    listTeamMembers,
    listTeams,
    removeOrgMember,
    removeTeamMember,
};

export const dockerHubTools = [
    {
        name: 'dockerHubAddOrgMember',
        description: 'Invite a user to join a Docker Hub organization by Docker ID or email.',
        tool: addOrgMember,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'write' as const,
    },
    {
        name: 'dockerHubCreateOrganization',
        description: 'Create a new Docker Hub organization.',
        tool: createOrganization,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'write' as const,
    },
    {
        name: 'dockerHubCreateRepository',
        description: 'Create a new Docker Hub repository under the specified namespace.',
        tool: createRepository,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'write' as const,
    },
    {
        name: 'dockerHubDeleteImage',
        description: 'Delete one or more images from a Docker Hub namespace using the bulk delete API.',
        tool: deleteImage,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'delete' as const,
    },
    {
        name: 'dockerHubDeleteOrganization',
        description: 'Permanently delete a Docker Hub organization. Treats 404 as success (idempotent).',
        tool: deleteOrganization,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'delete' as const,
    },
    {
        name: 'dockerHubDeleteRepository',
        description: 'Permanently delete a Docker Hub repository and all its images/tags.',
        tool: deleteRepository,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'delete' as const,
    },
    {
        name: 'dockerHubDeleteTag',
        description: 'Permanently delete a specific tag from a Docker Hub repository.',
        tool: deleteTag,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'delete' as const,
    },
    {
        name: 'dockerHubDeleteTeam',
        description: 'Permanently delete a team (group) from a Docker Hub organization.',
        tool: deleteTeam,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'delete' as const,
    },
    {
        name: 'dockerHubGetImage',
        description: 'Retrieve details about a platform-specific image variant by SHA256 digest.',
        tool: getImage,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubGetRepository',
        description: 'Retrieve detailed information about a specific Docker Hub repository.',
        tool: getRepository,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubGetTag',
        description: 'Retrieve details of a specific Docker Hub repository tag.',
        tool: getTag,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubGetTeam',
        description: 'Retrieve details of a specific team (group) within a Docker Hub organization.',
        tool: getTeam,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubListOrgAccessTokens',
        description: 'List organization access tokens for a Docker Hub organization.',
        tool: listOrgAccessTokens,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubListOrganizations',
        description: 'List Docker Hub organizations the authenticated user belongs to.',
        tool: listOrganizations,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubListOrgMembers',
        description: 'List members of a Docker Hub organization with roles and team assignments.',
        tool: listOrgMembers,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubListRepositories',
        description: 'List repositories under a Docker Hub namespace with optional filtering and pagination.',
        tool: listRepositories,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubListTeamMembers',
        description: 'List members of a Docker Hub organization team (group).',
        tool: listTeamMembers,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubListTeams',
        description: 'List all teams (groups) within a Docker Hub organization.',
        tool: listTeams,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'read' as const,
    },
    {
        name: 'dockerHubRemoveOrgMember',
        description: 'Remove a member from a Docker Hub organization.',
        tool: removeOrgMember,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'delete' as const,
    },
    {
        name: 'dockerHubRemoveTeamMember',
        description: 'Remove a user from a Docker Hub organization team (group).',
        tool: removeTeamMember,
        requiredAuth: 'dockerHubCredentials' as const,
        scope: 'delete' as const,
    },
];
