import {
  formData,
  queryIncidents,
  iterateIncidents,
  calculatePercentiles,
  findCurrentConfig,
} from './effective-response-force.controller';
import 'chai/register-should';



describe('mvp', () => {
  const req = {
    query: {
      type: '400',
    },
    user: {
      FireDepartment: {
        get: () => { return { firecares_id: '79592', es_indices: { 'fire-incident': '79592-fl-delray_beach_fire-rescue_department-fire-incident*'} } }
      }
    }
  };

  it('form data', (done) => {
    let res = {};
    formData(req, {
      json: (results) => {
        console.dir(results);
        done();
      }
    });
  }).timeout(0);

  it('should query', (done) => {
    let res = {};
    queryIncidents(req, res, () => {
      iterateIncidents(req, res, () => {
        calculatePercentiles(req, res, () => {

        })
        });
    });
  }).timeout(0);

  it.only('should query', (done) => {
    let res = {};
    findCurrentConfig(req, res, () => {
      console.dir(req)
    });
  }).timeout(0);
})