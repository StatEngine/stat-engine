import _ from 'lodash';

import nodemailer from 'nodemailer';
import mandrillTransport from 'nodemailer-mandrill-transport';
import moment from 'moment-timezone';

import {
  FireDepartment,
  Report,
  ReportMetric,
  User,
} from '../../sqldb';

import config from '../../config/environment';
import { NotFoundError } from '../../util/error';

export async function search(req, res) {
  const reports = await Report.findAll({
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
  });

  res.send(reports);
}

export async function get(req, res) {
  const report = await Report.findOne({
    where: {
      name: req.params.name,
      type: req.params.type.toUpperCase(),
      fire_department__id: req.user.FireDepartment._id
    },
    include: [{
      model: User,
      attributes: ['first_name', 'last_name', 'role']
    }],
  });

  if(!report) {
    throw new NotFoundError('Report not found');
  }

  res.json(report);
}

export async function upsert(req, res) {
  const motd = {
    name: req.params.name,
    type: req.params.type.toUpperCase(),
    content: req.body,
    fire_department__id: req.user.FireDepartment._id,
    updated_by: req.user._id,
  };

  const message = await Report.upsert(motd);
  res.json(message);
}

export async function view(req, res) {
  const reportMetric = await ReportMetric.find({
    where: {
      report__id: req.report._id,
      user__id: req.user._id,
    }
  });

  if(!reportMetric) {
    const newReportMetric = ReportMetric.build({
      report__id: req.report._id,
      user__id: req.user._id,
      views: 1,
    });
    await newReportMetric.save();
  } else {
    await reportMetric.increment('views', { by: 1 });
  }

  res.status(204).send();
}

export async function getMetrics(req, res) {
  const reportMetrics = await ReportMetric.findAll({
    attributes: ['views', 'user__id'],
    where: {
      report__id: req.report._id,
    },
    include: [{
      model: User,
      attributes: ['first_name', 'last_name']
    }],
  });

  res.json({
    views: {
      uniqueUsers: reportMetrics.length,
      totalViews: _.sumBy(reportMetrics, rm => rm.views),
    },
    metrics: reportMetrics,
  });
}

export async function findReport(req, res, next) {
  const report = await Report.findOne({
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
  });

  if(!report) {
    throw new NotFoundError('Report not found');
  }

  req.report = report;
  return next();
}

export async function loadNofiticationDestinations(req, res, next) {
  const fd = await FireDepartment.find({
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
  });

  req.emails = [];
  fd.Users.forEach(u => req.emails.push(u.email));
  next();
}

export async function notify(req, res) {
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
    await mailTransport.sendMail(mailOptions);
    res.status(204).send();
  } else {
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
  }
}
