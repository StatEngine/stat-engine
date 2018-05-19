import _ from 'lodash';

import {
  Report,
  ReportMetric,
  User,
} from '../../sqldb';

export function search(req, res) {
  Report.findAll({
    attributes: ['name', 'type', 'updated_by', 'updated_at'],
    where: {
      fire_department__id: req.user.FireDepartment._id
    },
    include: [{
      model: ReportMetric,
      attributes: ['views'],
    }, {
      model: User,
      attributes: ['first_name', 'last_name', 'role']
    }],
  }).then(reports => {
    res.send(reports);
  });
}

export function get(req, res) {
  Report.findOne({
    where: {
      name: req.params.name,
      type: req.params.type.toUpperCase(),
      fire_department__id: req.user.FireDepartment._id
    },
    include: [{
      model: User,
      attributes: ['first_name', 'last_name', 'role']
    }],
  }).then(report => {
    if(report) return res.json(report);
    else return res.status(404).send();
  });
}

export function upsert(req, res) {
  const motd = {
    name: req.params.name,
    type: req.params.type.toUpperCase(),
    content: req.body,
    fire_department__id: req.user.FireDepartment._id,
    updated_by: req.user._id,
  };

  return Report.upsert(motd).then(message => res.json(message));
}

export function view(req, res) {
  ReportMetric.find({
    where: {
      report__id: req.report._id,
      user__id: req.user._id,
    }
  }).then(reportMetric => {
    if(!reportMetric) {
      const newReportMetric = ReportMetric.build({
        report__id: req.report._id,
        user__id: req.user._id,
        views: 1,
      });
      return newReportMetric.save();
    } else {
      return reportMetric.increment('views', { by: 1 });
    }
  })
    .then(() => {
      res.status(204).send();
    })
    .catch(() => {
      res.status(500).send();
    });
}

export function getMetrics(req, res) {
  ReportMetric.findAll({
    attributes: ['views', 'user__id'],
    where: {
      report__id: req.report._id,
    },
    include: [{
      model: User,
      attributes: ['first_name', 'last_name']
    }],
  })
    .then(reportMetrics => {
      res.json({
        views: {
          uniqueUsers: reportMetrics.length,
          totalViews: _.sumBy(reportMetrics, rm => rm.views),
        },
        metrics: reportMetrics,
      });
    })
    .catch(() => {
      res.status(500).send();
    });
}

export function findReport(req, res, next) {
  Report.findOne({
    attributes: ['_id'],
    where: {
      name: req.params.name,
      type: req.params.type.toUpperCase(),
      fire_department__id: req.user.FireDepartment._id
    },
  })
    .then(report => {
      if(report) {
        req.report = report;
        return next();
      } else return res.status(404).send();
    })
    .catch(() => {
      res.status(500).send();
    });
}
