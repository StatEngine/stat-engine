import { types, flow } from 'mobx-state-tree';
import moment from 'moment-timezone';
import { FirecaresLookup } from '@statengine/shiftly';
import _ from 'lodash';

export const UI = types.model({
  timeFilters: types.frozen(),
  selectedFilters: types.frozen(),
})
  .actions(self => {
    // eslint-disable-next-line require-yield
    const buildFilters = flow(function*(fireDepartment) {
      const ShiftConfiguration = FirecaresLookup[fireDepartment.firecares_id];
      const shiftly = new ShiftConfiguration();

      const now = new moment.tz(fireDepartment.timezone);
      const quickFilters = {};

      const shiftTimeframe = shiftly.shiftTimeFrame(new moment.tz(fireDepartment.timezone).subtract(1, 'day').format());

      quickFilters.shift = {
        start: shiftTimeframe.start,
        end: shiftTimeframe.end,
        interval: 'day',
        subInterval: 'hour',
      };

      const intervals = [{
        interval: 'day',
        subInterval: 'hour',
      }, {
        interval: 'week',
        subInterval: 'day',
      }, {
        interval: 'month',
        subInterval: 'day',
      }, {
        interval: 'quarter',
        subInterval: 'week',
      }, {
        interval: 'year',
        subInterval: 'month'
      }];

      _.forEach(intervals, i => {
        const umStart = new moment(now).subtract(1, i.interval)
          .startOf(i.interval);
        const umEnd = new moment(umStart).endOf(i.interval);

        quickFilters[i.interval] = {
          start: umStart.format(),
          end: umEnd.format(),
          interval: i.interval,
          subInterval: i.subInterval
        };
      });

      const timeFilters = [];
      _.forOwn(quickFilters, (filter, key) => timeFilters.push({ id: key, displayName: `Last ${key}`, filter }));
      self.timeFilters = timeFilters;
    });

    const setTimeFilter = id => {
      let filter = _.find(self.timeFilters, tf => tf.id === id);
      if(!filter) filter = self.timeFilters[0];
      self.selectedFilters = {
        timeFilter: filter
      };
    };

    return {
      buildFilters,
      setTimeFilter,
    };
  });

export default UI;
