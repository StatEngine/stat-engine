/* eslint  class-methods-use-this: 0 */

'use strict';

import humanizeDuration from 'humanize-duration';

let _;
let tippy;
let PlotlyBasic;

const shortEnglishHumanizer = humanizeDuration.humanizer({
  language: 'shortEn',
  languages: {
    shortEn: {
      y: () => 'y',
      mo: () => 'mo',
      w: () => 'w',
      d: () => 'd',
      h: () => 'h',
      m: () => 'm',
      s: () => 's',
      ms: () => 'ms',
    }
  }
});

export default class IncidentAnalysisController {
  /*@ngInject*/
  constructor($scope, AmplitudeService, AnalyticEventNames, currentPrincipal, incidentData, Print) {
    this.$scope = $scope;
    this.AmplitudeService = AmplitudeService;
    this.AnalyticEventNames = AnalyticEventNames;
    this.currentPrincipal = currentPrincipal;
    this.incidentData = incidentData;
    this.Print = Print;
  }

  async loadModules() {
    _ = await import(/* webpackChunkName: "lodash" */ 'lodash');
    tippy = await import(/* webpackChunkName: "tippy" */ 'tippy.js');
    tippy = tippy.default;
    PlotlyBasic = await import(/* webpackChunkName: "plotly-basic" */ 'plotly.js/dist/plotly-basic.js');
  }

  async $onInit() {
    await this.loadModules();

    this.groupedUnits = _.groupBy(this.incidentData.incident.apparatus, u => u.suppressed);

    this.suppressedUnits = this.groupedUnits.true;
    this.incidentData.incident.apparatus = this.groupedUnits.false;

    this.incident = this.incidentData.incident;

    this.type = _.get(this.incident, 'description.extended_data.AgencyIncidentCallTypeDescription') || this.incident.description.type;
    this.subtype = this.incident.description.subtype;
    this.firstUnitDispatched = _.get(_.find(this.incident.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1), 'unit_id');
    this.firstUnitArrived = _.get(_.find(this.incident.apparatus, u => _.get(u, 'unit_status.dispatched.order') === 1), 'unit_id');
    this.comments = _.get(this.incident, 'description.comments');
    if(this.comments) {
      const limit = 8;
      this.comments = this.comments.split('**').slice(1);
      this.comments.forEach((comment, i) => {
        this.comments[i] = comment.trim();
      });
      this.isShowingAllComments = false;
      this.commentsTruncated = this.comments.slice(0, limit);
      this.isCommentsTruncated = this.comments.length > limit;
    }

    this.textSummaries = this.incidentData.textSummaries;
    this.analysis = this.incidentData.analysis;
    this.comparison = this.incidentData.comparison;
    this.travelMatrix = this.incidentData.travelMatrix;
    this.concurrentIncidents = this.incidentData.concurrent;

    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
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
      }],
      onRegisterApi: (uiGridApi) => {
        this.uiGridApi = uiGridApi;
      },
    };
    this.formatSearchResults(this.concurrentIncidents);

    this.initialized = true;
    this.initTippy();

    this.Print.addBeforePrintListener(this.beforePrint);
    this.Print.addAfterPrintListener(this.afterPrint);

    this.$scope.$on('$destroy', () => {
      this.Print.removeBeforePrintListener(this.beforePrint);
      this.Print.removeAfterPrintListener(this.afterPrint);
    });
  }

  initTippy() {
    tippy('.tippy', {
      allowTitleHTML: true,
      interactive: true,
      delay: 150,
      arrow: true,
      arrowType: 'sharp',
      theme: 'statengine',
      duration: 250,
      animation: 'shift-away',
      maxWidth: '350px',
      inertia: false,
      touch: true,
    });

    // dynamic content
    tippy('.ruletippy', {
      allowTitleHTML: true,
      interactive: true,
      delay: 150,
      arrow: true,
      arrowType: 'sharp',
      theme: 'statengine',
      duration: 250,
      animation: 'shift-away',
      maxWidth: '350px',
      dynamicTitle: true,
      inertia: false,
      touch: true,
    });
  }

  formatEvidence(evidence) {
    let html = '<ul class="pd-5 mg-5">';
    _.forEach(evidence, e => {
      switch (e.grade) {
      case 'SUCCESS':
        html += `<li class="tippy-text tx-success">${e.text}</li>`;
        break;

      case 'WARNING':
        html += `<li class="tippy-text tx-warning">${e.text}</li>`;
        break;

      case 'DANGER':
        html += `<li class="tippy-text tx-danger">${e.text}</li>`;
        break;
      }
    });

    html += '</ul>';

    return html;
  }

  formatSearchResults(results) {
    const searchResults = [];

    _.forEach(results, r => searchResults.push(r._source));

    this.concurrentIncidentTableOptions.data = searchResults;
    this.concurrentIncidentTableOptions.minRowsToShow = searchResults.length || 5;
  }


  scrollTo(location) {
    $('.content-view').animate({ scrollTop: $(location).offset().top }, 1000);
  }

  showFullComments(show) {
    if(show) {
      $('#fullComments').collapse('show');
    } else {
      $('#fullComments').collapse('hide');
    }

    this.isShowingAllComments = show;
  }

  humanizeDuration(ms) {
    if (_.isNil(ms) || _.isNaN(ms)) return 'N/A';
    return shortEnglishHumanizer(ms, { round: true });
  }

  print() {
    this.Print.print();
  }

  beforePrint = () => {
    // HACK: Some elements won't seem to auto resize on print, so we have to hardcode their widths for now.
    const plots = $('.js-plotly-plot');
    for(const plot of plots) {
      PlotlyBasic.relayout(plot, { width: 960 });
    }

    $('.concurrent-incidents-table').css({ width: '960px' });
    this.uiGridApi.core.handleWindowResize();

    this.showFullComments(true);
  };

  afterPrint = () => {
    // Remove hardcoded plot widths.
    const plots = $('.js-plotly-plot');
    for(const plot of plots) {
      PlotlyBasic.relayout(plot, { width: 0 });
    }

    $('.concurrent-incidents-table').css({ width: 'auto' });
    this.uiGridApi.core.handleWindowResize();

    this.showFullComments(false);

    this.AmplitudeService.track(this.AnalyticEventNames.APP_ACTION, {
      app: 'Incident Analysis',
      action: 'print',
    });
  };
}
