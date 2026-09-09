// @ts-nocheck
export { listRepos } from './Repos/list-repos.js';
export { createRepo } from './Repos/create-repo.js';
export { getGitHubUser } from './Users/get-github-user.js';
export { listRepoIssues } from './Issues/list-repo-issues.js';
export { createIssue } from './Issues/create-issue.js';
export { getRepo } from './Repos/get-repo.js';
export { forkRepo } from './Repos/fork-repo.js';
export { starRepo } from './Repos/star-repo.js';
export { watchRepo } from './Repos/watch-repo.js';
export { getRepoContributors } from './Repos/get-repo-contributors.js';
export { getRepoLanguages } from './Repos/get-repo-languages.js';
export { searchRepos } from './Search/search-repos.js';
export { getFileContent } from './Files/get-file-content.js';
export { createOrUpdateFile } from './Files/create-or-update-file.js';
export { deleteFile } from './Files/delete-file.js';
export { listCommits } from './Commits/list-commits.js';
export { listBranchesForHeadCommit } from './Commits/list-branches-for-head-commit.js';
export { listPullRequestsAssociatedWithCommit } from './Commits/list-pull-requests-associated-with-commit.js';
export { getCommit } from './Commits/get-commit.js';
export { compareCommits } from './Commits/compare-commits.js';
export { listBranches } from './Repos/list-branches.js';
export { updateIssue } from './Issues/update-issue.js';
export { addIssueComment } from './Issues/add-issue-comment.js';
export { listIssueComments } from './Issues/list-issue-comments.js';
export { addIssueLabels } from './Issues/add-issue-labels.js';
export { removeIssueLabel } from './Issues/remove-issue-label.js';
export { addIssueAssignees } from './Issues/add-issue-assignees.js';
export { lockIssue } from './Issues/lock-issue.js';
export { searchIssues } from './Search/search-issues.js';
export { listPullRequests } from './PRs/list-pull-requests.js';
export { getPullRequest } from './PRs/get-pull-request.js';
export { createPullRequest } from './PRs/create-pull-request.js';
export { mergePullRequest } from './PRs/merge-pull-request.js';
export { listPullRequestFiles } from './PRs/list-pull-request-files.js';
export { createPullRequestReview } from './PRs/create-pull-request-review.js';
export { updatePullRequest } from './PRs/update-pull-request.js';
export { listPullRequestCommits } from './PRs/list-pull-request-commits.js';
export { checkPullRequestMerged } from './PRs/check-pull-request-merged.js';
export { updatePullRequestBranch } from './PRs/update-pull-request-branch.js';
export { listWorkflows } from './Workflows/list-workflows.js';
export { triggerWorkflow } from './Workflows/trigger-workflow.js';
export { listWorkflowRuns } from './Workflows/list-workflow-runs.js';
export { getWorkflowRun } from './Workflows/get-workflow-run.js';
export { listGists } from './Gists/list-gists.js';
export { createGist } from './Gists/create-gist.js';
export { getGist } from './Gists/get-gist.js';
export { searchUsers } from './Search/search-users.js';
export { followUser } from './Users/follow-user.js';
// New User imports
export { updateAuthenticatedUser } from './Users/update-authenticated-user.js';
export { getUserById } from './Users/get-user-by-id.js';
export { listUsers } from './Users/list-users.js';
export { getUser } from './Users/get-user.js';
export { getUserContext } from './Users/get-user-context.js';
// New Issues imports
export { getIssue } from './Issues/get-issue.js';
export { listAuthenticatedUserIssues } from './Issues/list-authenticated-user-issues.js';
export { listOrgIssues } from './Issues/list-org-issues.js';
export { listUserAccountIssues } from './Issues/list-user-account-issues.js';
export { unlockIssue } from './Issues/unlock-issue.js';

