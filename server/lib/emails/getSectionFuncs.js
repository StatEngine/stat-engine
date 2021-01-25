import agencyIncidentTypeSummary from './sections/agencyIncidentTypeSummary';
import agencySummary from './sections/agencySummary';
import { alertSummary } from './sections/alertSummary';
import battalionSummary from './sections/battalionSummary';
import incidentSummary from './sections/incidentSummary';
import incidentTypeSummary from './sections/incidentTypeSummary';
import jurisdictionSummary from './sections/jurisdictionSummary';
import unitSummary from './sections/unitSummary';

export default function getSectionFuncs() {
  return {
    agencyIncidentTypeSummary,
    agencySummary,
    alertSummary,
    battalionSummary,
    incidentSummary,
    incidentTypeSummary,
    jurisdictionSummary,
    unitSummary,
  };
}
