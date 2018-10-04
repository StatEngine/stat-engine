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
  comparitiveMetrics: types.frozen(),
  allTimeMetrics: types.frozen(),
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

  const fetchMetrics = flow(function*(id, qs) {
    self.state = "pending"
    try {
      // TODO
      let params = {};
      const metrics = yield axios.get(`/api/units/${id}/metrics`, {
        params
      });
      self.currentMetrics = metrics.data;

      const comparitiveMetrics = yield axios.get(`/api/units/${id}/metrics`, {
        params
      });
      self.comparitiveMetrics = comparitiveMetrics.data;

      self.state = "done"
      console.dir('done fetching stats')
    } catch (error) {
      console.error("Failed to fetch unit stats", error)
      self.state = "error";
    }
    return true;
  });

  return {
    fetchUnits,
    fetchMetrics,
    select
  };
})
.views(self => ({
  get allUnits() {
    return self.units
  },
}))
