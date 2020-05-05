/* eslint  class-methods-use-this: 0 */

'use strict';

const LOCALSTORAGE_DISMISS_KEY = 'move-up-info';

export default class MoveupHomeController {
  /*@ngInject*/

  constructor($scope, units, mapboxConfig, stations, incidents) {
    this.$scope = $scope;
    this.error = null;
    this.loading = false;
    this.sort = 'unit_id';
    this.optimized = null;
    this.ascending = true;
    this.strategy = 'current';
    this.mapboxConfig = mapboxConfig;
    this.dirty = false;
    this.dismissed = !!localStorage.getItem(LOCALSTORAGE_DISMISS_KEY)
    this.filters  = {
      Engine: true
    };

    const stationIds = stations.map(station => station.station_number);
    this.stations = stations;

    this.units = units
      .filter(unit => {
        try {
          // Filter out units that don't have a station from our dataset
          const station = parseInt(unit.station);
          return stationIds.includes(station);
        } catch (err) {
          return false;
        }
      })
      .map(unit => {
        const station_number = parseInt(unit.station);
        const station = this.stations.find(station => station.station_number === station_number);
        return {
          ...unit,
          geom: station.geom,
          geohash: station.geohash
        }
      });

    this.types = [...new Set(this.units.map(unit => unit.unit_type))];

    this.payload = {
      covered_time: 4,
      station_status: stations.map(station => ({
        station_id: station.station_number,
        location: station.geohash
      })),
      incident_distribution: incidents.map(incident => incident.address.geohash)
    };

    this.setUnits();
  }

  setUnits() {
    const activeFilters = Object.keys(this.filters).filter(key => this.filters[key]);
    const units = this.units.filter(unit => activeFilters.includes(unit.unit_type));
    this.filteredUnits = units;

    this.payload = {
      ...this.payload,
      unit_status: units.map(unit => ({
        unit_id: unit.id,
        type: unit.unit_type,
        station: unit.station,
        status: false,
      })),
    };

    this.pagination = {
      page: 1,
      pageSize: 25,
      pageSizes: [10, 25, 50, 100],
      totalItems: units.length,
    };
  }

  setSort(sort) {
    const direction = this.ascending ? '+' : '-';
    this.sort = `${direction}${sort}`;
    this.ascending = !this.ascending;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  dismiss() {
    localStorage.setItem(LOCALSTORAGE_DISMISS_KEY, true);
  }

  setDirty() {
    this.dirty = true;
  }

  async run() {
    try {
      this.dirty = false;
      this.loading = true;
      this.error = null;
      this.setStrategy('current');
      const payload = {
        ...this.payload,
        unit_status: this.payload.unit_status.map(unit_status => {
          const station_number = parseInt(unit_status.station);
          const station = this.stations.find(station => station.station_number === station_number);
          return {
            unit_id: unit_status.unit_id,
            status: unit_status.status ? 'UNAVAILABLE' : 'AVAILABLE',
            current_location: station && station.geohash || null
          }
        })
      };
  
      this.optimized = await this.optimize(payload);
    } catch(err) {
      console.error(err);
      this.error = err;
    } finally {
      this.loading = false;
      this.$scope.$apply();
    }
  }

  async optimize(payload) {
    const url = 'https://p1l0yizmy0.execute-api.us-east-1.amazonaws.com/dev/move-up-model';
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    return response.json();
  }

  get paginationBegin() {
    if (this.pagination.page === 1) {
      return 0;
    }

    return (this.pagination.page - 1) * this.pagination.pageSize;
  }

  get modelImprovement() {
    if (!this.optimized) {
      return 0;
    }

    return (this.optimized.move_up.metrics.percentage_under_4_minute_travel - this.optimized.current.metrics.percentage_under_4_minute_travel).toFixed(1)
  }
}