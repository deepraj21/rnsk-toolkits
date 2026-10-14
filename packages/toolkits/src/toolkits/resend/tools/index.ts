// @ts-nocheck
import {
  resendSendEmail,
  resendSendBatchEmails,
  resendGetEmail,
  resendListEmails,
  resendCancelEmail,
} from './emails.js';
import {
  resendCreateDomain,
  resendListDomains,
  resendGetDomain,
  resendVerifyDomain,
  resendDeleteDomain,
} from './domains.js';
import { resendListApiKeys, resendCreateApiKey, resendDeleteApiKey } from './api-keys.js';
import { resendCreateAudience, resendListAudiences, resendCreateContact } from './audiences.js';

export {
  resendSendEmail,
  resendSendBatchEmails,
  resendGetEmail,
  resendListEmails,
  resendCancelEmail,
  resendCreateDomain,
  resendListDomains,
  resendGetDomain,
  resendVerifyDomain,
  resendDeleteDomain,
  resendListApiKeys,
  resendCreateApiKey,
  resendDeleteApiKey,
  resendCreateAudience,
  resendListAudiences,
  resendCreateContact,
};

const auth = 'resendApiKey' as const;
type Scope = 'read' | 'write' | 'delete';
function entry(name: string, toolRef: any, scope: Scope, keywords: string[]) {
  return {
    name,
    description: toolRef.description!,
    tool: toolRef,
    requiredAuth: auth,
    scope,
    keywords,
  };
}

export const resendTools = [
  entry('resendSendEmail', resendSendEmail, 'write', ['transactional', 'smtp']),
  entry('resendSendBatchEmails', resendSendBatchEmails, 'write', ['bulk']),
  entry('resendGetEmail', resendGetEmail, 'read', ['delivery']),
  entry('resendListEmails', resendListEmails, 'read', ['outbox']),
  entry('resendCancelEmail', resendCancelEmail, 'write', ['schedule']),
  entry('resendCreateDomain', resendCreateDomain, 'write', ['dns', 'spf']),
  entry('resendListDomains', resendListDomains, 'read', ['dns']),
  entry('resendGetDomain', resendGetDomain, 'read', ['dns']),
  entry('resendVerifyDomain', resendVerifyDomain, 'write', ['dns', 'dkim']),
  entry('resendDeleteDomain', resendDeleteDomain, 'delete', ['dns']),
  entry('resendListApiKeys', resendListApiKeys, 'read', ['credentials']),
  entry('resendCreateApiKey', resendCreateApiKey, 'write', ['credentials']),
  entry('resendDeleteApiKey', resendDeleteApiKey, 'delete', ['credentials']),
  entry('resendCreateAudience', resendCreateAudience, 'write', ['marketing', 'newsletter']),
  entry('resendListAudiences', resendListAudiences, 'read', ['marketing']),
  entry('resendCreateContact', resendCreateContact, 'write', ['subscribers']),
];
