'use strict';

import { Router } from 'express';
import bodyParser from 'body-parser';
import basicAuth from 'express-basic-auth';
import * as controller from './chargebee.controller';
import config from '../../config/environment';

const router = new Router();

router.post(
  '/webhook',
  basicAuth({
    users: {
      [config.chargebee.webhook.username]: config.chargebee.webhook.password,
    },
  }),
  bodyParser.json(),
  controller.webhook,
);

module.exports = router;
