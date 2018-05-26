import {
  getMatrix,
} from './mapbox.helpers';
import 'chai/register-should';

describe('getMatrix', () => {
  let incident = {
    "address": {
      "population_density": "Urban",
      "location": {
        "census": {
          "census_2010": {
            "census_id": "517600104021033",
            "block": "1033",
            "block_group": "1",
            "tract": "010402",
            "description": "Block 1033"
          }
        },
        "parcel": {
          "id": "1531",
          "name": "N0001322001",
          "land_use": "Multi-Family",
          "land_area": 299919.62,
          "owner_name": "Virginia United Methodist Hms Inc",
          "land_value": 782000,
          "dwelling_value": 7418000
        },
        "council_district": "2"
      },
      "address_id": "",
      "number": "1600",
      "address_line1": "1600 WESTWOOD AVE",
      "city": "Richmond",
      "cross_street1": "UNNAMED SEGMENT",
      "cross_street2": "CHATHAM RD",
      "first_due": "14",
      "name": "WESTWOOD",
      "postal_code": "",
      "prefix_direction": "",
      "suffix_direction": "",
      "response_zone": "607502",
      "state": "VA",
      "type": "AVE",
      "longitude": -77.460327,
      "latitude": 37.579026,
      "battalion": "BC1",
      "common_place_name": "HERMITAGE METHODIST HOME",
      "distance_from_fire_department": 1.2,
      "geohash": "dq8vv351ew1v"
    },
    "weather": {
      "currently": {
        "time": "2018-05-17T23:36:22-04:00",
        "summary": "Drizzle",
        "icon": "rain",
        "precipIntensity": 0.007,
        "precipIntensityError": 0.0004,
        "precipProbability": 1,
        "precipType": "rain",
        "temperature": 68.99,
        "apparentTemperature": 70.21,
        "dewPoint": 68.5,
        "humidity": 0.98,
        "pressure": 1016.66,
        "windSpeed": 1.97,
        "windGust": 4.68,
        "windBearing": 50,
        "cloudCover": 0.69,
        "uvIndex": 0,
        "visibility": 3.86,
        "ozone": 316.53
      },
      "daily": {
        "time": "2018-05-17T00:00:00-04:00",
        "summary": "Heavy rain in the evening and overnight.",
        "icon": "rain",
        "sunriseTime": "2018-05-17T06:00:05-04:00",
        "sunsetTime": "2018-05-17T20:15:17-04:00",
        "moonPhase": 0.08,
        "precipIntensity": 0.0347,
        "precipIntensityMax": 0.226,
        "precipIntensityMaxTime": "2018-05-17T18:00:00-04:00",
        "precipProbability": 0.99,
        "precipType": "rain",
        "temperatureHigh": 76.81,
        "temperatureHighTime": "2018-05-17T14:00:00-04:00",
        "temperatureLow": 67.5,
        "temperatureLowTime": "2018-05-18T07:00:00-04:00",
        "apparentTemperatureHigh": 77.96,
        "apparentTemperatureHighTime": "2018-05-17T15:00:00-04:00",
        "apparentTemperatureLow": 68.65,
        "apparentTemperatureLowTime": "2018-05-18T07:00:00-04:00",
        "dewPoint": 68.91,
        "humidity": 0.93,
        "pressure": 1015.32,
        "windSpeed": 2.48,
        "windGust": 11.99,
        "windGustTime": "2018-05-17T18:00:00-04:00",
        "windBearing": 156,
        "cloudCover": 0.54,
        "uvIndex": 9,
        "uvIndexTime": "2018-05-17T13:00:00-04:00",
        "visibility": 7.33,
        "ozone": 316.62,
        "temperatureMin": 68.1,
        "temperatureMinTime": 1526551200,
        "temperatureMax": 76.81,
        "temperatureMaxTime": 1526580000,
        "apparentTemperatureMin": 69.23,
        "apparentTemperatureMinTime": 1526551200,
        "apparentTemperatureMax": 77.96,
        "apparentTemperatureMaxTime": 1526583600
      }
    },
    "description": {
      "event_opened": "2018-05-17T23:36:22-04:00",
      "type": "FIRE-ALARM",
      "subtype": "PULL STATION",
      "event_id": "4034983",
      "incident_number": "F01805170145",
      "event_closed": "2018-05-17T23:52:53-04:00",
      "units": [
        "E14",
        "E16",
        "T10"
      ],
      "first_unit_dispatched": "2018-05-17T23:36:30-04:00",
      "first_unit_enroute": "2018-05-17T23:37:33-04:00",
      "first_unit_arrived": "2018-05-17T23:42:31-04:00",
      "hour_of_day": 23,
      "day_of_week": "Thursday",
      "comments": "SPECIAL ADDRESS COMMENT: ***RFD: HIGH LIFE HAZARD*** AddressFullText: 1600 WESTWOOD AVE RICHMOND VA 232274682 AUDIBLE ALARM THE HERMITAGE (Commercial) Alarm Company Incident Number: 714735321 Operator ID: JKO Station ID: 1TY Additional Location Information: Site Phone Number: 8772387739 Alarm Details: FA-PULL STATION Alarm Confirmation: NO ANSWER ** LOI search completed at 05/17/18 23:36:29 ** Case number C201814982 has been assigned to event F01805170145 ** >>>> by: 3657  on terminal: ecc-f2 ** Recommended unit E14 for requirement ENGINE (1.2 mi) ** Recommended unit E16 for requirement ENGINE (1.3 mi) ** Recommended unit T10 for requirement TRUCK (1.5 mi) Duplicate Event:Location = 1600 WESTWOOD AVE RICH : @HERMITAGE METHODIST HOME, Cross Street 1 = UNNAMED SEGMENT, Cross Street 2 = CHATHAM RD, Type = ASSIST-FIRE FIRE-ALARM ASSIST FIRE DEPARTMENT # FIRE ALARM, Subtype = TC GENERAL TRAFFIC AND/OR CROWD CONTROL GENERAL, Alarm Level = 0 SPECIAL ADDRESS COMMENT: End of Duplicate Event data ** Cross Referenced to Event # F01805170146 at: 05/17/18 23:38:30 ** >>>> by: JENNIFER M. THOMAS on terminal: ecc-f2 ***RFD: HIGH LIFE HAZARD*** ** LOI search completed at 05/17/18 23:37:53 FIRE ALARM GOING OFF DOESN'T KNOW THE SPECIFIC AREA NO FLAMES OR SMOKE 4TH FLOOR ART STUDIO Duplicate Event:Location = 1600 WESTWOOD AVE RICH : @HERMITAGE METHODIST HOME, Cross Street 1 = UNNAMED SEGMENT, Cross Street 2 = CHATHAM RD, Type = ASSIST-FIRE FIRE-ALARM ASSIST FIRE DEPARTMENT # FIRE ALARM, Subtype = TC GENERAL TRAFFIC AND/OR CROWD CONTROL GENERAL, Caller Name = BRITTANY, Caller Ph Number = 804-474-8600, Alarm Level = 0 SPECIAL ADDRESS COMMENT: End of Duplicate Event data ** Cross Referenced to Event # 201805170801 at: 05/17/18 23:40:15 ** >>>> by: TAYLOR S. WATKINS on terminal: ecc-p4 ***RFD: HIGH LIFE HAZARD*** ** LOI search completed at 05/17/18 23:37:53 FIRE ALARM GOING OFF DOESN'T KNOW THE SPECIFIC AREA NO FLAMES OR SMOKE 4TH FLOOR ART STUDIO ** Cross Referenced to Event # F01805170145 at: 05/17/18 23:38:30 ** >>>> by: JENNIFER M. THOMAS on terminal: ecc-f2 E14 2 STRY MULTI RESD STRUCTURE NV E14 W/INV E16 O/S WESTWOOD/CHATHAM 4TH FL PULL STATION GOING TO INV DETECTOR W/WATER IN IT E14 TO HANDLE ALL OTHR CO CAN RTRN TO SERVICE",
      "psap_answer_time": "2018-05-17T23:36:22-04:00",
      "shift": "C",
      "active": false,
      "suppressed": false,
      "loi_search_complete": "2018-05-17T23:40:15-04:00",
      "extended_data": {
        "psap_answer_time_to_event_creation": 0,
        "psap_answer_time_to_first_dispatch": 7,
        "psap_answer_time_to_first_arrival": 369,
        "event_duration": 991,
        "response_duration": 362
      },
      "category": "FIRE"
    },
    "apparatus": [
      {
        "car_id": "181241",
        "station": "FSTA14",
        "unit_id": "E14",
        "unit_type": "Engine",
        "unit_status": {
          "dispatched": {
            "latitude": 37.57179,
            "longitude": -77.44388,
            "timestamp": "2018-05-17T23:36:30-04:00",
            "geohash": "dq8vtxxpdc39",
            "order": 1
          },
          "enroute": {
            "latitude": 37.571794,
            "longitude": -77.443883,
            "timestamp": "2018-05-17T23:37:33-04:00",
            "geohash": "dq8vtxxpddp3",
            "order": 1
          },
          "~": {
            "latitude": 37.578284,
            "longitude": -77.459172,
            "timestamp": "2018-05-17T23:45:33-04:00",
            "geohash": "dq8vv2gvq7z5"
          },
          "arrived": {
            "latitude": 37.578284,
            "longitude": -77.459172,
            "timestamp": "2018-05-17T23:46:34-04:00",
            "geohash": "dq8vv2gvq7z5",
            "order": 3
          },
          "available": {
            "latitude": 37.578975,
            "longitude": -77.46044,
            "timestamp": "2018-05-17T23:52:52-04:00",
            "geohash": "dq8vv3512utt",
            "order": 3
          }
        },
        "shift": "C",
        "distance": 1.2,
        "extended_data": {
          "travel_duration": 541,
          "turnout_duration": 63,
          "response_duration": 604,
          "event_duration": 982
        },
        "first_due": true
      },
      {
        "car_id": "111297",
        "station": "FSTA16",
        "unit_id": "E16",
        "unit_type": "Engine",
        "unit_status": {
          "dispatched": {
            "latitude": 37.58846,
            "longitude": -77.44752,
            "timestamp": "2018-05-17T23:36:30-04:00",
            "geohash": "dq8vvdu2tuz3",
            "order": 2
          },
          "enroute": {
            "latitude": 37.588462,
            "longitude": -77.447527,
            "timestamp": "2018-05-17T23:37:47-04:00",
            "geohash": "dq8vvdu2tv4m",
            "order": 2
          },
          "arrived": {
            "latitude": 37.578277,
            "longitude": -77.45881,
            "timestamp": "2018-05-17T23:42:35-04:00",
            "geohash": "dq8vv2ujqft1",
            "order": 2
          },
          "available": {
            "latitude": 37.578277,
            "longitude": -77.45881,
            "timestamp": "2018-05-17T23:49:43-04:00",
            "geohash": "dq8vv2ujqft1",
            "order": 2
          }
        },
        "shift": "C",
        "distance": 1.3,
        "extended_data": {
          "travel_duration": 288,
          "turnout_duration": 77,
          "response_duration": 365,
          "event_duration": 793
        },
        "first_due": false
      },
      {
        "car_id": "981243",
        "station": "FSTA10",
        "unit_id": "T10",
        "unit_type": "Truck/Aerial",
        "unit_status": {
          "dispatched": {
            "latitude": 37.55981,
            "longitude": -77.46075,
            "timestamp": "2018-05-17T23:36:30-04:00",
            "geohash": "dq8vtmdcc8n3",
            "order": 3
          },
          "enroute": {
            "latitude": 37.559818,
            "longitude": -77.460754,
            "timestamp": "2018-05-17T23:37:47-04:00",
            "geohash": "dq8vtmdcc9e3",
            "order": 3
          },
          "arrived": {
            "latitude": 37.572879,
            "longitude": -77.460928,
            "timestamp": "2018-05-17T23:42:31-04:00",
            "geohash": "dq8vtrftvs3c",
            "order": 1
          },
          "available": {
            "latitude": 37.578208,
            "longitude": -77.460865,
            "timestamp": "2018-05-17T23:48:42-04:00",
            "geohash": "dq8vv2fszj8w",
            "order": 1
          }
        },
        "shift": "C",
        "distance": 1.5,
        "extended_data": {
          "travel_duration": 284,
          "turnout_duration": 77,
          "response_duration": 361,
          "event_duration": 732
        },
        "first_due": false
      }
    ],
    "fire_department": {
      "fd_id": "76000",
      "firecares_id": "93345",
      "name": "Richmond Fire and Emergency Services",
      "state": "VA",
      "timezone": "US/Eastern"
    },
    "version": "0.0.1",
    "durations": {
      "alarm_answer": {
        "seconds": 0
      },
      "alarm_processing": {
        "seconds": 8
      },
      "alarm_handling": {
        "seconds": 8
      },
      "turnout": {
        "seconds": 63
      },
      "travel": {
        "seconds": 298,
        "minutes": 4.966666666666667
      },
      "total_response": {
        "seconds": 369,
        "minutes": 6.15
      },
      "total_event": {
        "seconds": 991,
        "minutes": 16.516666666666666
      }
    },
    "NFPA": {
      "alarm_answering_duration_seconds": 0,
      "alarm_processing_duration_seconds": 8,
      "turnout_durations_seconds": [
        63,
        77,
        77
      ],
      "first_engine_travel_duration_seconds": 288,
      "type": "FIRE"
    },
    "validation": {
      "valid": true,
      "errorsText": "No errors"
    }
  };

  it('should get travel matrix', () => {
    console.dir(getMatrix(incident));
  });
});
