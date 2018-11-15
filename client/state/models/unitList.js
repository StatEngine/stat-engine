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
  responses: types.frozen(),
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

    const select = id => {
      self.selected = id;
    };

    const fetchSelectedResponses = flow(function*(id, qs) {
      self.state = 'pending';
      try {
        const metrics = yield axios.get(`/api/units/${id}/responses`, { params: qs });
        self.responses = metrics.data.responses;

        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch unit stats', error);
        self.state = 'error';
      }
      return true;
    });

    const fetchSelectedMetrics = flow(function*(id, qs) {
      self.state = 'pending';
      try {
        const metrics = yield axios.get(`/api/units/${id}/metrics`, { params: qs });
        self.currentMetrics = metrics.data;

        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch unit stats', error);
        self.state = 'error';
      }
      return true;
    });

    const fetchSelectedPreviousMetrics = flow(function*(id, qs) {
      self.state = 'pending';
      try {
        const pqs = _.clone(qs);
        const duration = moment.duration(moment(pqs.timeEnd).diff(moment(pqs.timeStart)));
        pqs.timeEnd = pqs.timeStart;
        pqs.timeStart = moment.parseZone(pqs.timeEnd).subtract(duration.asMilliseconds(), 'milliseconds')
          .format();

        const previousMetrics = yield axios.get(`/api/units/${id}/metrics`, { params: pqs });
        self.previousMetrics = previousMetrics.data;

        self.state = 'done';
      } catch(error) {
        console.error('Failed to fetch unit stats', error);
        self.state = 'error';
      }
      return true;
    });

    const fetchSelectedTotalMetrics = flow(function*(id, qs) {
      self.state = 'pending';
      try {
        const totalMetrics = yield axios.get(`/api/units/${id}/metrics/total`, { params: qs });
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
      fetchSelectedResponses,
      fetchSelectedTotalMetrics,
      fetchSelectedPreviousMetrics,
      fetchSelectedMetrics,
      select
    };
  })
  .views(self => ({
    get allUnits() {
      return self.units;
    },
  }));
