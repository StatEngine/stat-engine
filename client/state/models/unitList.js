import { types, flow } from 'mobx-state-tree';

import axios from 'axios'

export const Unit = types.model({
  id: types.identifier,
  incidentCount: types.number,
})

export const UnitList = types.model({
  units: types.optional(types.array(Unit), []),
  selected: types.maybe(types.reference(Unit)),
  currentTotalStats: types.frozen(),
  currentGranularStats: types.frozen(),
  previousStats: types.frozen(),
  totalStats: types.frozen(),
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

  const fetchCurrentStats = flow(function*(id, qs) {
    self.state = "pending"
    try {
      let params = qs;
      params.granularity = 'TOTAL';
      const stats = yield axios.get(`/api/units/${id}/stats`, {
        params
      });
      self.currentTotalStats = stats.data;

      params.granularity = 'DAY';
      console.dir(params)
      const granularStats = yield axios.get(`/api/units/${id}/stats`, {
        params
      });
      self.currentGranularStats = granularStats.data;

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
    fetchCurrentStats,
    //fetchPreviousStats,
    select
  };
})
.views(self => ({
  get allUnits() {
    return self.units
  },
}))
