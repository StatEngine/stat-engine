/* eslint  class-methods-use-this: 0 */

'use strict';

import _ from 'lodash';

export default class IncidentSearchController {
  /*@ngInject*/
  constructor(SegmentService, Incident, currentPrincipal, recentIncidents) {
    this.IncidentService = Incident;
    this.SegmentService = SegmentService;
    this.searchResultsTableOptions = {
      data: [],
      columnDefs: [{
        field: 'description.incident_number',
        displayName: 'Incident Number',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col )}}</a></div>',
      }, {
        field: 'address.address_line1',
        displayName: 'Address'
      }, {
        field: 'description.event_closed',
        displayName: 'Event Closed'
      }, {
        field: 'durations.total_event.seconds',
        displayName: 'Event Duration',
        cellFilter: 'humanizeDuration',
      }, {
        field: 'description.units.length',
        displayName: '# Units',
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

    this.formatSearchResults(recentIncidents);
  }

  formatSearchResults(results) {
    const searchResults = [];

    _.forEach(results, r => searchResults.push(r._source));

    this.searchResultsTableOptions.data = searchResults;
  }

  search() {
    this.SegmentService.track(this.SegmentService.events.APP_ACTION, {
      app: 'Incident Analysis',
      action: 'search',
    });

    this.IncidentService.search({ q: this.query }).$promise
      .then(results => this.formatSearchResults(results));
  }
}
