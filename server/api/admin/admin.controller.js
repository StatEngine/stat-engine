'use strict';

import * as fixtures from '../../fixtures';
import connection from '../../elasticsearch/connection';
import bodybuilder from 'bodybuilder';
import { InternalServerError } from '../../util/error';

export async function addFixtureTemplatesToDatabase(req, res) {
  await fixtures.addFixtureTemplatesToDatabase();

  res.status(204).send();
}

export async function getValidationHealth(req, res) {
  try {
    let body = bodybuilder()
    .size(10000)
    .filter('term', 'validation.valid', false)
    .build();

    const params = {
      index: req.user.FireDepartment.get().es_indices['fire-incident'],
      body
    };

    const searchResults = await connection.getClient().search(params);
    return res.json({
      items: searchResults.hits.hits,
      totalItems: searchResults.hits.total,
    });
  } catch (err) {
    console.error(err);
    throw new InternalServerError(err.message);
  }
}
