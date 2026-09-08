// @ts-nocheck
export { listRepos } from './Repos/list-repos';
export { createRepo } from './Repos/create-repo';
export { getGitHubUser } from './Users/get-github-user';
export { listRepoIssues } from './Issues/list-repo-issues';
export { createIssue } from './Issues/create-issue';
export { getRepo } from './Repos/get-repo';
export { forkRepo } from './Repos/fork-repo';
export { starRepo } from './Repos/star-repo';
export { watchRepo } from './Repos/watch-repo';
export { getRepoContributors } from './Repos/get-repo-contributors';
export { getRepoLanguages } from './Repos/get-repo-languages';
export { searchRepos } from './Search/search-repos';
export { getFileContent } from './Files/get-file-content';
export { createOrUpdateFile } from './Files/create-or-update-file';
export { deleteFile } from './Files/delete-file';
export { listCommits } from './Commits/list-commits';
export { listBranchesForHeadCommit } from './Commits/list-branches-for-head-commit';
export { listPullRequestsAssociatedWithCommit } from './Commits/list-pull-requests-associated-with-commit';
export { getCommit } from './Commits/get-commit';
export { compareCommits } from './Commits/compare-commits';
export { listBranches } from './Repos/list-branches';
export { updateIssue } from './Issues/update-issue';
export { addIssueComment } from './Issues/add-issue-comment';
export { listIssueComments } from './Issues/list-issue-comments';
export { addIssueLabels } from './Issues/add-issue-labels';
export { removeIssueLabel } from './Issues/remove-issue-label';
export { addIssueAssignees } from './Issues/add-issue-assignees';
export { lockIssue } from './Issues/lock-issue';
export { searchIssues } from './Search/search-issues';
export { listPullRequests } from './PRs/list-pull-requests';
export { getPullRequest } from './PRs/get-pull-request';
export { createPullRequest } from './PRs/create-pull-request';
export { mergePullRequest } from './PRs/merge-pull-request';
export { listPullRequestFiles } from './PRs/list-pull-request-files';
export { createPullRequestReview } from './PRs/create-pull-request-review';
export { updatePullRequest } from './PRs/update-pull-request';
export { listPullRequestCommits } from './PRs/list-pull-request-commits';
export { checkPullRequestMerged } from './PRs/check-pull-request-merged';
export { updatePullRequestBranch } from './PRs/update-pull-request-branch';
export { listWorkflows } from './Workflows/list-workflows';
export { triggerWorkflow } from './Workflows/trigger-workflow';
export { listWorkflowRuns } from './Workflows/list-workflow-runs';
export { getWorkflowRun } from './Workflows/get-workflow-run';
export { listGists } from './Gists/list-gists';
export { createGist } from './Gists/create-gist';
export { getGist } from './Gists/get-gist';
export { searchUsers } from './Search/search-users';
export { followUser } from './Users/follow-user';
// New User imports
export { updateAuthenticatedUser } from './Users/update-authenticated-user';
export { getUserById } from './Users/get-user-by-id';
export { listUsers } from './Users/list-users';
export { getUser } from './Users/get-user';
export { getUserContext } from './Users/get-user-context';
// New Issues imports
export { getIssue } from './Issues/get-issue';
export { listAuthenticatedUserIssues } from './Issues/list-authenticated-user-issues';
export { listOrgIssues } from './Issues/list-org-issues';
export { listUserAccountIssues } from './Issues/list-user-account-issues';
export { unlockIssue } from './Issues/unlock-issue';

// Actions
export { listArtifacts } from './Actions/list-artifacts';
export { getArtifact } from './Actions/get-artifact';
export { deleteArtifact } from './Actions/delete-artifact';
export { listWorkflowRunArtifacts } from './Actions/list-workflow-run-artifacts';
export { listWorkflowJobs } from './Actions/list-workflow-jobs';
export { getWorkflowJob } from './Actions/get-workflow-job';

// Activity
export { listPublicEvents } from './Activity/list-public-events';
export { listRepoEvents } from './Activity/list-repo-events';
export { listUserEvents } from './Activity/list-user-events';
export { listNotifications } from './Activity/list-notifications';
export { markNotificationsRead } from './Activity/mark-notifications-read';

// Apps
export { getAuthenticatedApp } from './Apps/get-authenticated-app';
export { listInstallations } from './Apps/list-installations';
export { getInstallation } from './Apps/get-installation';

// Checks
export { createCheckRun } from './Checks/create-check-run';
export { getCheckRun } from './Checks/get-check-run';
export { updateCheckRun } from './Checks/update-check-run';
export { listCheckRuns } from './Checks/list-check-runs';
export { createCheckSuite } from './Checks/create-check-suite';
export { getCheckSuite } from './Checks/get-check-suite';

// Code Scanning
export { listCodeScanningAlerts } from './CodeScanning/list-alerts';
export { getCodeScanningAlert } from './CodeScanning/get-alert';
export { updateCodeScanningAlert } from './CodeScanning/update-alert';

// Collaborators
export { listCollaborators } from './Collaborators/list-collaborators';
export { checkCollaborator } from './Collaborators/check-collaborator';
export { addCollaborator } from './Collaborators/add-collaborator';
export { removeCollaborator } from './Collaborators/remove-collaborator';

// Dependabot
export { listDependabotAlerts } from './Dependabot/list-alerts';
export { getDependabotAlert } from './Dependabot/get-alert';
export { updateDependabotAlert } from './Dependabot/update-alert';

// Deploy Keys
export { listDeployKeys } from './DeployKeys/list-deploy-keys';
export { createDeployKey } from './DeployKeys/create-deploy-key';
export { getDeployKey } from './DeployKeys/get-deploy-key';
export { deleteDeployKey } from './DeployKeys/delete-deploy-key';