// Actions
export { listArtifacts } from './Actions/list-artifacts.js';
export { getArtifact } from './Actions/get-artifact.js';
export { deleteArtifact } from './Actions/delete-artifact.js';
export { listWorkflowRunArtifacts } from './Actions/list-workflow-run-artifacts.js';
export { listWorkflowJobs } from './Actions/list-workflow-jobs.js';
export { getWorkflowJob } from './Actions/get-workflow-job.js';

// Activity
export { listPublicEvents } from './Activity/list-public-events.js';
export { listRepoEvents } from './Activity/list-repo-events.js';
export { listUserEvents } from './Activity/list-user-events.js';
export { listNotifications } from './Activity/list-notifications.js';
export { markNotificationsRead } from './Activity/mark-notifications-read.js';

// Apps
export { getAuthenticatedApp } from './Apps/get-authenticated-app.js';
export { listInstallations } from './Apps/list-installations.js';
export { getInstallation } from './Apps/get-installation.js';

// Checks
export { createCheckRun } from './Checks/create-check-run.js';
export { getCheckRun } from './Checks/get-check-run.js';
export { updateCheckRun } from './Checks/update-check-run.js';
export { listCheckRuns } from './Checks/list-check-runs.js';
export { createCheckSuite } from './Checks/create-check-suite.js';
export { getCheckSuite } from './Checks/get-check-suite.js';

// Code Scanning
export { listCodeScanningAlerts } from './CodeScanning/list-alerts.js';
export { getCodeScanningAlert } from './CodeScanning/get-alert.js';
export { updateCodeScanningAlert } from './CodeScanning/update-alert.js';

// Collaborators
export { listCollaborators } from './Collaborators/list-collaborators.js';
export { checkCollaborator } from './Collaborators/check-collaborator.js';
export { addCollaborator } from './Collaborators/add-collaborator.js';
export { removeCollaborator } from './Collaborators/remove-collaborator.js';

// Dependabot
export { listDependabotAlerts } from './Dependabot/list-alerts.js';
export { getDependabotAlert } from './Dependabot/get-alert.js';
export { updateDependabotAlert } from './Dependabot/update-alert.js';

// Deploy Keys
export { listDeployKeys } from './DeployKeys/list-deploy-keys.js';
export { createDeployKey } from './DeployKeys/create-deploy-key.js';
export { getDeployKey } from './DeployKeys/get-deploy-key.js';
export { deleteDeployKey } from './DeployKeys/delete-deploy-key.js';

// Deployments
export { listDeployments } from './Deployments/list-deployments.js';
export { createDeployment } from './Deployments/create-deployment.js';
export { getDeployment } from './Deployments/get-deployment.js';
export { deleteDeployment } from './Deployments/delete-deployment.js';

// Environments
export { listEnvironments } from './Environments/list-environments.js';
export { getEnvironment } from './Environments/get-environment.js';
export { createOrUpdateEnvironment } from './Environments/create-or-update-environment.js';
export { deleteEnvironment } from './Environments/delete-environment.js';

// Git
export { getBlob } from './Git/get-blob.js';
export { createBlob } from './Git/create-blob.js';
export { getGitCommit } from './Git/get-git-commit.js';
export { createGitCommit } from './Git/create-git-commit.js';
export { getRef } from './Git/get-ref.js';
export { createRef } from './Git/create-ref.js';
export { updateRef } from './Git/update-ref.js';
export { deleteRef } from './Git/delete-ref.js';
export { getTree } from './Git/get-tree.js';
export { createTree } from './Git/create-tree.js';

// Licenses
export { listLicenses } from './Licenses/list-licenses.js';
export { getLicense } from './Licenses/get-license.js';
export { getRepoLicense } from './Licenses/get-repo-license.js';

// Markdown
export { renderMarkdown } from './Markdown/render-markdown.js';

