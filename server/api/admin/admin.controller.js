'use strict';

import * as fixtures from '../../fixtures';

export async function addFixtureTemplatesToDatabase(req, res) {
  await fixtures.addFixtureTemplatesToDatabase();

  res.status(204).send();
}