// Deployments
export { listDeployments } from './Deployments/list-deployments';
export { createDeployment } from './Deployments/create-deployment';
export { getDeployment } from './Deployments/get-deployment';
export { deleteDeployment } from './Deployments/delete-deployment';

// Environments
export { listEnvironments } from './Environments/list-environments';
export { getEnvironment } from './Environments/get-environment';
export { createOrUpdateEnvironment } from './Environments/create-or-update-environment';
export { deleteEnvironment } from './Environments/delete-environment';

// Git
export { getBlob } from './Git/get-blob';
export { createBlob } from './Git/create-blob';
export { getGitCommit } from './Git/get-git-commit';
export { createGitCommit } from './Git/create-git-commit';
export { getRef } from './Git/get-ref';
export { createRef } from './Git/create-ref';
export { updateRef } from './Git/update-ref';
export { deleteRef } from './Git/delete-ref';
export { getTree } from './Git/get-tree';
export { createTree } from './Git/create-tree';

// Licenses
export { listLicenses } from './Licenses/list-licenses';
export { getLicense } from './Licenses/get-license';
export { getRepoLicense } from './Licenses/get-repo-license';

// Markdown
export { renderMarkdown } from './Markdown/render-markdown';

// Organizations
export { getOrganization } from './Organizations/get-organization';
export { listUserOrganizations } from './Organizations/list-user-organizations';
export { listOrgRepositories } from './Organizations/list-org-repositories';
export { listOrgMembers } from './Organizations/list-org-members';
export { getOrgMembership } from './Organizations/get-org-membership';
export { listOrganizations } from './Organizations/list-organizations';
export { updateOrganization } from './Organizations/update-organization';

// Projects
export { listRepoProjects } from './Projects/list-repo-projects';
export { listOrgProjects } from './Projects/list-org-projects';
export { createOrgProject } from './Projects/create-org-project';
export { getProject } from './Projects/get-project';
export { updateProject } from './Projects/update-project';
export { deleteProject } from './Projects/delete-project';
export { listProjectColumns } from './Projects/list-project-columns';

// Rate Limit
export { getRateLimit } from './RateLimit/get-rate-limit';

// Reactions
export { listIssueReactions } from './Reactions/list-issue-reactions';
export { createIssueReaction } from './Reactions/create-issue-reaction';
export { listPRCommentReactions } from './Reactions/list-pr-comment-reactions';
export { listCommitCommentReactions } from './Reactions/list-commit-comment-reactions';
export { createCommitCommentReaction } from './Reactions/create-commit-comment-reaction';
export { deleteReaction } from './Reactions/delete-reaction';

// Releases
export { listReleases } from './Releases/list-releases';
export { createRelease } from './Releases/create-release';
export { getRelease } from './Releases/get-release';
export { updateRelease } from './Releases/update-release';
export { deleteRelease } from './Releases/delete-release';
export { getLatestRelease } from './Releases/get-latest-release';
export { generateReleaseNotes } from './Releases/generate-release-notes';

// Secret Scanning
export { listSecretScanningAlerts } from './SecretScanning/list-alerts';
export { getSecretScanningAlert } from './SecretScanning/get-alert';
export { updateSecretScanningAlert } from './SecretScanning/update-alert';

// Security Advisories
export { listRepositoryAdvisories } from './SecurityAdvisories/list-repository-advisories';
export { getRepositoryAdvisory } from './SecurityAdvisories/get-repository-advisory';
export { createRepositoryAdvisory } from './SecurityAdvisories/create-repository-advisory';
export { listGlobalAdvisories } from './SecurityAdvisories/list-global-advisories';

// Stars
export { listStarredRepos } from './Stars/list-starred-repos';
export { checkRepoStarred } from './Stars/check-repo-starred';
export { listStargazers } from './Stars/list-stargazers';

// Statuses
export { createCommitStatus } from './Statuses/create-commit-status';
export { listCommitStatuses } from './Statuses/list-commit-statuses';
export { getCombinedStatus } from './Statuses/get-combined-status';

// Teams
export { listTeams } from './Teams/list-teams';
export { createTeam } from './Teams/create-team';
export { getTeam } from './Teams/get-team';
export { updateTeam } from './Teams/update-team';
export { deleteTeam } from './Teams/delete-team';
export { listTeamMembers } from './Teams/list-team-members';
export { listTeamRepos } from './Teams/list-team-repos';
export { addTeamRepo } from './Teams/add-team-repo';
export { removeTeamRepo } from './Teams/remove-team-repo';

// Webhooks
export { listRepoWebhooks } from './Webhooks/list-repo-webhooks';
export { createRepoWebhook } from './Webhooks/create-repo-webhook';
export { getRepoWebhook } from './Webhooks/get-repo-webhook';
export { updateRepoWebhook } from './Webhooks/update-repo-webhook';
export { deleteRepoWebhook } from './Webhooks/delete-repo-webhook';

