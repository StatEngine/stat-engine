import _ from 'lodash';
import async from 'async';

import connection from '../../elasticsearch/connection';

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
    return tweet;
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
    return tweet;
  }
}];

export function runAllQueries(options, cb) {
  async.map(QUERIES, (query, done) => runQuery(query, options, done), (err, results) => {
    if(err) return cb(err);
    return cb(null, _.filter(results, result => !_.isNil(result)));
  });
}

export function runQuery(query, options, cb) {
  const params = _.merge({
    index: options.index
  }, query.payload);

  const client = connection.getClient();

  return client[query.method](params)
    .then(res => query.parser(res, options))
    .then(parsed => cb(null, parsed))
    .catch(err => {
      console.error(err);
      cb(err);
    });
}
