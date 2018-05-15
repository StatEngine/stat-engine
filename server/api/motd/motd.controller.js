import async from 'async';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import request from 'request-promise';
import { DailyMessage } from '../../sqldb';

import connection from '../../elasticsearch/connection';

import config from '../../config/environment';

import SAFETY_MESSAGES from './safetyMessages';

export function day(req, res) {
  const year = req.params.year;
  const month = req.params.month;
  const day = req.params.day;
  console.log(`${req.user.FireDepartment._id} : here`)
  DailyMessage.findOne({
    where: {
      date: `${year}-${month}-${day}`,
      fire_department__id: req.user.FireDepartment._id
    },
  }).then(dailyMessage => res.json(dailyMessage));
}


export function configDay(req, res) {
  const year = req.params.year;
  const month = req.params.month;
  const day = req.params.day;
  //var dailyMessage = DailyMessage.build(req.body);
  const payload = req.body;
  payload.fire_department__id = req.user.FireDepartment._id;

  return DailyMessage.upsert(payload).then(function(message) {
    return res.json(message);
  });
}

export function getIncidentSummary(req, res) {
  const client = connection.getClient();
  console.dir(req.user.FireDepartment.get())
  client.search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: {
      size: 0,
      query: {
        bool: {
          must_not: {
            term: {
              'description.suppressed': true
            }
          }
        },
      },
      aggs: {
        category: {
          terms: {
            field: 'description.category',
          }
        },
        totalResponses: {
          sum: {
            script: {
              lang: 'painless',
              inline: 'doc[\'description.units.keyword\'].length'
            }
          }
        },
        responseDuration: {
          percentile_ranks: {
            field: 'description.extended_data.response_duration',
            values: [360]
          }
        },
        eventDuration: {
          percentiles: {
            field: 'description.extended_data.event_duration',
            percents: [90]
          }
        },
        turnoutDuration: {
          percentiles: {
            field: 'description.extended_data.event_duration',
            percents: [90]
          }
        },
        eventDuration: {
          percentiles: {
            field: 'description.extended_data.event_duration',
            percents: [90]
          }
        },
        apparatus: {
          nested: {
            path: 'apparatus'
          },
          aggs: {
            distance: {
              percentiles: {
                field: 'apparatus.distance',
                percents: [90]
              }
            },
            turnoutDuration: {
              percentiles: {
                field: 'apparatus.extended_data.turnout_duration',
                percents: [90]
              }
            },
            units: {
              terms: {
                field: 'apparatus.unit_id',
                size: 100
              },
              aggs: {
                turnoutDuration: {
                  percentiles: {
                    field: 'apparatus.extended_data.turnout_duration',
                    percents: [90]
                  }
                },
                totalDistance: {
                  sum: {
                    field: 'apparatus.distance'
                  }
                },
                totalEventDuration: {
                  sum: {
                    field: 'apparatus.extended_data.event_duration'
                  }
                }
              }
            },
          }
        }
      }
    }
  }).then((result) => {
    console.dir(result)
    const data = {};

    const categoryBuckets = _.get(result, 'aggregations.category.buckets');
    data.incidentSummary = {
      platoon: 'TODO',
      totalCount: _.get(result, 'hits.total'),
      emsCount: categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'EMS'), 'doc_count') : undefined,
      fireCount: categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'FIRE'), 'doc_count') : undefined,
      otherCount: categoryBuckets ? _.get(_.find(categoryBuckets, u => u.key === 'OTHER'), 'doc_count') : undefined,
      totalResponses: _.get(result, 'aggregations.totalResponses.value'),
      sixMinuteResponsePercentage: _.get(result, 'aggregations.apparatus.values[\'360.0\']'),
      turnoutDuration90: _.get(result, 'aggregations.turnoutDuration.values[\'90.0\']'),
      distance90: _.get(result, 'aggregations.distance.values[\'90.0\']'),
      eventDuration90: _.get(result, 'aggregations.eventDuration.values[\'90.0\']'),
    }

    data.unitSummary = [];
    const unitBuckets = _.get(result, 'aggregations.apparatus.units.buckets');
    _.forEach(unitBuckets, (u) => {
      data.unitSummary.push({
        name: u.key,
        totalCount: _.get(u, 'doc_count'),
        utilization: _.get(u, 'totalEventDuration.value'),
        distance: _.get(u, 'totalDistance.value'),
        turnoutDuration90: _.get(u, 'turnoutDuration.values[\'90.0\']'),
      });
    });

    data.incidentTypeSummary = [];

    res.json(data);

  }).catch((err) => {
    console.dir(err)
    res.status(500).send();
  });
}

