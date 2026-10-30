// @ts-nocheck
import { netlifyCreateBuildHook } from './create-build-hook.js';
import { netlifyCreateDeploy } from './create-deploy.js';
import { netlifyCreateEnvVar } from './create-env-var.js';
import { netlifyCreateSite } from './create-site.js';
import { netlifyDeleteEnvVar } from './delete-env-var.js';
import { netlifyDeleteSite } from './delete-site.js';
import { netlifyDeleteSubmission } from './delete-submission.js';
import { netlifyGetCurrentUser } from './get-current-user.js';
import { netlifyGetDeploy } from './get-deploy.js';
import { netlifyGetSite } from './get-site.js';
import { netlifyGetSubmission } from './get-submission.js';
import { netlifyListBuildHooks } from './list-build-hooks.js';
import { netlifyListDeploys } from './list-deploys.js';
import { netlifyListEnvVars } from './list-env-vars.js';
import { netlifyListForms } from './list-forms.js';
import { netlifyListFunctions } from './list-functions.js';
import { netlifyListSites } from './list-sites.js';
import { netlifyListSubmissions } from './list-submissions.js';
import { netlifyPurgeCache } from './purge-cache.js';
import { netlifyRestoreDeploy } from './restore-deploy.js';
import { netlifyTriggerBuildHook } from './trigger-build-hook.js';
import { netlifyUpdateEnvVar } from './update-env-var.js';
import { netlifyUpdateSite } from './update-site.js';

export {
  netlifyCreateBuildHook,
  netlifyCreateDeploy,
  netlifyCreateEnvVar,
  netlifyCreateSite,
  netlifyDeleteEnvVar,
  netlifyDeleteSite,
  netlifyDeleteSubmission,
  netlifyGetCurrentUser,
  netlifyGetDeploy,
  netlifyGetSite,
  netlifyGetSubmission,
  netlifyListBuildHooks,
  netlifyListDeploys,
  netlifyListEnvVars,
  netlifyListForms,
  netlifyListFunctions,
  netlifyListSites,
  netlifyListSubmissions,
  netlifyPurgeCache,
  netlifyRestoreDeploy,
  netlifyTriggerBuildHook,
  netlifyUpdateEnvVar,
  netlifyUpdateSite,
};

