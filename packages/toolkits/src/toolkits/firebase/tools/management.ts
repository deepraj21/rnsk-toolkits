// @ts-nocheck
import { tool } from 'ai';
import { z } from 'zod';
import { fbRequest, getProjectId } from './client.js';

const BASE = 'https://firebase.googleapis.com/v1beta1';
const cred = (
  desc = 'Firebase credentials JSON (projectId, serviceAccountKey, optional databaseUrl)',
) => z.string().describe(desc);

function err(label: string, error: unknown) {
  if ((error as any)?.details !== undefined) return error;
  return { error: label, message: error instanceof Error ? error.message : 'Unknown error' };
}

export const firebaseListProjects = tool({
  description: 'List Firebase projects accessible to the service account.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    pageSize: z.number().optional().describe('Max projects to return'),
    pageToken: z.string().optional().describe('nextPageToken from a previous response'),
    showDeleted: z.boolean().optional().describe('Include DELETED projects'),
  }),
  execute: async ({ firebaseCredentials, pageSize, pageToken, showDeleted }) => {
    try {
      return await fbRequest(firebaseCredentials, `${BASE}/projects`, {
        query: { pageSize, pageToken, showDeleted },
      });
    } catch (error) {
      return err('Failed to list Firebase projects', error);
    }
  },
});

export const firebaseGetProject = tool({
  description: 'Get a Firebase project by ID, including project number and resources.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, projectId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}`);
    } catch (error) {
      return err('Failed to get Firebase project', error);
    }
  },
});

export const firebaseListAvailableProjects = tool({
  description: 'List Google Cloud projects that can have Firebase services enabled.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    pageSize: z.number().optional().describe('Max projects to return'),
    pageToken: z.string().optional().describe('nextPageToken from a previous response'),
  }),
  execute: async ({ firebaseCredentials, pageSize, pageToken }) => {
    try {
      return await fbRequest(firebaseCredentials, `${BASE}/availableProjects`, {
        query: { pageSize, pageToken },
      });
    } catch (error) {
      return err('Failed to list available projects', error);
    }
  },
});

export const firebaseAddFirebase = tool({
  description:
    'Enable Firebase services on an existing Google Cloud project. Returns a long-running Operation.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().describe('Google Cloud project ID to add Firebase to'),
  }),
  execute: async ({ firebaseCredentials, projectId }) => {
    try {
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${projectId}:addFirebase`, {
        method: 'POST',
        body: {},
      });
    } catch (error) {
      return err('Failed to add Firebase to project', error);
    }
  },
});

export const firebaseUpdateProject = tool({
  description: 'Update a Firebase project display name.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    displayName: z.string().describe('New display name'),
  }),
  execute: async ({ firebaseCredentials, projectId, displayName }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}`, {
        method: 'PATCH',
        query: { updateMask: 'display_name' },
        body: { displayName },
      });
    } catch (error) {
      return err('Failed to update Firebase project', error);
    }
  },
});

export const firebaseGetAdminSdkConfig = tool({
  description: 'Get the Admin SDK config for a project to initialize server SDKs.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, projectId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/adminSdkConfig`);
    } catch (error) {
      return err('Failed to get Admin SDK config', error);
    }
  },
});

export const firebaseSearchApps = tool({
  description: 'List all apps (Android, iOS, web) in a Firebase project in one call.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    filter: z.string().optional().describe('AIP-160 filter, e.g. namespace=android'),
    pageSize: z.number().optional().describe('Max apps to return'),
    pageToken: z.string().optional().describe('nextPageToken from a previous response'),
  }),
  execute: async ({ firebaseCredentials, projectId, filter, pageSize, pageToken }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}:searchApps`, {
        query: { filter, pageSize, pageToken },
      });
    } catch (error) {
      return err('Failed to search Firebase apps', error);
    }
  },
});

export const firebaseListAndroidApps = tool({
  description: 'List Android apps in a Firebase project.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    pageSize: z.number().optional().describe('Max apps to return'),
    pageToken: z.string().optional().describe('nextPageToken from a previous response'),
    showDeleted: z.boolean().optional().describe('Include DELETED apps'),
  }),
  execute: async ({ firebaseCredentials, projectId, pageSize, pageToken, showDeleted }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/androidApps`, {
        query: { pageSize, pageToken, showDeleted },
      });
    } catch (error) {
      return err('Failed to list Android apps', error);
    }
  },
});

