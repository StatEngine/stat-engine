'use strict';

import { Router } from 'express';

import * as auth from '../../auth/auth.service';
import * as appInstallationController from './app-installation.controller';

const router = new Router();


router.get(
  '/installations/:installationId/access_tokens',
  auth.checkOauthJwt,
  appInstallationController.generateToken,
);

router.get(
  '/installations/:installationId/',
  auth.checkOauthJwt,
  appInstallationController.get,
);

router.get(
  '/installations',
  auth.checkOauthJwt,
  appInstallationController.search,
);

// future call
// Returns the  App associated with the oauth credentials used.
// router.get(
//  '/',
//  auth.checkOauthJwt,
//);

module.exports = router;
