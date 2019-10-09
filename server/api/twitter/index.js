'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';

import * as auth from '../../auth/auth.service';
import * as twitterAuth from './auth.controller';
import * as controller from './tweet.controller';
import { asyncMiddleware } from '../../util/async-middleware';

//import * as extensionConfiguration from '../extension-configuration/extension-configuration.service';

const router = new Router();

// Twitter loging
router.get(
  '/account/login',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(twitterAuth.login)
);

router.get(
  '/account/login/_callback',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(twitterAuth.loginCallback)
);

router.get(
  '/account/profile',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(twitterAuth.profile)
);

router.get(
  '/tweets/recommendations',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.recommendations)
);

router.get(
  '/tweets/recent',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  asyncMiddleware(controller.recent)
);

router.post(
  '/tweets/preview',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.preview)
);

router.post(
  '/tweets/tweet',
  auth.isApiAuthenticated,
  auth.hasRole('user'),
  asyncMiddleware(auth.hasFireDepartment),
  bodyParser.json(),
  asyncMiddleware(controller.tweetTweet)
);

module.exports = router;
