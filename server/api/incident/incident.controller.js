import _ from 'lodash';
import moment from 'moment';
import bodybuilder from 'bodybuilder';

import connection from '../../elasticsearch/connection';
import { IncidentAnalysisTimeRange } from '../../lib/incidentAnalysisTimeRange';
import { calculateTimeRange } from '../../lib/timeRangeUtils';

import {
  generateTextualSummaries,
  generateAnalysis,
} from './incident.helpers';

import {
  getMatrix
} from './mapbox.helpers';
import { NotFoundError } from '../../util/error';

export async function getActiveIncidents(req, res) {
  req.esBody = bodybuilder()
    .size(100)
    .filter('term', 'description.suppressed', false)
    .filter('term', 'description.active', true)
    .filter('range', 'description.event_opened', { gte: 'now-24h' })
    .build();

  const searchResults = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: req.esBody,
  });

  let data = [];
  _.forEach(searchResults.hits.hits, h => {
    data.push(h._source);
  });

  res.json(data);
}

export async function getTopIncidents(req, res) {
  let fd = req.user.FireDepartment.get();
  const timeRange = calculateTimeRange({
    startDate: req.query.startDate
      || moment().tz(fd.timezone)
        .format(),
    endDate: req.query.endDate,
    timeUnit: req.query.timeUnit || 'shift',
    firecaresId: fd.firecares_id,
    previous: req.query.previous
  });

  let base = bodybuilder()
    .size(0)
    .filter('term', 'description.suppressed', false)
    .aggregation('terms', 'description.category', a => a.aggregation('top_hits', undefined, {
      size: 10,
      sort: [{ 'durations.total_event.minutes': { order: 'desc' }}]
    }));

  base.filter('range', 'description.event_opened', { gte: timeRange.start, lt: timeRange.end });

  req.esBody = base
    .build();

  const searchResults = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: req.esBody,
  });

  const top = {};

  if(_.get(searchResults, 'aggregations')) {
    _.forEach(searchResults.aggregations['agg_terms_description.category'].buckets, b => {
      top[b.key] = [];
      _.forEach(b.agg_top_hits_undefined.hits.hits, h => {
        let analysis = generateAnalysis(h._source);
        analysis = _.filter(analysis, a => a.category === 'NFPA');
        top[b.key].push({
          incident_number: _.get(h, '_source.description.incident_number'),
          event_duration: _.get(h, '_source.durations.total_event.minutes'),
          type: _.get(h, '._source.description.type'),
          analysis: _.keyBy(analysis, 'name')
        });
      });
    });
  }

  res.json(top);
}

export async function getSummary(req, res) {
  let Analysis = new IncidentAnalysisTimeRange({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    timeRange: {
      start: moment()
        .subtract(1, 'days')
        .format(),
      end: moment().format()
    },
  });

  const results = await Analysis.compare();
  res.json(results);
}

export async function getIncidents(req, res) {
  const sort = req.query.sort || 'description.event_closed,desc';
  const { fromDate, toDate } = req.query;

  const params = {
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    from: req.query.from || 0,
    size: req.query.count || 10,
    body: {
      _source: [
        'description.incident_number',
        'address.address_line1',
        'description.event_opened',
        'description.event_closed',
        'description.type',
        'description.units',
        'description.category',
        'durations.total_event.seconds'
      ],
      sort: sort.split('+')
        .map((sortItem) => {
          const parts = sortItem.split(',');
          return {
            [parts[0]]: { order: parts[1] },
          };
      }),
    }
  };

  if(req.query.search) {
    params.q = req.query.search;
  } else {
    params.body.query = {
      bool: {
        must: [{
          term: {
            'description.active': false,
          }
        }, {
          term: {
            'description.suppressed': false,
          }
        }],
      }
    };

    if (fromDate || toDate) {
      let dateFilter = {
        range: {
          'description.event_opened': {}
        },
      };
      
      if (fromDate) {
        dateFilter.range['description.event_opened'].gte = fromDate;
      }
      if (toDate) {
        dateFilter.range['description.event_opened'].lte = toDate;
      }
      params.body.query.bool.must.push(dateFilter);
    }    
  }

  const searchResults = await connection.getClient().search(params);

  res.json({
    items: searchResults.hits.hits,
    totalItems: searchResults.hits.total,
  });
}

export function getIncident(req, res) {
  res.json({
    incident: req.incident,
    textSummaries: generateTextualSummaries(_.merge(req.incident, { travelMatrix: req.travelMatrix })),
    analysis: generateAnalysis(_.merge(req.incident, { travelMatrix: req.travelMatrix })),
    travelMatrix: req.travelMatrix,
    comparison: req.incidentComparison,
    concurrent: req.concurrentIncidents,
  });
}

export async function loadMatrix(req, res, next) {
  const matrix = await getMatrix(req.incident);

  req.travelMatrix = matrix;
  next();
}

