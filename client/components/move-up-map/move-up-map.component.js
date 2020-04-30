'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import MapBoxGL from 'mapbox-gl';
import geojsonExtent from '@mapbox/geojson-extent';
import Buffer from '@turf/buffer';
import { point } from '@turf/helpers';
import union from '@turf/union';

export class MoveUpMapComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    const mapColor = this.color || '#1bb4c7';

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
      container: 'map',
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
          'fill-color': mapColor,
          'fill-opacity': 0.2,
          'fill-outline-color': mapColor
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
          'line-color': mapColor
        },
        filter: ['==', '$type', 'Polygon']
      });

      this.stations.forEach(({ geom, name, station_number }) => {
        const units = this.units
          .filter(({ station }) => parseInt(station) === station_number)
          .map(({ id }) => `<div>${id}</div>`)

        const { coordinates } = geom;
        const popup = new MapBoxGL.Popup({ offset: 25 }).setHTML(`
          <div class="model-popup">
            <strong>${name}</strong>
            <div class="model-popup-unit-count">There are ${units.length} units currently assigned to this station</div>
            <div class="model-popup-units">
              ${ units.join('')}
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

}

export default angular.module('directives.moveUpMap', [])
  .component('moveUpMap', {
    template: require('./move-up-map.html'),
    controller: MoveUpMapComponent,
    controllerAs: 'vm',
    bindings: {
      stations: '=',
      units: '=',
      color: '@'
    },
  })
  .name;
