'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as twitterAuth from './auth.controller';
import * as controller from './tweet.controller';

import * as extensionConfiguration from '../extension-configuration/extension-configuration.service';

const router = new Router();

// Twitter loging
router.get(
  '/account/login',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  twitterAuth.login
);

router.get(
  '/account/login/_callback',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  twitterAuth.loginCallback
);

router.get(
  '/account/profile',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  twitterAuth.profile
);

router.get(
  '/tweets',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  controller.search
);

router.get(
  '/tweets/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  controller.get
);

router.put(
  '/tweets/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  bodyParser.json(),
  controller.update
);

router.delete(
  '/tweets/:id',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  extensionConfiguration.hasExtensionConfiguration('Twitter'),
  controller.destroy
);

module.exports = router;
