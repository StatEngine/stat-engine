'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './tweet.controller';

const router = new Router();

router.get('/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.belongsToFireDepartment,
  controller.search);


router.put('/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.belongsToFireDepartment,
  bodyParser.json(),
  controller.update);

router.delete('/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  auth.belongsToFireDepartment,
  controller.destroy);

module.exports = router;
