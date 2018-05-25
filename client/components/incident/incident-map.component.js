'use strict';

import angular from 'angular';
import mapboxgl from 'mapbox-gl';

export default class IncidentMapComponent {
  constructor() {
    'ngInject';
  }

  $onInit() {
    const incidentLocation = [this.incident.address.longitude, this.incident.address.latitude];

    const map = new mapboxgl.Map({
      container: 'incident-map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: incidentLocation,
      zoom: 13,
    });

    const address = `<h4>\
      ${this.incident.address.address_line1}<br>\
      ${this.incident.address.city}, ${this.incident.address.state}<\h4>`;
    const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(address);

    const marker = new mapboxgl.Marker()
      .setLngLat(incidentLocation)
      .setPopup(popup)
      .addTo(map);
  }
}
