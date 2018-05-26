/* eslint  class-methods-use-this: 0 */

'use strict';

import mapboxgl from 'mapbox-gl';
import Plotly from 'plotly.js'
import _ from 'lodash';
import moment from 'moment';

export default class IncidentAnalysisController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal, incident) {
    this.SegmentService = SegmentService;
    this.currentPrincipal = currentPrincipal;
    this.incident = incident.incident;
    this.incidentSummaries = incident.summaries;
    this.travelMatrix = incident.travelMatrix;
  }
}
