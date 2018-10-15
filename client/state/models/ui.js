import { types, flow } from 'mobx-state-tree';

import { FirecaresLookup } from '@statengine/shiftly';

export const UI = types.model({
  timeFilters: types.frozen(),
  selectedFilters: types.frozen(),
})
.actions(self => {
  const buildFilters = flow(function*(fireDepartment) {
    const ShiftConfiguration = FirecaresLookup[fireDepartment.firecares_id];
    const shiftly = new ShiftConfiguration();

    const now = new moment.tz(fireDepartment.timezone);
    const quickFilters = {};

    const shiftStart = new moment(now).subtract(1, 'day');
    shiftStart.set('hour', shiftly.shiftStart.substring(0, 2));
    shiftStart.set('minutes', shiftly.shiftStart.substring(2, 4));
    shiftStart.set('seconds', 0);
    shiftStart.set('milliseconds', 0);
    const shiftEnd = new moment(shiftStart).add(1, 'day');
    quickFilters.shift = {
      start: shiftStart.format(),
      end: shiftEnd.format(),
    }

    const units = ['day', 'week', 'month', 'quarter', 'year'];

    _.forEach(units, unit => {
      const umStart = new moment(now).subtract(1, unit).startOf(unit);
      const umEnd = new moment(umStart).endOf(unit);

      quickFilters[unit] = {
        start: umStart.format(),
        end: umEnd.format()
      };
    })

    const timeFilters = [];
    _.forOwn(quickFilters, (filter, key) => timeFilters.push({ displayName: 'Last ' + key, filter }));
    self.timeFilters = timeFilters;
  });

  const setFilters = (id) => {
    if (!self.selectedFilters) {
      self.selectedFilters = {
        timeFilter: self.timeFilters[0]
      }
    }
  }

  return {
    buildFilters,
    setFilters,
  };
})
.views(self => ({
  get selectedFilters() {
    return self.selectedFilters
  },
}))
