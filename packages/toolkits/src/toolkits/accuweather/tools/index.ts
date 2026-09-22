// @ts-nocheck
import { listWeatherAlarms, listWeatherAlerts } from './alerts-alarms.js';
import { getCurrentConditions, getHistoricalCurrentConditions, listTopCityConditions } from './current-conditions.js';
import { getDailyForecast, getHourlyForecast } from './forecasts.js';
import { getRadarSatelliteImagery } from './imagery.js';
import { getDailyIndices, getIndex, getIndexGroup, listIndexGroups, listIndices } from './indices.js';
import { getLightningForecast, listRecentLightningStrikes } from './lightning.js';
import {
    autocompleteLocations,
    getAdministrativeArea,
    getCountry,
    getLocation,
    getRegion,
    listAdministrativeAreas,
    listCountries,
    listNeighboringCities,
    listRegions,
    listTopCities,
    searchAdministrativeAreas,
    searchCityByIpAddress,
    searchLocations,
    searchLocationsByCoordinates,
} from './locations.js';
import { getMinuteCastForecast, listMinuteCastColorCodes } from './minutecast.js';
import { getTranslationGroup, listSupportedLanguages, listTranslationGroups, resolveLanguageIdentifier } from './translations.js';
import {
    getTropicalStormCurrentPosition,
    listActiveTropicalStorms,
    listTropicalStormForecasts,
    listTropicalStormPositions,
    listTropicalStormStatuses,
    listTropicalStormsByYear,
} from './tropical.js';

export {
    autocompleteLocations,
    getAdministrativeArea,
    getCountry,
    getCurrentConditions,
    getDailyForecast,
    getDailyIndices,
    getHistoricalCurrentConditions,
    getHourlyForecast,
    getIndex,
    getIndexGroup,
    getLightningForecast,
    getLocation,
    getMinuteCastForecast,
    getRadarSatelliteImagery,
    getRegion,
    getTranslationGroup,
    getTropicalStormCurrentPosition,
    listActiveTropicalStorms,
    listAdministrativeAreas,
    listCountries,
    listIndexGroups,
    listIndices,
    listMinuteCastColorCodes,
    listNeighboringCities,
    listRecentLightningStrikes,
    listRegions,
    listSupportedLanguages,
    listTopCities,
    listTopCityConditions,
    listTranslationGroups,
    listTropicalStormForecasts,
    listTropicalStormPositions,
    listTropicalStormStatuses,
    listTropicalStormsByYear,
    listWeatherAlarms,
    listWeatherAlerts,
    resolveLanguageIdentifier,
    searchAdministrativeAreas,
    searchCityByIpAddress,
    searchLocations,
    searchLocationsByCoordinates,
};

const auth = 'accuWeatherApiKey' as const;

type Scope = 'read' | 'write' | 'delete';
function entry(name: string, description: string, toolRef: any, scope: Scope): { name: string; description: string; tool: any; requiredAuth: typeof auth; scope: Scope } {
    return { name, description, tool: toolRef, requiredAuth: auth, scope };
}

