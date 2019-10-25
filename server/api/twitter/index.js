'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as twitterAuth from './auth.controller';
import * as controller from './tweet.controller';

//import * as extensionConfiguration from '../extension-configuration/extension-configuration.service';

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
  '/tweets/recommendations',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.recommendations
);

router.get(
  '/tweets/recent',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  controller.recent
);

router.post(
  '/tweets/preview',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.preview
);

router.post(
  '/tweets/tweet',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  auth.hasFireDepartment,
  bodyParser.json(),
  controller.tweetTweet
);

module.exports = router;
