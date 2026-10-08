// @ts-nocheck
import { launchdarklyListProjects } from './projects.js';
import { launchdarklyGetProject } from './projects.js';
import { launchdarklyListEnvironments } from './projects.js';
import { launchdarklyGetEnvironment } from './projects.js';
import { launchdarklyListFlags } from './flags.js';
import { launchdarklyGetFlag } from './flags.js';
import { launchdarklyCreateFlag } from './flags.js';
import { launchdarklyPatchFlag } from './flags.js';
import { launchdarklySetFlagEnvironment } from './flags.js';
import { launchdarklyDeleteFlag } from './flags.js';
import { launchdarklyListMembers } from './members.js';
import { launchdarklyGetMember } from './members.js';

export {
  launchdarklyListProjects,
  launchdarklyGetProject,
  launchdarklyListEnvironments,
  launchdarklyGetEnvironment,
  launchdarklyListFlags,
  launchdarklyGetFlag,
  launchdarklyCreateFlag,
  launchdarklyPatchFlag,
  launchdarklySetFlagEnvironment,
  launchdarklyDeleteFlag,
  launchdarklyListMembers,
  launchdarklyGetMember,
};

const auth = 'launchdarklyApiToken' as const;
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

export const launchdarklyTools = [
  entry('launchdarklyListProjects', launchdarklyListProjects, 'read', []),
  entry('launchdarklyGetProject', launchdarklyGetProject, 'read', []),
  entry('launchdarklyListEnvironments', launchdarklyListEnvironments, 'read', []),
  entry('launchdarklyGetEnvironment', launchdarklyGetEnvironment, 'read', []),
  entry('launchdarklyListFlags', launchdarklyListFlags, 'read', []),
  entry('launchdarklyGetFlag', launchdarklyGetFlag, 'read', []),
  entry('launchdarklyCreateFlag', launchdarklyCreateFlag, 'write', []),
  entry('launchdarklyPatchFlag', launchdarklyPatchFlag, 'write', []),
  entry('launchdarklySetFlagEnvironment', launchdarklySetFlagEnvironment, 'write', []),
  entry('launchdarklyDeleteFlag', launchdarklyDeleteFlag, 'delete', []),
  entry('launchdarklyListMembers', launchdarklyListMembers, 'read', []),
  entry('launchdarklyGetMember', launchdarklyGetMember, 'read', []),
];
