import { defineToolkit, defineTool } from '../../core/define.js';
import { inferToolScope } from '../../core/scope.js';
import { ACCUWEATHER_ICON } from './icon.js';
import { accuweatherTools } from './tools/index.js';

export default defineToolkit({
  id: 'accuweather',
  displayName: 'AccuWeather',
  shortDescription: 'Look up locations, current conditions, forecasts, alerts, lifestyle indices, tropical storms, and lightning data.',
  category: 'Data & Analytics',
  icon: ACCUWEATHER_ICON,
  auth: {
    type: 'api_key',
    tokenField: 'accuWeatherApiKey',
    provider: {
      in: 'header',
      name: 'Authorization',
      prefix: 'Bearer',
      connectDescription:
        'Connect AccuWeather with an API key from developer.accuweather.com (free personal keys available). Requests send it as Authorization: Bearer <key> and also as the apikey query parameter used by enterprise endpoints.',
    },
  },
  allowedHosts: ['dataservice.accuweather.com', 'api.accuweather.com'],
  tools: accuweatherTools.map((entry) =>
    defineTool({
      name: entry.name,
      description: entry.description,
      tool: entry.tool,
      requiredAuth: entry.requiredAuth,
      scope: (entry as any).scope ?? inferToolScope(entry.name),
    }),
  ),
  meta: {
    since: '0.0.11',
    homepage: 'https://www.accuweather.com',
    docsUrl: 'https://developer.accuweather.com',
  },
});