export async function loadConcurrent(req, res, next) {
  let eventOpened = _.get(req.incident, 'description.event_opened');
  let eventClosed = _.get(req.incident, 'description.event_closed');

  const response = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: {
      size: 100,
      _source: [
        'description.incident_number',
        'address.address_line1',
        'description.event_opened',
        'description.event_closed',
        'description.type',
        'description.units',
        'description.category',
        'address.battalion',
        'address.response_zone',
        'durations.total_event.seconds'],
      sort: [{
        'description.event_opened': {
          order: 'desc'
        }
      }],
      query: {
        constant_score: {
          filter: {
            bool: {
              must: [{
                term: {
                  'description.suppressed': false
                },
              }, {
                term: {
                  'description.active': false
                }
              }],
              must_not: [{
                term: {
                  'description.incident_number': req.incident.description.incident_number,
                }
              }],
              should: [{
                range: {
                  'description.event_opened': {
                    gte: eventOpened,
                    lte: eventClosed,
                  }
                },
              }, {
                range: {
                  'description.event_closed': {
                    gte: eventOpened,
                    lte: eventClosed,
                  }
                },
              }, {
                bool: {
                  filter: [{
                    term: {
                      'description.active': false
                    },
                  }, {
                    range: {
                      'description.event_opened': {
                        lte: eventOpened,
                      }
                    }
                  }, {
                    range: {
                      'description.event_closed': {
                        gte: eventClosed,
                      }
                    }
                  }]
                }
              }],
            },
          },
        },
      }
    }
  });

  req.concurrentIncidents = response.hits.hits;
  next();
}

export async function loadComparison(req, res, next) {
  let responseZone = _.get(req.incident, 'address.response_zone');
  let battalion = _.get(req.incident, 'address.battalion');
  let firstDue = _.get(req.incident, 'address.first_due');
  let addressLine1 = _.get(req.incident, 'address.address_line1');
  let census = _.get(req.incident, 'address.location.census.census_2010.tract');
  let councilDistrict = _.get(req.incident, 'address.location.council_district');
  let precinct = _.get(req.incident, 'address.location.precinct');
  let ward = _.get(req.incident, 'address.location.precinct_ward');
  let neighborhood = _.get(req.incident, 'address.location.neighborhood');

  const pulsePoint = !_.isEmpty(_.get(req.incident, 'description.extended_data.AgencyIncidentCallTypeDescription'));
  const incidentType = pulsePoint ? _.get(req.incident, 'description.extended_data.AgencyIncidentCallTypeDescription') : req.incident.description.type;
  const incidentTypeFilter = pulsePoint ? { term: {'description.extended_data.AgencyIncidentCallTypeDescription': incidentType }} : { term: {'description.type': incidentType }};

  const compValues = {};
  const aggs = [
    ['Response Zone', responseZone, { term: {'address.response_zone': responseZone }}],
    ['Battalion', battalion, { term: {'address.battalion': battalion }}],
    ['First Due', firstDue, { term: {'address.first_due': firstDue }}],
    ['Address', addressLine1, { term: {'address.address_line1': addressLine1 }}],
    ['Census', census, { term: {'address.location.census.census_2010.tract': census }}],
    ['Council District', councilDistrict, { term: {'address.location.council_district': councilDistrict }}],
    ['Incident Type', incidentType, incidentTypeFilter],
    ['Precinct', precinct, { term: {'address.location.precinct': precinct }}],
    ['Ward', ward, { term: {'address.location.precinct_ward': ward }}],
    ['Neighborhood', neighborhood, { term: {'address.location.neighborhood': neighborhood }}],
  ].filter(rule => !_.isNil(rule[1]))
    .reduce((acc, val) => {
      const [label, compValue, filter] = val;
      compValues[label] = compValue;
      acc[label] = {
        filter,
        aggs: {
          response_duration_percentile_rank: {
            percentiles: {
              field: 'durations.response.seconds',
              percents: [75, 90]
            }
          }
        }
      };
      return acc;
    }, {});

  const response = await connection.getClient().search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    size: 0,
    body: {
      query: {
        bool: {
          must: [{
            term: {
              'description.suppressed': false
            }
          }],
        },
      },
      aggs
    }
  });

  req.incidentComparison = response.aggregations;
  _.forOwn(req.incidentComparison, (value, label) => {
    req.incidentComparison[label].comparison_value = compValues[label];
  });
  next();
}

export async function loadIncident(req, res, next, id) {
  const client = connection.getClient();

  const searchResult = await client.search({
    index: req.user.FireDepartment.get().es_indices['fire-incident'],
    body: {
      query: {
        bool: {
          must: {
            term: {
              'description.incident_number': id,
            }
          }
        }
      }
    }
  });

  const hits = _.get(searchResult, 'hits.hits');

  if(!hits || hits.length === 0) throw new NotFoundError('Incident not found');

  req.incident = hits[0]._source;
  next();
}