export const firebaseCreateAndroidApp = tool({
  description:
    'Register a new Android app in a Firebase project. Returns a long-running Operation.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    packageName: z.string().describe('Android package name, e.g. com.example.app'),
    displayName: z.string().optional().describe('User-visible app name'),
  }),
  execute: async ({ firebaseCredentials, projectId, packageName, displayName }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/androidApps`, {
        method: 'POST',
        body: { packageName, displayName },
      });
    } catch (error) {
      return err('Failed to create Android app', error);
    }
  },
});

export const firebaseListIosApps = tool({
  description: 'List iOS apps in a Firebase project.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    pageSize: z.number().optional().describe('Max apps to return'),
    pageToken: z.string().optional().describe('nextPageToken from a previous response'),
    showDeleted: z.boolean().optional().describe('Include DELETED apps'),
  }),
  execute: async ({ firebaseCredentials, projectId, pageSize, pageToken, showDeleted }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/iosApps`, {
        query: { pageSize, pageToken, showDeleted },
      });
    } catch (error) {
      return err('Failed to list iOS apps', error);
    }
  },
});

export const firebaseCreateIosApp = tool({
  description: 'Register a new iOS app in a Firebase project. Returns a long-running Operation.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    bundleId: z.string().describe('iOS bundle ID, e.g. com.example.app'),
    displayName: z.string().optional().describe('User-visible app name'),
    appStoreId: z.string().optional().describe('App Store ID if published'),
  }),
  execute: async ({ firebaseCredentials, projectId, bundleId, displayName, appStoreId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/iosApps`, {
        method: 'POST',
        body: { bundleId, displayName, appStoreId },
      });
    } catch (error) {
      return err('Failed to create iOS app', error);
    }
  },
});

export const firebaseListWebApps = tool({
  description: 'List web apps in a Firebase project.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    pageSize: z.number().optional().describe('Max apps to return'),
    pageToken: z.string().optional().describe('nextPageToken from a previous response'),
    showDeleted: z.boolean().optional().describe('Include DELETED apps'),
  }),
  execute: async ({ firebaseCredentials, projectId, pageSize, pageToken, showDeleted }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/webApps`, {
        query: { pageSize, pageToken, showDeleted },
      });
    } catch (error) {
      return err('Failed to list web apps', error);
    }
  },
});

export const firebaseCreateWebApp = tool({
  description: 'Register a new web app in a Firebase project. Returns a long-running Operation.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    projectId: z.string().optional().describe('Defaults to the connected project'),
    displayName: z.string().optional().describe('User-visible app name'),
  }),
  execute: async ({ firebaseCredentials, projectId, displayName }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(firebaseCredentials, `${BASE}/projects/${pid}/webApps`, {
        method: 'POST',
        body: { displayName },
      });
    } catch (error) {
      return err('Failed to create web app', error);
    }
  },
});

export const firebaseGetWebAppConfig = tool({
  description:
    'Get the firebaseConfig (apiKey, authDomain, etc.) for a web app to initialize client SDKs.',
  inputSchema: z.object({
    firebaseCredentials: cred(),
    appId: z.string().describe('Web app ID (the trailing segment of projects/*/webApps/*)'),
    projectId: z.string().optional().describe('Defaults to the connected project'),
  }),
  execute: async ({ firebaseCredentials, appId, projectId }) => {
    try {
      const pid = projectId ?? getProjectId(firebaseCredentials);
      return await fbRequest(
        firebaseCredentials,
        `${BASE}/projects/${pid}/webApps/${appId}/config`,
      );
    } catch (error) {
      return err('Failed to get web app config', error);
    }
  },
});
