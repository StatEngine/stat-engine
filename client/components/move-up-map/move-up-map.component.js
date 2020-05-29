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
    const center = this.stations[0].geom.coordinates;

    const map = new MapBoxGL.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: 15,
      pitch: 0,
      center
    });

    map.on('load', () => {
      map.addSource('iso', {
        type: 'geojson',
        data: {
          'type': 'FeatureCollection',
          'features': []
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

      // map.fitBounds(bounds);
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

      this.fetchIsocrone(this.units, map, this.travel);
    });
  }

  async fetchIsocrone(units, map, travelTime) {
    const promises = units.map(unit => {
      const [lat, long] = unit.geom.coordinates;
      return fetch(`https://api.mapbox.com/isochrone/v1/mapbox/driving/${lat},${long}?contours_minutes=${travelTime}&polygons=true&access_token=pk.eyJ1IjoicHJvbWluZW50ZWRnZS1pcHNkaSIsImEiOiJja2FpZzg3OXYwMGk3MnhvY2Ric2k4MjdrIn0.zdkP7yOVF_HyWstRyt_QRg`).then(response => response.json());
    });

    const responses = await Promise.all(promises);
    const features = responses
      .map(response => response.features)
      .flat()
      .reduce((prev, current) => {
        debugger;
        return union(prev, current);
      });

    console.log(features);

    // map.getSource('iso').setData(features);
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
      travel: '='
    },
  })
  .name;
