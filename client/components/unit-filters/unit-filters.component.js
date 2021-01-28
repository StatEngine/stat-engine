'use strict';

import angular from 'angular';
import UnitFilterFixture from '../../../server/fixtures/extensions/unitFilters';
import applyUnitFilters from '../../util/filters';

export class UnitFiltersComponent {
  filterConfiguration;
  units = [];
  error;
  success;

  wildcards = '';
  individuals = '';

  included = [];
  excluded = [];

  /*@ngInject*/
  constructor(ExtensionConfiguration, Unit) {
    this.ExtensionConfiguration = ExtensionConfiguration;
    this.Unit = Unit;
  }

  async $onInit() {
    try {
      const extensions = await this.ExtensionConfiguration.query({ name: UnitFilterFixture.name }).$promise;
      const extension = extensions.find(ext => ext.Extension.name === UnitFilterFixture.name);
      this.units = await this.Unit.query().$promise;
      
      if (extension) {
        this.filterConfiguration = extension;
      } else {
        this.filterConfiguration = await this.ExtensionConfiguration.create({ name: UnitFilterFixture.name }).$promise;
      }
  
      if (Object.keys(this.filterConfiguration.config_json).length > 0) {
        this.applyFilters();
      } else {
        this.included = [...this.units];
      }
    } catch (err) {
      this.error = err.message;
    }
  }

  addFilter(term, type) {
    if (term) {
      if (!this.filterConfiguration.config_json[type]) {
        this.filterConfiguration.config_json[type] = [];
      }

      if (!this.filterConfiguration.config_json[type].includes(term)) {
        this.filterConfiguration.config_json[type] = [...this.filterConfiguration.config_json[type], term];
      }

      this[type] = '';
    }

    this.applyFilters();
  }

  removeFilter(term, type) {
    this.filterConfiguration.config_json[type] = this.filterConfiguration.config_json[type].filter(item => item !== term);
    this.applyFilters();
  }

  applyFilters() {
    const { excluded, included } = applyUnitFilters(this.units, this.filterConfiguration);
    this.excluded = excluded;
    this.included = included;
  }

  async save() {
    try {
      const id = this.filterConfiguration._id;
      await this.ExtensionConfiguration.update({ id, replace: true }, this.filterConfiguration.config_json);
      this.success = 'Configuration successfully saved.';
    } catch (err) {
      console.log(err);
      this.error = 'Configurations failed to save.';
    }
  }
}


export default angular.module('unitFilters', [])
  .component('unitFilters', {
    template: require('./unit-filters.html'),
    controller: UnitFiltersComponent,
    controllerAs: 'vm',
  })
  .name;
