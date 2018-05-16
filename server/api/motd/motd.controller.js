import async from 'async';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import request from 'request-promise';
import moment from 'moment';

import { DailyMessage } from '../../sqldb';

import connection from '../../elasticsearch/connection';

import config from '../../config/environment';

export function get(req, res) {
  const year = req.params.year;
  const month = req.params.month;
  const day = req.params.day;

  console.dir(req.params)
  DailyMessage.findOne({
    where: {
      date: `${year}-${month}-${day}`,
      fire_department__id: req.user.FireDepartment._id
    },
  }).then(dailyMessage => res.json(dailyMessage));
}

export function create(req, res) {
  let date = moment();
  date.year(req.body.date.year);
  date.month(req.body.date.month-1);
  date.date(req.body.date.date);

  const motd = {
    date: date.format(),
    config: req.body,
    fire_department__id: req.user.FireDepartment._id,
  }

  return DailyMessage.build(motd).save().then((message) => {
    return res.json(message);
  });
}
