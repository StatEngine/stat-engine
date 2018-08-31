'use strict';

import MapBoxGL from 'mapbox-gl';

export default class IncidentMapComponent {
  constructor(mapboxConfig) {
    'ngInject';

    this.mapboxConfig = mapboxConfig;
  }

  $onInit() {
    this.initialized = true;

    const incidentLocation = [this.incident.address.longitude, this.incident.address.latitude];

    const map = new MapBoxGL.Map({
      container: 'incident-map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: incidentLocation,
      zoom: 13,
      pitch: 60,
    });

    const address = `<h4>\
      ${this.incident.address.address_line1}<br>\
      ${this.incident.address.city}, ${this.incident.address.state}<\\h4>`;
    const popup = new MapBoxGL.Popup({ offset: 25 })
      .setHTML(address);

    new MapBoxGL.Marker()
      .setLngLat(incidentLocation)
      .setPopup(popup)
      .addTo(map);
  }
}
