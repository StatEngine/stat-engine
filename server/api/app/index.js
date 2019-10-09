'use strict';

import 'babel-polyfill';
import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as appInstallationController from './app-installation.controller';
import { asyncMiddleware } from '../../util/async-middleware';

const router = new Router();


router.get(
  '/installations/:installationId/access_tokens',
  auth.checkOauthJwt,
  asyncMiddleware(appInstallationController.generateToken),
);

router.get(
  '/installations/:installationId/',
  auth.checkOauthJwt,
  asyncMiddleware(appInstallationController.get),
);

router.get(
  '/installations',
  auth.checkOauthJwt,
  asyncMiddleware(appInstallationController.search),
);

// future call
// Returns the  App associated with the oauth credentials used.
// router.get(
//  '/',
//  auth.checkOauthJwt,
//);

module.exports = router;
