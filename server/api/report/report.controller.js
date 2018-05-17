import async from 'async';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import request from 'request-promise';

import { Report, User } from '../../sqldb';

import connection from '../../elasticsearch/connection';

import config from '../../config/environment';

export function search(req, res) {
  Report.findAll({
    where: {
      fire_department__id: req.user.FireDepartment._id
    },
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
      attributes: ['first_name', 'last_name', 'role' ]
    }],
  }).then(report => {
    if (report) return res.json(report);
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
  }

  return Report.upsert(motd).then((message) => {
    return res.json(message);
  });
}
