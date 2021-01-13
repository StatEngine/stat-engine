'use strict';

import angular from 'angular';
import UnitFilterFixture from '../../../server/fixtures/extensions/unitFilters';
import { applyUnitFilters } from '../../util/filters';

export class UnitFiltersComponent {
  filterConfiguration;
  units = [];
  error;
  success;

  excludeWildcard = "";
  excludeIndividual = "";

  included = [];
  excluded = [];

  /*@ngInject*/
  constructor(ExtensionConfiguration, Extension, Unit) {
    this.Extension = Extension;
    this.ExtensionConfiguration = ExtensionConfiguration;
    this.Unit = Unit;
  }

  async $onInit() {
    const [extensions, units] = await Promise.all([
      this.ExtensionConfiguration.query({ name: UnitFilterFixture.name }).$promise,
      this.Unit.query().$promise
    ]);
    this.units = units;
    const extension = extensions.find(extension => extension.Extension.name === UnitFilterFixture.name);

    if (extension) {
      this.filterConfiguration = extension;
    } else {
      this.filterConfiguration = await this.ExtensionConfiguration.create({ name: UnitFilterFixture.name }).$promise;
    }

    console.log(this.filterConfiguration);
    
    if (Object.keys(this.filterConfiguration.config_json).length > 0) {
      this.applyFilters();
    } else {
      this.included = [...this.units];
    }
  }

  addWildcard() {
    if (this.excludeWildcard) {
      if (!this.filterConfiguration.config_json.wildcards) {
        this.filterConfiguration.config_json.wildcards = [];
      }

      if (!this.filterConfiguration.config_json.wildcards.includes(this.excludeWildcard)) {
        this.filterConfiguration.config_json.wildcards.push(this.excludeWildcard);
      }

      this.excludeWildcard = ""; 
    }

    this.applyFilters();
  }

  addIndividual() {
    if (this.excludeIndividual) {
      if (!this.filterConfiguration.config_json.individuals) {
        this.filterConfiguration.config_json.individuals = [];
      }

      if (!this.filterConfiguration.config_json.individuals.includes(this.excludeIndividual)) {
        this.filterConfiguration.config_json.individuals.push(this.excludeIndividual);
      }

      this.excludeIndividual = "";
    }

    this.applyFilters();
  }

  removeIndividual(indivudal) {
    this.filterConfiguration.config_json.individuals = this.filterConfiguration.config_json.individuals.filter(item => item !== indivudal);
    this.applyFilters();
  }

  removeWildcard(wildcard) {
    this.filterConfiguration.config_json.wildcards = this.filterConfiguration.config_json.wildcards.filter(item => item !== wildcard);
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
      this.success = "Configuration successfully saved.";
    } catch (err) {
      console.log(err);
      this.error = "Configurations failed to save.";
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
