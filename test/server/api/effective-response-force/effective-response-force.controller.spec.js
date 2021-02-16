import { formData,
  queryIncidents,
  iterateIncidents,
  calculatePercentiles,
  findCurrentConfig } from '../../../../server/api/effective-response-force/effective-response-force.controller';
import 'chai/register-should';


describe('mvp', () => {
  const req = {
    query: { type: '400' },
    user: { FireDepartment: { get: () => { return { firecares_id: '79592', es_indices: { 'fire-incident': '79592-fl-delray_beach_fire-rescue_department-fire-incident*' } }; } } },
  };

  /**
   * Integration test - skip
   */
  xit('form data', done => {
    const res = {};
    formData(req, {
      json: results => {
        console.dir(results);
        done();
      },
    });
  }).timeout(0);

  /**
   * Integration test - skip
   */
  xit('should query', done => {
    const res = {};
    queryIncidents(req, res, () => {
      iterateIncidents(req, res, () => {
        calculatePercentiles(req, res, () => {

        });
      });
    });
  }).timeout(0);

  /**
   * Integration test - skip
   */
  xit('should query', done => {
    const res = {};
    findCurrentConfig(req, res, () => {
      console.dir(req);
    });
  }).timeout(0);
});
