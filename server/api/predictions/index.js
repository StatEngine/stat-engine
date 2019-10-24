'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as controller from './predictions.controller';

import { asyncMiddleware } from '../../util/async-middleware';


const router = new Router();

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  asyncMiddleware(controller.getPrediction)
);

module.exports = router;
