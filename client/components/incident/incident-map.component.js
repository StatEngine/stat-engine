'use strict';

import MapBoxGL from 'mapbox-gl';
import _ from 'lodash';
import geojsonExtent from '@mapbox/geojson-extent';

export default class IncidentMapComponent {
  constructor(mapboxConfig) {
    'ngInject';

    this.map = null;
    this.showConcurrent = false;
    this.mapboxConfig = mapboxConfig;
  }

  async loadModules() {
    const tippy = (await import(/* webpackChunkName: "tippy" */ 'tippy.js')).default;
    tippy('.tippy', {
      allowTitleHTML: true,
      interactive: true,
      delay: 150,
      arrow: true,
      arrowType: 'sharp',
      theme: 'statengine',
      duration: 250,
      animation: 'shift-away',
      maxWidth: '350px',
      inertia: false,
      touch: true,
    });
  }

  async $onInit() {
    await this.loadModules();
    this.initialized = true;

    const features = [];
    _.forEach(this.incidents, incident => {
      const coordinates = [incident.address.longitude, incident.address.latitude];

      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: {
          title: incident.description.incident_number,
          icon: 'marker'
        }
      });
    });

    const geojson = {
      type: 'FeatureCollection',
      features
    };

    const concurrent = this.concurrent.map(incident => {
      const coordinates = [incident.address.longitude, incident.address.latitude];
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates
        },
        properties: {
          title: incident.description.incident_number,
          icon: 'marker'
        }
      };
    });

    const bounds = geojsonExtent(geojson);
    const center = features.length > 0 ? features[0].geometry.coordinates : undefined;

    this.map = new MapBoxGL.Map({
      container: 'incident-map',
      style: 'mapbox://styles/mapbox/light-v9',
      zoom: 12,
      pitch: 60,
      center
    });

    this.map.on('load', () => {
      this.map.addLayer({
        id: 'incidents',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: geojson
        },
        layout: {
          'icon-image': '{icon}-15',
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }
      });

      this.map.addLayer({
        id: 'concurrent',
        type: 'symbol',
        source: {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: concurrent
          }
        },
        layout: {
          'icon-image': '{icon}-15',
          'text-field': '{title}',
          'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }
      });

      // Apply padding manually since MapBoxGL seems to be a bit glitchy here.
      const padding = 0.0015;
      bounds[0] -= padding;
      bounds[1] -= padding;
      bounds[2] += padding;
      bounds[3] += padding;

      this.map.fitBounds(bounds);
    });
  }

  toggleConcurrent() {
    if (this.map.loaded()) {
      if (this.showConcurrent) {
        this.showConcurrent = false;
        this.map.setLayoutProperty('concurrent', 'visibility', 'none');
      } else {
        this.showConcurrent = true;
        this.map.setLayoutProperty('concurrent', 'visibility', 'visible');
      }
    }
  }
}
