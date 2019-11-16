'use strict';

import { Router } from 'express';
import basicAuth from 'express-basic-auth';
import bodyParser from 'body-parser';

import config from '../../config/environment';
import * as controller from './admin.controller';

const router = new Router();

router.post(
  '/chargebeeWebhook',
  basicAuth({
    users: {
      [config.chargebee.webhook.username]: config.chargebee.webhook.password,
    },
  }),
  bodyParser.json(),
  controller.chargebeeWebhook,
);

module.exports = router;

