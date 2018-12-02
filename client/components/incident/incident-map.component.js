'use strict';

import MapBoxGL from 'mapbox-gl';
import _ from 'lodash';

export default class IncidentMapComponent {
  constructor(mapboxConfig) {
    'ngInject';

    this.mapboxConfig = mapboxConfig;
  }

  $onInit() {
    this.initialized = true;

    const bounds = new MapBoxGL.LngLatBounds();
    
    const markers = [];
    _.forEach(this.incidents, incident => {
      const incidentLocation = [incident.address.longitude, incident.address.latitude];
  
      const address = `<h4>\
        ${incident.address.address_line1}<br>\
        ${incident.address.city}, ${incident.address.state}<\h4>`;

      const popup = new MapBoxGL.Popup({ offset: 25 })
        .setHTML(address);
  
      bounds.extend([
        incidentLocation[0],
        incidentLocation[1]
      ]);

      markers.push(new MapBoxGL.Marker()
        .setLngLat(incidentLocation)
        .setPopup(popup)
      );
    })

    console.dir(bounds.getCenter())
    const map = new MapBoxGL.Map({
      container: 'incident-map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: bounds.getCenter(),
      zoom: 12,
     // pitch: 60,
    });

    _.forEach(markers, m => m.addTo(map))
  }
}
