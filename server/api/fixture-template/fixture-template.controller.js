import { FixtureTemplate } from '../../sqldb';
import * as fixtures from '../../fixtures';

export async function getDashboards(req, res) {
  const fixtureTemplates = await FixtureTemplate.findAll({
    where: { type: 'dashboard' },
  });

  res.json(fixtureTemplates);
}

export async function addFixtureTemplatesToDatabase(req, res) {
  await fixtures.addFixtureTemplatesToDatabase();

  res.status(204).send();
}
