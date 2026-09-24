import { defineToolkit, defineTool } from '../../core/define.js';
import { JENKINS_ICON } from './icon.js';
import { jenkinsTools } from './tools/index.js';

export default defineToolkit({
  id: 'jenkins',
  displayName: 'Jenkins',
  shortDescription: 'Jobs, builds, console logs, queues, agents, views, and plugins via the Jenkins Remote Access API.',
  category: 'Developer Tools & DevOps',
  icon: JENKINS_ICON,
  auth: {
    type: 'service_account',
    tokenField: 'jenkinsCredentials',
    provider: {
      fields: ['baseUrl', 'username', 'apiToken'],
      connectDescription:
        'Connect your Jenkins controller with its base URL (e.g. https://jenkins.example.com) plus a username and API token. Generate a token from User > Configure > API Token; requests use HTTP Basic auth (username:token) per the Jenkins scripted-clients docs. Leave username/token empty only for anonymous-access controllers.',
    },
  },
  tools: jenkinsTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: entry.scope,
    }),
  ),
  meta: {
    since: '0.0.12',
    homepage: 'https://www.jenkins.io',
    docsUrl: 'https://www.jenkins.io/doc/book/using/remote-access-api/',
    apiDocsUrl: 'https://www.jenkins.io/doc/book/using/remote-access-api/',
  },
});