export const accuweatherTools = [
    entry('accuweatherAutocompleteLocations', 'Return location-name suggestions for all locations, cities, or points of interest, optionally restricted to a country.', autocompleteLocations, 'read'),
    entry('accuweatherGetAdministrativeArea', 'Return one administrative area by country and administrative-area codes.', getAdministrativeArea, 'read'),
    entry('accuweatherGetCountry', 'Return one country by AccuWeather region and country codes.', getCountry, 'read'),
    entry('accuweatherGetCurrentConditions', 'Return current weather observations for a location key, with optional details and photos.', getCurrentConditions, 'read'),
    entry('accuweatherGetDailyForecast', 'Return a 1, 5, 7, 10, or 15-day forecast for a location key.', getDailyForecast, 'read'),
    entry('accuweatherGetDailyIndices', 'Return lifestyle-index forecasts for all indices, one group, or one index at a location.', getDailyIndices, 'read'),
    entry('accuweatherGetHistoricalCurrentConditions', 'Return the past 6 or 24 hours of current-condition observations for a location key.', getHistoricalCurrentConditions, 'read'),
    entry('accuweatherGetHourlyForecast', 'Return a 1, 12, 24, 72, or 120-hour forecast for a location key.', getHourlyForecast, 'read'),
    entry('accuweatherGetIndex', 'Return metadata for one lifestyle index.', getIndex, 'read'),
    entry('accuweatherGetIndexGroup', 'Return the lifestyle indices belonging to one index group.', getIndexGroup, 'read'),
    entry('accuweatherGetLightningForecast', 'Return forecast lightning probabilities for latitude/longitude coordinates.', getLightningForecast, 'read'),
    entry('accuweatherGetLocation', 'Return full location metadata for an AccuWeather location key.', getLocation, 'read'),
    entry('accuweatherGetMinuteCastForecast', 'Return minute-by-minute precipitation conditions for latitude/longitude coordinates.', getMinuteCastForecast, 'read'),
    entry('accuweatherGetRadarSatelliteImagery', 'Return radar and satellite image metadata and URLs at a selected resolution.', getRadarSatelliteImagery, 'read'),
    entry('accuweatherGetRegion', 'Return one AccuWeather region by region code.', getRegion, 'read'),
    entry('accuweatherGetTranslationGroup', 'Return translated strings for one AccuWeather translation group.', getTranslationGroup, 'read'),
    entry('accuweatherGetTropicalStormCurrentPosition', 'Return the latest observed position of a government-issued tropical storm.', getTropicalStormCurrentPosition, 'read'),
    entry('accuweatherListActiveTropicalStorms', 'Return active government-issued tropical storms globally or filtered by basin and storm ID.', listActiveTropicalStorms, 'read'),
    entry('accuweatherListAdministrativeAreas', 'Return administrative areas globally or within a country, one page at a time.', listAdministrativeAreas, 'read'),
    entry('accuweatherListCountries', 'Return countries globally or within a specific AccuWeather region, one page at a time.', listCountries, 'read'),
    entry('accuweatherListIndexGroups', 'Return lifestyle-index groups and their identifiers.', listIndexGroups, 'read'),
    entry('accuweatherListIndices', 'Return all supported lifestyle indices and their identifiers.', listIndices, 'read'),
    entry('accuweatherListMinuteCastColorCodes', 'Return full or simplified MinuteCast color-code metadata.', listMinuteCastColorCodes, 'read'),
    entry('accuweatherListNeighboringCities', 'Return cities near an AccuWeather location key.', listNeighboringCities, 'read'),
    entry('accuweatherListRecentLightningStrikes', 'Return recent lightning strikes within 1-60 miles of coordinates as GeoJSON.', listRecentLightningStrikes, 'read'),
    entry('accuweatherListRegions', 'Return AccuWeather geographic regions and their codes.', listRegions, 'read'),
    entry('accuweatherListSupportedLanguages', 'Return supported languages with numeric IDs and language codes.', listSupportedLanguages, 'read'),
    entry('accuweatherListTopCities', 'Return top-ranked cities globally or within one AccuWeather region.', listTopCities, 'read'),
    entry('accuweatherListTopCityConditions', 'Return current conditions for 50, 100, or 150 globally ranked cities.', listTopCityConditions, 'read'),
    entry('accuweatherListTranslationGroups', 'Return available AccuWeather translation groups and their identifiers.', listTranslationGroups, 'read'),
    entry('accuweatherListTropicalStormForecasts', 'Return forecast positions and intensity for a government-issued tropical storm.', listTropicalStormForecasts, 'read'),
    entry('accuweatherListTropicalStormPositions', 'Return the observed position history of a government-issued tropical storm.', listTropicalStormPositions, 'read'),
    entry('accuweatherListTropicalStormStatuses', 'Return tropical storm status categories and wind-speed definitions globally or for one basin.', listTropicalStormStatuses, 'read'),
    entry('accuweatherListTropicalStormsByYear', 'Return government-issued tropical storms for a year, optionally filtered by basin and storm ID.', listTropicalStormsByYear, 'read'),
    entry('accuweatherListWeatherAlarms', 'Return threshold-based weather alarms for the next 1, 5, 10, or 15 days at a location.', listWeatherAlarms, 'read'),
    entry('accuweatherListWeatherAlerts', 'Return active government-issued weather alerts for a location key.', listWeatherAlerts, 'read'),
    entry('accuweatherResolveLanguageIdentifier', 'Convert a language code to its numeric ID or an ID to its code.', resolveLanguageIdentifier, 'read'),
    entry('accuweatherSearchAdministrativeAreas', 'Search administrative areas by name text with optional country and admin-code filters.', searchAdministrativeAreas, 'read'),
    entry('accuweatherSearchCityByIpAddress', 'Resolve an IPv4 or IPv6 address to an AccuWeather city location.', searchCityByIpAddress, 'read'),
    entry('accuweatherSearchLocations', 'Search cities, general locations, postal codes, or points of interest by text.', searchLocations, 'read'),
    entry('accuweatherSearchLocationsByCoordinates', 'Find the nearest location, city, or point of interest to latitude/longitude coordinates.', searchLocationsByCoordinates, 'read'),
];
