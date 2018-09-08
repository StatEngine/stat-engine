import { types, flow } from 'mobx-state-tree';

import axios from 'axios'

export const Unit = types.model({
  unitId: types.identifier,
  station: ''
})

export const UnitList = types.model({
  units: types.optional(types.array(Unit), []),
  selectedUnit: types.maybe(types.reference(Unit)),
})
.actions(self => {
  const fetchUnits = flow(function*() {
        // <- note the star, this a generator function!
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

  return { fetchUnits };

  /*const selectUnit(unitId) {
    console.dir("in store selectign " + unitId)
    self.selectedUnit = unitId;
  }*/
})
.views(self => ({
  get allUnits() {
    return self.units
  },
//  get numOfUnits() {
//    return self.units.length
  //},
}))
