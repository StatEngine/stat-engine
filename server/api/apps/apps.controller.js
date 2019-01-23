import _ from 'lodash';
import config from '../../config/environment';

import {
  App,
} from '../../sqldb';

export function search(req, res) {
  return App.findAll({
    attributes: [
      '_id',
      'name',
      'slug',
      'description',
      'short_description',
      'features',
      'tags',
      'permissions',
      'featured',
      'hidden',
    ],
  })
    .then(apps => res.json(apps))
    .catch(e => {
      console.error(e);
      res.sendStatus(500);
    })
}
