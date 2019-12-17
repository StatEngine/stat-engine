import _ from 'lodash';
import async from 'async';

import connection from '../../elasticsearch/connection';
import { Log } from '../../util/log';

export const QUERIES = [{
  name: 'yesterdaysSummary',
  method: 'search',
  payload: {
    body: {
      size: 0,
      query: {
        bool: {
          must: [{
            term: {
              'description.suppressed': false
            }
          }],
          filter: {
            range: {
              'description.event_opened': {
                gte: 'now-1d/d',
                lt: 'now/d'
              }
            }
          }
        }
      },
      aggs: {
        category: { terms: { field: 'description.category' } }
      }
    },
  },
  parser: (res, options) => {
    if(!_.get(res, 'aggregations.category')) return undefined;

    const fireBucket = _.find(res.aggregations.category.buckets, b => b.key === 'FIRE');
    const emsBucket = _.find(res.aggregations.category.buckets, b => b.key === 'EMS');

    let tweet;
    if(fireBucket || emsBucket) {
      if(fireBucket && emsBucket) {
        tweet = `${options.name} responded to ${fireBucket.doc_count} fire & ${emsBucket.doc_count} EMS incidents`;
      } else if(fireBucket) {
        tweet = `${options.name} responded to ${fireBucket.doc_count} fire incidents`;
      } else if(emsBucket) {
        tweet = `${options.name} responded to ${emsBucket.doc_count} EMS incidents`;
      }
      tweet += ' yesterday';
    }
    return [{ status: tweet }];
  }
}, {
  name: 'weeklySummary',
  method: 'search',
  payload: {
    body: {
      size: 0,
      query: {
        bool: {
          must: [{
            term: {
              'description.suppressed': false
            }
          }],
          filter: {
            range: {
              'description.event_opened': {
                gte: 'now-7d/d',
                lt: 'now/d'
              }
            }
          }
        }
      },
      aggs: {
        category: { terms: { field: 'description.category' } }
      }
    },
  },
  parser: (res, options) => {
    if(!_.get(res, 'aggregations.category')) return undefined;

    const fireBucket = _.find(res.aggregations.category.buckets, b => b.key === 'FIRE');
    const emsBucket = _.find(res.aggregations.category.buckets, b => b.key === 'EMS');

    let tweet;
    if(fireBucket || emsBucket) {
      if(fireBucket && emsBucket) {
        tweet = `${options.name} responded to ${fireBucket.doc_count} fire & ${emsBucket.doc_count} EMS incidents`;
      } else if(fireBucket) {
        tweet = `${options.name} responded to ${fireBucket.doc_count} fire incidents`;
      } else if(emsBucket) {
        tweet = `${options.name} responded to ${emsBucket.doc_count} EMS incidents`;
      }
      tweet += ' last week';
    }
    return [{ status: tweet }];
  }
}, {
  name: 'recentIncidents',
  method: 'search',
  payload: {
    body: {
      size: 7,
      sort: [{
        'description.units': { order: 'desc' },
      }],
      query: {
        bool: {
          must: [{
            term: {
              'description.suppressed': false
            }
          }],
          filter: {
            range: {
              'description.event_opened': {
                gte: 'now-4h/h',
                lt: 'now/h'
              }
            }
          }
        }
      }
    },
  },
  parser: (res, options) => {
    let tweets = [];
    _.forEach(res.hits.hits, hit => {
      let tweet = `${options.name}`;

      let typeStr;
      let type = _.get(hit, '_source.description.category');
      let units = _.get(hit, '_source.description.units');

      if(type === 'FIRE') typeStr = 'a fire';
      else if(type === 'EMS') typeStr = 'an ems';
      else if(type === 'OTHER') type = undefined;
      let address = _.get(hit, '_source.address.common_place_name') || _.get(hit, '_source.address.address_line1');

      if(type && address) {
        if(_.get(hit, '_source.description.active')) {
          tweet += ` is currently responding to ${typeStr} incident`;
        } else {
          tweet += ` responded to ${typeStr} incident`;
        }

        if(units) {
          if(units.length > 1) tweet += ` with ${units.length} units`;
          else tweet += ' with 1 unit';
        }

        tweet += ` at ${address}`;

        tweets.push({ status: tweet, class: 'tweet-card-yellow' });
      }
    });

    return tweets;
  }
}];

export function runAllQueries(options, cb) {
  async.map(QUERIES, (query, done) => runQuery(query, options, done), (err, results) => {
    if(err) return cb(err);

    let flattendResults = _.flattenDeep(results);

    return cb(null, _.filter(flattendResults, result => !_.isEmpty(result)));
  });
}

export async function runQuery(query, options, cb) {
  const params = _.merge({
    index: options.index
  }, query.payload);

  const client = connection.getClient();

  try {
    const res = await client[query.method](params);
    const parsed = await query.parser(res, options);
    cb(null, parsed);
  } catch (err) {
    Log.error(err);
    cb(err);
  }
}
