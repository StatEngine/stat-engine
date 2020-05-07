import bodybuilder from 'bodybuilder';
import _ from 'lodash';

import connection from '../../elasticsearch/connection';

export async function search(req, res) {
    const { query } = req.query;
    
    if (!query) {
      return res.json([]);
    }
  
    const index = req.fireDepartment.es_indices['fire-incident'];
    const searchBody = bodybuilder()
      .size(0)
      .aggregation('terms', 'description.resources.personnel.dispatched', { size: 10000 })
      .build();
  
    const esRes = await connection.getClient().search({
      index,
      body: searchBody,
    });
  
    const buckets = _.get(esRes, 'aggregations["agg_terms_description.resources.personnel.dispatched"].buckets');
    const personel = buckets
      .map(bucket => bucket.key)
      .filter(key => {
        const lowercaseKey = key.toLowerCase();
        const lowercaseQuery = query.toLowerCase();
        return lowercaseKey.startsWith(lowercaseQuery);
      });
      
    return res.json(personel);
  };