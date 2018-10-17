import { types, flow } from 'mobx-state-tree';

import axios from 'axios'

export const Unit = types.model({
  id: types.identifier,
  incidentCount: types.number,
})

export const UnitList = types.model({
  units: types.optional(types.array(Unit), []),
  selected: types.maybe(types.reference(Unit)),
  currentMetrics: types.frozen(),
  previousMetrics: types.frozen(),
  totalMetrics: types.frozen(),
  responses: types.frozen(),
})
.actions(self => {
  const fetchUnits = flow(function*() {
    self.state = "pending"
    try {
      const units = yield axios.get('/api/units');
      self.units = units.data;
      self.state = "done";
    } catch (error)   {
      console.error("Failed to fetch units", error)
      self.state = "error"
    }
    return self.units.length
  });

  const select = (id) => {
    self.selected = id;
  }

  const fetchSelectedResponses = flow(function*(id, qs) {
    self.state = "pending"
    try {
      let params = {};
      const metrics = yield axios.get(`/api/units/${id}/responses`, {
        params
      });
      self.responses = metrics.data.incidents;

      self.state = "done"
    } catch (error) {
      console.error("Failed to fetch unit stats", error)
      self.state = "error";
    }
    return true;
  });


  const fetchSelectedMetrics = flow(function*(id, qs) {
    self.state = "pending"
    try {
      // TODO
      //let params = {
        // This is a hack because we dont have an easy way of knowning unit station
      //  station_id: _.get(self.responses, "[0].apparatus_data.unit_id")
      //};
      console.dir(qs);
      const metrics = yield axios.get(`/api/units/${id}/metrics`, { params: qs });
      self.currentMetrics = metrics.data;

      const previousMetrics = yield axios.get(`/api/units/${id}/metrics`, { params: qs });
      self.previousMetrics = previousMetrics.data;

      const totalMetrics = yield axios.get(`/api/units/${id}/metrics/total`, { params: qs });
      self.totalMetrics = totalMetrics.data;

      self.state = "done"
    } catch (error) {
      console.error("Failed to fetch unit stats", error)
      self.state = "error";
    }
    return true;
  });

  return {
    fetchUnits,
    fetchSelectedResponses,
    fetchSelectedMetrics,
    select
  };
})
.views(self => ({
  get allUnits() {
    return self.units
  },
}))
