// @ts-nocheck
import {
    gitlabListProjects,
    gitlabGetProject,
    gitlabCreateProject,
    gitlabUpdateProject,
    gitlabDeleteProject,
} from './projects.js';
import {
    gitlabListIssues,
    gitlabGetIssue,
    gitlabCreateIssue,
    gitlabUpdateIssue,
    gitlabListIssueNotes,
    gitlabCreateIssueNote,
} from './issues.js';
import {
    gitlabListMergeRequests,
    gitlabGetMergeRequest,
    gitlabCreateMergeRequest,
    gitlabMergeMergeRequest,
    gitlabCreateMergeRequestNote,
} from './merge-requests.js';
import {
    gitlabListPipelines,
    gitlabGetPipeline,
    gitlabCreatePipeline,
    gitlabListJobs,
} from './pipelines.js';
import { gitlabListBranches, gitlabListCommits, gitlabGetFile } from './repository.js';
import { gitlabGetCurrentUser, gitlabListGroups } from './users-groups.js';

export {
    gitlabListProjects,
    gitlabGetProject,
    gitlabCreateProject,
    gitlabUpdateProject,
    gitlabDeleteProject,
    gitlabListIssues,
    gitlabGetIssue,
    gitlabCreateIssue,
    gitlabUpdateIssue,
    gitlabListIssueNotes,
    gitlabCreateIssueNote,
    gitlabListMergeRequests,
    gitlabGetMergeRequest,
    gitlabCreateMergeRequest,
    gitlabMergeMergeRequest,
    gitlabCreateMergeRequestNote,
    gitlabListPipelines,
    gitlabGetPipeline,
    gitlabCreatePipeline,
    gitlabListJobs,
    gitlabListBranches,
    gitlabListCommits,
    gitlabGetFile,
    gitlabGetCurrentUser,
    gitlabListGroups,
};

export const gitlabTools = [
    { name: 'GitlabListProjects', description: gitlabListProjects.description!, tool: gitlabListProjects, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabGetProject', description: gitlabGetProject.description!, tool: gitlabGetProject, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabCreateProject', description: gitlabCreateProject.description!, tool: gitlabCreateProject, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabUpdateProject', description: gitlabUpdateProject.description!, tool: gitlabUpdateProject, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabDeleteProject', description: gitlabDeleteProject.description!, tool: gitlabDeleteProject, requiredAuth: 'gitlabToken' as const, scope: 'delete' as const },
    { name: 'GitlabListIssues', description: gitlabListIssues.description!, tool: gitlabListIssues, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabGetIssue', description: gitlabGetIssue.description!, tool: gitlabGetIssue, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabCreateIssue', description: gitlabCreateIssue.description!, tool: gitlabCreateIssue, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabUpdateIssue', description: gitlabUpdateIssue.description!, tool: gitlabUpdateIssue, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabListIssueNotes', description: gitlabListIssueNotes.description!, tool: gitlabListIssueNotes, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabCreateIssueNote', description: gitlabCreateIssueNote.description!, tool: gitlabCreateIssueNote, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabListMergeRequests', description: gitlabListMergeRequests.description!, tool: gitlabListMergeRequests, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabGetMergeRequest', description: gitlabGetMergeRequest.description!, tool: gitlabGetMergeRequest, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabCreateMergeRequest', description: gitlabCreateMergeRequest.description!, tool: gitlabCreateMergeRequest, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabMergeMergeRequest', description: gitlabMergeMergeRequest.description!, tool: gitlabMergeMergeRequest, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabCreateMergeRequestNote', description: gitlabCreateMergeRequestNote.description!, tool: gitlabCreateMergeRequestNote, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabListPipelines', description: gitlabListPipelines.description!, tool: gitlabListPipelines, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabGetPipeline', description: gitlabGetPipeline.description!, tool: gitlabGetPipeline, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabCreatePipeline', description: gitlabCreatePipeline.description!, tool: gitlabCreatePipeline, requiredAuth: 'gitlabToken' as const, scope: 'write' as const },
    { name: 'GitlabListJobs', description: gitlabListJobs.description!, tool: gitlabListJobs, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabListBranches', description: gitlabListBranches.description!, tool: gitlabListBranches, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabListCommits', description: gitlabListCommits.description!, tool: gitlabListCommits, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabGetFile', description: gitlabGetFile.description!, tool: gitlabGetFile, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabGetCurrentUser', description: gitlabGetCurrentUser.description!, tool: gitlabGetCurrentUser, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
    { name: 'GitlabListGroups', description: gitlabListGroups.description!, tool: gitlabListGroups, requiredAuth: 'gitlabToken' as const, scope: 'read' as const },
];