export const netlifyTools = [
  {
    name: 'netlifyListSites',
    description:
      'Lists Netlify sites on the account with page/per_page pagination, filterable by name substring. Returns each site id, name, and URLs.',
    tool: netlifyListSites,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['sites', 'projects', 'websites', 'list'],
  },
  {
    name: 'netlifyGetSite',
    description:
      'Gets one Netlify site by id or name: live/ssl/admin URLs, custom domain, git and build settings, published deploy, and account.',
    tool: netlifyGetSite,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['site', 'details', 'settings', 'domain', 'lookup'],
  },
  {
    name: 'netlifyCreateSite',
    description:
      'Creates a Netlify site, optionally connecting a git repository (provider, repo, branch, build command, publish dir) so Netlify builds and deploys on push.',
    tool: netlifyCreateSite,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['new site', 'create', 'deploy', 'hosting', 'repo'],
  },
  {
    name: 'netlifyUpdateSite',
    description:
      'Updates a Netlify site: rename it, change the custom domain or aliases, toggle force SSL, or set a password. Only provided fields change.',
    tool: netlifyUpdateSite,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['edit', 'rename', 'domain', 'settings', 'update'],
  },
  {
    name: 'netlifyDeleteSite',
    description:
      'Deletes a Netlify site permanently (site, deploys, and forms). Use only when the user explicitly asks to remove it.',
    tool: netlifyDeleteSite,
    requiredAuth: 'netlifyToken' as const,
    scope: 'delete' as const,
    keywords: ['remove', 'delete', 'site', 'teardown'],
  },
  {
    name: 'netlifyListDeploys',
    description:
      'Lists a Netlify site’s deploys newest first, with each deploy’s state (ready/error/building), branch, commit, and URLs.',
    tool: netlifyListDeploys,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['deploys', 'deployments', 'releases', 'builds', 'history'],
  },
  {
    name: 'netlifyGetDeploy',
    description:
      'Gets one Netlify deploy by id: state, branch, commit sha and message, URLs, failure error message, and required file digests.',
    tool: netlifyGetDeploy,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['deploy', 'details', 'status', 'commit', 'logs'],
  },
  {
    name: 'netlifyCreateDeploy',
    description:
      'Creates a deploy on a Netlify site: rebuild a git-connected branch, or start a digest-based deploy from a path -> SHA1 map. Starts a real deployment.',
    tool: netlifyCreateDeploy,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['deploy', 'publish', 'release', 'ship', 'build'],
  },
  {
    name: 'netlifyRestoreDeploy',
    description:
      'Restores a previous Netlify deploy, making it live again — the standard rollback. Changes what visitors see.',
    tool: netlifyRestoreDeploy,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['rollback', 'revert', 'restore', 'undo', 'previous deploy'],
  },
  {
    name: 'netlifyListBuildHooks',
    description:
      'Lists a Netlify site’s build hooks, each with a title, branch, and a URL that triggers a build when POSTed to.',
    tool: netlifyListBuildHooks,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['build hooks', 'webhooks', 'triggers', 'list'],
  },
  {
    name: 'netlifyCreateBuildHook',
    description:
      'Creates a build hook on a Netlify site: a URL that starts a build of the given branch when called with POST. Returns the hook URL.',
    tool: netlifyCreateBuildHook,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['build hook', 'trigger', 'webhook', 'rebuild', 'create'],
  },
  {
    name: 'netlifyTriggerBuildHook',
    description:
      'Triggers a Netlify build by POSTing to a build-hook URL from createBuildHook/listBuildHooks. Starts a real build/deploy.',
    tool: netlifyTriggerBuildHook,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['trigger', 'rebuild', 'build hook', 'deploy now', 'fire'],
  },
  {
    name: 'netlifyListForms',
    description:
      'Lists the forms detected on a Netlify site with their ids, names, submission counts, and fields.',
    tool: netlifyListForms,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['forms', 'contact form', 'submissions', 'list'],
  },
  {
    name: 'netlifyListSubmissions',
    description:
      'Lists submissions of a Netlify form newest first, with the submitted fields, email, and meta (ip, user agent, referrer).',
    tool: netlifyListSubmissions,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['submissions', 'form entries', 'responses', 'leads', 'inbox'],
  },
  {
    name: 'netlifyGetSubmission',
    description: 'Gets one Netlify form submission by id: field values, email, and meta data.',
    tool: netlifyGetSubmission,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['submission', 'form entry', 'details', 'lookup'],
  },
  {
    name: 'netlifyDeleteSubmission',
    description:
      'Deletes a single Netlify form submission permanently. Use only when the user explicitly asks (e.g. spam or GDPR deletion).',
    tool: netlifyDeleteSubmission,
    requiredAuth: 'netlifyToken' as const,
    scope: 'delete' as const,
    keywords: ['remove', 'delete', 'spam', 'gdpr', 'submission'],
  },
  {
    name: 'netlifyListFunctions',
    description:
      'Lists the serverless functions deployed on a Netlify site with their names and runtimes, optionally filtered by name substring.',
    tool: netlifyListFunctions,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['functions', 'serverless', 'lambda', 'endpoints', 'list'],
  },
  {
    name: 'netlifyListEnvVars',
    description:
      "Lists a Netlify site's environment variables with their deploy contexts and scopes; secret variables show redacted metadata.",
    tool: netlifyListEnvVars,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['env vars', 'environment', 'config', 'secrets', 'variables'],
  },
  {
    name: 'netlifyCreateEnvVar',
    description:
      'Creates an environment variable on a Netlify site (site-level) with a value, deploy context (default all), and scopes. Takes effect on the next build.',
    tool: netlifyCreateEnvVar,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['env var', 'environment', 'config', 'secret', 'set'],
  },
  {
    name: 'netlifyUpdateEnvVar',
    description:
      "Updates an existing environment variable's value for a deploy context on a Netlify site. Other contexts keep their values.",
    tool: netlifyUpdateEnvVar,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['env var', 'change value', 'rotate', 'config', 'update'],
  },
  {
    name: 'netlifyDeleteEnvVar',
    description:
      'Deletes an environment variable from a Netlify site (all contexts). Use updateEnvVar instead to just change a value.',
    tool: netlifyDeleteEnvVar,
    requiredAuth: 'netlifyToken' as const,
    scope: 'delete' as const,
    keywords: ['remove', 'delete', 'env var', 'unset', 'config'],
  },
  {
    name: 'netlifyPurgeCache',
    description:
      'Purges Netlify’s CDN cache for a site — everything, or just content with given cache tags. Visitors get fresh content on the next request.',
    tool: netlifyPurgeCache,
    requiredAuth: 'netlifyToken' as const,
    scope: 'write' as const,
    keywords: ['cache', 'purge', 'cdn', 'flush', 'refresh'],
  },
  {
    name: 'netlifyGetCurrentUser',
    description:
      'Gets the Netlify user tied to the token (name, email, accounts). Confirms the token works and reveals account ids.',
    tool: netlifyGetCurrentUser,
    requiredAuth: 'netlifyToken' as const,
    scope: 'read' as const,
    keywords: ['me', 'current user', 'profile', 'account', 'whoami'],
  },
];