// Organizations
export { getOrganization } from './Organizations/get-organization.js';
export { listUserOrganizations } from './Organizations/list-user-organizations.js';
export { listOrgRepositories } from './Organizations/list-org-repositories.js';
export { listOrgMembers } from './Organizations/list-org-members.js';
export { getOrgMembership } from './Organizations/get-org-membership.js';
export { listOrganizations } from './Organizations/list-organizations.js';
export { updateOrganization } from './Organizations/update-organization.js';

// Projects
export { listRepoProjects } from './Projects/list-repo-projects.js';
export { listOrgProjects } from './Projects/list-org-projects.js';
export { createOrgProject } from './Projects/create-org-project.js';
export { getProject } from './Projects/get-project.js';
export { updateProject } from './Projects/update-project.js';
export { deleteProject } from './Projects/delete-project.js';
export { listProjectColumns } from './Projects/list-project-columns.js';

// Rate Limit
export { getRateLimit } from './RateLimit/get-rate-limit.js';

// Reactions
export { listIssueReactions } from './Reactions/list-issue-reactions.js';
export { createIssueReaction } from './Reactions/create-issue-reaction.js';
export { listPRCommentReactions } from './Reactions/list-pr-comment-reactions.js';
export { listCommitCommentReactions } from './Reactions/list-commit-comment-reactions.js';
export { createCommitCommentReaction } from './Reactions/create-commit-comment-reaction.js';
export { deleteReaction } from './Reactions/delete-reaction.js';

// Releases
export { listReleases } from './Releases/list-releases.js';
export { createRelease } from './Releases/create-release.js';
export { getRelease } from './Releases/get-release.js';
export { updateRelease } from './Releases/update-release.js';
export { deleteRelease } from './Releases/delete-release.js';
export { getLatestRelease } from './Releases/get-latest-release.js';
export { generateReleaseNotes } from './Releases/generate-release-notes.js';

// Secret Scanning
export { listSecretScanningAlerts } from './SecretScanning/list-alerts.js';
export { getSecretScanningAlert } from './SecretScanning/get-alert.js';
export { updateSecretScanningAlert } from './SecretScanning/update-alert.js';

// Security Advisories
export { listRepositoryAdvisories } from './SecurityAdvisories/list-repository-advisories.js';
export { getRepositoryAdvisory } from './SecurityAdvisories/get-repository-advisory.js';
export { createRepositoryAdvisory } from './SecurityAdvisories/create-repository-advisory.js';
export { listGlobalAdvisories } from './SecurityAdvisories/list-global-advisories.js';

// Stars
export { listStarredRepos } from './Stars/list-starred-repos.js';
export { checkRepoStarred } from './Stars/check-repo-starred.js';
export { listStargazers } from './Stars/list-stargazers.js';

// Statuses
export { createCommitStatus } from './Statuses/create-commit-status.js';
export { listCommitStatuses } from './Statuses/list-commit-statuses.js';
export { getCombinedStatus } from './Statuses/get-combined-status.js';

// Teams
export { listTeams } from './Teams/list-teams.js';
export { createTeam } from './Teams/create-team.js';
export { getTeam } from './Teams/get-team.js';
export { updateTeam } from './Teams/update-team.js';
export { deleteTeam } from './Teams/delete-team.js';
export { listTeamMembers } from './Teams/list-team-members.js';
export { listTeamRepos } from './Teams/list-team-repos.js';
export { addTeamRepo } from './Teams/add-team-repo.js';
export { removeTeamRepo } from './Teams/remove-team-repo.js';

// Webhooks
export { listRepoWebhooks } from './Webhooks/list-repo-webhooks.js';
export { createRepoWebhook } from './Webhooks/create-repo-webhook.js';
export { getRepoWebhook } from './Webhooks/get-repo-webhook.js';
export { updateRepoWebhook } from './Webhooks/update-repo-webhook.js';
export { deleteRepoWebhook } from './Webhooks/delete-repo-webhook.js';

