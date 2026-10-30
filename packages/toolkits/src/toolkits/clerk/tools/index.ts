// @ts-nocheck
import { clerkAddOrganizationMember } from './add-organization-member.js';
import { clerkBanUser } from './ban-user.js';
import { clerkCreateOrganization } from './create-organization.js';
import { clerkCreateOrganizationInvitation } from './create-organization-invitation.js';
import { clerkCreateSessionToken } from './create-session-token.js';
import { clerkCreateSignInToken } from './create-sign-in-token.js';
import { clerkCreateUser } from './create-user.js';
import { clerkDeleteOrganization } from './delete-organization.js';
import { clerkDeleteUser } from './delete-user.js';
import { clerkGetOrganization } from './get-organization.js';
import { clerkGetSession } from './get-session.js';
import { clerkGetUser } from './get-user.js';
import { clerkListJwtTemplates } from './list-jwt-templates.js';
import { clerkListOrganizationInvitations } from './list-organization-invitations.js';
import { clerkListOrganizationMembers } from './list-organization-members.js';
import { clerkListOrganizations } from './list-organizations.js';
import { clerkListSessions } from './list-sessions.js';
import { clerkListUsers } from './list-users.js';
import { clerkRemoveOrganizationMember } from './remove-organization-member.js';
import { clerkRevokeSession } from './revoke-session.js';
import { clerkSetUserMetadata } from './set-user-metadata.js';
import { clerkUnbanUser } from './unban-user.js';
import { clerkUpdateOrganization } from './update-organization.js';
import { clerkUpdateOrganizationMember } from './update-organization-member.js';
import { clerkUpdateUser } from './update-user.js';

export {
  clerkAddOrganizationMember,
  clerkBanUser,
  clerkCreateOrganization,
  clerkCreateOrganizationInvitation,
  clerkCreateSessionToken,
  clerkCreateSignInToken,
  clerkCreateUser,
  clerkDeleteOrganization,
  clerkDeleteUser,
  clerkGetOrganization,
  clerkGetSession,
  clerkGetUser,
  clerkListJwtTemplates,
  clerkListOrganizationInvitations,
  clerkListOrganizationMembers,
  clerkListOrganizations,
  clerkListSessions,
  clerkListUsers,
  clerkRemoveOrganizationMember,
  clerkRevokeSession,
  clerkSetUserMetadata,
  clerkUnbanUser,
  clerkUpdateOrganization,
  clerkUpdateOrganizationMember,
  clerkUpdateUser,
};