import { listRepos } from './Repos/list-repos';
import { createRepo } from './Repos/create-repo';
import { getGitHubUser } from './Users/get-github-user';
import { listRepoIssues } from './Issues/list-repo-issues';
import { createIssue } from './Issues/create-issue';
import { getRepo } from './Repos/get-repo';
import { forkRepo } from './Repos/fork-repo';
import { starRepo } from './Repos/star-repo';
import { watchRepo } from './Repos/watch-repo';
import { getRepoContributors } from './Repos/get-repo-contributors';
import { getRepoLanguages } from './Repos/get-repo-languages';
import { searchRepos } from './Search/search-repos';
import { getFileContent } from './Files/get-file-content';
import { createOrUpdateFile } from './Files/create-or-update-file';
import { deleteFile } from './Files/delete-file';
import { listCommits } from './Commits/list-commits';
import { listBranchesForHeadCommit } from './Commits/list-branches-for-head-commit';
import { listPullRequestsAssociatedWithCommit } from './Commits/list-pull-requests-associated-with-commit';
import { getCommit } from './Commits/get-commit';
import { compareCommits } from './Commits/compare-commits';
import { listBranches } from './Repos/list-branches';
import { updateIssue } from './Issues/update-issue';
import { addIssueComment } from './Issues/add-issue-comment';
import { listIssueComments } from './Issues/list-issue-comments';
import { addIssueLabels } from './Issues/add-issue-labels';
import { removeIssueLabel } from './Issues/remove-issue-label';
import { addIssueAssignees } from './Issues/add-issue-assignees';
import { lockIssue } from './Issues/lock-issue';
import { searchIssues } from './Search/search-issues';
import { listPullRequests } from './PRs/list-pull-requests';
import { getPullRequest } from './PRs/get-pull-request';
import { createPullRequest } from './PRs/create-pull-request';
import { mergePullRequest } from './PRs/merge-pull-request';
import { listPullRequestFiles } from './PRs/list-pull-request-files';
import { createPullRequestReview } from './PRs/create-pull-request-review';
import { updatePullRequest } from './PRs/update-pull-request';
import { listPullRequestCommits } from './PRs/list-pull-request-commits';
import { checkPullRequestMerged } from './PRs/check-pull-request-merged';
import { updatePullRequestBranch } from './PRs/update-pull-request-branch';
import { listWorkflows } from './Workflows/list-workflows';
import { triggerWorkflow } from './Workflows/trigger-workflow';
import { listWorkflowRuns } from './Workflows/list-workflow-runs';
import { getWorkflowRun } from './Workflows/get-workflow-run';
import { listGists } from './Gists/list-gists';
import { createGist } from './Gists/create-gist';
import { getGist } from './Gists/get-gist';
import { searchUsers } from './Search/search-users';
import { followUser } from './Users/follow-user';
// New User imports
import { updateAuthenticatedUser } from './Users/update-authenticated-user';
import { getUserById } from './Users/get-user-by-id';
import { listUsers } from './Users/list-users';
import { getUser } from './Users/get-user';
import { getUserContext } from './Users/get-user-context';
// New Search imports
import { searchCode } from './Search/search-code';
import { searchCommits } from './Search/search-commits';
import { searchLabels } from './Search/search-labels';
import { searchTopics } from './Search/search-topics';
// New Issues imports
import { getIssue } from './Issues/get-issue';
import { listAuthenticatedUserIssues } from './Issues/list-authenticated-user-issues';
import { listOrgIssues } from './Issues/list-org-issues';
import { listUserAccountIssues } from './Issues/list-user-account-issues';
import { unlockIssue } from './Issues/unlock-issue';

// Actions
import { listArtifacts } from './Actions/list-artifacts';
import { getArtifact } from './Actions/get-artifact';
import { deleteArtifact } from './Actions/delete-artifact';
import { listWorkflowRunArtifacts } from './Actions/list-workflow-run-artifacts';
import { listWorkflowJobs } from './Actions/list-workflow-jobs';
import { getWorkflowJob } from './Actions/get-workflow-job';

// Activity
import { listPublicEvents } from './Activity/list-public-events';
import { listRepoEvents } from './Activity/list-repo-events';
import { listUserEvents } from './Activity/list-user-events';
import { listNotifications } from './Activity/list-notifications';
import { markNotificationsRead } from './Activity/mark-notifications-read';

// Apps
import { getAuthenticatedApp } from './Apps/get-authenticated-app';
import { listInstallations } from './Apps/list-installations';
import { getInstallation } from './Apps/get-installation';

// Checks
import { createCheckRun } from './Checks/create-check-run';
import { getCheckRun } from './Checks/get-check-run';
import { updateCheckRun } from './Checks/update-check-run';
import { listCheckRuns } from './Checks/list-check-runs';
import { createCheckSuite } from './Checks/create-check-suite';
import { getCheckSuite } from './Checks/get-check-suite';

// Code Scanning
import { listCodeScanningAlerts } from './CodeScanning/list-alerts';
import { getCodeScanningAlert } from './CodeScanning/get-alert';
import { updateCodeScanningAlert } from './CodeScanning/update-alert';

// Collaborators
import { listCollaborators } from './Collaborators/list-collaborators';
import { checkCollaborator } from './Collaborators/check-collaborator';
import { addCollaborator } from './Collaborators/add-collaborator';
import { removeCollaborator } from './Collaborators/remove-collaborator';

// Dependabot
import { listDependabotAlerts } from './Dependabot/list-alerts';
import { getDependabotAlert } from './Dependabot/get-alert';
import { updateDependabotAlert } from './Dependabot/update-alert';

// Deploy Keys
import { listDeployKeys } from './DeployKeys/list-deploy-keys';
import { createDeployKey } from './DeployKeys/create-deploy-key';
import { getDeployKey } from './DeployKeys/get-deploy-key';
import { deleteDeployKey } from './DeployKeys/delete-deploy-key';

// Deployments
import { listDeployments } from './Deployments/list-deployments';
import { createDeployment } from './Deployments/create-deployment';
import { getDeployment } from './Deployments/get-deployment';
import { deleteDeployment } from './Deployments/delete-deployment';

// Environments
import { listEnvironments } from './Environments/list-environments';
import { getEnvironment } from './Environments/get-environment';
import { createOrUpdateEnvironment } from './Environments/create-or-update-environment';
import { deleteEnvironment } from './Environments/delete-environment';

// Git
import { getBlob } from './Git/get-blob';
import { createBlob } from './Git/create-blob';
import { getGitCommit } from './Git/get-git-commit';
import { createGitCommit } from './Git/create-git-commit';
import { getRef } from './Git/get-ref';
import { createRef } from './Git/create-ref';
import { updateRef } from './Git/update-ref';
import { deleteRef } from './Git/delete-ref';
import { getTree } from './Git/get-tree';
import { createTree } from './Git/create-tree';

