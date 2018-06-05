/* eslint  class-methods-use-this: 0 */

'use strict';

import _ from 'lodash';

import { Incident } from '../../../../server/api/incident/incident';

export default class IncidentAnalysisController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal, incidentData) {
    this.SegmentService = SegmentService;
    this.currentPrincipal = currentPrincipal;

    this.groupedUnits = _.groupBy(incidentData.incident.apparatus, u => u.suppressed);

    this.suppressedUnits = this.groupedUnits.true;
    incidentData.incident.apparatus = this.groupedUnits.false;

    this.incident = new Incident(incidentData.incident);

    this.textSummaries = incidentData.textSummaries;
    this.analysis = incidentData.analysis;
    this.comparison = incidentData.comparison;
    this.travelMatrix = incidentData.travelMatrix;
  }
}
