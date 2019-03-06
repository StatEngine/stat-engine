import { types, flow } from 'mobx-state-tree';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment-timezone';

export const Unit = types.model({
  id: types.identifier,
  incidentCount: types.number,
});

export const UnitList = types.model({
  units: types.optional(types.array(Unit), []),
  selected: types.maybe(types.reference(Unit)),
  currentMetrics: types.frozen(),
  previousMetrics: types.frozen(),
  totalMetrics: types.frozen(),
  responses: types.maybe(types.model({
    items: types.frozen(),
    totalItems: types.number,
  })),
})
  .actions(self => {
    const fetchUnits = flow(function*() {
      self.state = 'pending';
      try {
        const units = yield axios.get('/api/units');
        self.units = units.data;
        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch units', error);
        self.state = 'error';
      }
      return self.units.length;
    });

    const fetchResponses = flow(function*(id, query) {
      self.state = 'pending';
      try {
        const metrics = yield axios.get(`/api/units/${id}/responses`, { params: query });
        self.responses = {
          items: metrics.data.items,
          totalItems: metrics.data.totalItems,
        };

        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch unit stats', error);
        self.state = 'error';
      }
      return true;
    });

    const fetchMetrics = flow(function*(id, query) {
      self.state = 'pending';
      try {
        const metrics = yield axios.get(`/api/units/${id}/metrics`, { params: query });
        self.currentMetrics = metrics.data;

        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch unit stats', error);
        self.state = 'error';
      }
      return true;
    });

    const fetchPreviousMetrics = flow(function*(id, query) {
      self.state = 'pending';
      try {
        const queryCopy = _.clone(query);
        const duration = moment.duration(moment(queryCopy.timeEnd).diff(moment(queryCopy.timeStart)));
        queryCopy.timeEnd = queryCopy.timeStart;
        queryCopy.timeStart = moment.parseZone(queryCopy.timeEnd).subtract(duration.asMilliseconds(), 'milliseconds')
          .format();

        const previousMetrics = yield axios.get(`/api/units/${id}/metrics`, { params: queryCopy });
        self.previousMetrics = previousMetrics.data;

        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch unit stats', error);
        self.state = 'error';
      }
      return true;
    });

    const fetchTotalMetrics = flow(function*(id, query) {
      self.state = 'pending';
      try {
        const totalMetrics = yield axios.get(`/api/units/${id}/metrics/total`, { params: query });
        self.totalMetrics = totalMetrics.data;

        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch unit stats', error);
        self.state = 'error';
      }
      return true;
    });


    return {
      fetchUnits,
      fetchResponses,
      fetchTotalMetrics,
      fetchPreviousMetrics,
      fetchMetrics,
    };
  })
  .views(self => ({
    get allUnits() {
      return self.units;
    },
  }));