// Licenses
import { listLicenses } from './Licenses/list-licenses';
import { getLicense } from './Licenses/get-license';
import { getRepoLicense } from './Licenses/get-repo-license';

// Markdown
import { renderMarkdown } from './Markdown/render-markdown';

// Organizations
import { getOrganization } from './Organizations/get-organization';
import { listUserOrganizations } from './Organizations/list-user-organizations';
import { listOrgRepositories } from './Organizations/list-org-repositories';
import { listOrgMembers } from './Organizations/list-org-members';
import { getOrgMembership } from './Organizations/get-org-membership';
import { listOrganizations } from './Organizations/list-organizations';
import { updateOrganization } from './Organizations/update-organization';

// Projects
import { listRepoProjects } from './Projects/list-repo-projects';
import { listOrgProjects } from './Projects/list-org-projects';
import { createOrgProject } from './Projects/create-org-project';
import { getProject } from './Projects/get-project';
import { updateProject } from './Projects/update-project';
import { deleteProject } from './Projects/delete-project';
import { listProjectColumns } from './Projects/list-project-columns';

// Rate Limit
import { getRateLimit } from './RateLimit/get-rate-limit';

// Reactions
import { listIssueReactions } from './Reactions/list-issue-reactions';
import { createIssueReaction } from './Reactions/create-issue-reaction';
import { listPRCommentReactions } from './Reactions/list-pr-comment-reactions';
import { listCommitCommentReactions } from './Reactions/list-commit-comment-reactions';
import { createCommitCommentReaction } from './Reactions/create-commit-comment-reaction';
import { deleteReaction } from './Reactions/delete-reaction';

// Releases
import { listReleases } from './Releases/list-releases';
import { createRelease } from './Releases/create-release';
import { getRelease } from './Releases/get-release';
import { updateRelease } from './Releases/update-release';
import { deleteRelease } from './Releases/delete-release';
import { getLatestRelease } from './Releases/get-latest-release';
import { generateReleaseNotes } from './Releases/generate-release-notes';

// Secret Scanning
import { listSecretScanningAlerts } from './SecretScanning/list-alerts';
import { getSecretScanningAlert } from './SecretScanning/get-alert';
import { updateSecretScanningAlert } from './SecretScanning/update-alert';

// Security Advisories
import { listRepositoryAdvisories } from './SecurityAdvisories/list-repository-advisories';
import { getRepositoryAdvisory } from './SecurityAdvisories/get-repository-advisory';
import { createRepositoryAdvisory } from './SecurityAdvisories/create-repository-advisory';
import { listGlobalAdvisories } from './SecurityAdvisories/list-global-advisories';

// Stars
import { listStarredRepos } from './Stars/list-starred-repos';
import { checkRepoStarred } from './Stars/check-repo-starred';
import { listStargazers } from './Stars/list-stargazers';

// Statuses
import { createCommitStatus } from './Statuses/create-commit-status';
import { listCommitStatuses } from './Statuses/list-commit-statuses';
import { getCombinedStatus } from './Statuses/get-combined-status';

// Teams
import { listTeams } from './Teams/list-teams';
import { createTeam } from './Teams/create-team';
import { getTeam } from './Teams/get-team';
import { updateTeam } from './Teams/update-team';
import { deleteTeam } from './Teams/delete-team';
import { listTeamMembers } from './Teams/list-team-members';
import { listTeamRepos } from './Teams/list-team-repos';
import { addTeamRepo } from './Teams/add-team-repo';
import { removeTeamRepo } from './Teams/remove-team-repo';

// Webhooks
import { listRepoWebhooks } from './Webhooks/list-repo-webhooks';
import { createRepoWebhook } from './Webhooks/create-repo-webhook';
import { getRepoWebhook } from './Webhooks/get-repo-webhook';
import { updateRepoWebhook } from './Webhooks/update-repo-webhook';
import { deleteRepoWebhook } from './Webhooks/delete-repo-webhook';

