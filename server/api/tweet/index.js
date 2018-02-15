'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as controller from './tweet.controller';

import * as extensionConfiguration from '../extension-configuration/extension-configuration.service';

const router = new Router();

router.get(
  '/',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  controller.search
);

router.get(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  controller.get
);

router.put(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  bodyParser.json(),
  controller.update
);

router.delete(
  '/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  controller.destroy
);

module.exports = router;
