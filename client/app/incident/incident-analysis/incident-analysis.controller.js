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
    this.analysis = incident.analysis;

    this.travelMatrix = incident.travelMatrix;

    const comparisons = ['This Incident', 'Response Zone 23423', 'First Due #14',
      'Census Block 23423', 'Battalion #2', 'Council District 3', 'This Department'];

    Plotly.newPlot('response-comparison', [{
      x: comparisons,
      y: [this.incident.description.extended_data.response_duration,
          ..._.range(1, comparisons.length).map(() => _.random(200, 700))],
      orientation: 'v',
      marker: {
        color: 'rgba(55,128,191,0.6)',
        width: 1
      },
      type: 'bar'
    }], {
      title: '90th Percentile Response Time Comparisons',
      width: '1000'
    });
  }

}