export const githubTools = [
  {
    name: 'listRepos',
    description: 'List repositories for the authenticated GitHub user. Returns repo name, full_name, description, visibility, and URL.',
    tool: listRepos,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'createRepo',
    description: 'Create a new repository for the authenticated GitHub user.',
    tool: createRepo,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'getGitHubUser',
    description: 'Get the authenticated GitHub user profile (login, name, email, plan, usage, etc.).',
    tool: getGitHubUser,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'updateAuthenticatedUser',
    description: 'Update the authenticated GitHub user profile.',
    tool: updateAuthenticatedUser,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'getUserById',
    description: 'Get a user using their ID.',
    tool: getUserById,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'listUsers',
    description: 'List users. Lists all users, in the order that they signed up on GitHub.',
    tool: listUsers,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'getUser',
    description: 'Get a user. Provides publicly available information about someone with a GitHub account.',
    tool: getUser,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'getUserContext',
    description: 'Get contextual information for a user. Provides the interaction context between the authenticated user and another user.',
    tool: getUserContext,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'listRepoIssues',
    description: 'List issues for a GitHub repository. Provide owner and repo.',
    tool: listRepoIssues,
    requiredAuth: 'githubToken' as const,
  },
  {
    name: 'createIssue',
    description: 'Create a new issue in a GitHub repository. Provide owner, repo, title, and optional body.',
    tool: createIssue,
    requiredAuth: 'githubToken' as const,
  },
  { name: 'getRepo', description: 'Get detailed information about a specific GitHub repository.', tool: getRepo, requiredAuth: 'githubToken' as const },
  { name: 'forkRepo', description: 'Fork a GitHub repository to your account or an organization.', tool: forkRepo, requiredAuth: 'githubToken' as const },
  { name: 'starRepo', description: 'Star or unstar a GitHub repository.', tool: starRepo, requiredAuth: 'githubToken' as const },
  { name: 'watchRepo', description: 'Set subscription status (watch/unwatch) for a repository.', tool: watchRepo, requiredAuth: 'githubToken' as const },
  { name: 'getRepoContributors', description: 'List contributors for a GitHub repository.', tool: getRepoContributors, requiredAuth: 'githubToken' as const },
  { name: 'getRepoLanguages', description: 'List languages used in a GitHub repository.', tool: getRepoLanguages, requiredAuth: 'githubToken' as const },
  { name: 'searchRepos', description: 'Search for GitHub repositories using a query string.', tool: searchRepos, requiredAuth: 'githubToken' as const },
  { name: 'searchCode', description: 'Search code. Searches for query terms inside of a file.', tool: searchCode, requiredAuth: 'githubToken' as const },
  { name: 'searchCommits', description: 'Search commits. Find commits via various criteria on the default branch (usually master).', tool: searchCommits, requiredAuth: 'githubToken' as const },
  { name: 'searchLabels', description: 'Search labels. Find labels in a repository with names or descriptions that match search keywords.', tool: searchLabels, requiredAuth: 'githubToken' as const },
  { name: 'searchTopics', description: 'Search topics. Find topics via various criteria.', tool: searchTopics, requiredAuth: 'githubToken' as const },
  { name: 'getFileContent', description: 'Get the content of a file from a GitHub repository.', tool: getFileContent, requiredAuth: 'githubToken' as const },
  { name: 'createOrUpdateFile', description: 'Create or update a file in a GitHub repository.', tool: createOrUpdateFile, requiredAuth: 'githubToken' as const },
  { name: 'deleteFile', description: 'Delete a file from a GitHub repository.', tool: deleteFile, requiredAuth: 'githubToken' as const },
  { name: 'listCommits', description: 'List commits on a GitHub repository.', tool: listCommits, requiredAuth: 'githubToken' as const },
  { name: 'listBranchesForHeadCommit', description: 'List branches for HEAD commit.', tool: listBranchesForHeadCommit, requiredAuth: 'githubToken' as const },
  { name: 'listPullRequestsAssociatedWithCommit', description: 'List pull requests associated with a commit.', tool: listPullRequestsAssociatedWithCommit, requiredAuth: 'githubToken' as const },
  { name: 'getCommit', description: 'Get a commit.', tool: getCommit, requiredAuth: 'githubToken' as const },
  { name: 'compareCommits', description: 'Compare two commits.', tool: compareCommits, requiredAuth: 'githubToken' as const },
  { name: 'listBranches', description: 'List branches of a GitHub repository.', tool: listBranches, requiredAuth: 'githubToken' as const },
  { name: 'updateIssue', description: 'Update a GitHub issue (close, reopen, edit title/body).', tool: updateIssue, requiredAuth: 'githubToken' as const },
  { name: 'addIssueComment', description: 'Add a comment to a GitHub issue or pull request.', tool: addIssueComment, requiredAuth: 'githubToken' as const },
  { name: 'listIssueComments', description: 'List comments on a GitHub issue or pull request.', tool: listIssueComments, requiredAuth: 'githubToken' as const },
  { name: 'addIssueLabels', description: 'Add labels to a GitHub issue.', tool: addIssueLabels, requiredAuth: 'githubToken' as const },
  { name: 'removeIssueLabel', description: 'Remove a label from a GitHub issue.', tool: removeIssueLabel, requiredAuth: 'githubToken' as const },
  { name: 'addIssueAssignees', description: 'Add assignees to a GitHub issue.', tool: addIssueAssignees, requiredAuth: 'githubToken' as const },
  { name: 'lockIssue', description: 'Lock or unlock a GitHub issue.', tool: lockIssue, requiredAuth: 'githubToken' as const },
  { name: 'searchIssues', description: 'Search for GitHub issues and pull requests.', tool: searchIssues, requiredAuth: 'githubToken' as const },
  { name: 'listPullRequests', description: 'List pull requests for a GitHub repository.', tool: listPullRequests, requiredAuth: 'githubToken' as const },
  { name: 'getPullRequest', description: 'Get detailed information about a specific pull request.', tool: getPullRequest, requiredAuth: 'githubToken' as const },
  { name: 'createPullRequest', description: 'Create a new pull request.', tool: createPullRequest, requiredAuth: 'githubToken' as const },
  { name: 'mergePullRequest', description: 'Merge a pull request.', tool: mergePullRequest, requiredAuth: 'githubToken' as const },
  { name: 'listPullRequestFiles', description: 'List files modified in a pull request.', tool: listPullRequestFiles, requiredAuth: 'githubToken' as const },
  { name: 'createPullRequestReview', description: 'Create a review for a pull request.', tool: createPullRequestReview, requiredAuth: 'githubToken' as const },
  { name: 'updatePullRequest', description: 'Update a pull request (title, body, state, base).', tool: updatePullRequest, requiredAuth: 'githubToken' as const },
  { name: 'listPullRequestCommits', description: 'List commits on a pull request.', tool: listPullRequestCommits, requiredAuth: 'githubToken' as const },
  { name: 'checkPullRequestMerged', description: 'Check if a pull request has been merged.', tool: checkPullRequestMerged, requiredAuth: 'githubToken' as const },
  { name: 'updatePullRequestBranch', description: 'Update a pull request branch with the latest changes from the base branch.', tool: updatePullRequestBranch, requiredAuth: 'githubToken' as const },
  { name: 'listWorkflows', description: 'List GitHub Actions workflows for a repository.', tool: listWorkflows, requiredAuth: 'githubToken' as const },
  { name: 'triggerWorkflow', description: 'Trigger a GitHub Actions workflow dispatch event.', tool: triggerWorkflow, requiredAuth: 'githubToken' as const },
  { name: 'listWorkflowRuns', description: 'List GitHub Actions workflow runs.', tool: listWorkflowRuns, requiredAuth: 'githubToken' as const },
  { name: 'getWorkflowRun', description: 'Get details of a specific GitHub Actions workflow run.', tool: getWorkflowRun, requiredAuth: 'githubToken' as const },
  { name: 'listGists', description: 'List the authenticated user\'s gists or public gists.', tool: listGists, requiredAuth: 'githubToken' as const },
  { name: 'createGist', description: 'Create a new gist.', tool: createGist, requiredAuth: 'githubToken' as const },
  { name: 'getGist', description: 'Get a specific gist.', tool: getGist, requiredAuth: 'githubToken' as const },
  { name: 'searchUsers', description: 'Search for GitHub users.', tool: searchUsers, requiredAuth: 'githubToken' as const },
  { name: 'followUser', description: 'Follow or unfollow a GitHub user.', tool: followUser, requiredAuth: 'githubToken' as const },
  { name: 'getIssue', description: 'Get a single issue by its number.', tool: getIssue, requiredAuth: 'githubToken' as const },
  { name: 'listAuthenticatedUserIssues', description: 'List issues assigned to the authenticated user across all visible repositories.', tool: listAuthenticatedUserIssues, requiredAuth: 'githubToken' as const },
  { name: 'listOrgIssues', description: 'List issues assigned to the authenticated user for a specific organization.', tool: listOrgIssues, requiredAuth: 'githubToken' as const },
  { name: 'listUserAccountIssues', description: 'List issues assigned to the authenticated user across their own repositories.', tool: listUserAccountIssues, requiredAuth: 'githubToken' as const },
  { name: 'unlockIssue', description: 'Unlock a GitHub issue.', tool: unlockIssue, requiredAuth: 'githubToken' as const },

  // Actions
  { name: 'listArtifacts', description: 'List artifacts for a repository.', tool: listArtifacts, requiredAuth: 'githubToken' as const },
  { name: 'getArtifact', description: 'Get an artifact.', tool: getArtifact, requiredAuth: 'githubToken' as const },
  { name: 'deleteArtifact', description: 'Delete an artifact.', tool: deleteArtifact, requiredAuth: 'githubToken' as const },
  { name: 'listWorkflowRunArtifacts', description: 'List workflow run artifacts.', tool: listWorkflowRunArtifacts, requiredAuth: 'githubToken' as const },
  { name: 'listWorkflowJobs', description: 'List jobs for a workflow run.', tool: listWorkflowJobs, requiredAuth: 'githubToken' as const },
  { name: 'getWorkflowJob', description: 'Get a job for a workflow run.', tool: getWorkflowJob, requiredAuth: 'githubToken' as const },

  // Activity
  { name: 'listPublicEvents', description: 'List public events.', tool: listPublicEvents, requiredAuth: 'githubToken' as const },
  { name: 'listRepoEvents', description: 'List repository events.', tool: listRepoEvents, requiredAuth: 'githubToken' as const },
  { name: 'listUserEvents', description: 'List events for the authenticated user.', tool: listUserEvents, requiredAuth: 'githubToken' as const },
  { name: 'listNotifications', description: 'List notifications for the authenticated user.', tool: listNotifications, requiredAuth: 'githubToken' as const },
  { name: 'markNotificationsRead', description: 'Mark notifications as read.', tool: markNotificationsRead, requiredAuth: 'githubToken' as const },

  // Apps
  { name: 'getAuthenticatedApp', description: 'Get the authenticated app.', tool: getAuthenticatedApp, requiredAuth: 'githubToken' as const },
  { name: 'listInstallations', description: 'List installations for the authenticated app.', tool: listInstallations, requiredAuth: 'githubToken' as const },
  { name: 'getInstallation', description: 'Get an installation for the authenticated app.', tool: getInstallation, requiredAuth: 'githubToken' as const },

  // Checks
  { name: 'createCheckRun', description: 'Create a check run.', tool: createCheckRun, requiredAuth: 'githubToken' as const },
  { name: 'getCheckRun', description: 'Get a check run.', tool: getCheckRun, requiredAuth: 'githubToken' as const },
  { name: 'updateCheckRun', description: 'Update a check run.', tool: updateCheckRun, requiredAuth: 'githubToken' as const },
  { name: 'listCheckRuns', description: 'List check runs for a ref.', tool: listCheckRuns, requiredAuth: 'githubToken' as const },
  { name: 'createCheckSuite', description: 'Create a check suite.', tool: createCheckSuite, requiredAuth: 'githubToken' as const },
  { name: 'getCheckSuite', description: 'Get a check suite.', tool: getCheckSuite, requiredAuth: 'githubToken' as const },

  // Code Scanning
  { name: 'listCodeScanningAlerts', description: 'List code scanning alerts for a repository.', tool: listCodeScanningAlerts, requiredAuth: 'githubToken' as const },
  { name: 'getCodeScanningAlert', description: 'Get a code scanning alert.', tool: getCodeScanningAlert, requiredAuth: 'githubToken' as const },
  { name: 'updateCodeScanningAlert', description: 'Update a code scanning alert.', tool: updateCodeScanningAlert, requiredAuth: 'githubToken' as const },

  // Collaborators
  { name: 'listCollaborators', description: 'List repository collaborators.', tool: listCollaborators, requiredAuth: 'githubToken' as const },
  { name: 'checkCollaborator', description: 'Check if a user is a repository collaborator.', tool: checkCollaborator, requiredAuth: 'githubToken' as const },
  { name: 'addCollaborator', description: 'Add a repository collaborator.', tool: addCollaborator, requiredAuth: 'githubToken' as const },
  { name: 'removeCollaborator', description: 'Remove a repository collaborator.', tool: removeCollaborator, requiredAuth: 'githubToken' as const },

  // Dependabot
  { name: 'listDependabotAlerts', description: 'List Dependabot alerts for a repository.', tool: listDependabotAlerts, requiredAuth: 'githubToken' as const },
  { name: 'getDependabotAlert', description: 'Get a Dependabot alert.', tool: getDependabotAlert, requiredAuth: 'githubToken' as const },
  { name: 'updateDependabotAlert', description: 'Update a Dependabot alert.', tool: updateDependabotAlert, requiredAuth: 'githubToken' as const },

  // Deploy Keys
  { name: 'listDeployKeys', description: 'List deploy keys for a repository.', tool: listDeployKeys, requiredAuth: 'githubToken' as const },
  { name: 'createDeployKey', description: 'Create a deploy key.', tool: createDeployKey, requiredAuth: 'githubToken' as const },
  { name: 'getDeployKey', description: 'Get a deploy key.', tool: getDeployKey, requiredAuth: 'githubToken' as const },
  { name: 'deleteDeployKey', description: 'Delete a deploy key.', tool: deleteDeployKey, requiredAuth: 'githubToken' as const },

  // Deployments
  { name: 'listDeployments', description: 'List deployments for a repository.', tool: listDeployments, requiredAuth: 'githubToken' as const },
  { name: 'createDeployment', description: 'Create a deployment.', tool: createDeployment, requiredAuth: 'githubToken' as const },
  { name: 'getDeployment', description: 'Get a deployment.', tool: getDeployment, requiredAuth: 'githubToken' as const },
  { name: 'deleteDeployment', description: 'Delete a deployment.', tool: deleteDeployment, requiredAuth: 'githubToken' as const },

  // Environments
  { name: 'listEnvironments', description: 'List environments for a repository.', tool: listEnvironments, requiredAuth: 'githubToken' as const },
  { name: 'getEnvironment', description: 'Get an environment.', tool: getEnvironment, requiredAuth: 'githubToken' as const },
  { name: 'createOrUpdateEnvironment', description: 'Create or update an environment.', tool: createOrUpdateEnvironment, requiredAuth: 'githubToken' as const },
  { name: 'deleteEnvironment', description: 'Delete an environment.', tool: deleteEnvironment, requiredAuth: 'githubToken' as const },

  // Git
  { name: 'getBlob', description: 'Get a blob.', tool: getBlob, requiredAuth: 'githubToken' as const },
  { name: 'createBlob', description: 'Create a blob.', tool: createBlob, requiredAuth: 'githubToken' as const },
  { name: 'getGitCommit', description: 'Get a low-level git commit.', tool: getGitCommit, requiredAuth: 'githubToken' as const },
  { name: 'createGitCommit', description: 'Create a low-level git commit.', tool: createGitCommit, requiredAuth: 'githubToken' as const },
  { name: 'getRef', description: 'Get a git reference.', tool: getRef, requiredAuth: 'githubToken' as const },
  { name: 'createRef', description: 'Create a git reference.', tool: createRef, requiredAuth: 'githubToken' as const },
  { name: 'updateRef', description: 'Update a git reference.', tool: updateRef, requiredAuth: 'githubToken' as const },
  { name: 'deleteRef', description: 'Delete a git reference.', tool: deleteRef, requiredAuth: 'githubToken' as const },
  { name: 'getTree', description: 'Get a git tree.', tool: getTree, requiredAuth: 'githubToken' as const },
  { name: 'createTree', description: 'Create a git tree.', tool: createTree, requiredAuth: 'githubToken' as const },

  // Licenses
  { name: 'listLicenses', description: 'List all commonly used licenses.', tool: listLicenses, requiredAuth: 'githubToken' as const },
  { name: 'getLicense', description: 'Get a specific license.', tool: getLicense, requiredAuth: 'githubToken' as const },
  { name: 'getRepoLicense', description: 'Get the license for a repository.', tool: getRepoLicense, requiredAuth: 'githubToken' as const },

  // Markdown
  { name: 'renderMarkdown', description: 'Render a Markdown document.', tool: renderMarkdown, requiredAuth: 'githubToken' as const },

  // Organizations
  { name: 'getOrganization', description: 'Get an organization.', tool: getOrganization, requiredAuth: 'githubToken' as const },
  { name: 'listUserOrganizations', description: 'List organizations for the authenticated user.', tool: listUserOrganizations, requiredAuth: 'githubToken' as const },
  { name: 'listOrganizations', description: 'List all organizations.', tool: listOrganizations, requiredAuth: 'githubToken' as const },
  { name: 'updateOrganization', description: 'Update an organization.', tool: updateOrganization, requiredAuth: 'githubToken' as const },
  { name: 'listOrgRepositories', description: 'List repositories for an organization.', tool: listOrgRepositories, requiredAuth: 'githubToken' as const },
  { name: 'listOrgMembers', description: 'List organization members.', tool: listOrgMembers, requiredAuth: 'githubToken' as const },
  { name: 'getOrgMembership', description: 'Get organization membership for a user.', tool: getOrgMembership, requiredAuth: 'githubToken' as const },

  // Projects
  { name: 'listRepoProjects', description: 'List repository projects.', tool: listRepoProjects, requiredAuth: 'githubToken' as const },
  { name: 'listOrgProjects', description: 'List organization projects.', tool: listOrgProjects, requiredAuth: 'githubToken' as const },
  { name: 'createOrgProject', description: 'Create an organization project.', tool: createOrgProject, requiredAuth: 'githubToken' as const },
  { name: 'getProject', description: 'Get a project.', tool: getProject, requiredAuth: 'githubToken' as const },
  { name: 'updateProject', description: 'Update a project.', tool: updateProject, requiredAuth: 'githubToken' as const },
  { name: 'deleteProject', description: 'Delete a project.', tool: deleteProject, requiredAuth: 'githubToken' as const },
  { name: 'listProjectColumns', description: 'List columns for a project.', tool: listProjectColumns, requiredAuth: 'githubToken' as const },

  // Rate Limit
  { name: 'getRateLimit', description: 'Get rate limit status.', tool: getRateLimit, requiredAuth: 'githubToken' as const },

  // Reactions
  { name: 'listIssueReactions', description: 'List reactions for an issue.', tool: listIssueReactions, requiredAuth: 'githubToken' as const },
  { name: 'createIssueReaction', description: 'Create a reaction for an issue.', tool: createIssueReaction, requiredAuth: 'githubToken' as const },
  { name: 'listPRCommentReactions', description: 'List reactions for a PR comment.', tool: listPRCommentReactions, requiredAuth: 'githubToken' as const },
  { name: 'listCommitCommentReactions', description: 'List reactions for a commit comment.', tool: listCommitCommentReactions, requiredAuth: 'githubToken' as const },
  { name: 'createCommitCommentReaction', description: 'Create a reaction for a commit comment.', tool: createCommitCommentReaction, requiredAuth: 'githubToken' as const },
  { name: 'deleteReaction', description: 'Delete a reaction.', tool: deleteReaction, requiredAuth: 'githubToken' as const },

  // Releases
  { name: 'listReleases', description: 'List releases for a repository.', tool: listReleases, requiredAuth: 'githubToken' as const },
  { name: 'createRelease', description: 'Create a release.', tool: createRelease, requiredAuth: 'githubToken' as const },
  { name: 'getRelease', description: 'Get a release.', tool: getRelease, requiredAuth: 'githubToken' as const },
  { name: 'updateRelease', description: 'Update a release.', tool: updateRelease, requiredAuth: 'githubToken' as const },
  { name: 'deleteRelease', description: 'Delete a release.', tool: deleteRelease, requiredAuth: 'githubToken' as const },
  { name: 'getLatestRelease', description: 'Get the latest release.', tool: getLatestRelease, requiredAuth: 'githubToken' as const },
  { name: 'generateReleaseNotes', description: 'Generate release notes.', tool: generateReleaseNotes, requiredAuth: 'githubToken' as const },

  // Secret Scanning
  { name: 'listSecretScanningAlerts', description: 'List secret scanning alerts.', tool: listSecretScanningAlerts, requiredAuth: 'githubToken' as const },
  { name: 'getSecretScanningAlert', description: 'Get a secret scanning alert.', tool: getSecretScanningAlert, requiredAuth: 'githubToken' as const },
  { name: 'updateSecretScanningAlert', description: 'Update a secret scanning alert.', tool: updateSecretScanningAlert, requiredAuth: 'githubToken' as const },

  // Security Advisories
  { name: 'listRepositoryAdvisories', description: 'List repository security advisories.', tool: listRepositoryAdvisories, requiredAuth: 'githubToken' as const },
  { name: 'getRepositoryAdvisory', description: 'Get a repository security advisory.', tool: getRepositoryAdvisory, requiredAuth: 'githubToken' as const },
  { name: 'createRepositoryAdvisory', description: 'Create a repository security advisory.', tool: createRepositoryAdvisory, requiredAuth: 'githubToken' as const },
  { name: 'listGlobalAdvisories', description: 'List global security advisories.', tool: listGlobalAdvisories, requiredAuth: 'githubToken' as const },

  // Stars
  { name: 'listStarredRepos', description: 'List starred repositories.', tool: listStarredRepos, requiredAuth: 'githubToken' as const },
  { name: 'checkRepoStarred', description: 'Check if a repository is starred.', tool: checkRepoStarred, requiredAuth: 'githubToken' as const },
  { name: 'listStargazers', description: 'List stargazers for a repository.', tool: listStargazers, requiredAuth: 'githubToken' as const },

  // Statuses
  { name: 'createCommitStatus', description: 'Create a commit status.', tool: createCommitStatus, requiredAuth: 'githubToken' as const },
  { name: 'listCommitStatuses', description: 'List commit statuses.', tool: listCommitStatuses, requiredAuth: 'githubToken' as const },
  { name: 'getCombinedStatus', description: 'Get combined status for a ref.', tool: getCombinedStatus, requiredAuth: 'githubToken' as const },

  // Teams
  { name: 'listTeams', description: 'List organization teams.', tool: listTeams, requiredAuth: 'githubToken' as const },
  { name: 'createTeam', description: 'Create a team.', tool: createTeam, requiredAuth: 'githubToken' as const },
  { name: 'getTeam', description: 'Get a team.', tool: getTeam, requiredAuth: 'githubToken' as const },
  { name: 'updateTeam', description: 'Update a team.', tool: updateTeam, requiredAuth: 'githubToken' as const },
  { name: 'deleteTeam', description: 'Delete a team.', tool: deleteTeam, requiredAuth: 'githubToken' as const },
  { name: 'listTeamMembers', description: 'List team members.', tool: listTeamMembers, requiredAuth: 'githubToken' as const },
  { name: 'listTeamRepos', description: 'List team repositories.', tool: listTeamRepos, requiredAuth: 'githubToken' as const },
  { name: 'addTeamRepo', description: 'Add a repository to a team.', tool: addTeamRepo, requiredAuth: 'githubToken' as const },
  { name: 'removeTeamRepo', description: 'Remove a repository from a team.', tool: removeTeamRepo, requiredAuth: 'githubToken' as const },

  // Webhooks
  { name: 'listRepoWebhooks', description: 'List repository webhooks.', tool: listRepoWebhooks, requiredAuth: 'githubToken' as const },
  { name: 'createRepoWebhook', description: 'Create a repository webhook.', tool: createRepoWebhook, requiredAuth: 'githubToken' as const },
  { name: 'getRepoWebhook', description: 'Get a repository webhook.', tool: getRepoWebhook, requiredAuth: 'githubToken' as const },
  { name: 'updateRepoWebhook', description: 'Update a repository webhook.', tool: updateRepoWebhook, requiredAuth: 'githubToken' as const },
  { name: 'deleteRepoWebhook', description: 'Delete a repository webhook.', tool: deleteRepoWebhook, requiredAuth: 'githubToken' as const },
];
