/* eslint  class-methods-use-this: 0 */

'use strict';

import MapBoxGL from 'mapbox-gl';
import _ from 'lodash';

import geojsonExtent from '@mapbox/geojson-extent';

const LOCALSTORAGE_DISMISS_KEY = 'move-up-info';

export default class MoveupHomeController {
  /*@ngInject*/

  constructor(units, mapboxConfig, stations) {
    this.stations = stations;
    this.sort = 'unit_id';
    this.ascending = true;
    this.strategy = 'current';
    this.units = units;
    this.mapboxConfig = mapboxConfig;
    this.outputDisabled = true;
    this.dismissed = !!localStorage.getItem(LOCALSTORAGE_DISMISS_KEY)

    this.payload = {
      covered_time: 4,
      unit_status: units.map(unit => ({
        unit_id: unit.id,
        type: unit.unit_type,
        station: unit.station,
        status: false,
      })),
      station_status: stations.map(station => ({
        station_id: station.station_number,
        location: station.geohash
      }))
    }
  }

  $onInit() {
    const map = new MapBoxGL.Map({
      container: 'unoptimized-map',
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: 12,
      pitch: 60,
      // center
    });
  }

  run() {
    console.log(this.payload);
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
    console.log(payload);
  }

  handlePaginationChange(pagination) {
    console.log(pagination)
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
}