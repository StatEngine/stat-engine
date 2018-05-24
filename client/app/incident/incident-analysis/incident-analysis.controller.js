/* eslint  class-methods-use-this: 0 */

'use strict';

import mapboxgl from 'mapbox-gl';
import Plotly from 'plotly.js'
import _ from 'lodash';
import moment from 'moment';

export default class IncidentAnalysisController {
  /*@ngInject*/
  constructor(SegmentService, currentPrincipal, incident) {
    this.SegmentService = SegmentService;
    this.currentPrincipal = currentPrincipal;
    this.incident = incident;

    // TODO generate these magically
    this.incidentSummary = 'On Friday, Mon 13 12:00 AM, Richmond Fire Department responded to a structure fire at 348 Maple Road, a Commerical property valued at 10M.  The first response arrived withn 4 minutes, and the total reponse included 10 units across 2 stations.  The incident was resolved within 12 minutes.';
    this.responseSummary =
      this.incident.fire_department.name + ' response included 3 units, including 3 trucks, 2 engines, 1 chief, and .  The incident occurred in response zone.  Station X was first due.  The first unit arrived on scene within 2 minutes';
    this.locationSummary = 'Incident location is located within an Urban population density within the south market neighborhood and council district 8';

    // TODO should move this to component
    // Future - uber driving route
    const incidentLocation = [incident.address.longitude, incident.address.latitude];
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/light-v9',
      center: incidentLocation,
      zoom: 13,
    });

    var marker = new mapboxgl.Marker()
      .setLngLat(incidentLocation)
      .addTo(map);


    var unitTimelineData = [];
    const turnoutDurations = {
      x: [],
      y: [],
    };
    const travelDurations = {
      x: [],
      y: [],
    };

    _.forEach(this.incident.apparatus, u => {
      if (u.extended_data.turnout_duration) {
        turnoutDurations.x.push(u.extended_data.turnout_duration);
        turnoutDurations.y.push(u.unit_id);
      }
      if (u.extended_data.travel_duration) {
        travelDurations.x.push(u.extended_data.travel_duration);
        travelDurations.y.push(u.unit_id);
      }
    })

    unitTimelineData.push({
      x: turnoutDurations.x,
      y: turnoutDurations.y,
      name: 'Turnout',
      orientation: 'h',
      marker: {
        color: 'rgba(55,128,191,0.6)',
        width: 1
      },
      type: 'bar'
    });
    unitTimelineData.push({
      x: travelDurations.x,
      y: travelDurations.y,
      name: 'Travel',
      orientation: 'h',
      marker: {
        color: 'rgba(255,153,51,0.6)',
        width: 1
      },
      type: 'bar'
    });

    var layout = {
      title: 'Unit Response Durations',
      barmode: 'stack',
      shapes: [

    //line vertical

    {
      type: 'line',
      x0: 90,
      x1: 90,
      line: {
        color: 'red',
        width: 4
      }
    },
  ]
   };


   Plotly.newPlot('unit-timeline', unitTimelineData, layout);


   var x1 = [];
   var x2 = [];
   for (var i = 0; i < 500; i ++) {
   	x1[i] = Math.random();
   	x2[i] = Math.random();
   }

   var trace1 = {
     x: ['T10', 'E16', 'E14'],
     y: [20, 14, 23],
     name: 'Expected',
     type: 'bar',
     opacity: 0.5,
     width: [.1, .1, .1],
   };

   var trace2 = {
     x: ['T10', 'E16', 'E14'],
     y: [12, 18, 29],
     name: 'Actual',
     type: 'bar',
     opacity: 0.5,
     width: [.2, .2, .2],
   };


   var data = [trace1, trace2];
   var layout = {
     title: 'Travel Durations',
     barmode: 'overlay',
   };
   Plotly.newPlot("travel", data, layout);


  }
}
