import { FixtureTemplate } from '../../sqldb';

export async function getDashboards(req, res) {
  const fixtureTemplates = await FixtureTemplate.findAll({
    where: { type: 'dashboard' },
  });

  const dashboards = [];
  for (const fixtureTemplate of fixtureTemplates) {
    const kibanaTemplateDashboard = fixtureTemplate.kibana_template._source.dashboard;
    dashboards.push({
      _id: fixtureTemplate._id,
      htmlId: fixtureTemplate._id.replace(/:/g, '-'),
      title: kibanaTemplateDashboard.title,
      description: kibanaTemplateDashboard.description || '- No Description -',
      author: kibanaTemplateDashboard.author || 'StatEngine',
    });
  }

  res.json(dashboards);
}
