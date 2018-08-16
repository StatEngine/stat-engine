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

    // displays
    this.type = this.incident.description.extended_data.AgencyIncidentCallTypeDescription || this.incident.description.type;
    this.subtype = this.incident.description.subtype;
    this.firstUnitDispatched = _.get(_.find(this.incident.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1), 'unit_id');
    this.firstUnitArrived = _.get(_.find(this.incident.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1), 'unit_id');
    let comments = _.get(this.incident, 'description.comments');
    if (comments) {
      let limit = 500;
      this.commentsTruncated = comments.substring(0, limit);
      this.isCommentsTruncated = comments.length > limit;
    }

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
        cellClass: (grid, row, col) => {
          if(grid.getCellValue(row, col) == incident.address.battalion) {
            return 'text-danger';
          }
        },
        width: 100,
      }, {
        field: 'address.response_zone',
        displayName: 'Response Zone',
        cellClass: (grid, row, col) => {
          if(grid.getCellValue(row, col) == incident.address.response_zone) {
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


  scrollTo(location) {
    $('html, body').animate({ scrollTop: $(location).offset().top }, 1000);
  };
}
