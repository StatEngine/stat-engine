import alertSummary from './sections/alertSummary';
import incidentSummary from './sections/incidentSummary';
import comparisonMetricSummary from './sections/comparisonMetricSummary';

export default function getSectionFuncs() {
  return {
    agencyIncidentTypeSummary: params => comparisonMetricSummary('agencyIncidentType', params),
    agencySummary: params => comparisonMetricSummary('agencyResponses', params),
    alertSummary,
    battalionSummary: params => comparisonMetricSummary('battalion', params),
    incidentSummary,
    incidentTypeSummary: params => comparisonMetricSummary('incidentType', params),
    jurisdictionSummary: params => comparisonMetricSummary('jurisdiction', params),
    unitSummary: params => comparisonMetricSummary('unit', params),
  };
}
