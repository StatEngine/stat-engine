'use strict';

/* eslint no-sync: 0 */

import angular from 'angular';
import MapBoxGL from 'mapbox-gl';

export class MoveUpMapComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    const mapColor = this.color || '#1bb4c7';
    const center = this.stations[0].geom.coordinates;
    const isochrones = this.isochrones;

    const map = new MapBoxGL.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: 11,
      pitch: 0,
      center
    });

    map.on('load', () => {

      map.addSource('boundary', {
        type: 'geojson',
        data: {
          'type': 'Feature',
          'geometry': this.boundary.geom
        }
      });

      map.addSource('iso', {
        type: 'geojson',
        data: {
          'type': 'Feature',
          'geometry': isochrones
        }
      });
     
      map.addLayer({
        'id': 'isoLayer',
        'type': 'fill',
        'source': 'iso',
        'layout': {},
        'paint': {
          'fill-color': mapColor,
          'fill-opacity': 0.3
        }
      });

      map.addLayer({
        'id': 'boundaryStroke',
        'type': 'line',
        'source': 'boundary',
        'layout': {},
        'paint': {
          'line-color': mapColor,
          'line-width': 2
        }
      });

      this.stations.forEach(({ geom, name, station_number }) => {
        const units = this.units
          .filter(unit => !unit.status)
          .filter(({ station }) => parseInt(station) === station_number)
          .map(({ unit_id }) => `<div>${unit_id}</div>`);

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
      color: '@',
      isochrones: '=',
      boundary: '='
    },
  })
  .name;
