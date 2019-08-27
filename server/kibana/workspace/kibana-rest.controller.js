import kibanaApi from '../kibana-api';

// sample call to kibana rest api
export async function testApiCall(req, res) {
  const exampleResponse = await kibanaApi.get({
    uri: `/api/saved_objects/_find?type=index-pattern&search_fields=title&search=*`,
  });

  console.dir(exampleResponse);

  res.json(exampleResponse);
}
