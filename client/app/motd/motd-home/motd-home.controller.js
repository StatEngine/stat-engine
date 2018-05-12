'use strict';

import _ from 'lodash';

export default class MOTDHomeController {
  /*@ngInject*/
  constructor(SegmentService) {
    this.SegmentService = SegmentService;

    this.content = '';

    // fetch from ?
    this.safetyMessage = 'Be safe today';
    this.weatherForecast = 'Its going to rain';
    this.logoUrl = 'https://s3.amazonaws.com/statengine-public-assets/richmond.png';

    this.buildContent();
  }

  _addParagraph(text, options) {
    let bold = _.get(options, 'bold');

    let p = '<p>'
    if (bold) p += '<b>';
    p += text;
    if (bold) p += '</b>';
    p + '</p>';

    this.content += p;
  }

  _addImage(uri, options) {
    let p = '<p>';

    p += `<img src="${uri}" style="width: 250px;">`;

    p + '</p>';

    this.content += p;
  }

  safety() {
    this._addParagraph('Safety Message of the Day', { bold: true })
    this._addParagraph(this.safetyMessage, { bold: false })
  }

  logo() {
    this._addImage(this.logoUrl);
  }

  weather() {
    this._addParagraph('Weather', { bold: true })
    this._addParagraph(this.weatherForecast, { bold: false })
  }

  buildContent() {
    this.logo();
    this.safety();
    this.weather();

  }
}
