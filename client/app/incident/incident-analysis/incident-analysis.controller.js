/* eslint  class-methods-use-this: 0 */

'use strict';

import mapboxgl from 'mapbox-gl';
import Plotly from 'plotly.js'
import _ from 'lodash';
import moment from 'moment';

export default class IncidentAnalysisController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal, incidentData) {
    this.SegmentService = SegmentService;
    this.currentPrincipal = currentPrincipal;

    this.incident = incidentData.incident;
    this.textSummaries = incidentData.textSummaries;
    this.analysis = incidentData.analysis;
    this.comparison = incidentData.comparison;
    this.travelMatrix = incidentData.travelMatrix;
  }

}
