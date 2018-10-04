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
    } catch (error)   {
      console.error("Failed to fetch units", error)
      self.state = "error"
    }
    return self.units.length
  });

  const select = (id) => {
    self.selected = id;
  }

  const fetchStats = flow(function*(id) {
    self.state = "pending"
    try {
        const stats = yield axios.get('/api/units/stats');
        self.selectedStats = stats.data;
        self.state = "done"
    } catch (error) {
        console.error("Failed to fetch unit stats", error)
        self.state = "error"
    }
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
