/* eslint  class-methods-use-this: 0 */

'use strict';

const LOCALSTORAGE_DISMISS_KEY = 'move-up-info';

export default class MoveupHomeController {
  /*@ngInject*/

  constructor($scope, units, mapboxConfig, stations, incidents) {
    this.$scope = $scope;
    this.sort = 'unit_id';
    this.optimized = null;
    this.ascending = true;
    this.strategy = 'current';
    this.mapboxConfig = mapboxConfig;
    this.dirty = false;
    this.dismissed = !!localStorage.getItem(LOCALSTORAGE_DISMISS_KEY)

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

    this.payload = {
      covered_time: 4,
      unit_status: this.units.map(unit => ({
        unit_id: unit.id,
        type: unit.unit_type,
        station: unit.station,
        status: false,
      })),
      station_status: stations.map(station => ({
        station_id: station.station_number,
        location: station.geohash
      })),
      incident_distribution: incidents.map(incident => incident.address.geohash)
    };

    this.pagination = {
      page: 1,
      pageSize: 25,
      pageSizes: [10, 25, 50, 100],
      totalItems: this.units.length,
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
    this.dirty = false;
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
    this.$scope.$apply();
  }

  async optimize(payload) {
    // const url = 'https://p1l0yizmy0.execute-api.us-east-1.amazonaws.com/dev/move-up-model';
    // const response = await fetch(url, {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(payload)
    // });

    // return response.json();
    return {
      "current": {
        "metrics": {
          "percentage_under_4_minute_travel": 74.7
        }
      },
      "move_up": {
        "strategy": "maximize fraction of incidents within 4 minute travel time",
        "metrics": {
          "percentage_under_4_minute_travel": 86.4
        },
        "moves": [
          {
            "unit_id": "E14",
            "station": 16
          },
          {
            "unit_id": "E8",
            "station": 17
          },
          {
            "unit_id": "E25",
            "station": 23
          },
          {
            "unit_id": "E19",
            "station": 20
          },
          {
            "unit_id": "E6",
            "station": 5
          }
        ]
      }
    };
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