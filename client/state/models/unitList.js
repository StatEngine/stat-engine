import { types, flow } from 'mobx-state-tree';

import axios from 'axios'

export const Unit = types.model({
  id: types.identifier,
  incidentCount: types.number,
})

export const UnitList = types.model({
  units: types.optional(types.array(Unit), []),
  selected: types.maybe(types.reference(Unit)),
  selectedStats: types.frozen(),
})
.actions(self => {
  const fetchUnits = flow(function*() {
    self.state = "pending"
   try {
        const units = yield axios.get('/api/units');
        self.units = units.data;
        self.state = "done"
    } catch (error) {
        // ... including try/catch error handling
        console.error("Failed to fetch projects", error)
        self.state = "error"
    }
    // The action will return a promise that resolves to the returned value
    // (or rejects with anything thrown from the action)
    return self.units.length
  });

  const select = (id) => {
    self.selected = id;
  }

  const fetchStats = flow(function*(id) {
    self.state = "pending"
    console.dir('fetching stats for :' + id);
    try {
        const stats = yield axios.get('/api/units/stats');
        self.selectedStats = stats.data;
        self.state = "done"
    } catch (error) {
        // ... including try/catch error handling
        console.error("Failed to fetch projects", error)
        self.state = "error"
    }
    // The action will return a promise that resolves to the returned value
    // (or rejects with anything thrown from the action)
    return self.selectedStats
  });

  return {
    fetchUnits,
    fetchStats,
    select
  };
})
.views(self => ({
  get allUnits() {
    return self.units
  },
}))
