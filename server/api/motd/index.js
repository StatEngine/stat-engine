'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import * as auth from '../../auth/auth.service';
import * as controller from './motd.controller';

const router = new Router();

router.get(
  '/:year/:month/:day',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.day
);

router.post(
  '/:year/:month/:day',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  bodyParser.json(),
  controller.configDay
);

router.get(
  '/weather',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  controller.getWeather
);

module.exports = router;
