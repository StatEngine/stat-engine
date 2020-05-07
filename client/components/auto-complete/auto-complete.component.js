'use strict';

import angular from 'angular';

export class AutoCompleteComponent {
  constructor() {
    this.results = [];
  }

  $onInit() {
    const { placeholder = "", type = "text" } = this.options;
    this.options = {
      ...this.options,
      placeholder,
      type
    }

    if (!this.value) {
      this.value = "";
    }
  }

  async search(event) {
    const value = event.currentTarget.value;
    this.results = await this.options.data(value);
  }

  onSelect(selected)  {
    const value = this.options.type === 'number' ? parseInt(selected) : selected;
    this.value = value;
    this.results = [];
    if (this.options.onSelect) {
      this.options.onSelect(selected);
    }
  }
}

export default angular.module('autoComplete', [])
  .component('autoComplete', {
    template: require('./auto-complete.html'),
    controller: AutoCompleteComponent,
    controllerAs: 'vm',
    bindings: {
      options: '<',
      value: '='
    },
  })
  .name;