import { listRepos } from './Repos/list-repos.js';
import { createRepo } from './Repos/create-repo.js';
import { getGitHubUser } from './Users/get-github-user.js';
import { listRepoIssues } from './Issues/list-repo-issues.js';
import { createIssue } from './Issues/create-issue.js';
import { getRepo } from './Repos/get-repo.js';
import { forkRepo } from './Repos/fork-repo.js';
import { starRepo } from './Repos/star-repo.js';
import { watchRepo } from './Repos/watch-repo.js';
import { getRepoContributors } from './Repos/get-repo-contributors.js';
import { getRepoLanguages } from './Repos/get-repo-languages.js';
import { searchRepos } from './Search/search-repos.js';
import { getFileContent } from './Files/get-file-content.js';
import { createOrUpdateFile } from './Files/create-or-update-file.js';
import { deleteFile } from './Files/delete-file.js';
import { listCommits } from './Commits/list-commits.js';
import { listBranchesForHeadCommit } from './Commits/list-branches-for-head-commit.js';
import { listPullRequestsAssociatedWithCommit } from './Commits/list-pull-requests-associated-with-commit.js';
import { getCommit } from './Commits/get-commit.js';
import { compareCommits } from './Commits/compare-commits.js';
import { listBranches } from './Repos/list-branches.js';
import { updateIssue } from './Issues/update-issue.js';
import { addIssueComment } from './Issues/add-issue-comment.js';
import { listIssueComments } from './Issues/list-issue-comments.js';
import { addIssueLabels } from './Issues/add-issue-labels.js';
import { removeIssueLabel } from './Issues/remove-issue-label.js';
import { addIssueAssignees } from './Issues/add-issue-assignees.js';
import { lockIssue } from './Issues/lock-issue.js';
import { searchIssues } from './Search/search-issues.js';
import { listPullRequests } from './PRs/list-pull-requests.js';
import { getPullRequest } from './PRs/get-pull-request.js';
import { createPullRequest } from './PRs/create-pull-request.js';
import { mergePullRequest } from './PRs/merge-pull-request.js';
import { listPullRequestFiles } from './PRs/list-pull-request-files.js';
import { createPullRequestReview } from './PRs/create-pull-request-review.js';
import { updatePullRequest } from './PRs/update-pull-request.js';
import { listPullRequestCommits } from './PRs/list-pull-request-commits.js';
import { checkPullRequestMerged } from './PRs/check-pull-request-merged.js';
import { updatePullRequestBranch } from './PRs/update-pull-request-branch.js';
import { listWorkflows } from './Workflows/list-workflows.js';
import { triggerWorkflow } from './Workflows/trigger-workflow.js';
import { listWorkflowRuns } from './Workflows/list-workflow-runs.js';
import { getWorkflowRun } from './Workflows/get-workflow-run.js';
import { listGists } from './Gists/list-gists.js';
import { createGist } from './Gists/create-gist.js';
import { getGist } from './Gists/get-gist.js';
import { searchUsers } from './Search/search-users.js';
import { followUser } from './Users/follow-user.js';
// New User imports
import { updateAuthenticatedUser } from './Users/update-authenticated-user.js';
import { getUserById } from './Users/get-user-by-id.js';
import { listUsers } from './Users/list-users.js';
import { getUser } from './Users/get-user.js';
import { getUserContext } from './Users/get-user-context.js';
// New Search imports
import { searchCode } from './Search/search-code.js';
import { searchCommits } from './Search/search-commits.js';
import { searchLabels } from './Search/search-labels.js';
import { searchTopics } from './Search/search-topics.js';
// New Issues imports
import { getIssue } from './Issues/get-issue.js';
import { listAuthenticatedUserIssues } from './Issues/list-authenticated-user-issues.js';
import { listOrgIssues } from './Issues/list-org-issues.js';
import { listUserAccountIssues } from './Issues/list-user-account-issues.js';
import { unlockIssue } from './Issues/unlock-issue.js';