export const clerkTools = [
  {
    name: 'clerkListUsers',
    description:
      'Lists users of the Clerk instance with limit/offset (or starting_after cursor) pagination, filterable by email, phone, username, external ID, organization, or banned state.',
    tool: clerkListUsers,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['users', 'accounts', 'members', 'directory', 'list'],
  },
  {
    name: 'clerkGetUser',
    description:
      'Gets one Clerk user by ID: identities, emails, phones, username, metadata, banned/locked state, and last sign-in.',
    tool: clerkGetUser,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['user', 'profile', 'account', 'details', 'lookup'],
  },
  {
    name: 'clerkCreateUser',
    description:
      'Creates a user in Clerk with an email address, phone number, and/or username (optionally a password). Use skipPasswordChecks for admin-created accounts.',
    tool: clerkCreateUser,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['create user', 'add user', 'signup', 'register', 'new account'],
  },
  {
    name: 'clerkUpdateUser',
    description:
      'Updates a Clerk user: rename, change username, set the primary email, reset a password, or sign out of other sessions. Only provided fields change.',
    tool: clerkUpdateUser,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['edit user', 'rename', 'password', 'profile', 'update'],
  },
  {
    name: 'clerkDeleteUser',
    description:
      'Permanently deletes a Clerk user with all sessions, identities, and metadata. Cannot be undone — only when explicitly asked (account deletion / GDPR).',
    tool: clerkDeleteUser,
    requiredAuth: 'clerkToken' as const,
    scope: 'delete' as const,
    keywords: ['delete user', 'remove', 'gdpr', 'erase', 'account deletion'],
  },
  {
    name: 'clerkSetUserMetadata',
    description:
      'Merges metadata into a Clerk user: public (client-readable), private (server-only), or unsafe metadata. Provided keys are merged over existing values.',
    tool: clerkSetUserMetadata,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['metadata', 'flags', 'plan', 'custom fields', 'tags'],
  },
  {
    name: 'clerkBanUser',
    description:
      'Bans a Clerk user: they are signed out and cannot sign in again until unbanned. For moderation/abuse response when explicitly asked.',
    tool: clerkBanUser,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['ban', 'block', 'suspend', 'moderation', 'disable access'],
  },
  {
    name: 'clerkUnbanUser',
    description: 'Removes a ban from a Clerk user so they can sign in again.',
    tool: clerkUnbanUser,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['unban', 'unblock', 'restore', 'reinstate', 'enable access'],
  },
  {
    name: 'clerkListSessions',
    description:
      'Lists sessions of the Clerk instance, filterable by user, client, or status (active/revoked/ended/expired) — see where and when users are signed in.',
    tool: clerkListSessions,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['sessions', 'sign-ins', 'logins', 'devices', 'active users'],
  },
  {
    name: 'clerkGetSession',
    description:
      'Gets one Clerk session by ID: status, user and client IDs, active organization, and created/last-active/expire times.',
    tool: clerkGetSession,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['session', 'details', 'status', 'activity', 'lookup'],
  },
  {
    name: 'clerkRevokeSession',
    description:
      'Revokes a Clerk session, signing that device out immediately (security response, "log this device out").',
    tool: clerkRevokeSession,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['revoke', 'sign out', 'logout', 'kill session', 'force sign-out'],
  },
  {
    name: 'clerkCreateSessionToken',
    description:
      'Creates a session token (optionally from a JWT template) for an active Clerk session — let a backend act "as" that user. Short-lived and sensitive.',
    tool: clerkCreateSessionToken,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['token', 'jwt', 'session token', 'impersonate', 'mint token'],
  },
  {
    name: 'clerkListOrganizations',
    description:
      'Lists organizations (B2B tenants/workspaces) of the Clerk instance, filterable by name/domain query or by member user, newest first.',
    tool: clerkListOrganizations,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['organizations', 'orgs', 'tenants', 'workspaces', 'teams', 'list'],
  },
  {
    name: 'clerkGetOrganization',
    description:
      'Gets one Clerk organization by ID or slug: name, slug, verified domains, logo, metadata, and member counts.',
    tool: clerkGetOrganization,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['organization', 'org', 'tenant', 'workspace', 'details'],
  },
  {
    name: 'clerkCreateOrganization',
    description:
      'Creates an organization in Clerk with a name and slug (optionally a verified domain for auto-join). Returns the new org ID.',
    tool: clerkCreateOrganization,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['create organization', 'new org', 'tenant', 'workspace', 'b2b'],
  },
  {
    name: 'clerkUpdateOrganization',
    description:
      'Updates a Clerk organization: rename it, change the slug, logo, or membership limits. Only provided fields change.',
    tool: clerkUpdateOrganization,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['edit organization', 'rename org', 'slug', 'settings', 'update'],
  },
  {
    name: 'clerkDeleteOrganization',
    description:
      'Permanently deletes a Clerk organization with its memberships and invitations. Cannot be undone — only when explicitly asked.',
    tool: clerkDeleteOrganization,
    requiredAuth: 'clerkToken' as const,
    scope: 'delete' as const,
    keywords: ['delete organization', 'remove org', 'teardown', 'tenant removal'],
  },
  {
    name: 'clerkListOrganizationMembers',
    description:
      'Lists the members of a Clerk organization with their roles and membership status, filterable by user or role.',
    tool: clerkListOrganizationMembers,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['members', 'membership', 'org members', 'team', 'roster'],
  },
  {
    name: 'clerkAddOrganizationMember',
    description:
      'Adds an existing Clerk user to an organization with a role (e.g. \"basic_member\", \"org:admin\"). Use createOrganizationInvitation to onboard by email instead.',
    tool: clerkAddOrganizationMember,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['add member', 'invite user to org', 'grant access', 'team add'],
  },
  {
    name: 'clerkUpdateOrganizationMember',
    description:
      'Changes a member’s role in a Clerk organization — promote to org:admin or demote to basic_member.',
    tool: clerkUpdateOrganizationMember,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['change role', 'promote', 'demote', 'permissions', 'member role'],
  },
  {
    name: 'clerkRemoveOrganizationMember',
    description:
      'Removes a member from a Clerk organization (the user still exists, they just lose access to this org).',
    tool: clerkRemoveOrganizationMember,
    requiredAuth: 'clerkToken' as const,
    scope: 'delete' as const,
    keywords: ['remove member', 'kick', 'revoke org access', 'offboard'],
  },
  {
    name: 'clerkListOrganizationInvitations',
    description:
      'Lists invitations of a Clerk organization (pending/accepted/revoked) with the invited email, role, and expiry.',
    tool: clerkListOrganizationInvitations,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['invitations', 'pending invites', 'org invites', 'list'],
  },
  {
    name: 'clerkCreateOrganizationInvitation',
    description:
      'Invites an email address to join a Clerk organization with a role; Clerk emails an accept link. Set notify=false to create it silently.',
    tool: clerkCreateOrganizationInvitation,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['invite', 'invitation', 'email invite', 'org invite', 'onboard'],
  },
  {
    name: 'clerkListJwtTemplates',
    description:
      'Lists the JWT templates configured for the Clerk instance — templates define claims Clerk stamps into tokens for third-party services.',
    tool: clerkListJwtTemplates,
    requiredAuth: 'clerkToken' as const,
    scope: 'read' as const,
    keywords: ['jwt templates', 'tokens', 'claims', 'integrations', 'list'],
  },
  {
    name: 'clerkCreateSignInToken',
    description:
      'Creates a one-time sign-in token for a Clerk user (e.g. support "login as user" / impersonation links). Short-lived and sensitive — never log it.',
    tool: clerkCreateSignInToken,
    requiredAuth: 'clerkToken' as const,
    scope: 'write' as const,
    keywords: ['sign-in token', 'impersonate', 'magic link', 'support login', 'auth as user'],
  },
];
