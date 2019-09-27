'use strict';

import { FixtureTemplate } from '../../sqldb';

export async function getDashboards(req, res) {
  const fixtureTemplates = await FixtureTemplate.findAll({
    where: { type: 'dashboard' },
  });

  res.json(fixtureTemplates);
}