// Actions
import { listArtifacts } from './Actions/list-artifacts.js';
import { getArtifact } from './Actions/get-artifact.js';
import { deleteArtifact } from './Actions/delete-artifact.js';
import { listWorkflowRunArtifacts } from './Actions/list-workflow-run-artifacts.js';
import { listWorkflowJobs } from './Actions/list-workflow-jobs.js';
import { getWorkflowJob } from './Actions/get-workflow-job.js';

// Activity
import { listPublicEvents } from './Activity/list-public-events.js';
import { listRepoEvents } from './Activity/list-repo-events.js';
import { listUserEvents } from './Activity/list-user-events.js';
import { listNotifications } from './Activity/list-notifications.js';
import { markNotificationsRead } from './Activity/mark-notifications-read.js';

// Apps
import { getAuthenticatedApp } from './Apps/get-authenticated-app.js';
import { listInstallations } from './Apps/list-installations.js';
import { getInstallation } from './Apps/get-installation.js';

// Checks
import { createCheckRun } from './Checks/create-check-run.js';
import { getCheckRun } from './Checks/get-check-run.js';
import { updateCheckRun } from './Checks/update-check-run.js';
import { listCheckRuns } from './Checks/list-check-runs.js';
import { createCheckSuite } from './Checks/create-check-suite.js';
import { getCheckSuite } from './Checks/get-check-suite.js';

// Code Scanning
import { listCodeScanningAlerts } from './CodeScanning/list-alerts.js';
import { getCodeScanningAlert } from './CodeScanning/get-alert.js';
import { updateCodeScanningAlert } from './CodeScanning/update-alert.js';

// Collaborators
import { listCollaborators } from './Collaborators/list-collaborators.js';
import { checkCollaborator } from './Collaborators/check-collaborator.js';
import { addCollaborator } from './Collaborators/add-collaborator.js';
import { removeCollaborator } from './Collaborators/remove-collaborator.js';

// Dependabot
import { listDependabotAlerts } from './Dependabot/list-alerts.js';
import { getDependabotAlert } from './Dependabot/get-alert.js';
import { updateDependabotAlert } from './Dependabot/update-alert.js';

// Deploy Keys
import { listDeployKeys } from './DeployKeys/list-deploy-keys.js';
import { createDeployKey } from './DeployKeys/create-deploy-key.js';
import { getDeployKey } from './DeployKeys/get-deploy-key.js';
import { deleteDeployKey } from './DeployKeys/delete-deploy-key.js';

// Deployments
import { listDeployments } from './Deployments/list-deployments.js';
import { createDeployment } from './Deployments/create-deployment.js';
import { getDeployment } from './Deployments/get-deployment.js';
import { deleteDeployment } from './Deployments/delete-deployment.js';

// Environments
import { listEnvironments } from './Environments/list-environments.js';
import { getEnvironment } from './Environments/get-environment.js';
import { createOrUpdateEnvironment } from './Environments/create-or-update-environment.js';
import { deleteEnvironment } from './Environments/delete-environment.js';

// Git
import { getBlob } from './Git/get-blob.js';
import { createBlob } from './Git/create-blob.js';
import { getGitCommit } from './Git/get-git-commit.js';
import { createGitCommit } from './Git/create-git-commit.js';
import { getRef } from './Git/get-ref.js';
import { createRef } from './Git/create-ref.js';
import { updateRef } from './Git/update-ref.js';
import { deleteRef } from './Git/delete-ref.js';
import { getTree } from './Git/get-tree.js';
import { createTree } from './Git/create-tree.js';

// Licenses
import { listLicenses } from './Licenses/list-licenses.js';
import { getLicense } from './Licenses/get-license.js';
import { getRepoLicense } from './Licenses/get-repo-license.js';

// Markdown
import { renderMarkdown } from './Markdown/render-markdown.js';

