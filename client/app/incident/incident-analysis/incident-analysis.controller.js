/* eslint  class-methods-use-this: 0 */

'use strict';

import _ from 'lodash';

export default class IncidentAnalysisController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal, incidentData) {
    this.SegmentService = SegmentService;
    this.currentPrincipal = currentPrincipal;

    this.groupedUnits = _.groupBy(incidentData.incident.apparatus, u => u.suppressed);

    this.suppressedUnits = this.groupedUnits.true;
    incidentData.incident.apparatus = this.groupedUnits.false;

    this.incident = incidentData.incident;

    this.textSummaries = incidentData.textSummaries;
    this.analysis = incidentData.analysis;
    this.comparison = incidentData.comparison;
    this.travelMatrix = incidentData.travelMatrix;
    this.concurrentIncidents = incidentData.concurrent;

    this.SegmentService.track(this.SegmentService.events.APP_ACTION, {
      app: 'Incident Analysis',
      action: 'view',
    });

    const incident = this.incident;
    this.concurrentIncidentTableOptions = {
      data: [],
      columnDefs: [{
        field: 'description.incident_number',
        displayName: 'Incident Number',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col )}}</a></div>',
      }, {
        field: 'description.event_opened',
        displayName: 'Event Opened'
      }, {
        field: 'description.event_closed',
        displayName: 'Event Closed'
      }, {
        field: 'description.units.length',
        displayName: '# Units',
        width: 75,
      }, {
        field: 'address.battalion',
        displayName: 'Battalion',
        cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row,col) == incident.address.battalion) {
            return 'text-danger';
          }
        },
        width: 100,
      }, {
        field: 'address.response_zone',
        displayName: 'Response Zone',
        cellClass: function(grid, row, col, rowRenderIndex, colRenderIndex) {
          if (grid.getCellValue(row,col) == incident.address.response_zone) {
            return 'text-danger';
          }
        },
        width: 100,
      }, {
        field: 'description.category',
        displayName: 'Category',
        width: 100,
      }, {
        field: 'description.type',
        displayName: 'Type',
      }]
    };
    this.formatSearchResults(this.concurrentIncidents);
  }

  formatSearchResults(results) {
    const searchResults = [];

    _.forEach(results, r => searchResults.push(r._source));

    this.concurrentIncidentTableOptions.data = searchResults;
    this.concurrentIncidentTableOptions.minRowsToShow = searchResults.length || 5;
  }
}
