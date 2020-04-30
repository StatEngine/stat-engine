/* eslint  class-methods-use-this: 0 */

'use strict';

import _ from 'lodash';
import MapBoxGL from 'mapbox-gl';
import geojsonExtent from '@mapbox/geojson-extent';
import Buffer from '@turf/buffer';
import { point } from '@turf/helpers';
import union from '@turf/union';
import axios from 'axios';

const LOCALSTORAGE_DISMISS_KEY = 'move-up-info';

export default class MoveupHomeController {
  /*@ngInject*/

  constructor(units, mapboxConfig, stations, incidents) {
    this.sort = 'unit_id';
    this.ascending = true;
    this.strategy = 'current';
    this.mapboxConfig = mapboxConfig;
    this.outputDisabled = true;
    this.modelHasChangedSinceRun = false;
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
    }

    this.pagination = {
      page: 1,
      pageSize: 25,
      pageSizes: [10, 25, 50, 100],
      totalItems: this.units.length,
    };
  }

  $onInit() {
    const units = this.units
      .filter((unit, index, self) => self.findIndex(u => u.geohash === unit.geohash) === index)
      .map(unit => {
        const coordinates = unit.geom.coordinates;
        const _point = point(coordinates);
        return Buffer(_point, 2, { units: 'miles' });
      })
      .reduce((prev, current) => union(prev, current));

    const geojson = {
      type: 'FeatureCollection',
      features: [units]
    };

    const bounds = geojsonExtent(geojson);
    const center = this.stations[0].geom.coordinates;

    const map = new MapBoxGL.Map({
      container: 'unoptimized-map',
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: 15,
      pitch: 0,
      center
    });

    map.on('load', () => {

      map.addLayer({
        id: 'coverage',
        type: 'fill',
        source: {
          type: 'geojson',
          data: geojson
        },
        paint: {
          'fill-color': '#1bb4c7',
          'fill-opacity': 0.2,
          'fill-outline-color': '#1bb4c7'
        },
        filter: ['==', '$type', 'Polygon']
      });

      map.addLayer({
        id: 'coverageOutline',
        type: 'line',
        source: {
          type: 'geojson',
          data: geojson
        },
        paint: {
          'line-color': '#1bb4c7'
        },
        filter: ['==', '$type', 'Polygon']
      });

      this.stations.forEach(({ geom, name, station_number }) => {
        const units = this.units
          .filter(({station}) => parseInt(station) === station_number)
          .map(({ id }) => `<div>${id}</div>`)

        const { coordinates } = geom;
        const popup = new MapBoxGL.Popup({ offset: 25 }).setHTML(`
          <div class="model-popup">
            <strong>${name}</strong>
            <div class="model-popup-unit-count">There are ${units.length} units currently assigned to this station</div>
            <div class="model-popup-units">
              ${ units.join('') }
            </div>
          </div>
        `);
           
          const el = document.createElement('div');
          el.classList.add('model-marker');
          el.setAttribute("data-count", units.length);
           
          new MapBoxGL.Marker(el)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map);
      });

      map.fitBounds(bounds);
      map.addControl(new MapBoxGL.NavigationControl());

      // Custom Controls
      const layerButton = document.createElement('button');
      layerButton.classList.add('mapboxgl-ctrl-icon');
      layerButton.classList.add('layers-button');
      layerButton.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const container = map.getContainer();
        container.classList.toggle('hide-markers');
      };

      const controlGroup = document.querySelector('.mapboxgl-ctrl-top-right .mapboxgl-ctrl-group');
      controlGroup.appendChild(layerButton);
    });
  }

  $onChanges(changes) {
    console.log(changes);
  }

  async run() {
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
    this.modelHasChangedSinceRun = false;
    this.optimized = await this.optimize(payload);
    this.outputDisabled = false;
  }

  async optimize(payload) {
    const url = 'https://p1l0yizmy0.execute-api.us-east-1.amazonaws.com/dev/move-up-model';
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return response.json();
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

  get paginationBegin() {
    if (this.pagination.page === 1) {
      return 0;
    }
    
    return (this.pagination.page - 1) * this.pagination.pageSize;
  }
}