export function getSafetyMessage(req, res) {
  return res.json({ message: SAFETY_MESSAGES[Math.floor(Math.random() * SAFETY_MESSAGES.length)]});
}

export function getWeatherForecast(req, res) {
  console.log(`https://api.darksky.net/forecast/${process.env.DARKSKY_API_TOKEN}/${req.user.FireDepartment.latitude},${req.user.FireDepartment.longitude}`)

  return res.json({'latitude':37.5407,'longitude':-77.436,'timezone':'America/New_York','currently':{'time':1526222741,'summary':'Mostly Cloudy','icon':'partly-cloudy-day','nearestStormDistance':73,'nearestStormBearing':48,'precipIntensity':0,'precipProbability':0,'temperature':76.65,'apparentTemperature':77.46,'dewPoint':67.45,'humidity':0.73,'pressure':1018.83,'windSpeed':1.41,'windGust':2.61,'windBearing':149,'cloudCover':0.61,'uvIndex':4,'visibility':8.61,'ozone':326.67},'hourly':{'summary':'Rain this evening.','icon':'rain','data':[{'time':1526220000,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':73.27,'apparentTemperature':74.02,'dewPoint':66.37,'humidity':0.79,'pressure':1019.03,'windSpeed':3.18,'windGust':3.66,'windBearing':62,'cloudCover':0.37,'uvIndex':3,'visibility':7.74,'ozone':326.06},{'time':1526223600,'summary':'Mostly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':77.7,'apparentTemperature':78.54,'dewPoint':67.75,'humidity':0.72,'pressure':1018.77,'windSpeed':2.05,'windGust':2.29,'windBearing':178,'cloudCover':0.69,'uvIndex':4,'visibility':8.89,'ozone':326.86},{'time':1526227200,'summary':'Clear','icon':'clear-day','precipIntensity':0,'precipProbability':0,'temperature':82.26,'apparentTemperature':84.85,'dewPoint':67.07,'humidity':0.6,'pressure':1017.19,'windSpeed':4.42,'windGust':4.54,'windBearing':47,'cloudCover':0.15,'uvIndex':8,'visibility':10,'ozone':327.16},{'time':1526230800,'summary':'Clear','icon':'clear-day','precipIntensity':0,'precipProbability':0,'temperature':85.44,'apparentTemperature':88.1,'dewPoint':66.73,'humidity':0.54,'pressure':1015.65,'windSpeed':5.83,'windGust':7.18,'windBearing':170,'cloudCover':0.09,'uvIndex':10,'visibility':10,'ozone':327.22},{'time':1526234400,'summary':'Clear','icon':'clear-day','precipIntensity':0.0004,'precipProbability':0.01,'precipType':'rain','temperature':87.5,'apparentTemperature':89.81,'dewPoint':65.83,'humidity':0.49,'pressure':1015.13,'windSpeed':4.96,'windGust':11.75,'windBearing':226,'cloudCover':0.07,'uvIndex':9,'visibility':10,'ozone':327.12},{'time':1526238000,'summary':'Clear','icon':'clear-day','precipIntensity':0.0027,'precipProbability':0.04,'precipType':'rain','temperature':86.7,'apparentTemperature':89.48,'dewPoint':66.76,'humidity':0.52,'pressure':1013.79,'windSpeed':6.08,'windGust':11.9,'windBearing':200,'cloudCover':0.15,'uvIndex':7,'visibility':10,'ozone':327.1},{'time':1526241600,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0.0127,'precipProbability':0.1,'precipType':'rain','temperature':85.81,'apparentTemperature':88.65,'dewPoint':67,'humidity':0.54,'pressure':1013.05,'windSpeed':4.62,'windGust':13.06,'windBearing':231,'cloudCover':0.25,'uvIndex':4,'visibility':10,'ozone':327},{'time':1526245200,'summary':'Possible Light Rain','icon':'rain','precipIntensity':0.0425,'precipProbability':0.16,'precipType':'rain','temperature':84.96,'apparentTemperature':87.77,'dewPoint':67.07,'humidity':0.55,'pressure':1013.24,'windSpeed':4.42,'windGust':13.38,'windBearing':265,'cloudCover':0.29,'uvIndex':2,'visibility':7.64,'ozone':326.68},{'time':1526248800,'summary':'Possible Light Rain','icon':'rain','precipIntensity':0.0358,'precipProbability':0.15,'precipType':'rain','temperature':82.9,'apparentTemperature':85.9,'dewPoint':67.88,'humidity':0.61,'pressure':1012.37,'windSpeed':5.98,'windGust':11.57,'windBearing':180,'cloudCover':0.47,'uvIndex':1,'visibility':9.59,'ozone':325.98},{'time':1526252400,'summary':'Rain','icon':'rain','precipIntensity':0.0723,'precipProbability':0.2,'precipType':'rain','temperature':80.53,'apparentTemperature':83.4,'dewPoint':68.55,'humidity':0.67,'pressure':1012.47,'windSpeed':5.37,'windGust':8.89,'windBearing':83,'cloudCover':0.59,'uvIndex':0,'visibility':4.67,'ozone':325.1},{'time':1526256000,'summary':'Mostly Cloudy','icon':'partly-cloudy-day','precipIntensity':0.0093,'precipProbability':0.08,'precipType':'rain','temperature':79.31,'apparentTemperature':81.84,'dewPoint':68.46,'humidity':0.7,'pressure':1013.48,'windSpeed':3.51,'windGust':5.85,'windBearing':95,'cloudCover':0.8,'uvIndex':0,'visibility':10,'ozone':324.25},{'time':1526259600,'summary':'Rain','icon':'rain','precipIntensity':0.0615,'precipProbability':0.21,'precipType':'rain','temperature':73.69,'apparentTemperature':74.53,'dewPoint':67.21,'humidity':0.8,'pressure':1013.44,'windSpeed':5.32,'windGust':8.31,'windBearing':65,'cloudCover':0.75,'uvIndex':0,'visibility':5.32,'ozone':323.23},{'time':1526263200,'summary':'Mostly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0177,'precipProbability':0.15,'precipType':'rain','temperature':69.48,'apparentTemperature':70.18,'dewPoint':65.18,'humidity':0.86,'pressure':1014.34,'windSpeed':6.23,'windGust':10.38,'windBearing':64,'cloudCover':0.8,'uvIndex':0,'visibility':10,'ozone':322.18},{'time':1526266800,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0075,'precipProbability':0.07,'precipType':'rain','temperature':69.56,'apparentTemperature':70.45,'dewPoint':66.52,'humidity':0.9,'pressure':1014.47,'windSpeed':4.32,'windGust':5.7,'windBearing':99,'cloudCover':0.35,'uvIndex':0,'visibility':10,'ozone':321.37},{'time':1526270400,'summary':'Mostly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0037,'precipProbability':0.08,'precipType':'rain','temperature':63.87,'apparentTemperature':64.36,'dewPoint':61.98,'humidity':0.94,'pressure':1015.28,'windSpeed':6.25,'windGust':9.55,'windBearing':68,'cloudCover':0.83,'uvIndex':0,'visibility':10,'ozone':320.91},{'time':1526274000,'summary':'Mostly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0009,'precipProbability':0.04,'precipType':'rain','temperature':62.79,'apparentTemperature':63.15,'dewPoint':60.79,'humidity':0.93,'pressure':1015.34,'windSpeed':5.37,'windGust':6.67,'windBearing':71,'cloudCover':0.81,'uvIndex':0,'visibility':10,'ozone':320.76},{'time':1526277600,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0,'precipProbability':0,'temperature':67.62,'apparentTemperature':68.36,'dewPoint':64.86,'humidity':0.91,'pressure':1013.91,'windSpeed':5.78,'windGust':5.8,'windBearing':87,'cloudCover':0.25,'uvIndex':0,'visibility':10,'ozone':320.64},{'time':1526281200,'summary':'Mostly Cloudy','icon':'partly-cloudy-night','precipIntensity':0,'precipProbability':0,'temperature':62.07,'apparentTemperature':62.25,'dewPoint':59.35,'humidity':0.91,'pressure':1015.25,'windSpeed':4.14,'windGust':4.14,'windBearing':60,'cloudCover':0.79,'uvIndex':0,'visibility':10,'ozone':320.64},{'time':1526284800,'summary':'Mostly Cloudy','icon':'partly-cloudy-night','precipIntensity':0,'precipProbability':0,'temperature':61.97,'apparentTemperature':62.12,'dewPoint':59.13,'humidity':0.9,'pressure':1015.14,'windSpeed':3.8,'windGust':3.8,'windBearing':46,'cloudCover':0.79,'uvIndex':0,'visibility':10,'ozone':320.76},{'time':1526288400,'summary':'Clear','icon':'clear-night','precipIntensity':0,'precipProbability':0,'temperature':66.3,'apparentTemperature':66.83,'dewPoint':63.12,'humidity':0.9,'pressure':1013.7,'windSpeed':5.24,'windGust':6.04,'windBearing':55,'cloudCover':0.24,'uvIndex':0,'visibility':10,'ozone':320.8},{'time':1526292000,'summary':'Mostly Cloudy','icon':'partly-cloudy-night','precipIntensity':0,'precipProbability':0,'temperature':61.52,'apparentTemperature':61.66,'dewPoint':58.93,'humidity':0.91,'pressure':1015.67,'windSpeed':3.33,'windGust':3.34,'windBearing':34,'cloudCover':0.78,'uvIndex':0,'visibility':10,'ozone':320.84},{'time':1526295600,'summary':'Mostly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':61.15,'apparentTemperature':61.32,'dewPoint':58.97,'humidity':0.93,'pressure':1016.34,'windSpeed':3.23,'windGust':3.24,'windBearing':34,'cloudCover':0.77,'uvIndex':0,'visibility':10,'ozone':320.81},{'time':1526299200,'summary':'Mostly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':65.68,'apparentTemperature':66.3,'dewPoint':63.47,'humidity':0.93,'pressure':1015.49,'windSpeed':5.28,'windGust':6.97,'windBearing':1,'cloudCover':0.86,'uvIndex':1,'visibility':10,'ozone':320.86},{'time':1526302800,'summary':'Mostly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':64.57,'apparentTemperature':64.88,'dewPoint':61.02,'humidity':0.88,'pressure':1016.96,'windSpeed':3.13,'windGust':3.14,'windBearing':74,'cloudCover':0.67,'uvIndex':1,'visibility':10,'ozone':320.88},{'time':1526306400,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0.0002,'precipProbability':0.01,'precipType':'rain','temperature':68.85,'apparentTemperature':69.28,'dewPoint':63.02,'humidity':0.82,'pressure':1016.9,'windSpeed':3.12,'windGust':3.12,'windBearing':120,'cloudCover':0.57,'uvIndex':3,'visibility':10,'ozone':320.94},{'time':1526310000,'summary':'Overcast','icon':'cloudy','precipIntensity':0,'precipProbability':0,'temperature':75.45,'apparentTemperature':76.23,'dewPoint':67,'humidity':0.75,'pressure':1015.57,'windSpeed':3.76,'windGust':3.86,'windBearing':334,'cloudCover':0.95,'uvIndex':4,'visibility':10,'ozone':321.01},{'time':1526313600,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0.0002,'precipProbability':0.01,'precipType':'rain','temperature':76.52,'apparentTemperature':77.16,'dewPoint':66,'humidity':0.7,'pressure':1016.72,'windSpeed':1.97,'windGust':3.07,'windBearing':197,'cloudCover':0.48,'uvIndex':7,'visibility':10,'ozone':321.12},{'time':1526317200,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0.0002,'precipProbability':0.01,'precipType':'rain','temperature':79.28,'apparentTemperature':81.5,'dewPoint':67,'humidity':0.66,'pressure':1016.57,'windSpeed':1.6,'windGust':3.41,'windBearing':222,'cloudCover':0.48,'uvIndex':8,'visibility':10,'ozone':321.28},{'time':1526320800,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':84.13,'apparentTemperature':88.3,'dewPoint':69.68,'humidity':0.62,'pressure':1014.76,'windSpeed':2.71,'windGust':4.48,'windBearing':238,'cloudCover':0.34,'uvIndex':8,'visibility':10,'ozone':321},{'time':1526324400,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':83.44,'apparentTemperature':86.5,'dewPoint':67.85,'humidity':0.6,'pressure':1015.54,'windSpeed':2.32,'windGust':5.1,'windBearing':204,'cloudCover':0.38,'uvIndex':6,'visibility':10,'ozone':319.93},{'time':1526328000,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':84.94,'apparentTemperature':88.1,'dewPoint':67.72,'humidity':0.56,'pressure':1014.64,'windSpeed':3.52,'windGust':6.45,'windBearing':190,'cloudCover':0.25,'uvIndex':4,'visibility':10,'ozone':318.39},{'time':1526331600,'summary':'Clear','icon':'clear-day','precipIntensity':0,'precipProbability':0,'temperature':88.08,'apparentTemperature':92.8,'dewPoint':69.42,'humidity':0.54,'pressure':1012.19,'windSpeed':5.54,'windGust':12.1,'windBearing':183,'cloudCover':0,'uvIndex':2,'visibility':10,'ozone':317.28},{'time':1526335200,'summary':'Clear','icon':'clear-day','precipIntensity':0,'precipProbability':0,'temperature':85.1,'apparentTemperature':88.24,'dewPoint':67.66,'humidity':0.56,'pressure':1013.9,'windSpeed':4.5,'windGust':7.85,'windBearing':161,'cloudCover':0.24,'uvIndex':1,'visibility':10,'ozone':317.14},{'time':1526338800,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':83.39,'apparentTemperature':86.41,'dewPoint':67.78,'humidity':0.59,'pressure':1014.04,'windSpeed':4.33,'windGust':7.9,'windBearing':158,'cloudCover':0.33,'uvIndex':0,'visibility':10,'ozone':317.46},{'time':1526342400,'summary':'Possible Light Rain','icon':'rain','precipIntensity':0.0293,'precipProbability':0.1,'precipType':'rain','temperature':83.25,'apparentTemperature':87.26,'dewPoint':69.74,'humidity':0.64,'pressure':1012.24,'windSpeed':6.03,'windGust':15.9,'windBearing':173,'cloudCover':0.73,'uvIndex':0,'visibility':10,'ozone':317.38},{'time':1526346000,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0002,'precipProbability':0.01,'precipType':'rain','temperature':78.6,'apparentTemperature':79.41,'dewPoint':67.63,'humidity':0.69,'pressure':1014.53,'windSpeed':4.38,'windGust':8.78,'windBearing':157,'cloudCover':0.47,'uvIndex':0,'visibility':10,'ozone':316.48},{'time':1526349600,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0011,'precipProbability':0.02,'precipType':'rain','temperature':75.61,'apparentTemperature':76.42,'dewPoint':67.32,'humidity':0.76,'pressure':1014.87,'windSpeed':4.63,'windGust':9.63,'windBearing':159,'cloudCover':0.51,'uvIndex':0,'visibility':10,'ozone':315.25},{'time':1526353200,'summary':'Overcast','icon':'cloudy','precipIntensity':0.0119,'precipProbability':0.08,'precipType':'rain','temperature':72.53,'apparentTemperature':73.26,'dewPoint':66.12,'humidity':0.8,'pressure':1013.55,'windSpeed':4.74,'windGust':10.86,'windBearing':167,'cloudCover':1,'uvIndex':0,'visibility':10,'ozone':314.16},{'time':1526356800,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0012,'precipProbability':0.03,'precipType':'rain','temperature':71.31,'apparentTemperature':72.21,'dewPoint':67.1,'humidity':0.87,'pressure':1014.96,'windSpeed':4.15,'windGust':7.33,'windBearing':171,'cloudCover':0.49,'uvIndex':0,'visibility':10,'ozone':313.61},{'time':1526360400,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0.0003,'precipProbability':0.02,'precipType':'rain','temperature':70.29,'apparentTemperature':71.24,'dewPoint':67.17,'humidity':0.9,'pressure':1014.71,'windSpeed':3.72,'windGust':4.28,'windBearing':162,'cloudCover':0.42,'uvIndex':0,'visibility':10,'ozone':313.19},{'time':1526364000,'summary':'Overcast','icon':'cloudy','precipIntensity':0,'precipProbability':0,'temperature':70.63,'apparentTemperature':71.56,'dewPoint':67.07,'humidity':0.89,'pressure':1013.82,'windSpeed':3.39,'windGust':9.28,'windBearing':205,'cloudCover':0.95,'uvIndex':0,'visibility':10,'ozone':312.74},{'time':1526367600,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0,'precipProbability':0,'temperature':69.79,'apparentTemperature':70.68,'dewPoint':66.58,'humidity':0.9,'pressure':1014.57,'windSpeed':3.76,'windGust':5.17,'windBearing':166,'cloudCover':0.31,'uvIndex':0,'visibility':10,'ozone':312.11},{'time':1526371200,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0,'precipProbability':0,'temperature':69.73,'apparentTemperature':70.52,'dewPoint':65.89,'humidity':0.88,'pressure':1014.66,'windSpeed':4.58,'windGust':8.83,'windBearing':158,'cloudCover':0.27,'uvIndex':0,'visibility':10,'ozone':311.63},{'time':1526374800,'summary':'Clear','icon':'clear-night','precipIntensity':0.0008,'precipProbability':0.02,'precipType':'rain','temperature':70.18,'apparentTemperature':70.98,'dewPoint':66.09,'humidity':0.87,'pressure':1013.94,'windSpeed':4.57,'windGust':4.66,'windBearing':205,'cloudCover':0.21,'uvIndex':0,'visibility':10,'ozone':311.41},{'time':1526378400,'summary':'Partly Cloudy','icon':'partly-cloudy-night','precipIntensity':0,'precipProbability':0,'temperature':70.09,'apparentTemperature':70.78,'dewPoint':65.22,'humidity':0.85,'pressure':1015.03,'windSpeed':5.87,'windGust':14.74,'windBearing':200,'cloudCover':0.26,'uvIndex':0,'visibility':10,'ozone':311.87},{'time':1526382000,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':70.48,'apparentTemperature':71.16,'dewPoint':65.25,'humidity':0.84,'pressure':1015.26,'windSpeed':6.25,'windGust':16.95,'windBearing':204,'cloudCover':0.31,'uvIndex':0,'visibility':10,'ozone':312.68},{'time':1526385600,'summary':'Mostly Cloudy','icon':'partly-cloudy-day','precipIntensity':0.0004,'precipProbability':0.02,'precipType':'rain','temperature':70.61,'apparentTemperature':71.44,'dewPoint':66.4,'humidity':0.87,'pressure':1014.76,'windSpeed':5.54,'windGust':5.54,'windBearing':187,'cloudCover':0.8,'uvIndex':1,'visibility':10,'ozone':313.25},{'time':1526389200,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':74.44,'apparentTemperature':75.21,'dewPoint':66.75,'humidity':0.77,'pressure':1015.42,'windSpeed':7.1,'windGust':17.54,'windBearing':212,'cloudCover':0.41,'uvIndex':2,'visibility':10,'ozone':313.13},{'time':1526392800,'summary':'Partly Cloudy','icon':'partly-cloudy-day','precipIntensity':0,'precipProbability':0,'temperature':78.53,'apparentTemperature':79.41,'dewPoint':68.2,'humidity':0.71,'pressure':1015.36,'windSpeed':7.62,'windGust':15.91,'windBearing':216,'cloudCover':0.45,'uvIndex':3,'visibility':10,'ozone':312.78}]},'daily':{'summary':'Light rain throughout the week, with high temperatures falling to 78°F on Saturday.','icon':'rain','data':[{'time':1526184000,'summary':'Rain in the evening.','icon':'rain','sunriseTime':1526205800,'sunsetTime':1526256696,'moonPhase':0.93,'precipIntensity':0.0109,'precipIntensityMax':0.0723,'precipIntensityMaxTime':1526252400,'precipProbability':0.51,'precipType':'rain','temperatureHigh':87.5,'temperatureHighTime':1526234400,'temperatureLow':61.15,'temperatureLowTime':1526295600,'apparentTemperatureHigh':89.81,'apparentTemperatureHighTime':1526234400,'apparentTemperatureLow':61.32,'apparentTemperatureLowTime':1526295600,'dewPoint':66.09,'humidity':0.72,'pressure':1015.72,'windSpeed':1.22,'windGust':13.38,'windGustTime':1526245200,'windBearing':95,'cloudCover':0.32,'uvIndex':10,'uvIndexTime':1526230800,'visibility':9.62,'ozone':323.06,'temperatureMin':67.53,'temperatureMinTime':1526209200,'temperatureMax':87.5,'temperatureMaxTime':1526234400,'apparentTemperatureMin':68.26,'apparentTemperatureMinTime':1526209200,'apparentTemperatureMax':89.81,'apparentTemperatureMaxTime':1526234400},{'time':1526270400,'summary':'Partly cloudy throughout the day.','icon':'partly-cloudy-day','sunriseTime':1526292149,'sunsetTime':1526343149,'moonPhase':0.97,'precipIntensity':0.002,'precipIntensityMax':0.0293,'precipIntensityMaxTime':1526342400,'precipProbability':0.2,'precipType':'rain','temperatureHigh':88.08,'temperatureHighTime':1526331600,'temperatureLow':69.73,'temperatureLowTime':1526371200,'apparentTemperatureHigh':92.8,'apparentTemperatureHighTime':1526331600,'apparentTemperatureLow':70.52,'apparentTemperatureLowTime':1526371200,'dewPoint':64.81,'humidity':0.77,'pressure':1014.96,'windSpeed':1.72,'windGust':15.9,'windGustTime':1526342400,'windBearing':115,'cloudCover':0.56,'uvIndex':8,'uvIndexTime':1526317200,'visibility':10,'ozone':319.45,'temperatureMin':61.15,'temperatureMinTime':1526295600,'temperatureMax':88.08,'temperatureMaxTime':1526331600,'apparentTemperatureMin':61.32,'apparentTemperatureMinTime':1526295600,'apparentTemperatureMax':92.8,'apparentTemperatureMaxTime':1526331600},{'time':1526356800,'summary':'Mostly cloudy throughout the day.','icon':'partly-cloudy-day','sunriseTime':1526378499,'sunsetTime':1526429602,'moonPhase':0.01,'precipIntensity':0.0009,'precipIntensityMax':0.0139,'precipIntensityMaxTime':1526407200,'precipProbability':0.09,'precipType':'rain','temperatureHigh':87.18,'temperatureHighTime':1526414400,'temperatureLow':68.85,'temperatureLowTime':1526464800,'apparentTemperatureHigh':91.35,'apparentTemperatureHighTime':1526410800,'apparentTemperatureLow':69.59,'apparentTemperatureLowTime':1526464800,'dewPoint':67.01,'humidity':0.7,'pressure':1013.97,'windSpeed':7.9,'windGust':30.89,'windGustTime':1526439600,'windBearing':208,'cloudCover':0.54,'uvIndex':9,'uvIndexTime':1526403600,'visibility':10,'ozone':310.72,'temperatureMin':69.73,'temperatureMinTime':1526371200,'temperatureMax':87.18,'temperatureMaxTime':1526414400,'apparentTemperatureMin':70.52,'apparentTemperatureMinTime':1526371200,'apparentTemperatureMax':91.35,'apparentTemperatureMaxTime':1526410800},{'time':1526443200,'summary':'Overcast throughout the day.','icon':'cloudy','sunriseTime':1526464851,'sunsetTime':1526516054,'moonPhase':0.04,'precipIntensity':0.0021,'precipIntensityMax':0.0165,'precipIntensityMaxTime':1526482800,'precipProbability':0.14,'precipType':'rain','temperatureHigh':84.03,'temperatureHighTime':1526504400,'temperatureLow':68.62,'temperatureLowTime':1526547600,'apparentTemperatureHigh':89.14,'apparentTemperatureHighTime':1526500800,'apparentTemperatureLow':69.88,'apparentTemperatureLowTime':1526547600,'dewPoint':67.76,'humidity':0.77,'pressure':1015.17,'windSpeed':8,'windGust':29.55,'windGustTime':1526450400,'windBearing':212,'cloudCover':0.98,'uvIndex':6,'uvIndexTime':1526490000,'ozone':310.66,'temperatureMin':68.85,'temperatureMinTime':1526464800,'temperatureMax':84.03,'temperatureMaxTime':1526504400,'apparentTemperatureMin':69.59,'apparentTemperatureMinTime':1526464800,'apparentTemperatureMax':89.14,'apparentTemperatureMaxTime':1526500800},{'time':1526529600,'summary':'Overcast starting in the evening.','icon':'cloudy','sunriseTime':1526551204,'sunsetTime':1526602505,'moonPhase':0.08,'precipIntensity':0.0008,'precipIntensityMax':0.0046,'precipIntensityMaxTime':1526612400,'precipProbability':0.09,'precipType':'rain','temperatureHigh':80.49,'temperatureHighTime':1526580000,'temperatureLow':72.43,'temperatureLowTime':1526634000,'apparentTemperatureHigh':83.74,'apparentTemperatureHighTime':1526580000,'apparentTemperatureLow':73.43,'apparentTemperatureLowTime':1526634000,'dewPoint':69.17,'humidity':0.81,'pressure':1014.67,'windSpeed':9.08,'windGust':22.8,'windGustTime':1526529600,'windBearing':199,'cloudCover':1,'uvIndex':6,'uvIndexTime':1526576400,'ozone':319.91,'temperatureMin':68.62,'temperatureMinTime':1526547600,'temperatureMax':80.49,'temperatureMaxTime':1526580000,'apparentTemperatureMin':69.88,'apparentTemperatureMinTime':1526547600,'apparentTemperatureMax':83.74,'apparentTemperatureMaxTime':1526580000},{'time':1526616000,'summary':'Rain overnight.','icon':'rain','sunriseTime':1526637559,'sunsetTime':1526688957,'moonPhase':0.12,'precipIntensity':0.0078,'precipIntensityMax':0.0374,'precipIntensityMaxTime':1526691600,'precipProbability':0.39,'precipType':'rain','temperatureHigh':81.68,'temperatureHighTime':1526670000,'temperatureLow':63.86,'temperatureLowTime':1526720400,'apparentTemperatureHigh':84.22,'apparentTemperatureHighTime':1526666400,'apparentTemperatureLow':64.63,'apparentTemperatureLowTime':1526720400,'dewPoint':67.39,'humidity':0.77,'pressure':1015.93,'windSpeed':7.19,'windGust':28.07,'windGustTime':1526698800,'windBearing':204,'cloudCover':1,'uvIndex':6,'uvIndexTime':1526662800,'ozone':316.31,'temperatureMin':68.39,'temperatureMinTime':1526698800,'temperatureMax':81.68,'temperatureMaxTime':1526670000,'apparentTemperatureMin':69.55,'apparentTemperatureMinTime':1526698800,'apparentTemperatureMax':84.22,'apparentTemperatureMaxTime':1526666400},{'time':1526702400,'summary':'Rain in the morning and afternoon.','icon':'rain','sunriseTime':1526723916,'sunsetTime':1526775407,'moonPhase':0.15,'precipIntensity':0.0305,'precipIntensityMax':0.0983,'precipIntensityMaxTime':1526709600,'precipProbability':0.8,'precipType':'rain','temperatureHigh':78.28,'temperatureHighTime':1526760000,'temperatureLow':69.67,'temperatureLowTime':1526803200,'apparentTemperatureHigh':79.6,'apparentTemperatureHighTime':1526760000,'apparentTemperatureLow':71.04,'apparentTemperatureLowTime':1526803200,'dewPoint':68.87,'humidity':0.93,'pressure':1015.69,'windSpeed':4.93,'windGust':28.48,'windGustTime':1526702400,'windBearing':184,'cloudCover':0.96,'uvIndex':7,'uvIndexTime':1526749200,'ozone':306.62,'temperatureMin':63.86,'temperatureMinTime':1526720400,'temperatureMax':78.28,'temperatureMaxTime':1526760000,'apparentTemperatureMin':64.63,'apparentTemperatureMinTime':1526720400,'apparentTemperatureMax':79.6,'apparentTemperatureMaxTime':1526760000},{'time':1526788800,'summary':'Overcast throughout the day.','icon':'cloudy','sunriseTime':1526810273,'sunsetTime':1526861857,'moonPhase':0.19,'precipIntensity':0.0045,'precipIntensityMax':0.0363,'precipIntensityMaxTime':1526871600,'precipProbability':0.16,'precipType':'rain','temperatureHigh':80.74,'temperatureHighTime':1526842800,'temperatureLow':66.28,'temperatureLowTime':1526875200,'apparentTemperatureHigh':84.65,'apparentTemperatureHighTime':1526842800,'apparentTemperatureLow':67.31,'apparentTemperatureLowTime':1526875200,'dewPoint':70.61,'humidity':0.9,'pressure':1014.12,'windSpeed':10.09,'windGust':27.5,'windGustTime':1526788800,'windBearing':216,'cloudCover':1,'uvIndex':6,'uvIndexTime':1526832000,'ozone':297.57,'temperatureMin':67.41,'temperatureMinTime':1526871600,'temperatureMax':80.74,'temperatureMaxTime':1526842800,'apparentTemperatureMin':68.56,'apparentTemperatureMinTime':1526871600,'apparentTemperatureMax':84.65,'apparentTemperatureMaxTime':1526842800}]},'flags':{'sources':['isd','nearest-precip','nwspa','cmc','gfs','hrrr','madis','nam','sref','darksky'],'isd-stations':['692304-99999','720285-03734','720498-99999','720501-99999','723084-99999','723114-03715','724010-13740','724014-93714','724014-99999','724015-99999','724029-93775','997994-99999','998017-99999','999999-13726','999999-13740','999999-13780'],'units':'us'},'offset':-4})

  // return request({
  //   uri: `https://api.darksky.net/forecast/${process.env.DARKSKY_API_TOKEN}/${req.user.FireDepartment.latitude},${req.user.FireDepartment.longitude}`,
  //   qs: {
  //     exclude: 'minutely'
  //   },
  //   json: true
  // }).then(results => res.json(results));
}