// Organizations
import { getOrganization } from './Organizations/get-organization.js';
import { listUserOrganizations } from './Organizations/list-user-organizations.js';
import { listOrgRepositories } from './Organizations/list-org-repositories.js';
import { listOrgMembers } from './Organizations/list-org-members.js';
import { getOrgMembership } from './Organizations/get-org-membership.js';
import { listOrganizations } from './Organizations/list-organizations.js';
import { updateOrganization } from './Organizations/update-organization.js';

// Projects
import { listRepoProjects } from './Projects/list-repo-projects.js';
import { listOrgProjects } from './Projects/list-org-projects.js';
import { createOrgProject } from './Projects/create-org-project.js';
import { getProject } from './Projects/get-project.js';
import { updateProject } from './Projects/update-project.js';
import { deleteProject } from './Projects/delete-project.js';
import { listProjectColumns } from './Projects/list-project-columns.js';

// Rate Limit
import { getRateLimit } from './RateLimit/get-rate-limit.js';

// Reactions
import { listIssueReactions } from './Reactions/list-issue-reactions.js';
import { createIssueReaction } from './Reactions/create-issue-reaction.js';
import { listPRCommentReactions } from './Reactions/list-pr-comment-reactions.js';
import { listCommitCommentReactions } from './Reactions/list-commit-comment-reactions.js';
import { createCommitCommentReaction } from './Reactions/create-commit-comment-reaction.js';
import { deleteReaction } from './Reactions/delete-reaction.js';

// Releases
import { listReleases } from './Releases/list-releases.js';
import { createRelease } from './Releases/create-release.js';
import { getRelease } from './Releases/get-release.js';
import { updateRelease } from './Releases/update-release.js';
import { deleteRelease } from './Releases/delete-release.js';
import { getLatestRelease } from './Releases/get-latest-release.js';
import { generateReleaseNotes } from './Releases/generate-release-notes.js';

// Secret Scanning
import { listSecretScanningAlerts } from './SecretScanning/list-alerts.js';
import { getSecretScanningAlert } from './SecretScanning/get-alert.js';
import { updateSecretScanningAlert } from './SecretScanning/update-alert.js';

// Security Advisories
import { listRepositoryAdvisories } from './SecurityAdvisories/list-repository-advisories.js';
import { getRepositoryAdvisory } from './SecurityAdvisories/get-repository-advisory.js';
import { createRepositoryAdvisory } from './SecurityAdvisories/create-repository-advisory.js';
import { listGlobalAdvisories } from './SecurityAdvisories/list-global-advisories.js';

// Stars
import { listStarredRepos } from './Stars/list-starred-repos.js';
import { checkRepoStarred } from './Stars/check-repo-starred.js';
import { listStargazers } from './Stars/list-stargazers.js';

// Statuses
import { createCommitStatus } from './Statuses/create-commit-status.js';
import { listCommitStatuses } from './Statuses/list-commit-statuses.js';
import { getCombinedStatus } from './Statuses/get-combined-status.js';

// Teams
import { listTeams } from './Teams/list-teams.js';
import { createTeam } from './Teams/create-team.js';
import { getTeam } from './Teams/get-team.js';
import { updateTeam } from './Teams/update-team.js';
import { deleteTeam } from './Teams/delete-team.js';
import { listTeamMembers } from './Teams/list-team-members.js';
import { listTeamRepos } from './Teams/list-team-repos.js';
import { addTeamRepo } from './Teams/add-team-repo.js';
import { removeTeamRepo } from './Teams/remove-team-repo.js';

// Webhooks
import { listRepoWebhooks } from './Webhooks/list-repo-webhooks.js';
import { createRepoWebhook } from './Webhooks/create-repo-webhook.js';
import { getRepoWebhook } from './Webhooks/get-repo-webhook.js';
import { updateRepoWebhook } from './Webhooks/update-repo-webhook.js';
import { deleteRepoWebhook } from './Webhooks/delete-repo-webhook.js';

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
