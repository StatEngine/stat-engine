/* eslint  class-methods-use-this: 0 */

'use strict';


export default class IncidentSearchController {
  /*@ngInject*/
  constructor(SegmentService, Incident, currentPrincipal, recentIncidents) {
    this.IncidentService = Incident;

    this.searchResultsTableOptions = {
      data: [],
      columnDefs: [{
        field: 'description.incident_number',
        displayName: 'Incident Number',
        cellTemplate: '<div class="ui-grid-cell-contents"><a href="#" ui-sref="site.incident.analysis({ id: grid.getCellValue(row, col) })">{{ grid.getCellValue(row, col )}}</a></div>'
      }, {
        field: 'description.event_closed',
        displayName: 'Event Closed'
      }, {
        field: 'durations.total_event.minutes',
        displayName: 'Event Duration (min)',
        cellFilter: 'number: 2',
      }, {
        field: 'description.units.length',
        displayName: '# Units',
        width: 100,
      }, {
        field: 'description.category',
        displayName: 'Type',
        width: 100,
      }]
    }

    this.formatSearchResults(recentIncidents);
  }

  formatSearchResults(results) {
    const searchResults = [];

    _.forEach(results, r => searchResults.push(r._source));

    this.searchResultsTableOptions.data =  searchResults;
  }

  search() {
    this.IncidentService.search({ q: this.query }).$promise
      .then((results) => this.formatSearchResults(results))
  }
}
