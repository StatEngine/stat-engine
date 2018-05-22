'use strict';

import moment from 'moment';

export default class ReportEditController {
  /*@ngInject*/
  constructor($stateParams, $state, currentPrincipal, Report, Safety, report, weatherForecast, safetyMessage, stats, SegmentService) {
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.FireDepartment = currentPrincipal.FireDepartment;
    this.timezone = this.FireDepartment.timezone;
    this.ReportService = Report;
    this.SafetyService = Safety;
    this.SegmentService = SegmentService;

    this.report = report;
    if(!this.report) {
      this.report = {
        content: {
          weather: {
            forecast: weatherForecast
          },
          safety: {
            message: safetyMessage.message
          },
          stats: {
            timeFilter: stats.timeFilter,
            incident: {
              stats: stats.incident,
            },
            unit: {
              stats: stats.unit
            }
          }
        }
      };
    }

    this.toolbar = [
      ['edit', ['undo', 'redo']],
      ['headline', ['style']],
      ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
      ['fontface', ['fontname']],
      ['textsize', ['fontsize']],
      ['fontclr', ['color']],
      ['alignment', ['ul', 'ol', 'paragraph']],
      ['height', ['height']],
      ['table', ['table']],
      ['insert', ['link', 'picture']],
    ];

    this.unitTableOptions = {
      data: this.report.content.stats.unit.stats,
      columnDefs: [{
        field: 'name',
      }, {
        field: 'totalCount',
        cellFilter: 'number: 0',
        displayName: 'Incidents'
      }, {
        field: 'transports',
        displayName: 'Transports',
        cellFilter: 'number: 0',
      }, {
        field: 'utilization',
        displayName: 'Utilization (min)',
        cellFilter: 'number: 2',
      }, {
        field: 'distance',
        cellFilter: 'number: 2',
        displayName: 'Total Distance (m)'
      }, {
        field: 'turnoutDuration90',
        cellFilter: 'number: 2',
        displayName: '90% Turnout Duration (s)'
      }]
    };
  }

  reset() {
    this.$state.go('site.report.edit', {
      type: this.$stateParams.type,
      name: this.$stateParams.name
    }, {
      reload: true
    });
  }

  refreshSafetyMessage() {
    this.SafetyService.getRandomMessage().$promise
      .then(rando => {
        this.report.content.safety.message = rando.message;
      });
  }

  pageBack() {
    const dest = moment(this.$stateParams.name, 'YYYY-MM-DD')
      .subtract(1, 'day')
      .format('YYYY-MM-DD');
    this.$state.go('site.report.edit', {
      type: this.$stateParams.type,
      name: dest
    });
  }

  pageForward() {
    const dest = moment(this.$stateParams.name, 'YYYY-MM-DD')
      .add(1, 'day')
      .format('YYYY-MM-DD');
    this.$state.go('site.report.edit', {
      type: this.$stateParams.type,
      name: dest
    });
  }

  save() {
    this.SegmentService.track(this.SegmentService.events.APP_ACTION, {
      app: 'REPORT',
      action: 'save',
    });

    this.ReportService.update({
      type: this.$stateParams.type,
      name: this.$stateParams.name,
    }, this.report.content).$promise
      .then(() => {
        this.$state.go('site.report.view', {
          type: this.$stateParams.type,
          name: this.$stateParams.name
        });
      });
  }
}
