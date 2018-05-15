'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import * as auth from '../../auth/auth.service';
import * as controller from './motd.controller';

const router = new Router();

router.get(
  '/templates/weather',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getWeatherForecast
);

router.get(
  '/templates/safetyMessage',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getSafetyMessage
);

router.get(
  '/templates/incidentSummary',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.getIncidentSummary
);

router.get(
  '/:year/:month/:day',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.day
);

router.post(
  '/:year/:month/:day',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.configDay
);

module.exports = router;
