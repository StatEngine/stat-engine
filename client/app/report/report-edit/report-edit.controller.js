'use strict';

import _ from 'lodash';
import moment from 'moment';

export default class ReportEditController {
  /*@ngInject*/
  constructor($stateParams, $state, currentPrincipal, Report, Safety, report, weatherForecast, safetyMessage, stats) {
    this.$stateParams = $stateParams;
    this.$state = $state;
    this.FireDepartment = currentPrincipal.FireDepartment;
    this.ReportService = Report;
    this.SafetyService = Safety;

    this.report = report;
    if (!this.report) {
      this.report = {
        content: {
          weather: {
            forecast: weatherForecast
          },
          safety: {
            message: safetyMessage.message
          },
          stats: {
            incident: {
              stats: stats.incident,
            },
            unit: {
              stats: stats.unit
            }
          }
        }
      }
    }

    this.toolbar = [
      ['edit',['undo','redo']],
      ['headline', ['style']],
      ['style', ['bold', 'italic', 'underline', 'strikethrough', 'clear']],
      ['fontface', ['fontname']],
      ['textsize', ['fontsize']],
      ['fontclr', ['color']],
      ['alignment', ['ul', 'ol', 'paragraph']],
      ['height', ['height']],
      ['table', ['table']],
      ['insert', ['link','picture']],
    ];

    this.now = moment();
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
      .then((rando) => {
        this.report.content.safety.message = rando.message;
      });
  }

  save() {
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
