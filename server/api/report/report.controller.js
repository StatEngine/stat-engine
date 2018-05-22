import _ from 'lodash';

import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import moment from 'moment';

import {
  FireDepartment,
  Report,
  ReportMetric,
  User,
} from '../../sqldb';

import config from '../../config/environment';

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
    attributes: ['_id', 'updated_at', 'updated_by', 'name'],
    where: {
      name: req.params.name,
      type: req.params.type.toUpperCase(),
      fire_department__id: req.user.FireDepartment._id
    },
    include: [{
      model: User,
      attributes: ['first_name', 'last_name']
    }],
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

export function loadNofiticationDestinations(req, res, next) {
  return FireDepartment.find({
    where: {
      _id: req.user.FireDepartment._id
    },
    attributes: [
      '_id',
    ],
    include: [{
      model: User,
      attributes: ['first_name', 'last_name', 'email']
    }]
  })
    .then(fd => {
      req.emails = [];
      fd.Users.forEach(u => req.emails.push(u.email));
      next();
    })
    .catch(err => next(err));
}

export function notify(req, res) {
  if(config.mailSettings.mandrillAPIKey) {
    var mailOptions = {};
    mailOptions.from = config.mailSettings.serverEmail;
    mailOptions.to = req.emails.join(',');

    // Mailing service
    var mailTransport = nodemailer.createTransport(mandrillTransport({
      auth: {
        apiKey: config.mailSettings.mandrillAPIKey
      }
    }));

    mailOptions.mandrillOptions = {
      template_name: config.mailSettings.newReportTemplate,
      template_content: [],
      message: {
        merge: true,
        merge_language: 'handlebars',
        global_merge_vars: [{
          name: 'UpdatedBy',
          content: req.report.User.name,
        }, {
          name: 'ReportName',
          content: req.report.name,
        }, {
          name: 'UpdatedAt',
          content:
            moment(req.report.updated_at)
              .tz(req.user.FireDepartment.timezone)
              .format()
        }]
      }
    };
    mailTransport.sendMail(mailOptions)
      .then(() => res.status(204).send())
      .catch(() => res.status(500).send());
  } else {
    return new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  }
}
