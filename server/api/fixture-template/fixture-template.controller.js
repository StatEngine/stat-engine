
// import request from 'request-promise';

import { FixtureTemplate } from '../../sqldb';

export async function getDashboards(req, res) {
  const dashboards = await FixtureTemplate.findAll({
    where: { type: 'dashboard' },
  });

  // const response = await request.get('http://localhost:3000/_plugin/kibana/api/saved_objects/_find?type=index-pattern&search_fields=title&search=*');
  // console.log(response);

  res.json(dashboards);
}
